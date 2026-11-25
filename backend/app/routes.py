from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database import get_connection
from app.excursion import alert_for_reading, shipment_status
from app.schemas import (
    AlertOut,
    HealthOut,
    IngestReading,
    ShipmentDetail,
    ShipmentSummary,
    TemperatureReading,
)

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthOut)
def health() -> HealthOut:
    return HealthOut(service="coldtrace-api", version="0.1.0-mvp")


def _row_shipment_summary(row, status: str, latest_c: float | None, alert_count: int) -> ShipmentSummary:
    return ShipmentSummary(
        id=row["id"],
        reference=row["reference"],
        product=row["product"],
        origin=row["origin"],
        destination=row["destination"],
        min_c=row["min_c"],
        max_c=row["max_c"],
        started_at=row["started_at"],
        eta=row["eta"],
        status=status,
        latest_c=latest_c,
        alert_count=alert_count,
    )


@router.get("/shipments", response_model=list[ShipmentSummary])
def list_shipments() -> list[ShipmentSummary]:
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM shipments ORDER BY started_at DESC").fetchall()
        out: list[ShipmentSummary] = []
        for row in rows:
            sid = row["id"]
            readings = conn.execute(
                "SELECT celsius FROM temperature_readings WHERE shipment_id = ? ORDER BY recorded_at",
                (sid,),
            ).fetchall()
            temps = [r["celsius"] for r in readings]
            latest_c = temps[-1] if temps else None
            alerts = conn.execute(
                "SELECT severity FROM alerts WHERE shipment_id = ?",
                (sid,),
            ).fetchall()
            has_breach = any(a["severity"] == "critical" for a in alerts)
            status = shipment_status(temps, row["min_c"], row["max_c"], has_breach_alert=has_breach)
            out.append(_row_shipment_summary(row, status, latest_c, len(alerts)))
        return out
    finally:
        conn.close()


@router.get("/shipments/{shipment_id}", response_model=ShipmentDetail)
def get_shipment(shipment_id: str) -> ShipmentDetail:
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        reading_rows = conn.execute(
            """
            SELECT id, recorded_at, celsius, source
            FROM temperature_readings
            WHERE shipment_id = ?
            ORDER BY recorded_at
            """,
            (shipment_id,),
        ).fetchall()
        alert_rows = conn.execute(
            """
            SELECT id, raised_at, severity, message, reading_c
            FROM alerts
            WHERE shipment_id = ?
            ORDER BY raised_at DESC
            """,
            (shipment_id,),
        ).fetchall()

        temps = [r["celsius"] for r in reading_rows]
        has_breach = any(a["severity"] == "critical" for a in alert_rows)
        status = shipment_status(temps, row["min_c"], row["max_c"], has_breach_alert=has_breach)
        latest_c = temps[-1] if temps else None

        summary = _row_shipment_summary(row, status, latest_c, len(alert_rows))
        return ShipmentDetail(
            **summary.model_dump(),
            readings=[TemperatureReading(**dict(r)) for r in reading_rows],
            alerts=[AlertOut(**dict(a)) for a in alert_rows],
        )
    finally:
        conn.close()


@router.post("/shipments/{shipment_id}/readings", response_model=ShipmentDetail)
def ingest_reading(shipment_id: str, body: IngestReading) -> ShipmentDetail:
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM shipments WHERE id = ?", (shipment_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        recorded_at = body.recorded_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        conn.execute(
            """
            INSERT INTO temperature_readings (shipment_id, recorded_at, celsius, source)
            VALUES (?, ?, ?, ?)
            """,
            (shipment_id, recorded_at, body.celsius, body.source),
        )

        alert = alert_for_reading(
            shipment_id, recorded_at, body.celsius, row["min_c"], row["max_c"]
        )
        if alert:
            severity, message, raised_at = alert
            conn.execute(
                """
                INSERT INTO alerts (shipment_id, raised_at, severity, message, reading_c)
                VALUES (?, ?, ?, ?, ?)
                """,
                (shipment_id, raised_at, severity, message, body.celsius),
            )
        conn.commit()
    finally:
        conn.close()

    return get_shipment(shipment_id)
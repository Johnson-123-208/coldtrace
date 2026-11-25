import sqlite3
from datetime import datetime, timedelta, timezone

from app.database import init_schema
from app.excursion import alert_for_reading


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def seed(conn: sqlite3.Connection) -> None:
    cur = conn.execute("SELECT COUNT(*) FROM shipments")
    if cur.fetchone()[0] > 0:
        return

    now = datetime.now(timezone.utc)
    shipments = [
        {
            "id": "shp-vaccine-berlin",
            "reference": "CT-2025-0142",
            "product": "mRNA vaccine lot B7",
            "origin": "Munich DC",
            "destination": "Charité Berlin",
            "min_c": 2.0,
            "max_c": 8.0,
            "started_at": _iso(now - timedelta(hours=18)),
            "eta": _iso(now + timedelta(hours=6)),
        },
        {
            "id": "shp-insulin-ham",
            "reference": "CT-2025-0198",
            "product": "Insulin pens (cold chain)",
            "origin": "Frankfurt Hub",
            "destination": "Hamburg Clinic",
            "min_c": 2.0,
            "max_c": 8.0,
            "started_at": _iso(now - timedelta(hours=10)),
            "eta": _iso(now + timedelta(hours=14)),
        },
        {
            "id": "shp-biologics-muc",
            "reference": "CT-2025-0204",
            "product": "Monoclonal antibody vials",
            "origin": "Basel Mfg",
            "destination": "Munich University Hospital",
            "min_c": 2.0,
            "max_c": 8.0,
            "started_at": _iso(now - timedelta(hours=22)),
            "eta": _iso(now + timedelta(hours=2)),
        },
        {
            "id": "shp-plasma-dus",
            "reference": "CT-2025-0177",
            "product": "Plasma fractionation unit",
            "origin": "Cologne Lab",
            "destination": "Düsseldorf Blood Center",
            "min_c": 1.0,
            "max_c": 6.0,
            "started_at": _iso(now - timedelta(hours=6)),
            "eta": _iso(now + timedelta(hours=18)),
        },
    ]

    for s in shipments:
        conn.execute(
            """
            INSERT INTO shipments (id, reference, product, origin, destination, min_c, max_c, started_at, eta)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                s["id"],
                s["reference"],
                s["product"],
                s["origin"],
                s["destination"],
                s["min_c"],
                s["max_c"],
                s["started_at"],
                s["eta"],
            ),
        )

    readings: list[tuple] = []
    alerts: list[tuple] = []

    def add_series(shipment_id: str, min_c: float, max_c: float, temps: list[float], start: datetime):
        for i, temp in enumerate(temps):
            ts = _iso(start + timedelta(minutes=30 * i))
            readings.append((shipment_id, ts, temp, "simulated-logger"))
            alert = alert_for_reading(shipment_id, ts, temp, min_c, max_c)
            if alert:
                severity, message, raised_at = alert
                alerts.append((shipment_id, raised_at, severity, message, temp))

    add_series(
        "shp-vaccine-berlin",
        2.0,
        8.0,
        [5.2, 5.0, 4.9, 5.1, 4.8, 5.3, 5.0, 4.7, 5.2, 5.1, 4.9, 5.0],
        now - timedelta(hours=18),
    )
    add_series(
        "shp-insulin-ham",
        2.0,
        8.0,
        [5.5, 5.2, 4.8, 4.2, 3.6, 2.2, 1.7, 2.4, 4.0, 4.6, 5.0, 5.3],
        now - timedelta(hours=10),
    )
    add_series(
        "shp-biologics-muc",
        2.0,
        8.0,
        [6.5, 6.2, 5.8, 5.0, 4.2, 3.0, 1.8, 0.9, 0.5, 1.2, 2.0, 2.8],
        now - timedelta(hours=22),
    )
    add_series(
        "shp-plasma-dus",
        1.0,
        6.0,
        [3.5, 3.6, 3.4, 3.5, 3.7, 3.5, 3.6, 3.5, 3.4, 3.6, 3.5, 3.5],
        now - timedelta(hours=6),
    )

    conn.executemany(
        "INSERT INTO temperature_readings (shipment_id, recorded_at, celsius, source) VALUES (?, ?, ?, ?)",
        readings,
    )
    conn.executemany(
        "INSERT INTO alerts (shipment_id, raised_at, severity, message, reading_c) VALUES (?, ?, ?, ?, ?)",
        alerts,
    )
    conn.commit()


def bootstrap(conn: sqlite3.Connection) -> None:
    init_schema(conn)
    seed(conn)
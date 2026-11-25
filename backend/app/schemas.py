from pydantic import BaseModel, Field


class ShipmentSummary(BaseModel):
    id: str
    reference: str
    product: str
    origin: str
    destination: str
    min_c: float
    max_c: float
    started_at: str
    eta: str
    status: str
    latest_c: float | None = None
    alert_count: int = 0


class TemperatureReading(BaseModel):
    id: int
    recorded_at: str
    celsius: float
    source: str


class AlertOut(BaseModel):
    id: int
    raised_at: str
    severity: str
    message: str
    reading_c: float


class ShipmentDetail(ShipmentSummary):
    readings: list[TemperatureReading]
    alerts: list[AlertOut]


class IngestReading(BaseModel):
    celsius: float = Field(..., ge=-40, le=60)
    recorded_at: str | None = None
    source: str = "manual-ingest"


class HealthOut(BaseModel):
    service: str
    version: str
    demo_label: str = "SIMULATED telemetry for demonstration"
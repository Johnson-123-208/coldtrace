"""Deterministic cold-chain excursion detection — no ML."""

from typing import Literal

ShipmentStatus = Literal["ok", "at-risk", "breached"]


def in_range(celsius: float, min_c: float, max_c: float) -> bool:
    return min_c <= celsius <= max_c


def classify_reading(celsius: float, min_c: float, max_c: float) -> ShipmentStatus:
    if in_range(celsius, min_c, max_c):
        return "ok"
    margin = 0.5
    if min_c - margin <= celsius <= max_c + margin:
        return "at-risk"
    return "breached"


def shipment_status(
    readings: list[float],
    min_c: float,
    max_c: float,
    *,
    has_breach_alert: bool,
) -> ShipmentStatus:
    if has_breach_alert:
        return "breached"
    if not readings:
        return "ok"

    latest = readings[-1]
    if not in_range(latest, min_c, max_c):
        if classify_reading(latest, min_c, max_c) == "breached":
            return "breached"
        return "at-risk"

    out_of_range = [c for c in readings if not in_range(c, min_c, max_c)]
    if out_of_range:
        if any(classify_reading(c, min_c, max_c) == "breached" for c in out_of_range):
            return "breached"
        return "at-risk"

    return "ok"


def alert_for_reading(
    shipment_id: str,
    recorded_at: str,
    celsius: float,
    min_c: float,
    max_c: float,
) -> tuple[str, str, str] | None:
    if in_range(celsius, min_c, max_c):
        return None

    level = classify_reading(celsius, min_c, max_c)
    if celsius < min_c:
        delta = min_c - celsius
        direction = "below minimum"
    else:
        delta = celsius - max_c
        direction = "above maximum"

    if level == "breached":
        severity = "critical"
        message = (
            f"Temperature {celsius:.1f}°C is {delta:.1f}°C {direction} "
            f"(allowed {min_c:.1f}–{max_c:.1f}°C) — shipment {shipment_id}"
        )
    else:
        severity = "warning"
        message = (
            f"Temperature {celsius:.1f}°C drifted {direction} "
            f"(allowed {min_c:.1f}–{max_c:.1f}°C) — monitor closely"
        )

    return severity, message, recorded_at
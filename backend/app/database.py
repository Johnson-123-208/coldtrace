import sqlite3
from pathlib import Path

from app.config import settings


def _sqlite_path() -> Path:
    url = settings.database_url
    if url.startswith("sqlite:///"):
        rel = url.removeprefix("sqlite:///")
        return Path(__file__).resolve().parent.parent / rel
    return Path(__file__).resolve().parent.parent / "coldtrace.db"


DB_PATH = _sqlite_path()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS shipments (
            id TEXT PRIMARY KEY,
            reference TEXT NOT NULL,
            product TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            min_c REAL NOT NULL,
            max_c REAL NOT NULL,
            started_at TEXT NOT NULL,
            eta TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS temperature_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
            recorded_at TEXT NOT NULL,
            celsius REAL NOT NULL,
            source TEXT NOT NULL DEFAULT 'logger'
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
            raised_at TEXT NOT NULL,
            severity TEXT NOT NULL,
            message TEXT NOT NULL,
            reading_c REAL NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_readings_shipment ON temperature_readings(shipment_id, recorded_at);
        CREATE INDEX IF NOT EXISTS idx_alerts_shipment ON alerts(shipment_id, raised_at);
        """
    )
    conn.commit()
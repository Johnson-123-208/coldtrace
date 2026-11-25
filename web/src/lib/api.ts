const API_URL = (
  import.meta.env.VITE_API_URL || "https://coldtrace-api-xt2c.onrender.com"
).replace(/\/$/, "");

export type ShipmentStatus = "ok" | "at-risk" | "breached";

export interface ShipmentSummary {
  id: string;
  reference: string;
  product: string;
  origin: string;
  destination: string;
  min_c: number;
  max_c: number;
  started_at: string;
  eta: string;
  status: ShipmentStatus;
  latest_c: number | null;
  alert_count: number;
}

export interface TemperatureReading {
  id: number;
  recorded_at: string;
  celsius: number;
  source: string;
}

export interface Alert {
  id: number;
  raised_at: string;
  severity: string;
  message: string;
  reading_c: number;
}

export interface ShipmentDetail extends ShipmentSummary {
  readings: TemperatureReading[];
  alerts: Alert[];
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function listShipments(): Promise<ShipmentSummary[]> {
  return fetchJson("/api/shipments");
}

export function getShipment(id: string): Promise<ShipmentDetail> {
  return fetchJson(`/api/shipments/${encodeURIComponent(id)}`);
}

export function ingestReading(id: string, celsius: number): Promise<ShipmentDetail> {
  return fetchJson(`/api/shipments/${encodeURIComponent(id)}/readings`, {
    method: "POST",
    body: JSON.stringify({ celsius }),
  });
}

export function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
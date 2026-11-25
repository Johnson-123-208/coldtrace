import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { formatWhen, listShipments, type ShipmentSummary } from "../lib/api";

export function DashboardPage() {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listShipments()
      .then(setShipments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    ok: shipments.filter((s) => s.status === "ok").length,
    risk: shipments.filter((s) => s.status === "at-risk").length,
    breach: shipments.filter((s) => s.status === "breached").length,
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Active shipments</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Track cold-chain lanes, ingest logger temperature, and surface deterministic excursion alerts.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "In range", value: counts.ok, tone: "text-teal-700 bg-teal-50 ring-teal-600/15" },
          { label: "At risk", value: counts.risk, tone: "text-amber-900 bg-amber-50 ring-amber-600/20" },
          { label: "Breached", value: counts.breach, tone: "text-red-800 bg-red-50 ring-red-600/15" },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl px-5 py-4 ring-1 ring-inset ${card.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{card.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-muted">Loading shipments…</p>}
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          API unreachable: {error}. Start the backend on port 8008.
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Route</th>
                <th className="px-4 py-3 font-semibold">Latest</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Alerts</th>
                <th className="px-4 py-3 font-semibold">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <Link to={`/shipments/${s.id}`} className="font-medium text-sky hover:underline">
                      {s.reference}
                    </Link>
                    <p className="text-xs text-muted">{s.product}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s.origin} → {s.destination}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {s.latest_c != null ? `${s.latest_c.toFixed(1)} °C` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.alert_count}</td>
                  <td className="px-4 py-3 text-muted">{formatWhen(s.eta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import type { Alert } from "../lib/api";
import { formatWhen } from "../lib/api";

export function AlertList({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface-2 px-4 py-6 text-sm text-muted">
        No excursion alerts for this shipment.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li
          key={a.id}
          className={`rounded-xl border px-4 py-3 ${
            a.severity === "critical"
              ? "border-red-200 bg-red-50/80"
              : "border-amber-200 bg-amber-50/60"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                a.severity === "critical" ? "text-red-800" : "text-amber-900"
              }`}
            >
              {a.severity}
            </span>
            <time className="text-xs text-muted">{formatWhen(a.raised_at)}</time>
          </div>
          <p className="mt-1 text-sm text-ink">{a.message}</p>
        </li>
      ))}
    </ul>
  );
}
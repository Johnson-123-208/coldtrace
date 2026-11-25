import type { ShipmentStatus } from "../lib/api";

const styles: Record<ShipmentStatus, string> = {
  ok: "bg-teal-50 text-teal-800 ring-teal-600/20",
  "at-risk": "bg-amber-50 text-amber-900 ring-amber-600/25",
  breached: "bg-red-50 text-red-800 ring-red-600/20",
};

const labels: Record<ShipmentStatus, string> = {
  ok: "In range",
  "at-risk": "At risk",
  breached: "Breached",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
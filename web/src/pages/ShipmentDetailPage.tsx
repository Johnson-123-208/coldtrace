import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { StatusBadge } from "../components/StatusBadge";
import { TemperatureChart } from "../components/TemperatureChart";
import { formatWhen, getShipment, ingestReading, type ShipmentDetail } from "../lib/api";

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempInput, setTempInput] = useState("4.0");
  const [submitting, setSubmitting] = useState(false);

  const load = (shipmentId: string) => {
    setLoading(true);
    getShipment(shipmentId)
      .then(setShipment)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) load(id);
  }, [id]);

  const onIngest = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const c = Number(tempInput);
    if (Number.isNaN(c)) return;
    setSubmitting(true);
    try {
      const detail = await ingestReading(id, c);
      setShipment(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-muted">Loading shipment…</p>;
  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
    );
  }
  if (!shipment) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-sky hover:underline">
            ← All shipments
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{shipment.reference}</h1>
          <p className="mt-1 text-muted">{shipment.product}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Origin", shipment.origin],
          ["Destination", shipment.destination],
          ["Allowed range", `${shipment.min_c}–${shipment.max_c} °C`],
          ["ETA", formatWhen(shipment.eta)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-surface px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <TemperatureChart readings={shipment.readings} minC={shipment.min_c} maxC={shipment.max_c} />

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="mb-3 text-lg font-semibold text-ink">Excursion alerts</h2>
          <AlertList alerts={shipment.alerts} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-ink">Simulate reading</h2>
          <form
            onSubmit={onIngest}
            className="space-y-3 rounded-2xl border border-line bg-surface p-4 shadow-card"
          >
            <p className="text-xs text-muted">
              Post a temperature sample to the API. Out-of-range values raise alerts immediately.
            </p>
            <label className="block text-sm font-medium text-ink">
              Celsius
              <input
                type="number"
                step="0.1"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:ring-2 focus:ring-sky/40"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Ingest reading"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
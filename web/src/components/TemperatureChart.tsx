import type { TemperatureReading } from "../lib/api";

type Props = {
  readings: TemperatureReading[];
  minC: number;
  maxC: number;
};

export function TemperatureChart({ readings, minC, maxC }: Props) {
  if (readings.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-line bg-surface-2 text-sm text-muted">
        No readings yet
      </div>
    );
  }

  const width = 720;
  const height = 220;
  const padX = 36;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const temps = readings.map((r) => r.celsius);
  const yMin = Math.min(minC - 1.5, ...temps);
  const yMax = Math.max(maxC + 1.5, ...temps);

  const toX = (i: number) => padX + (i / Math.max(readings.length - 1, 1)) * innerW;
  const toY = (c: number) => padY + ((yMax - c) / (yMax - yMin || 1)) * innerH;

  const bandTop = toY(maxC);
  const bandBottom = toY(minC);
  const points = readings.map((r, i) => `${toX(i)},${toY(r.celsius)}`).join(" ");

  const outOfRange = readings.filter((r) => r.celsius < minC || r.celsius > maxC);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Temperature timeline</h3>
        <p className="text-xs text-muted">
          Allowed band {minC}–{maxC} °C · {readings.length} readings
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Temperature chart">
        <rect x={padX} y={bandTop} width={innerW} height={bandBottom - bandTop} fill="rgb(196 236 252 / 0.55)" rx="4" />
        <line x1={padX} y1={bandTop} x2={padX + innerW} y2={bandTop} stroke="#2e9cf4" strokeDasharray="4 4" strokeWidth="1" />
        <line x1={padX} y1={bandBottom} x2={padX + innerW} y2={bandBottom} stroke="#2e9cf4" strokeDasharray="4 4" strokeWidth="1" />
        <polyline fill="none" stroke="#0c3474" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
        {outOfRange.map((r) => {
          const i = readings.indexOf(r);
          return (
            <circle
              key={r.id}
              cx={toX(i)}
              cy={toY(r.celsius)}
              r={5}
              fill="#dc2626"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}
        <text x={padX} y={14} className="fill-ink text-[10px]" fill="#0c3474">
          {yMax.toFixed(1)}°C
        </text>
        <text x={padX} y={height - 6} className="fill-ink text-[10px]" fill="#0c3474">
          {yMin.toFixed(1)}°C
        </text>
      </svg>
    </div>
  );
}
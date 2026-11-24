/** Shared tooltip: title + one row per series, text in neutral ink with a colour swatch. */
export default function ChartTooltip({ active, payload, title }) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined);
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-900">{title(payload[0].payload)}</p>
      {rows.length === 0 && <p className="text-slate-500">No readings</p>}
      {rows.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
          {p.name}: <span className="font-semibold tabular-nums text-slate-900">{p.value} mg/dL</span>
        </p>
      ))}
    </div>
  );
}

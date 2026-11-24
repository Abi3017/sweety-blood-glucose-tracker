import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { TIME_SLOTS, TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';

/** Average reading per time slot as concentric rings (full ring = 300 mg/dL). */
export default function RadialSlots({ readings }) {
  const data = TIME_SLOTS.map((slot) => {
    const vals = readings.filter((r) => r.timeSlot === slot).map((r) => r.glucoseValue);
    return {
      slot,
      name: TIME_SLOT_LABELS[slot],
      value: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0,
      count: vals.length,
      fill: TIME_SLOT_COLORS[slot],
    };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="h-64 w-64 shrink-0" role="img" aria-label="Radial chart of the average reading for each time slot.">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={data} innerRadius="28%" outerRadius="100%" barSize={14} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 300]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--chart-grid)' }} isAnimationActive animationDuration={1100} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full max-w-xs space-y-3">
        {data.map((d) => (
          <li key={d.slot} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.fill }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{d.name}</p>
              <p className="text-xs text-slate-400">{d.count} {d.count === 1 ? 'reading' : 'readings'}</p>
            </div>
            <p className="text-lg font-semibold tabular-nums text-slate-900">
              {d.count ? d.value : '—'}
              {d.count > 0 && <span className="ml-1 text-xs font-medium text-slate-400">mg/dL</span>}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

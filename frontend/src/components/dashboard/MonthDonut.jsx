import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TIME_SLOTS, TIME_SLOT_LABELS } from '../../utils/timeSlots';

const COLORS = {
  MORNING: '#f97316',
  AFTER_BREAKFAST: '#78716c',
  AFTER_LUNCH: '#c5cb85',
  AFTER_DINNER: '#fdba74',
};

/** Share of this month's readings by time slot, as a donut with the month in the middle. */
export default function MonthDonut({ readings, monthLabel }) {
  const data = TIME_SLOTS.map((slot) => ({
    slot,
    name: TIME_SLOT_LABELS[slot],
    value: readings.filter((r) => r.timeSlot === slot).length,
  }));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="relative mx-auto h-56 w-56" role="img" aria-label={`Donut chart of ${total} readings this month by time slot.`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={total > 0 ? 3 : 0}
              cornerRadius={8}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={1100}
            >
              {data.map((d) => (
                <Cell key={d.slot} fill={COLORS[d.slot]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} readings`, name]}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-axis)', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-sm font-semibold text-slate-900">{monthLabel}</span>
          <span className="text-xs text-slate-500">{total} readings</span>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
        {data.map((d) => (
          <li key={d.slot} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[d.slot] }} aria-hidden />
            <span className="truncate">{d.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-900">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

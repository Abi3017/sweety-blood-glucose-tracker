import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from '../reports/ChartTooltip';
import { TIME_SLOTS, TIME_SLOT_LABELS, TIME_SLOT_SHORT } from '../../utils/timeSlots';

/** How readings moved through one day (morning → after dinner), drawn as a smooth curve. */
export default function DailySlotChart({ readings }) {
  const bySlot = Object.fromEntries(readings.map((r) => [r.timeSlot, r.glucoseValue]));
  const data = TIME_SLOTS.map((slot) => ({ slot, label: TIME_SLOT_SHORT[slot], value: bySlot[slot] ?? null }));

  return (
    <div className="h-64 w-full" role="img" aria-label="Curved line chart of today's readings by time slot.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="day-curve" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[(min) => Math.max(0, Math.floor((min - 20) / 10) * 10), (max) => Math.ceil((max + 20) / 10) * 10]}
          />
          <Tooltip cursor={{ stroke: '#f97316', strokeOpacity: 0.4, strokeWidth: 1.5 }} content={<ChartTooltip title={(row) => TIME_SLOT_LABELS[row.slot]} />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Glucose"
            stroke="#f97316"
            strokeWidth={3}
            strokeLinecap="round"
            fill="url(#day-curve)"
            dot={{ r: 4.5, fill: '#f97316', stroke: 'var(--chart-bg)', strokeWidth: 2.5 }}
            activeDot={{ r: 7, fill: '#f97316', stroke: 'var(--chart-bg)', strokeWidth: 3 }}
            connectNulls
            isAnimationActive
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

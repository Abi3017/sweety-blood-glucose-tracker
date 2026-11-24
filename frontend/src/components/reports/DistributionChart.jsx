import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STEP = 20;

/** How many readings fall into each 20 mg/dL band. A plain histogram, no target ranges implied. */
export default function DistributionChart({ readings }) {
  const data = useMemo(() => {
    const values = readings.map((r) => r.glucoseValue);
    const start = Math.floor(Math.min(...values) / STEP) * STEP;
    const end = Math.floor(Math.max(...values) / STEP) * STEP;
    const buckets = [];
    for (let from = start; from <= end; from += STEP) {
      buckets.push({ label: `${from}–${from + STEP - 1}`, count: values.filter((v) => v >= from && v < from + STEP).length });
    }
    return buckets;
  }, [readings]);

  return (
    <div className="h-72 w-full" role="img" aria-label="Histogram of how many readings fall into each 20 mg/dL band.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="dist-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--chart-text)' }} tickLine={false} axisLine={false} width={32} />
          <Tooltip
            cursor={{ fill: 'var(--chart-grid)', fillOpacity: 0.5, radius: 8 }}
            formatter={(v) => [`${v} ${v === 1 ? 'reading' : 'readings'}`, 'Count']}
            labelFormatter={(l) => `${l} mg/dL`}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--chart-axis)', fontSize: 12 }}
          />
          <Bar dataKey="count" fill="url(#dist-grad)" radius={[10, 10, 4, 4]} maxBarSize={36} isAnimationActive animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

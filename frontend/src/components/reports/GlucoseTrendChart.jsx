import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip';
import CalendarHeatmap from './CalendarHeatmap';
import BubbleMatrix from './BubbleMatrix';
import RadialSlots from './RadialSlots';
import DistributionChart from './DistributionChart';
import { TIME_SLOTS, TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { eachDate, formatDate } from '../../utils/dates';

const AVERAGE_COLOR = '#f97316';

/** Tooltip for the range view: the day's lowest, highest and average. */
function RangeTooltip({ active, payload }) {
  const row = active && payload?.[0]?.payload;
  if (!row || row.min == null) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-900">{formatDate(row.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
      <p className="text-slate-600">
        Range: <span className="font-semibold tabular-nums text-slate-900">{row.min}–{row.max} mg/dL</span>
      </p>
      <p className="text-slate-600">
        Average: <span className="font-semibold tabular-nums text-slate-900">{row.average} mg/dL</span>
      </p>
      <p className="text-slate-400">{row.count} {row.count === 1 ? 'reading' : 'readings'}</p>
    </div>
  );
}

/**
 * Readings over a date range as smooth gradient areas. "By slot" shows one series per time slot
 * (toggle them with the pills); "Daily average" shows the mean of each day's readings.
 * Dates without a reading stay as gaps — no values are invented.
 */
export default function GlucoseTrendChart({ startDate, endDate, readings }) {
  const [view, setView] = useState('calendar');
  const [hidden, setHidden] = useState(() => new Set());

  const data = useMemo(() => {
    const byDate = Object.fromEntries(eachDate(startDate, endDate).map((date) => [date, { date }]));
    readings.forEach((r) => {
      if (byDate[r.readingDate]) byDate[r.readingDate][r.timeSlot] = r.glucoseValue;
    });
    return Object.values(byDate).map((row) => {
      const values = TIME_SLOTS.map((s) => row[s]).filter((v) => v != null);
      return {
        ...row,
        average: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null,
        min: values.length ? Math.min(...values) : null,
        max: values.length ? Math.max(...values) : null,
        range: values.length ? [Math.min(...values), Math.max(...values)] : null,
        count: values.length,
      };
    });
  }, [startDate, endDate, readings]);

  const slotsWithData = TIME_SLOTS.filter((slot) => readings.some((r) => r.timeSlot === slot));
  const visibleSlots = slotsWithData.filter((s) => !hidden.has(s));

  const toggle = (slot) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else if (visibleSlots.length > 1) next.add(slot); // always keep at least one series visible
      return next;
    });

  const series = view === 'average' ? [{ key: 'average', name: 'Daily average', color: AVERAGE_COLOR }] : visibleSlots.map((s) => ({ key: s, name: TIME_SLOT_LABELS[s], color: TIME_SLOT_COLORS[s] }));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex max-w-full overflow-x-auto rounded-full bg-slate-100 p-1" role="group" aria-label="Chart view">
          {[
            ['calendar', 'Calendar'],
            ['range', 'Daily range'],
            ['bubbles', 'Bubbles'],
            ['radial', 'Radial'],
            ['distribution', 'Distribution'],
            ['slots', 'By slot'],
            ['average', 'Daily average'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${view === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'slots' && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show or hide time slots">
            {slotsWithData.map((slot) => {
              const on = !hidden.has(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(slot)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    on ? 'border-slate-200 bg-white text-slate-700 shadow-sm' : 'border-transparent bg-slate-100 text-slate-400'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: on ? TIME_SLOT_COLORS[slot] : 'currentColor' }} aria-hidden />
                  {TIME_SLOT_LABELS[slot]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {view === 'bubbles' ? (
        <BubbleMatrix rows={data} />
      ) : view === 'radial' ? (
        <RadialSlots readings={readings} />
      ) : view === 'distribution' ? (
        <DistributionChart readings={readings} />
      ) : view === 'calendar' ? (
        data.some((r) => r.average != null) ? (
          <CalendarHeatmap rows={data} startDate={startDate} endDate={endDate} />
        ) : null
      ) : (
        <>
      <p className="mb-1 pl-1 text-xs font-medium text-slate-400">mg/dL</p>
      <div
        className="h-72 w-full"
        role="img"
        aria-label={`${view === 'range' ? 'Bar chart of the daily lowest to highest reading' : view === 'average' ? 'Area chart of the daily average' : 'Area chart, one series per time slot,'} of glucose readings from ${formatDate(startDate)} to ${formatDate(endDate)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {view === 'range' ? (
            <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="range-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#fdba74" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })}
                tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
                tickLine={false}
                axisLine={false}
                width={44}
                domain={[(min) => Math.max(0, Math.floor((min - 20) / 10) * 10), (max) => Math.ceil((max + 20) / 10) * 10]}
              />
              <Tooltip cursor={{ fill: 'var(--chart-grid)', fillOpacity: 0.5, radius: 8 }} content={<RangeTooltip />} />
              <Bar
                dataKey="range"
                name="Range"
                fill="url(#range-grad)"
                radius={999}
                maxBarSize={14}
                background={{ fill: 'var(--chart-grid)', radius: 999 }}
                isAnimationActive
                animationDuration={900}
              />
              <Line
                dataKey="average"
                name="Average"
                stroke="none"
                dot={{ r: 4, fill: 'var(--chart-bg)', stroke: '#c2410c', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: 'var(--chart-bg)', stroke: '#c2410c', strokeWidth: 3 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          ) : (
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`trend-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatDate(d, { day: 'numeric', month: 'short' })}
              tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--chart-text)' }}
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[(min) => Math.max(0, Math.floor((min - 20) / 10) * 10), (max) => Math.ceil((max + 20) / 10) * 10]}
            />
            <Tooltip
              cursor={{ stroke: AVERAGE_COLOR, strokeWidth: 1.5, strokeOpacity: 0.5 }}
              content={<ChartTooltip title={(row) => formatDate(row.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />}
            />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#trend-${s.key})`}
                dot={{ r: 3.5, fill: s.color, stroke: 'var(--chart-bg)', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: s.color, stroke: 'var(--chart-bg)', strokeWidth: 3 }}
                connectNulls={false}
                isAnimationActive
                animationDuration={900}
              />
            ))}
          </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
        </>
      )}
    </div>
  );
}

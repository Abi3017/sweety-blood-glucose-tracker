import { useState } from 'react';
import { TIME_SLOTS, TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { formatDate } from '../../utils/dates';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Orange intensity for an average, relative to this period's own lowest and highest average. */
function shade(avg, lo, hi) {
  const t = hi === lo ? 0.6 : (avg - lo) / (hi - lo);
  return 0.16 + t * 0.74; // 0.16 .. 0.90 opacity
}

/**
 * Compact month calendar: each day is a small tile tinted by that day's average (darker = higher
 * relative to the rest of the period) and showing the average. Selecting a day fills the panel
 * beside it with that day's range and each slot's reading.
 * `rows` is [{ date, average, min, max, count, MORNING?, ... }].
 */
export default function CalendarHeatmap({ rows, startDate, endDate }) {
  const withData = rows.filter((r) => r.average != null);
  const lo = Math.min(...withData.map((r) => r.average));
  const hi = Math.max(...withData.map((r) => r.average));
  const byDate = Object.fromEntries(rows.map((r) => [r.date, r]));
  const [active, setActive] = useState(() => withData[withData.length - 1]?.date ?? rows[0].date);
  const picked = byDate[active];

  // Pad the first week so the 1st lands on the right weekday (Monday-first).
  const lead = (new Date(`${startDate}T00:00:00Z`).getUTCDay() + 6) % 7;
  const cells = [...Array(lead).fill(null), ...rows.map((r) => r.date)];

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="w-full max-w-sm shrink-0">
        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="text-center text-[11px] font-semibold text-slate-400" aria-hidden="true">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5" role="grid" aria-label={`Calendar of daily average glucose from ${formatDate(startDate)} to ${formatDate(endDate)}.`}>
          {cells.map((date, i) => {
            if (!date) return <div key={`pad-${i}`} aria-hidden="true" />;
            const row = byDate[date];
            const has = row.average != null;
            const selected = active === date;
            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                onClick={() => setActive(date)}
                onMouseEnter={() => setActive(date)}
                onFocus={() => setActive(date)}
                aria-selected={selected}
                aria-label={has ? `${formatDate(date)}: average ${row.average} mg/dL from ${row.count} readings` : `${formatDate(date)}: no readings`}
                className={`cal-tile relative aspect-square rounded-xl border text-center transition-all duration-200 hover:scale-110 ${
                  has ? 'border-transparent' : 'border-dashed border-slate-200'
                } ${selected ? 'z-10 scale-110 shadow-md ring-2 ring-brand-600' : ''}`}
                style={{ animationDelay: `${i * 12}ms`, background: has ? `rgb(249 115 22 / ${shade(row.average, lo, hi)})` : undefined }}
              >
                <span className={`absolute left-1.5 top-1 text-[9px] font-medium tabular-nums ${has ? 'text-slate-800/70' : 'text-slate-300'}`}>
                  {Number(date.slice(8))}
                </span>
                {has && <span className="flex h-full items-end justify-center pb-1.5 text-xs font-semibold tabular-nums text-slate-900">{Math.round(row.average)}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
          <span>Lower avg</span>
          <span className="h-2 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, rgb(249 115 22 / 0.16), rgb(249 115 22 / 0.9))' }} aria-hidden="true" />
          <span>Higher avg</span>
        </div>
      </div>

      <div className="min-h-[14rem] flex-1 rounded-3xl bg-tint-peach p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {formatDate(picked.date, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {picked.average != null ? (
          <>
            <p key={picked.date} className="animate-pop-in mt-2 text-4xl font-semibold tabular-nums tracking-tight text-slate-900">
              {picked.average}
              <span className="ml-1.5 text-sm font-medium text-slate-500">mg/dL avg</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Range {picked.min}–{picked.max} · {picked.count} {picked.count === 1 ? 'reading' : 'readings'}
            </p>
            <ul className="mt-4 space-y-2">
              {TIME_SLOTS.map((slot) => (
                <li key={slot} className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TIME_SLOT_COLORS[slot] }} aria-hidden />
                  <span className="flex-1 text-slate-700">{TIME_SLOT_LABELS[slot]}</span>
                  <span className="font-semibold tabular-nums text-slate-900">{picked[slot] ?? '—'}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No readings were recorded on this day.</p>
        )}
      </div>
    </div>
  );
}

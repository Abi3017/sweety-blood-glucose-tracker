import { TIME_SLOTS, TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { formatDate } from '../../utils/dates';

/**
 * Time slots (rows) by day (columns). Each reading is a bubble: larger = higher relative to this
 * period's lowest and highest reading. Missing readings stay as tiny grey dots.
 * `rows` is [{ date, MORNING?, AFTER_BREAKFAST?, ... }].
 */
export default function BubbleMatrix({ rows }) {
  const values = rows.flatMap((r) => TIME_SLOTS.map((s) => r[s]).filter((v) => v != null));
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const size = (v) => (hi === lo ? 70 : 35 + ((v - lo) / (hi - lo)) * 65); // % of the cell

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid min-w-[44rem] items-center gap-y-1"
        style={{ gridTemplateColumns: `7.5rem repeat(${rows.length}, minmax(0, 1fr))` }}
        role="table"
        aria-label="Bubble chart of readings by time slot and day. Larger bubbles are higher readings."
      >
        {TIME_SLOTS.map((slot, r) => (
          <div key={slot} className="contents" role="row">
            <div className="pr-3 text-xs font-medium text-slate-600" role="rowheader">
              <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: TIME_SLOT_COLORS[slot] }} aria-hidden />
              {TIME_SLOT_LABELS[slot].replace(' (Fasting)', '')}
            </div>
            {rows.map((row, c) => {
              const v = row[slot];
              return (
                <div key={row.date} className="flex aspect-square items-center justify-center" role="cell">
                  {v == null ? (
                    <span className="h-1 w-1 rounded-full bg-slate-200" aria-label={`${formatDate(row.date)}: no reading`} />
                  ) : (
                    <span
                      className="cal-tile rounded-full shadow-sm transition-transform duration-200 hover:scale-125"
                      title={`${formatDate(row.date)} · ${TIME_SLOT_LABELS[slot]}: ${v} mg/dL`}
                      aria-label={`${formatDate(row.date)}, ${TIME_SLOT_LABELS[slot]}: ${v} mg/dL`}
                      style={{
                        width: `${size(v)}%`,
                        height: `${size(v)}%`,
                        background: TIME_SLOT_COLORS[slot],
                        opacity: 0.85,
                        animationDelay: `${(r * rows.length + c) * 8}ms`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div aria-hidden="true" />
        {rows.map((row, i) => (
          <div key={row.date} className="pt-1 text-center text-[10px] tabular-nums text-slate-400" aria-hidden="true">
            {i === 0 || i === rows.length - 1 || Number(row.date.slice(8)) % 5 === 0 ? Number(row.date.slice(8)) : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

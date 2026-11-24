import { TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';

/** Individual readings of the daily report, each with its time slot. */
export default function DailyReadingsList({ readings }) {
  return (
    <ul className="divide-y divide-slate-100" aria-label="Readings for the selected date">
      {readings.map((r) => (
        <li key={r.id} className="flex items-center justify-between px-5 py-3.5">
          <span className="flex items-center gap-2.5 text-sm text-slate-700">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TIME_SLOT_COLORS[r.timeSlot] }} aria-hidden />
            {TIME_SLOT_LABELS[r.timeSlot]}
          </span>
          <span className="text-sm font-semibold tabular-nums text-slate-900">
            {r.glucoseValue} <span className="text-xs font-medium text-slate-500">mg/dL</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

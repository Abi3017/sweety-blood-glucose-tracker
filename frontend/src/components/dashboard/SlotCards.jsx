import { Link } from 'react-router-dom';
import { Plus, Pencil, Sunrise, Coffee, Sun, Moon } from 'lucide-react';
import { TIME_SLOTS, TIME_SLOT_LABELS, TIME_SLOT_SHORT } from '../../utils/timeSlots';

const ICONS = { MORNING: Sunrise, AFTER_BREAKFAST: Coffee, AFTER_LUNCH: Sun, AFTER_DINNER: Moon };
const level = (v) => Math.min(Math.max((v / 300) * 100, 8), 100);

/** One card per daily slot, app-style: its reading with a level bar, or a "+ Log" button. */
export default function SlotCards({ date, readings, canAdd }) {
  const bySlot = Object.fromEntries(readings.map((r) => [r.timeSlot, r]));

  return (
    <ul className="stagger grid gap-3 sm:grid-cols-2">
      {TIME_SLOTS.map((slot) => {
        const reading = bySlot[slot];
        const Icon = ICONS[slot];
        const label = TIME_SLOT_LABELS[slot];
        return (
          <li key={slot} className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="flex-1 text-sm font-semibold text-slate-900">{label}</p>
              {reading && (
                <Link
                  to={`/readings/${reading.id}/edit`}
                  state={{ from: '/dashboard' }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                  aria-label={`Edit ${label} reading`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              )}
            </div>

            {reading ? (
              <div className="mt-3">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {reading.glucoseValue}
                  <span className="ml-1.5 text-sm font-medium text-slate-400">mg/dL</span>
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                  <div className="bar-fill h-full rounded-full bg-gradient-to-r from-brand-200 to-brand-500" style={{ width: `${level(reading.glucoseValue)}%` }} />
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-center text-sm text-slate-400">No reading yet</p>
                {canAdd && (
                  <Link
                    to={`/readings/new?date=${date}&slot=${slot}`}
                    state={{ from: '/dashboard' }}
                    className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                    aria-label={`Add ${label} reading`}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Log {TIME_SLOT_SHORT[slot]}
                  </Link>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

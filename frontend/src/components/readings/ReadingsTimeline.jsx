import { Link } from 'react-router-dom';
import { Coffee, Moon, Pencil, Sun, Sunrise, Trash2 } from 'lucide-react';
import { TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { formatDate } from '../../utils/dates';

const ICONS = { MORNING: Sunrise, AFTER_BREAKFAST: Coffee, AFTER_LUNCH: Sun, AFTER_DINNER: Moon };
const level = (v) => Math.min(Math.max((v / 300) * 100, 8), 100);
const loggedAt = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Readings in the order given, grouped into one card per date. */
function groupByDate(readings) {
  const groups = [];
  readings.forEach((r) => {
    const last = groups[groups.length - 1];
    if (last && last.date === r.readingDate) last.items.push(r);
    else groups.push({ date: r.readingDate, items: [r] });
  });
  return groups;
}

/** Day-by-day timeline: a date badge on the left, that day's readings as cards on the right. */
export default function ReadingsTimeline({ readings, onDelete }) {
  const groups = groupByDate(readings);

  return (
    <ol className="stagger relative space-y-5 p-4 sm:p-5 md:before:absolute md:before:bottom-8 md:before:left-[3.9rem] md:before:top-8 md:before:w-px md:before:border-l md:before:border-dashed md:before:border-slate-200">
      {groups.map((g) => {
        const d = new Date(`${g.date}T00:00:00Z`);
        return (
          <li key={g.date} className="relative flex flex-col gap-3 md:flex-row md:gap-5">
            <div className="z-10 flex shrink-0 items-center gap-3 md:w-[4.5rem] md:flex-col md:gap-0">
              <div className="flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700 shadow-sm ring-4 ring-white">
                <span className="text-[10px] font-bold uppercase tracking-wide">{d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span>
                <span className="text-2xl font-semibold leading-none tabular-nums">{d.getUTCDate()}</span>
              </div>
              <p className="text-xs font-medium text-slate-400 md:mt-1.5">{d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</p>
            </div>

            <ul className="grid flex-1 gap-3 sm:grid-cols-2">
              {g.items.map((r) => {
                const Icon = ICONS[r.timeSlot];
                const label = TIME_SLOT_LABELS[r.timeSlot];
                const when = formatDate(r.readingDate);
                return (
                  <li key={r.id} className="group rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{label}</p>
                        <p className="text-[11px] text-slate-400">Logged {loggedAt(r.createdAt)}</p>
                      </div>
                      <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                        <Link
                          to={`/readings/${r.id}/edit`}
                          state={{ from: '/readings' }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
                          aria-label={`Edit ${label} reading on ${when}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(r)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${label} reading on ${when}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                      {r.glucoseValue}
                      <span className="ml-1.5 text-sm font-medium text-slate-400">mg/dL</span>
                    </p>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                      <div className="bar-fill h-full rounded-full bg-gradient-to-r from-brand-200 to-brand-500" style={{ width: `${level(r.glucoseValue)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

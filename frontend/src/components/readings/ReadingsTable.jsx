import { Link } from 'react-router-dom';
import { Coffee, Moon, Pencil, Sun, Sunrise, Trash2 } from 'lucide-react';
import { TIME_SLOT_COLORS, TIME_SLOT_LABELS } from '../../utils/timeSlots';
import { formatDate } from '../../utils/dates';

const ICONS = { MORNING: Sunrise, AFTER_BREAKFAST: Coffee, AFTER_LUNCH: Sun, AFTER_DINNER: Moon };
const level = (v) => Math.min(Math.max((v / 300) * 100, 6), 100);
const loggedAt = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const head = 'px-4 pb-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400';

/** Table with each row drawn as its own rounded strip: slot chip, value with a level bar, actions on hover. */
export default function ReadingsTable({ readings, onDelete }) {
  return (
    <div className="overflow-x-auto px-3 pb-3 pt-2 sm:px-4">
      <table className="w-full border-separate border-spacing-y-2 text-sm">
        <caption className="sr-only">Your glucose readings</caption>
        <thead>
          <tr>
            <th scope="col" className={head}>Date</th>
            <th scope="col" className={head}>Time slot</th>
            <th scope="col" className={`${head} w-[32%]`}>Glucose (mg/dL)</th>
            <th scope="col" className={head}>Logged</th>
            <th scope="col" className={`${head} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="stagger">
          {readings.map((r) => {
            const Icon = ICONS[r.timeSlot];
            const label = TIME_SLOT_LABELS[r.timeSlot];
            const when = formatDate(r.readingDate);
            const d = new Date(`${r.readingDate}T00:00:00Z`);
            const cell = 'bg-slate-50 px-4 py-3 transition-colors group-hover:bg-brand-50';
            return (
              <tr key={r.id} className="group">
                <td className={`${cell} rounded-l-2xl`}>
                  <p className="whitespace-nowrap font-semibold text-slate-900">{when}</p>
                  <p className="text-xs text-slate-400">{d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })}</p>
                </td>
                <td className={cell}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: TIME_SLOT_COLORS[r.timeSlot] }}>
                      <Icon className="h-3 w-3" aria-hidden />
                    </span>
                    {label}
                  </span>
                </td>
                <td className={cell}>
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-lg font-semibold tabular-nums text-slate-900">{r.glucoseValue}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white" aria-hidden="true">
                      <div className="bar-fill h-full rounded-full bg-gradient-to-r from-brand-200 to-brand-500" style={{ width: `${level(r.glucoseValue)}%` }} />
                    </div>
                  </div>
                </td>
                <td className={`${cell} whitespace-nowrap text-xs text-slate-500`}>{loggedAt(r.createdAt)}</td>
                <td className={`${cell} rounded-r-2xl`}>
                  <div className="flex justify-end gap-1.5">
                    <Link
                      to={`/readings/${r.id}/edit`}
                      state={{ from: '/readings' }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-brand-700 hover:shadow"
                      aria-label={`Edit ${label} reading on ${when}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(r)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-red-600 hover:shadow"
                      aria-label={`Delete ${label} reading on ${when}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

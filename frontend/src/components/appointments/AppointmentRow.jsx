import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { describeWhen, formatTime, startsAt } from '../../utils/appointments';

/** One appointment: date block, doctor, when/where, and edit/delete actions. */
export default function AppointmentRow({ appointment, past = false, onEdit, onDelete }) {
  const d = startsAt(appointment);
  return (
    <li className={`rounded-3xl border border-slate-200/70 bg-white p-3 shadow-sm ${past ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl ${past ? 'bg-slate-100 text-slate-500' : 'bg-brand-50 text-brand-700'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wide">{d.toLocaleDateString('en-GB', { month: 'short' })}</span>
          <span className="text-2xl font-semibold leading-none tabular-nums">{d.getDate()}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{appointment.doctor}</p>
            {appointment.specialty && <span className="rounded-full bg-tint-lilac px-2.5 py-0.5 text-[11px] font-medium text-slate-600">{appointment.specialty}</span>}
          </div>
          <p className="mt-0.5 text-sm text-slate-600">
            {past ? `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(appointment.time)}` : describeWhen(appointment)}
          </p>
          {appointment.location && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-400">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              {appointment.location}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={() => onEdit(appointment)} aria-label={`Edit appointment with ${appointment.doctor}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onDelete(appointment)} aria-label={`Delete appointment with ${appointment.doctor}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {appointment.notes && <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-600">{appointment.notes}</p>}
    </li>
  );
}

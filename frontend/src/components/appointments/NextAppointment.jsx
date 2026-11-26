import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, MapPin, Plus } from 'lucide-react';
import { daysUntil, describeWhen } from '../../utils/appointments';

const addClass = 'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700';

/** Highlight card for the soonest upcoming appointment, or an invitation to add one. */
export default function NextAppointment({ appointment, large = false, onAdd }) {
  if (!appointment) {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tint-lilac text-slate-600">
            <CalendarClock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Doctor appointment</p>
            <p className="text-xs text-slate-500">Nothing scheduled</p>
          </div>
        </div>
        {/* On the appointments page the form opens in place; elsewhere this links there. */}
        {onAdd ? (
          <button type="button" onClick={onAdd} className={addClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Add appointment
          </button>
        ) : (
          <Link to="/appointments?new=1" className={addClass}>
            <Plus className="h-4 w-4" aria-hidden />
            Add appointment
          </Link>
        )}
      </div>
    );
  }

  const days = daysUntil(appointment);
  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-tint-lilac via-white to-tint-sky p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next appointment</p>
          <p className={`mt-1 truncate font-semibold tracking-tight text-slate-900 ${large ? 'text-2xl' : 'text-lg'}`}>{appointment.doctor}</p>
          {appointment.specialty && <p className="text-sm text-slate-500">{appointment.specialty}</p>}
        </div>
        <div className="shrink-0 rounded-2xl bg-white px-3.5 py-2 text-center shadow-sm">
          <p className="text-2xl font-semibold leading-none tabular-nums text-brand-600">{days === 0 ? 'Today' : days}</p>
          {days !== 0 && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{days === 1 ? 'day' : 'days'}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">{describeWhen(appointment)}</p>
      {appointment.location && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{appointment.location}</span>
        </p>
      )}
      <Link to="/appointments" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
        All appointments
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

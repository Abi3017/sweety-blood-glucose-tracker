import { CalendarDays, X } from 'lucide-react';
import { TIME_SLOT_OPTIONS } from '../../utils/timeSlots';
import { todayISO } from '../../utils/dates';

const SLOT_SHORT = { MORNING: 'Morning', AFTER_BREAKFAST: 'Breakfast', AFTER_LUNCH: 'Lunch', AFTER_DINNER: 'Dinner' };

/** Date inputs shaped as pills, plus one-tap time-slot pills. */
export default function ReadingFilters({ filters, onChange, onClear }) {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const active = filters.startDate || filters.endDate || filters.timeSlot;
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate;
  const slots = [{ value: '', label: 'All' }, ...TIME_SLOT_OPTIONS.map((o) => ({ value: o.value, label: SLOT_SHORT[o.value] }))];

  const dateInput = (key, label) => (
    <label className={`flex h-11 items-center gap-2 rounded-full border bg-white px-4 text-sm shadow-sm ${invalidRange ? 'border-red-300' : 'border-slate-200'}`}>
      <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <input type="date" max={todayISO()} value={filters[key]} onChange={set(key)} className="bg-transparent text-sm text-slate-800 focus:outline-none" />
    </label>
  );

  return (
    <div className="space-y-3 border-b border-slate-100 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by time slot">
        {slots.map((s) => {
          const on = filters.timeSlot === s.value;
          return (
            <button
              key={s.value || 'all'}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filters, timeSlot: s.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                on ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {dateInput('startDate', 'From')}
        {dateInput('endDate', 'To')}
        {active && (
          <button type="button" onClick={onClear} className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-4 w-4" aria-hidden />
            Clear
          </button>
        )}
      </div>
      {invalidRange && (
        <p role="alert" className="text-sm text-red-600">
          &quot;To&quot; must be on or after &quot;From&quot;.
        </p>
      )}
    </div>
  );
}

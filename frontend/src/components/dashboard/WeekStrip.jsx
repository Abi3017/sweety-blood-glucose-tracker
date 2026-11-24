import { addDays, todayISO } from '../../utils/dates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Seven-day picker centred on the selected date. Future days are disabled. */
export default function WeekStrip({ date, onSelect }) {
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i - 3));

  return (
    <div className="flex gap-1.5" role="group" aria-label="Choose a day">
      {days.map((d) => {
        const selected = d === date;
        const future = d > today;
        const weekday = WEEKDAYS[new Date(`${d}T00:00:00Z`).getUTCDay()];
        return (
          <button
            key={d}
            type="button"
            disabled={future}
            onClick={() => onSelect(d)}
            aria-pressed={selected}
            aria-label={`${weekday} ${Number(d.slice(8))}`}
            className={`flex flex-1 flex-col items-center gap-1 rounded-full px-0 py-2.5 text-center transition-all duration-300 ${
              selected
                ? 'scale-105 bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : future
                  ? 'cursor-not-allowed bg-slate-100/60 text-slate-300'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
            }`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">{weekday}</span>
            <span className="text-sm font-semibold tabular-nums">{Number(d.slice(8))}</span>
            <span className={`h-1.5 w-1.5 rounded-full transition-opacity ${selected ? 'bg-white opacity-100' : 'opacity-0'}`} />
          </button>
        );
      })}
    </div>
  );
}

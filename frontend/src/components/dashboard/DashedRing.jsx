const TICKS = 60;
const CENTER = 100;
const INNER = 80;
const OUTER = 94;

/** Ring made of 60 dashes that light up one by one as `done` approaches `total`. */
export default function DashedRing({ done, total, label = "Today's readings", large = false }) {
  const complete = done >= total;
  const lit = Math.round(Math.min(done / total, 1) * TICKS);
  const color = complete ? '#22c55e' : '#f97316';

  return (
    <div className={`relative mx-auto aspect-square w-full ${large ? 'max-w-[17rem]' : 'max-w-[11.5rem]'}`} role="img" aria-label={`${done} of ${total} readings recorded.`}>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {Array.from({ length: TICKS }, (_, i) => {
          const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const on = i < lit;
          return (
            <line
              key={i}
              x1={CENTER + Math.cos(angle) * INNER}
              y1={CENTER + Math.sin(angle) * INNER}
              x2={CENTER + Math.cos(angle) * OUTER}
              y2={CENTER + Math.sin(angle) * OUTER}
              strokeWidth="4.5"
              strokeLinecap="round"
              stroke={on ? color : 'currentColor'}
              className={on ? 'tick-on' : 'text-slate-200'}
              style={on ? { animationDelay: `${i * 22}ms` } : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_8px_30px_-12px_rgb(15_23_42/0.25)]">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <span className={`font-semibold tabular-nums leading-tight text-slate-900 ${large ? 'text-6xl' : 'text-4xl'}`}>
          {done}
          <span className="text-lg font-medium text-slate-400">/{total}</span>
        </span>
        <span
          className={`mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            complete ? 'bg-mint-100 text-mint-700' : 'bg-brand-50 text-brand-700'
          }`}
        >
          {complete ? 'Complete' : 'In progress'}
        </span>
      </div>
    </div>
  );
}

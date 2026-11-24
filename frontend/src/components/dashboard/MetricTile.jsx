import { useCountUp } from '../../hooks/useCountUp';

/** Nested metric card: label, animated number and a mini bar per time slot. */
const TONES = { peach: 'bg-tint-peach', mint: 'bg-tint-mint', lilac: 'bg-tint-lilac' };

export default function MetricTile({ label, value, unit = 'mg/dL', bars, highlight, tone = 'peach' }) {
  const hasValue = value !== null && value !== undefined;
  const num = hasValue ? Number(value) : null;
  const decimals = hasValue && String(value).includes('.') ? String(value).split('.')[1].length : 0;
  const animated = useCountUp(num, { decimals });
  const max = Math.max(...bars.map((b) => b ?? 0), 1);

  return (
    <div className={`rounded-2xl border border-white/60 p-2.5 ${TONES[tone]}`}>
      <p className="px-1.5 pb-2 pt-1 text-sm font-semibold text-slate-800">{label}</p>
      <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-sm">
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
            {hasValue ? animated ?? value : '—'}
            {hasValue && <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>}
          </p>
          <div className="flex h-9 items-end gap-1" aria-hidden="true">
            {bars.map((b, i) => (
              <span
                key={i}
                className={`bar-grow w-1.5 rounded-full ${b != null && highlight?.(b, bars) ? 'bg-brand-500' : 'bg-slate-200'}`}
                style={{ height: `${b == null ? 18 : Math.max((b / max) * 100, 22)}%`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import Tilt from './Tilt';
import { useCountUp } from '../../hooks/useCountUp';

/** One summary statistic. Shows an em dash when there is no data rather than a fake 0. */
export default function StatCard({ label, value, unit = 'mg/dL', icon: Icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    mint: 'bg-mint-50 text-mint-700',
    slate: 'bg-slate-100 text-slate-600',
  };
  const hasValue = value !== null && value !== undefined;
  const num = hasValue ? Number(value) : null;
  const decimals = hasValue && String(value).includes('.') ? String(value).split('.')[1].length : 0;
  const animated = useCountUp(num, { decimals });
  const shown = hasValue ? (animated ?? value) : '—';
  return (
    <Tilt className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
        {shown}
        {hasValue && unit && <span className="ml-1.5 text-sm font-medium text-slate-500">{unit}</span>}
      </p>
    </Tilt>
  );
}

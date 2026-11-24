import { CalendarCheck } from 'lucide-react';
import Card from '../common/Card';
import DashedRing from './DashedRing';
import { useCountUp } from '../../hooks/useCountUp';

/** App-home score card: big dashed ring, a friendly message and the logging streak. */
export default function ProgressSummary({ done, total, streak, message }) {
  const streakShown = useCountUp(streak ?? 0, { duration: 1000 });

  return (
    <Card className="flex flex-col items-center gap-4 bg-gradient-to-b from-white to-tint-peach p-6 text-center">
      <DashedRing done={done} total={total} large />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {streak !== null && (
        <div className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm" title="Consecutive days with at least one reading">
          <CalendarCheck className="h-5 w-5 text-brand-600" aria-hidden />
          <span className="text-sm text-slate-600">
            <span className="text-base font-semibold tabular-nums text-slate-900">{streakShown}</span> day streak
          </span>
        </div>
      )}
    </Card>
  );
}

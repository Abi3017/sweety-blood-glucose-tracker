import { Clock } from 'lucide-react';
import MealCard from './MealCard';
import { useNow } from '../../hooks/useNow';
import { mealForTime } from '../../utils/foodPlan';

/** Shows only the meal that fits the current time, and updates as the clock moves on. */
export default function TimedMealCard({ compact = false, linkTo }) {
  const now = useNow();
  const slot = mealForTime(now);
  const clock = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm">
        <Clock className="h-4 w-4 text-brand-600" aria-hidden />
        <span className="font-semibold tabular-nums text-slate-900">{clock}</span>
        <span className="text-slate-400">·</span>
        <span className="font-medium text-slate-700">{slot.title}</span>
      </div>
      <p className="mb-3 px-1 text-sm text-slate-500">{slot.note}</p>
      <MealCard key={slot.key} mealKey={slot.key} compact={compact} linkTo={linkTo} />
    </div>
  );
}

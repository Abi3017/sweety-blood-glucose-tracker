import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { MEALS, MEAL_TABS } from '../../utils/foodPlan';

/** A suggested meal with a floating "plate", tags and ← → buttons to browse other ideas. */
export default function MealCard({ mealKey, compact = false, linkTo }) {
  const meals = MEALS[mealKey];
  const [index, setIndex] = useState(0);
  const meal = meals[index];
  const tab = MEAL_TABS.find((t) => t.key === mealKey);
  const step = (d) => setIndex((i) => (i + d + meals.length) % meals.length);

  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-tint-mint via-white to-tint-peach p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          Suggested {tab.label.toLowerCase()}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous idea" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-700">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs tabular-nums text-slate-400" aria-live="polite">
            {index + 1}/{meals.length}
          </span>
          <button type="button" onClick={() => step(1)} aria-label="Next idea" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-500 hover:text-brand-700">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div key={meal.id} className={`animate-pop-in mt-4 flex ${compact ? 'items-center gap-4' : 'flex-col items-center gap-2 text-center sm:flex-row sm:gap-6 sm:text-left'}`}>
        <div className={`plate animate-float shrink-0 ${compact ? 'h-20 w-20 text-4xl' : 'h-32 w-32 text-6xl'}`} aria-hidden="true">
          {meal.emoji}
        </div>
        <div className="min-w-0">
          <h3 className={`font-semibold tracking-tight text-slate-900 ${compact ? 'text-base' : 'text-xl'}`}>{meal.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{meal.description}</p>
          <div className={`mt-3 flex flex-wrap gap-2 ${compact ? '' : 'justify-center sm:justify-start'}`}>
            {meal.tags.map((t) => (
              <span key={t} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {linkTo && (
        <Link to={linkTo} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          Open food plan
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import Card from '../components/common/Card';
import MealCard from '../components/food/MealCard';
import PlateGuide from '../components/food/PlateGuide';
import TimedMealCard from '../components/food/TimedMealCard';
import PageHeader from '../components/layout/PageHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { FOOD_DISCLAIMER, HABITS, MEAL_TABS } from '../utils/foodPlan';

export default function FoodPlan() {
  useDocumentTitle('Food plan');
  const [browsing, setBrowsing] = useState(false);
  const [tab, setTab] = useState('dinner');

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Food plan" description="Meal ideas that fit the time of day." />

      <div role="note" className="animate-fade-up mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-slate-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <p>{FOOD_DISCLAIMER}</p>
      </div>

      {/* Only what fits the current time is shown by default. */}
      <TimedMealCard />

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setBrowsing((b) => !b)}
          aria-expanded={browsing}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-700"
        >
          {browsing ? 'Hide other meals' : 'Browse other meals'}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${browsing ? 'rotate-180' : ''}`} aria-hidden />
        </button>

        {browsing && (
          <div className="animate-fade-up mt-4">
            <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-full bg-slate-100 p-1" role="tablist" aria-label="Meal type">
              {MEAL_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span aria-hidden="true">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
            <div role="tabpanel">
              <MealCard key={tab} mealKey={tab} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Build your plate</h2>
          <PlateGuide />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Daily habits</h2>
          <ul className="stagger space-y-3">
            {HABITS.map((h) => (
              <li key={h.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm" aria-hidden="true">
                  {h.emoji}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{h.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

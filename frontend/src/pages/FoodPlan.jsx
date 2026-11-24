import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import Card from '../components/common/Card';
import MealCard from '../components/food/MealCard';
import PlateGuide from '../components/food/PlateGuide';
import PageHeader from '../components/layout/PageHeader';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getDailyReport } from '../services/reportService';
import { todayISO } from '../utils/dates';
import { FOOD_DISCLAIMER, HABITS, MEAL_TABS, suggestedMealKey } from '../utils/foodPlan';
import { TIME_SLOTS } from '../utils/timeSlots';

export default function FoodPlan() {
  useDocumentTitle('Food plan');
  const today = useAsync(() => getDailyReport(todayISO()), []);
  const [tab, setTab] = useState('breakfast');
  const [touched, setTouched] = useState(false);

  // Start on the meal that matches your next unlogged slot, unless you've already picked a tab.
  useEffect(() => {
    if (today.data && !touched) setTab(suggestedMealKey(today.data.readings, TIME_SLOTS));
  }, [today.data, touched]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Food plan" description="Meal ideas to go with your day. Browse them, or follow the plate guide." />

      <div role="note" className="animate-fade-up mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-slate-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <p>{FOOD_DISCLAIMER}</p>
      </div>

      <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-full bg-slate-100 p-1" role="tablist" aria-label="Meal type">
        {MEAL_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => {
              setTouched(true);
              setTab(t.key);
            }}
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

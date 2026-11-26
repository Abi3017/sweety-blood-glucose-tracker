import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, LineChart as LineChartIcon, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Mascot from '../components/common/Mascot';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import MetricTile from '../components/dashboard/MetricTile';
import MonthDonut from '../components/dashboard/MonthDonut';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import NextAppointment from '../components/appointments/NextAppointment';
import RemindersCard from '../components/reminders/RemindersCard';
import TimedMealCard from '../components/food/TimedMealCard';
import SlotCards from '../components/dashboard/SlotCards';
import WeekStrip from '../components/dashboard/WeekStrip';
import DailySlotChart from '../components/dashboard/DailySlotChart';
import GlucoseTrendChart from '../components/reports/GlucoseTrendChart';
import { useAuth } from '../context/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLegacyAppointmentImport } from '../hooks/useLegacyAppointmentImport';
import { listAppointments } from '../services/appointmentService';
import { splitAppointments } from '../utils/appointments';
import { getDailyReport, getMonthToDateReport, getPreviousMonthReport } from '../services/reportService';
import { formatDate, formatLongDate, formatRange, todayISO } from '../utils/dates';
import { calculateStreak } from '../utils/streak';
import { TIME_SLOTS } from '../utils/timeSlots';
import { MAX_READINGS_PER_DAY } from '../utils/messages';

/** Section title used above the cards. */
function SectionTitle({ children, right }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 px-1">
      <h2 className="text-base font-semibold text-slate-900">{children}</h2>
      {right}
    </div>
  );
}

/** Website dashboard: two columns on wide screens (ring + summary | schedule + charts), stacked on phones. */
export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [date, setDate] = useState(todayISO());

  const daily = useAsync(() => getDailyReport(date), [date]);
  const monthly = useAsync(() => getMonthToDateReport(date), [date]);
  // Previous month lets the streak carry across the 1st of a month.
  const previous = useAsync(() => getPreviousMonthReport(date).catch(() => null), [date]);

  const appointments = useAsync(() => listAppointments().catch(() => null), []);
  // Moves appointments an earlier version saved in this browser into the account, then refreshes.
  useLegacyAppointmentImport(user.id, () => appointments.reload());
  const nextAppointment = splitAppointments(appointments.data ?? []).upcoming[0];
  const report = daily.data;
  const firstName = user?.name?.split(' ')[0] || '';
  const recorded = report ? report.readings.length : 0;
  const left = MAX_READINGS_PER_DAY - recorded;
  const canAdd = report ? left > 0 : false;
  const isToday = date === todayISO();
  const streak =
    monthly.data && !previous.loading
      ? calculateStreak([...(previous.data?.readings ?? []), ...monthly.data.readings].map((r) => r.readingDate), date)
      : null;

  // Value per slot (null when missing) feeds the mini bars.
  const bars = report ? TIME_SLOTS.map((slot) => report.readings.find((r) => r.timeSlot === slot)?.glucoseValue ?? null) : [];
  const message =
    recorded === 0
      ? "Let's log your first reading."
      : left === 0
        ? 'All done — great consistency!'
        : `${left} more to go. You've got this!`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hi, {firstName} <span className="animate-wave-hand" aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s your day overview · {isToday ? 'Today' : formatLongDate(date)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-12 cursor-pointer items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300">
            <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
            <span className="sr-only">Selected date</span>
            <input
              type="date"
              max={todayISO()}
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="cursor-pointer bg-transparent text-sm font-medium focus:outline-none"
            />
          </label>
          <Link
            to={`/readings/new?date=${date}`}
            state={{ from: '/dashboard' }}
            className="group inline-flex h-12 items-center gap-4 rounded-full bg-brand-600 pl-6 pr-1.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Add reading
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-600 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </div>
      </div>

      <RemindersCard
        todayReadings={isToday && report ? report.readings : null}
        appointments={appointments.data}
        showReadings={isToday}
      />

      {daily.loading && <LoadingState label="Loading your day…" />}
      {!daily.loading && daily.error && (
        <Card>
          <ErrorState message={daily.error.message} onRetry={daily.reload} />
        </Card>
      )}

      {!daily.loading && report && (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* Left: score ring and summary */}
          <div className="space-y-6 lg:col-span-4">
            <ProgressSummary done={recorded} total={MAX_READINGS_PER_DAY} streak={streak} message={message} />

            <section aria-label="Summary">
              <SectionTitle>Summary</SectionTitle>
              <div className="stagger -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible lg:pb-0">
                <div className="min-w-[15rem] flex-1 snap-start lg:min-w-0">
                  <MetricTile tone="peach" label="Highest" value={report.stats?.highest} bars={bars} highlight={(b, all) => b === Math.max(...all.filter((x) => x != null))} />
                </div>
                <div className="min-w-[15rem] flex-1 snap-start lg:min-w-0">
                  <MetricTile tone="mint" label="Lowest" value={report.stats?.lowest} bars={bars} highlight={(b, all) => b === Math.min(...all.filter((x) => x != null))} />
                </div>
                <div className="min-w-[15rem] flex-1 snap-start lg:min-w-0">
                  <MetricTile tone="lilac" label="Average" value={report.stats ? report.stats.average.toFixed(1) : null} bars={bars} highlight={() => true} />
                </div>
              </div>
            </section>

            <NextAppointment appointment={nextAppointment} />
          </div>

          {/* Right: week, slots and day chart */}
          <div className="space-y-6 lg:col-span-8">
            <Card className="p-5">
              <SectionTitle right={<span className="text-xs font-medium text-slate-400">{recorded} of {MAX_READINGS_PER_DAY} recorded</span>}>Schedule</SectionTitle>
              <WeekStrip date={date} onSelect={setDate} />

              {recorded === 0 && (
                <div className="mt-5 flex flex-col items-center rounded-3xl bg-tint-peach p-6 text-center sm:flex-row sm:text-left">
                  <Mascot size={96} />
                  <div className="sm:ml-5">
                    <h3 className="text-lg font-semibold text-slate-900">No readings yet</h3>
                    <p className="mt-1 text-sm text-slate-600">Log a glucose reading to start tracking your day.</p>
                    <Link
                      to={`/readings/new?date=${date}`}
                      state={{ from: '/dashboard' }}
                      className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:text-brand-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Log reading
                    </Link>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <SlotCards date={date} readings={report.readings} canAdd={canAdd} />
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>Through the day</SectionTitle>
              {recorded >= 2 ? (
                <DailySlotChart readings={report.readings} />
              ) : (
                <EmptyState icon={LineChartIcon} title="Not enough data for a trend" description="Add at least two readings on this date to see how your glucose changed through the day." />
              )}
            </Card>

            <TimedMealCard compact linkTo="/food-plan" />
          </div>
        </div>
      )}

      {!monthly.loading && monthly.data && (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <Card className="p-5 lg:col-span-4">
            <SectionTitle>Readings by time slot</SectionTitle>
            {monthly.data.isEmpty ? (
              <EmptyState mascot icon={LineChartIcon} title="No readings yet" description="Log a reading and your monthly breakdown will appear here." />
            ) : (
              <MonthDonut readings={monthly.data.readings} monthLabel={formatDate(date, { month: 'long' })} />
            )}
          </Card>

          <Card className="p-5 lg:col-span-8">
            <SectionTitle right={<span className="text-xs text-slate-500">{formatRange(monthly.data.range)}</span>}>This month so far</SectionTitle>
            {monthly.data.isEmpty ? (
              <EmptyState icon={LineChartIcon} title="No readings this month yet" description="Your monthly trend will appear here." />
            ) : (
              <GlucoseTrendChart {...monthly.data.range} readings={monthly.data.readings} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import FormField from '../components/common/FormField';
import { LoadingState, ErrorState, EmptyState } from '../components/common/States';
import PageHeader from '../components/layout/PageHeader';
import ReportTabs from '../components/reports/ReportTabs';
import StatsGrid from '../components/reports/StatsGrid';
import GlucoseTrendChart from '../components/reports/GlucoseTrendChart';
import DailyReadingsList from '../components/reports/DailyReadingsList';
import ReadingsBySlotTable from '../components/reports/ReadingsBySlotTable';
import DailySlotChart from '../components/dashboard/DailySlotChart';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getDailyReport, getMonthToDateReport, getPreviousMonthReport } from '../services/reportService';
import { formatDate, formatRange, todayISO } from '../utils/dates';

const TABS = [
  { id: 'daily', label: 'Daily', dateLabel: 'Report date', load: getDailyReport },
  { id: 'mtd', label: 'Month-to-date', dateLabel: 'Up to date', load: getMonthToDateReport },
  { id: 'previous', label: 'Previous month', dateLabel: 'Reference date', load: getPreviousMonthReport },
];

const DESCRIPTIONS = {
  daily: 'Readings for the selected date.',
  mtd: 'From the 1st of the month through the selected date.',
  previous: 'The whole calendar month before the reference date.',
};

export default function Reports() {
  useDocumentTitle('Reports');
  const [tabId, setTabId] = useState('daily');
  const [date, setDate] = useState(todayISO());
  const tab = TABS.find((t) => t.id === tabId);

  const { data: report, loading, error, reload } = useAsync(() => tab.load(date), [tabId, date]);

  return (
    <>
      <PageHeader title="Reports" description="Summaries of your readings for a day or a month." />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <ReportTabs tabs={TABS} active={tabId} onChange={setTabId} />
        <FormField
          label={tab.dateLabel}
          type="date"
          max={todayISO()}
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="w-44"
        />
      </div>

      <div id={`panel-${tabId}`} role="tabpanel" aria-labelledby={`tab-${tabId}`} className="space-y-6">
        {loading && <LoadingState label="Calculating report…" />}
        {!loading && error && (
          <Card>
            <ErrorState message={error.message} onRetry={reload} />
          </Card>
        )}

        {!loading && report && (
          <>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{formatRange(report.range)}</span> · {DESCRIPTIONS[tabId]}
            </p>

            {report.isEmpty ? (
              <Card>
                <EmptyState
                  icon={BarChart3}
                  title="No readings for this period"
                  description={`You have no readings between ${formatDate(report.range.startDate)} and ${formatDate(
                    report.range.endDate,
                  )}. Statistics will appear once readings are added.`}
                />
              </Card>
            ) : (
              <>
                <StatsGrid stats={report.stats} />

                {tabId === 'daily' ? (
                  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                    <Card>
                      <CardHeader title="Readings" description="Each reading with its time slot." />
                      <DailyReadingsList readings={report.readings} />
                    </Card>
                    <Card>
                      <CardHeader title="Through the day" />
                      <div className="p-5">
                        {report.readings.length >= 2 ? (
                          <DailySlotChart readings={report.readings} />
                        ) : (
                          <p className="py-10 text-center text-sm text-slate-500">Add another reading on this date to see a trend.</p>
                        )}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardHeader title="Glucose over time" description="One line per time slot. Gaps mean no reading on that date." />
                      <div className="p-5">
                        <GlucoseTrendChart {...report.range} readings={report.readings} />
                      </div>
                    </Card>
                    <Card>
                      <CardHeader title="All readings" description="Readings in this period by date and time slot (mg/dL)." />
                      <ReadingsBySlotTable readings={report.readings} />
                    </Card>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

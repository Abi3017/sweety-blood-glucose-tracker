import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList, LayoutList, Rows3 } from 'lucide-react';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { LoadingState, EmptyState, ErrorState } from '../components/common/States';
import PageHeader from '../components/layout/PageHeader';
import ReadingFilters from '../components/readings/ReadingFilters';
import ReadingsTable from '../components/readings/ReadingsTable';
import ReadingsTimeline from '../components/readings/ReadingsTimeline';
import Pagination from '../components/readings/Pagination';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { deleteReading, getReadings } from '../services/readingService';
import { TIME_SLOT_LABELS } from '../utils/timeSlots';
import { formatDate } from '../utils/dates';

const EMPTY_FILTERS = { startDate: '', endDate: '', timeSlot: '' };
const PAGE_SIZE = 10;
const VIEW_KEY = 'sweety.readingsView';

function loadView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'timeline' ? 'timeline' : 'table';
  } catch {
    return 'table';
  }
}

export default function Readings() {
  useDocumentTitle('Readings');
  const toast = useToast();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [view, setView] = useState(loadView);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rangeInvalid = filters.startDate && filters.endDate && filters.startDate > filters.endDate;
  const { data, loading, error, reload } = useAsync(
    () => (rangeInvalid ? Promise.resolve(null) : getReadings({ ...filters, page, limit: PAGE_SIZE })),
    [filters, page, rangeInvalid],
  );

  const updateFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteReading(toDelete.id);
      toast.success('Reading deleted.');
      setToDelete(null);
      // Step back a page if the last item on this page was removed.
      if (data.readings.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const chooseView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* the choice just won't persist */
    }
  };

  const hasFilters = filters.startDate || filters.endDate || filters.timeSlot;

  return (
    <>
      <PageHeader
        title="Reading history"
        description="All of your recorded glucose readings."
        action={
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-slate-100 p-1 md:inline-flex" role="group" aria-label="Layout">
              {[
                ['table', 'Table', Rows3],
                ['timeline', 'Timeline', LayoutList],
              ].map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={view === id}
                  onClick={() => chooseView(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 ${view === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          <Link
            to="/readings/new"
            state={{ from: '/readings' }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add reading
          </Link>
          </div>
        }
      />

      <Card>
        <ReadingFilters filters={filters} onChange={updateFilters} onClear={() => updateFilters(EMPTY_FILTERS)} />

        {loading && <LoadingState label="Loading readings…" />}
        {!loading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!loading && !error && data && data.readings.length === 0 && (
          <EmptyState
            mascot={!hasFilters}
            icon={ClipboardList}
            title={hasFilters ? 'No readings match these filters' : 'No readings yet'}
            description={
              hasFilters
                ? 'Try a different date range or time slot.'
                : 'Add your first glucose reading to start building your history.'
            }
          />
        )}
        {!loading && !error && data && data.readings.length > 0 && (
          <>
            {view === 'table' ? (
              <>
                <div className="hidden md:block">
                  <ReadingsTable readings={data.readings} onDelete={setToDelete} />
                </div>
                <div className="md:hidden">
                  <ReadingsTimeline readings={data.readings} onDelete={setToDelete} />
                </div>
              </>
            ) : (
              <ReadingsTimeline readings={data.readings} onDelete={setToDelete} />
            )}
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this reading?"
        description={
          toDelete
            ? `${TIME_SLOT_LABELS[toDelete.timeSlot]} reading of ${toDelete.glucoseValue} mg/dL on ${formatDate(
                toDelete.readingDate,
              )} will be permanently deleted.`
            : ''
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

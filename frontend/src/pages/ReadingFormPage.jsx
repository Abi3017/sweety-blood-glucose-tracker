import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Card from '../components/common/Card';
import PageHeader from '../components/layout/PageHeader';
import ReadingForm from '../components/readings/ReadingForm';
import { LoadingState, ErrorState } from '../components/common/States';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { createReading, getReading, updateReading } from '../services/readingService';
import { TIME_SLOTS } from '../utils/timeSlots';
import { isValidISODate } from '../utils/dates';

/** /readings/new (optionally ?date=&slot=) and /readings/:id/edit */
export default function ReadingFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? 'Edit reading' : 'Add reading');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const returnTo = location.state?.from || (isEdit ? '/readings' : '/dashboard');

  const existing = useAsync(() => (isEdit ? getReading(id) : Promise.resolve(null)), [id, isEdit]);

  const presetDate = searchParams.get('date');
  const presetSlot = searchParams.get('slot');
  const defaults = isEdit
    ? existing.data && {
        readingDate: existing.data.readingDate,
        timeSlot: existing.data.timeSlot,
        glucoseValue: String(existing.data.glucoseValue),
      }
    : {
        ...(isValidISODate(presetDate) ? { readingDate: presetDate } : {}),
        ...(TIME_SLOTS.includes(presetSlot) ? { timeSlot: presetSlot } : {}),
      };

  const handleSubmit = async (values) => {
    if (isEdit) {
      await updateReading(id, values);
      toast.success('Reading updated.');
    } else {
      await createReading(values);
      toast.success('Reading saved.');
    }
    navigate(returnTo, { replace: true });
  };

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit reading' : 'Add reading'}
        description={isEdit ? 'Update the date, time slot or value.' : 'Record a blood glucose measurement.'}
      />
      <Card className="max-w-xl p-5 sm:p-6">
        {isEdit && existing.loading && <LoadingState />}
        {isEdit && existing.error && <ErrorState message={existing.error.message} onRetry={existing.reload} />}
        {defaults && (
          <ReadingForm
            key={id || 'new'}
            defaultValues={defaults}
            onSubmit={handleSubmit}
            onCancel={() => navigate(returnTo)}
            submitLabel={isEdit ? 'Save changes' : 'Save reading'}
          />
        )}
      </Card>
    </>
  );
}

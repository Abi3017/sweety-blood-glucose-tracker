import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardCopy, Plus, Stethoscope } from 'lucide-react';
import AppointmentForm from '../components/appointments/AppointmentForm';
import AppointmentRow from '../components/appointments/AppointmentRow';
import NextAppointment from '../components/appointments/NextAppointment';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '../components/common/States';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useLegacyAppointmentImport } from '../hooks/useLegacyAppointmentImport';
import { deleteAppointment, listAppointments, saveAppointment } from '../services/appointmentService';
import { getMonthToDateReport } from '../services/reportService';
import { splitAppointments } from '../utils/appointments';
import { formatRange, todayISO } from '../utils/dates';

/** Plain-text summary a person can paste into a message or read out at the visit. */
function summaryText(report) {
  const { stats, range } = report;
  return `Glucose summary ${formatRange(range)}: average ${stats.average} mg/dL, highest ${stats.highest}, lowest ${stats.lowest}, ${stats.count} readings.`;
}

export default function Appointments() {
  useDocumentTitle('Appointments');
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();

  const appointments = useAsync(listAppointments, []);
  const summary = useAsync(() => getMonthToDateReport(todayISO()), []);
  // `null` = form closed, `{}` = adding, an appointment = editing.
  const [editing, setEditing] = useState(params.get('new') ? {} : null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  // Opens the form when the page is reached (or re-visited) with ?new=1.
  useEffect(() => {
    if (params.get('new')) setEditing((current) => current ?? {});
  }, [params]);

  useLegacyAppointmentImport(user.id, (count) => {
    toast.success(`Moved ${count} appointment${count === 1 ? '' : 's'} from this browser to your account.`);
    appointments.reload();
  });

  const list = appointments.data ?? [];
  const { upcoming, past } = splitAppointments(list);
  const [next, ...later] = upcoming;

  const closeForm = () => {
    setEditing(null);
    if (params.get('new')) setParams({}, { replace: true });
  };

  const handleSave = async (values) => {
    setBusy(true);
    try {
      await saveAppointment(values);
      toast.success(values.id ? 'Appointment updated.' : 'Appointment added.');
      closeForm();
      appointments.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteAppointment(toDelete.id);
      toast.success('Appointment deleted.');
      setToDelete(null);
      appointments.reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(summary.data));
      toast.success('Summary copied. Paste it into a message or note.');
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.');
    }
  };

  const report = summary.data;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Doctor appointments"
        description="Keep track of upcoming visits and take your readings along."
        action={
          !editing && (
            <Button onClick={() => setEditing({})}>
              <Plus className="h-4 w-4" aria-hidden />
              Add appointment
            </Button>
          )
        }
      />

      {editing && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">{editing.id ? 'Edit appointment' : 'New appointment'}</h2>
          <AppointmentForm key={editing.id || 'new'} initial={editing.id ? editing : null} onSave={handleSave} onCancel={closeForm} saving={busy} />
        </Card>
      )}

      {appointments.loading && !appointments.data && <LoadingState label="Loading appointments…" />}
      {appointments.error && (
        <Card>
          <ErrorState message={appointments.error.message} onRetry={appointments.reload} />
        </Card>
      )}

      {appointments.data && (
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <NextAppointment appointment={next} large onAdd={() => setEditing({})} />

            <section aria-label="Upcoming appointments">
              <h2 className="mb-3 px-1 text-base font-semibold text-slate-900">Upcoming</h2>
              {upcoming.length === 0 ? (
                <Card>
                  <EmptyState mascot icon={Stethoscope} title="No upcoming appointments" description="Add your next doctor visit and it will show up on your dashboard." />
                </Card>
              ) : (
                <ul className="stagger space-y-3">
                  {[next, ...later].map((a) => (
                    <AppointmentRow key={a.id} appointment={a} onEdit={setEditing} onDelete={setToDelete} />
                  ))}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section aria-label="Past appointments">
                <h2 className="mb-3 px-1 text-base font-semibold text-slate-900">Past</h2>
                <ul className="space-y-3">
                  {past.map((a) => (
                    <AppointmentRow key={a.id} appointment={a} past onEdit={setEditing} onDelete={setToDelete} />
                  ))}
                </ul>
              </section>
            )}
          </div>

          <Card className="p-5 lg:col-span-5">
            <h2 className="text-base font-semibold text-slate-900">Take this to your visit</h2>
            <p className="mt-1 text-sm text-slate-500">A quick summary of this month’s readings.</p>
            {summary.loading && <div className="skeleton mt-4 h-28" aria-hidden="true" />}
            {!summary.loading && report && !report.isEmpty && (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ['Average', report.stats.average, 'bg-tint-lilac'],
                    ['Highest', report.stats.highest, 'bg-tint-peach'],
                    ['Lowest', report.stats.lowest, 'bg-tint-mint'],
                    ['Readings', report.stats.count, 'bg-slate-100'],
                  ].map(([label, value, tone]) => (
                    <div key={label} className={`rounded-2xl p-3.5 ${tone}`}>
                      <dt className="text-xs font-medium text-slate-500">{label}</dt>
                      <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-slate-400">{formatRange(report.range)} · mg/dL</p>
                <Button variant="secondary" className="mt-4 w-full" onClick={copySummary}>
                  <ClipboardCopy className="h-4 w-4" aria-hidden />
                  Copy summary
                </Button>
              </>
            )}
            {!summary.loading && (!report || report.isEmpty) && <p className="mt-4 text-sm text-slate-500">No readings this month yet, so there is nothing to summarise.</p>}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this appointment?"
        description={toDelete ? `Your appointment with ${toDelete.doctor} will be removed.` : ''}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

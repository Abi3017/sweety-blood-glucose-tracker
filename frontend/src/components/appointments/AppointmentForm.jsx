import { useState } from 'react';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { validateAppointment } from '../../utils/appointments';
import { todayISO } from '../../utils/dates';

const EMPTY = { doctor: '', specialty: '', date: todayISO(), time: '10:00', location: '', notes: '' };

/** Add / edit form. `initial` is an existing appointment when editing. */
export default function AppointmentForm({ initial, onSave, onCancel, saving = false }) {
  const [values, setValues] = useState(() => (initial ? { ...EMPTY, ...initial } : EMPTY));
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const found = validateAppointment(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSave({
        ...(initial?.id ? { id: initial.id } : {}),
        doctor: values.doctor.trim(),
        specialty: values.specialty.trim(),
        date: values.date,
        time: values.time,
        location: values.location.trim(),
        notes: values.notes.trim(),
      });
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField label="Doctor" placeholder="Dr. Meera Rao" value={values.doctor} onChange={set('doctor')} error={errors.doctor} autoFocus maxLength={80} />
      <FormField label="Specialty (optional)" placeholder="Endocrinologist" value={values.specialty} onChange={set('specialty')} error={errors.specialty} maxLength={60} />
      <FormField label="Date" type="date" value={values.date} onChange={set('date')} error={errors.date} />
      <FormField label="Time" type="time" value={values.time} onChange={set('time')} error={errors.time} />
      <FormField label="Clinic or location (optional)" placeholder="City Care Hospital, Room 4" value={values.location} onChange={set('location')} error={errors.location} className="sm:col-span-2" maxLength={120} />

      <div className="sm:col-span-2">
        <label htmlFor="appt-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes (optional)
        </label>
        <textarea
          id="appt-notes"
          rows={3}
          maxLength={500}
          value={values.notes}
          onChange={set('notes')}
          placeholder="Questions to ask, tests to bring, fasting instructions…"
          aria-invalid={errors.notes ? 'true' : 'false'}
          className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {errors.notes && (
          <p role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.notes}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>{initial?.id ? 'Save changes' : 'Add appointment'}</Button>
      </div>
    </form>
  );
}

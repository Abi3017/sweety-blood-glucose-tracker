import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '../common/FormField';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { readingSchema } from '../../validations/readingSchema';
import { TIME_SLOT_OPTIONS } from '../../utils/timeSlots';
import { todayISO } from '../../utils/dates';
import { applyServerErrors } from '../../utils/forms';

const FIELDS = ['readingDate', 'timeSlot', 'glucoseValue'];

/**
 * Add / edit reading form. `onSubmit(values)` should call the API and throw the
 * normalized API error on failure; backend rule violations (duplicate slot,
 * daily limit, …) are then shown next to the relevant field.
 */
export default function ReadingForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save reading' }) {
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(readingSchema),
    defaultValues: { readingDate: todayISO(), timeSlot: '', glucoseValue: '', ...defaultValues },
  });

  const submit = async (values) => {
    setServerError('');
    try {
      await onSubmit(values);
    } catch (error) {
      if (!applyServerErrors(error, setError, FIELDS)) setServerError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5" aria-label="Reading form">
      <Alert type="error">{serverError}</Alert>

      <FormField
        label="Reading date"
        type="date"
        max={todayISO()}
        error={errors.readingDate?.message}
        {...register('readingDate')}
      />

      <FormField label="Time slot" as="select" error={errors.timeSlot?.message} {...register('timeSlot')}>
        <option value="">Select a time slot</option>
        {TIME_SLOT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormField>

      <FormField
        label="Glucose value"
        type="number"
        inputMode="numeric"
        step="1"
        placeholder="e.g. 110"
        suffix="mg/dL"
        hint="Whole number between 40 and 600."
        error={errors.glucoseValue?.message}
        {...register('glucoseValue')}
      />

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

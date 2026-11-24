import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ReadingForm from '../components/readings/ReadingForm';
import { addDays, todayISO } from '../utils/dates';

function setup(props = {}) {
  const onSubmit = props.onSubmit || vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  render(<ReadingForm onSubmit={onSubmit} onCancel={onCancel} defaultValues={{ readingDate: '2026-10-15' }} {...props} />);
  return { onSubmit, onCancel, user: userEvent.setup() };
}

const glucose = () => screen.getByLabelText('Glucose value');
const slot = () => screen.getByLabelText('Time slot');
const save = () => screen.getByRole('button', { name: /save reading/i });

describe('ReadingForm', () => {
  it('shows the unit label and all four time slots', () => {
    setup();
    expect(screen.getByText('mg/dL')).toBeInTheDocument();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Select a time slot',
      'Morning (Fasting)',
      'After Breakfast',
      'After Lunch',
      'After Dinner',
    ]);
  });

  it('requires a glucose value and a time slot', async () => {
    const { user, onSubmit } = setup();
    await user.click(save());
    expect(await screen.findByText('Please enter a glucose value.')).toBeInTheDocument();
    expect(screen.getByText('Please select a time slot.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([['39'], ['601'], ['120.5']])('rejects %s with the range message', async (value) => {
    const { user, onSubmit } = setup();
    await user.selectOptions(slot(), 'MORNING');
    await user.type(glucose(), value);
    await user.click(save());
    expect(await screen.findByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a future date', async () => {
    const { user } = setup({ defaultValues: { readingDate: addDays(todayISO(), 1) } });
    await user.selectOptions(slot(), 'MORNING');
    await user.type(glucose(), '110');
    await user.click(save());
    expect(await screen.findByText('Date cannot be in the future.')).toBeInTheDocument();
  });

  it('submits a valid reading with a numeric value', async () => {
    const { user, onSubmit } = setup();
    await user.selectOptions(slot(), 'AFTER_LUNCH');
    await user.type(glucose(), '145');
    await user.click(save());
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ readingDate: '2026-10-15', timeSlot: 'AFTER_LUNCH', glucoseValue: 145 }),
    );
  });

  it('shows a duplicate-slot error returned by the API next to the time slot', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      status: 409,
      message: 'You already have an After lunch reading for this date.',
      details: [{ field: 'timeSlot', message: 'You already have an After lunch reading for this date.' }],
    });
    const { user } = setup({ onSubmit });
    await user.selectOptions(slot(), 'AFTER_LUNCH');
    await user.type(glucose(), '150');
    await user.click(save());
    expect(await screen.findByText('You already have an After lunch reading for this date.')).toBeInTheDocument();
    expect(slot()).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the daily-limit and network errors from the API', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce({
        status: 409,
        message: 'You can add only 4 readings per day.',
        details: [{ field: 'readingDate', message: 'You can add only 4 readings per day.' }],
      })
      .mockRejectedValueOnce({ status: 0, message: 'Unable to reach the server. Please check your connection and try again.', details: [] });
    const { user } = setup({ onSubmit });
    await user.selectOptions(slot(), 'AFTER_DINNER');
    await user.type(glucose(), '150');
    await user.click(save());
    expect(await screen.findByText('You can add only 4 readings per day.')).toBeInTheDocument();

    await user.click(save());
    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument();
  });

  it('calls onCancel', async () => {
    const { user, onCancel } = setup();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});

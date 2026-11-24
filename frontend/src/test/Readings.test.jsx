import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Readings from '../pages/Readings';
import * as authService from '../services/authService';
import * as readingService from '../services/readingService';
import { renderWithProviders } from './renderWithProviders';

vi.mock('../services/authService');
vi.mock('../services/readingService');

const meta = (total) => ({ page: 1, limit: 10, total, totalPages: Math.max(1, Math.ceil(total / 10)) });
const reading = {
  id: 'r1',
  readingDate: '2026-10-15',
  timeSlot: 'AFTER_LUNCH',
  glucoseValue: 145,
  createdAt: '2026-10-15T08:00:00.000Z',
};

describe('Readings page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockResolvedValue({ id: 'u1', name: 'Demo', email: 'demo@sweety.app' });
  });

  it('shows an empty state when there are no readings', async () => {
    readingService.getReadings.mockResolvedValue({ readings: [], meta: meta(0) });
    renderWithProviders(<Readings />);
    expect(await screen.findByText('No readings yet')).toBeInTheDocument();
  });

  it('shows an error state with retry when loading fails', async () => {
    const user = userEvent.setup();
    readingService.getReadings
      .mockRejectedValueOnce({ message: 'Unable to reach the server. Please check your connection and try again.' })
      .mockResolvedValueOnce({ readings: [reading], meta: meta(1) });
    renderWithProviders(<Readings />);

    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect((await screen.findAllByText('After Lunch')).length).toBeGreaterThan(0);
  });

  it('asks for confirmation before deleting a reading', async () => {
    const user = userEvent.setup();
    readingService.getReadings
      .mockResolvedValueOnce({ readings: [reading], meta: meta(1) })
      .mockResolvedValueOnce({ readings: [], meta: meta(0) });
    readingService.deleteReading.mockResolvedValue();
    renderWithProviders(<Readings />);

    const [deleteButton] = await screen.findAllByRole('button', { name: /delete after lunch reading/i });
    await user.click(deleteButton);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Delete this reading?');
    expect(readingService.deleteReading).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(readingService.deleteReading).toHaveBeenCalledWith('r1'));
    expect(await screen.findByText('No readings yet')).toBeInTheDocument();
    expect(screen.getByText('Reading deleted.')).toBeInTheDocument();
  });
});

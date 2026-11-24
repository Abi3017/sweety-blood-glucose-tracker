import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '../pages/Register';
import * as authService from '../services/authService';
import { renderWithProviders } from './renderWithProviders';

vi.mock('../services/authService');

const setup = () =>
  renderWithProviders(<Register />, {
    route: '/register',
    path: '/register',
    extraRoutes: <Route path="/dashboard" element={<p>Dashboard page</p>} />,
  });

async function fillForm(user, { name = 'Asha Kumar', email = 'asha@example.com', password = 'Passw0rd!', confirm = password } = {}) {
  if (name) await user.type(screen.getByLabelText('Full name'), name);
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Password'), password);
  if (confirm) await user.type(screen.getByLabelText('Confirm password'), confirm);
  await user.click(screen.getByRole('button', { name: /create account/i }));
}

describe('Register page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockRejectedValue({ status: 401 });
  });

  it('requires every field', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Please enter your full name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a password.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
  });

  it('enforces password strength and matching confirmation', async () => {
    const user = userEvent.setup();
    setup();
    await fillForm(user, { password: 'weakpass', confirm: 'different' });
    expect(await screen.findByText('Password must contain an uppercase letter.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('shows a duplicate email error from the server next to the email field', async () => {
    const user = userEvent.setup();
    authService.register.mockRejectedValue({
      status: 409,
      message: 'An account with this email already exists.',
      details: [{ field: 'email', message: 'An account with this email already exists.' }],
    });
    setup();
    await fillForm(user);

    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('creates the account and opens the dashboard', async () => {
    const user = userEvent.setup();
    authService.register.mockResolvedValue({ id: '1', name: 'Asha Kumar', email: 'asha@example.com' });
    setup();
    await fillForm(user);

    await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../pages/Login';
import * as authService from '../services/authService';
import { renderWithProviders } from './renderWithProviders';

vi.mock('../services/authService');

describe('Login page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authService.getCurrentUser.mockRejectedValue({ status: 401 });
  });

  const setup = () =>
    renderWithProviders(<Login />, {
      route: '/login',
      path: '/login',
      extraRoutes: <Route path="/dashboard" element={<p>Dashboard page</p>} />,
    });

  it('shows validation messages for empty fields', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Please enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    setup();
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
  });

  it('logs in and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ id: '1', name: 'Demo Patient', email: 'demo@sweety.app' });
    setup();

    await user.type(screen.getByLabelText('Email'), 'demo@sweety.app');
    await user.type(screen.getByLabelText('Password'), 'Demo@1234');
    await user.click(screen.getByLabelText(/keep me signed in/i));
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() =>
      expect(authService.login).toHaveBeenCalledWith({ email: 'demo@sweety.app', password: 'Demo@1234', rememberMe: true }),
    );
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });

  it('shows the server error for wrong credentials', async () => {
    const user = userEvent.setup();
    authService.login.mockRejectedValue({ status: 401, message: 'Invalid email or password.', details: [] });
    setup();

    await user.type(screen.getByLabelText('Email'), 'demo@sweety.app');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });
});

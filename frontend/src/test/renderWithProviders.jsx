import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

/** Renders `ui` at `route` inside the app providers. `extraRoutes` lets tests assert navigation. */
export function renderWithProviders(ui, { route = '/', path = '*', extraRoutes = null } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path={path} element={ui} />
            {extraRoutes}
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

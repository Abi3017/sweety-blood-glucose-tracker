import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/RouteGuards';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Readings from './pages/Readings';
import ReadingFormPage from './pages/ReadingFormPage';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import FoodPlan from './pages/FoodPlan';
import Appointments from './pages/Appointments';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/readings" element={<Readings />} />
          <Route path="/readings/new" element={<ReadingFormPage />} />
          <Route path="/readings/:id/edit" element={<ReadingFormPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/food-plan" element={<FoodPlan />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

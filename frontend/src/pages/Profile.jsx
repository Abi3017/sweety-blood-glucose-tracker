import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, CalendarDays, Activity, UserRound } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card';
import Button from '../components/common/Button';
import PageHeader from '../components/layout/PageHeader';
import { LoadingState, ErrorState } from '../components/common/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getCurrentUser } from '../services/authService';
import { formatDateTime } from '../utils/dates';

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
        <dd className="truncate text-sm font-medium text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

export default function Profile() {
  useDocumentTitle('Profile');
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data: profile, loading, error, reload } = useAsync(getCurrentUser, []);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader title="Profile" description="Your account information." />
      <Card className="max-w-2xl">
        <CardHeader title="Account" />
        {loading && <LoadingState />}
        {error && <ErrorState message={error.message} onRetry={reload} />}
        {profile && (
          <dl className="divide-y divide-slate-100">
            <Row icon={UserRound} label="Name" value={profile.name} />
            <Row icon={Mail} label="Email" value={profile.email} />
            <Row icon={CalendarDays} label="Member since" value={formatDateTime(profile.createdAt)} />
            <Row icon={Activity} label="Readings recorded" value={profile.totalReadings} />
          </dl>
        )}
        <div className="border-t border-slate-100 px-5 py-4">
          <Button variant="secondary" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden />
            Log out
          </Button>
        </div>
      </Card>
    </>
  );
}

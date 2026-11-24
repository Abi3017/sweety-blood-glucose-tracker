import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Logo size="lg" />
      <p className="mt-10 text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you are looking for does not exist or has moved.</p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Go to dashboard
      </Link>
    </div>
  );
}

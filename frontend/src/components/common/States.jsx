import { AlertTriangle, Inbox } from 'lucide-react';
import Spinner from './Spinner';
import Button from './Button';
import Mascot from './Mascot';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-6 text-slate-500">
      <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="skeleton h-40 w-full" aria-hidden="true" />
      <span className="flex items-center gap-2 text-sm">
        <Spinner className="h-4 w-4 text-brand-500" />
        {label}
      </span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, mascot = false }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {mascot ? (
        <Mascot size={104} className="mb-2" />
      ) : (
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-slate-900">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message || 'We could not load this information.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

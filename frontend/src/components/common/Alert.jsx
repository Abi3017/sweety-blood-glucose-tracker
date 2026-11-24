import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const STYLES = {
  error: { box: 'border-red-200 bg-red-50 text-red-700', Icon: AlertCircle },
  success: { box: 'border-mint-100 bg-mint-50 text-mint-700', Icon: CheckCircle2 },
  info: { box: 'border-brand-100 bg-brand-50 text-brand-700', Icon: Info },
};

export default function Alert({ type = 'error', children, className = '' }) {
  if (!children) return null;
  const { box, Icon } = STYLES[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${box} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

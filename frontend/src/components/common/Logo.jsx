import { Droplet } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  const text = size === 'lg' ? 'text-2xl' : 'text-xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${box} inline-flex items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm`}>
        <Droplet className="h-5 w-5" fill="currentColor" aria-hidden />
      </span>
      <span className={`${text} font-bold tracking-tight text-slate-900`}>Sweety</span>
    </span>
  );
}

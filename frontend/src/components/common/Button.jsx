import Spinner from './Spinner';

const VARIANTS = {
  primary: 'btn-primary text-white disabled:opacity-60',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
};

function addRipple(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const dot = document.createElement('span');
  dot.className = 'ripple';
  Object.assign(dot.style, { width: `${size}px`, height: `${size}px`, left: `${e.clientX - r.left - size / 2}px`, top: `${e.clientY - r.top - size / 2}px` });
  el.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  onPointerDown,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onPointerDown={(e) => {
        if (!(disabled || loading)) addRipple(e);
        onPointerDown?.(e);
      }}
      aria-busy={loading || undefined}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

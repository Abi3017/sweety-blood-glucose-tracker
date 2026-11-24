import Logo from '../common/Logo';
import Ambient from '../common/Ambient';
import ThemeToggle from '../common/ThemeToggle';
import Mascot from '../common/Mascot';

/** Centered card used by the login and registration pages. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Ambient />
      <ThemeToggle className="fixed right-4 top-4 z-20" />
      <div className="w-full max-w-md">
        <div className="animate-fade-up mb-8 flex flex-col items-center gap-2">
          <Mascot size={96} />
          <Logo size="lg" />
        </div>
        <svg className="animate-fade-up mx-auto -mt-4 mb-4 h-10 w-48 text-brand-500" viewBox="0 0 200 40" fill="none" aria-hidden="true">
          <path className="draw-line" pathLength="1" d="M0 22 H50 L58 22 L66 6 L76 34 L86 14 L92 22 H130 L138 22 L146 10 L156 30 L164 22 H200" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="animate-pop-in rounded-2xl border border-slate-200/70 bg-white p-6 shadow-lg shadow-slate-900/5 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="animate-fade-up mt-6 text-center text-sm text-slate-600">{footer}</p>}
      </div>
    </div>
  );
}

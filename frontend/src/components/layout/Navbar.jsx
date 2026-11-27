import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart3, Utensils, CalendarClock, LogOut, Menu, X, UserRound } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';
import Mascot from '../common/Mascot';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/readings', label: 'Readings', icon: ListChecks },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/food-plan', label: 'Food plan', icon: Utensils },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock },
];

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);


  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success('You have been logged out.');
    navigate('/login', { replace: true });
  };

  return (
    <header className="animate-fade-up sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 rounded-full border border-slate-200/70 bg-white/90 px-5 shadow-sm backdrop-blur-md" aria-label="Main">
        <Link to="/dashboard" aria-label="Sweety dashboard">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 lg:flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} title={label} aria-label={label}>
              <Icon className="h-4 w-4" aria-hidden />
              <span className="hidden xl:inline">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm ${isActive ? 'bg-brand-50' : 'hover:bg-slate-100'}`
            }
          >
            <span className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100">
              <Mascot variant="avatar" size={40} />
            </span>
            <span className="flex min-w-0 flex-col text-left leading-tight">
              <span className="max-w-[10rem] truncate text-sm font-semibold text-slate-800">{user?.name}</span>
              <span className="max-w-[10rem] truncate text-xs text-slate-400">{user?.email}</span>
            </span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>

        <ThemeToggle className="lg:hidden" />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="mx-auto mt-2 max-w-7xl rounded-3xl border border-slate-200/70 bg-white px-4 pb-4 pt-2 shadow-lg lg:hidden">
          <div className="flex flex-col gap-1">
            {[...NAV_ITEMS, { to: '/profile', label: 'Profile', icon: UserRound }].map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

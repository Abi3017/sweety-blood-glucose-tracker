import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart3, UserRound, Plus } from 'lucide-react';

const item = ({ isActive }) =>
  `inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
    isActive ? 'scale-110 bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
  }`;

/** Floating phone-style tab bar with a centre "add reading" button. Hidden on desktop. */
export default function BottomNav() {
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-sm items-center justify-between rounded-full border border-slate-200/70 bg-white/95 px-3 py-2 shadow-xl shadow-slate-900/10 backdrop-blur lg:hidden"
    >
      <NavLink to="/dashboard" className={item} aria-label="Dashboard">
        <LayoutDashboard className="h-5 w-5" />
      </NavLink>
      <NavLink to="/readings" end className={item} aria-label="Readings">
        <ListChecks className="h-5 w-5" />
      </NavLink>
      <Link
        to="/readings/new"
        aria-label="Add reading"
        className="-mt-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 ring-4 ring-white transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" />
      </Link>
      <NavLink to="/reports" className={item} aria-label="Reports">
        <BarChart3 className="h-5 w-5" />
      </NavLink>
      <NavLink to="/profile" className={item} aria-label="Profile">
        <UserRound className="h-5 w-5" />
      </NavLink>
    </nav>
  );
}

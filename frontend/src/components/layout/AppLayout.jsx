import { Outlet, useLocation } from 'react-router-dom';
import Ambient from '../common/Ambient';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen">
      <Ambient />
      <Navbar />
      <main key={pathname} className="animate-fade-up mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-8 md:pt-8">
        <Outlet />
      </main>
      <BottomNav />
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-slate-400 sm:px-6">
        Sweety records and summarises your readings. It does not provide medical advice — talk to your doctor about your results.
      </footer>
    </div>
  );
}

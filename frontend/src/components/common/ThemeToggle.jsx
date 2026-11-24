import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/** Switches the `dark` class on <html> and remembers the choice. The initial class is set in index.html. */
export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const apply = (next) => {
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
    setDark(next);
  };

  const toggle = (event) => {
    const next = !dark;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      apply(next);
      return;
    }
    // Circular reveal growing from the button.
    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(() => apply(next));
    transition.ready
      .then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        ),
      )
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={dark}
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 ${className}`}
    >
      <Sun className={`absolute h-5 w-5 transition-all duration-500 ${dark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} aria-hidden />
      <Moon className={`absolute h-5 w-5 transition-all duration-500 ${dark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} aria-hidden />
    </button>
  );
}

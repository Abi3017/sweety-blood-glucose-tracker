import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, CalendarClock, X } from 'lucide-react';
import { useNow } from '../../hooks/useNow';
import { appointmentReminders, readingReminder } from '../../utils/reminders';

const DISMISSED_KEY = 'sweety.dismissedReminders';
const NOTIFIED_KEY = 'sweety.notifiedReminders';

function readSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}
function writeSet(key, set) {
  try {
    // Reminder ids contain their date, so old ones are harmless; keep the list from growing forever.
    localStorage.setItem(key, JSON.stringify([...set].slice(-60)));
  } catch {
    /* the choice just won't persist */
  }
}

const canNotify = () => typeof window !== 'undefined' && 'Notification' in window;

/**
 * Reminders for today: the latest reading that is due and empty, plus appointments today or tomorrow.
 * Each can be dismissed for the day. Browser alerts are optional and only fire while the site is open.
 * `todayReadings` is null while loading. `showReadings` is false when viewing a past date.
 */
export default function RemindersCard({ todayReadings, appointments, showReadings = true }) {
  const now = useNow(60000);
  const [dismissed, setDismissed] = useState(() => readSet(DISMISSED_KEY));
  const [permission, setPermission] = useState(() => (canNotify() ? Notification.permission : 'unsupported'));

  const reminders = useMemo(() => {
    const list = [];
    const reading = showReadings && todayReadings ? readingReminder(todayReadings, now) : null;
    if (reading) list.push(reading);
    list.push(...appointmentReminders(appointments ?? [], now));
    return list.filter((r) => !dismissed.has(r.id));
  }, [todayReadings, appointments, showReadings, now, dismissed]);

  // Fire a browser notification once per reminder, if allowed.
  useEffect(() => {
    if (permission !== 'granted') return;
    const notified = readSet(NOTIFIED_KEY);
    let changed = false;
    reminders.forEach((r) => {
      if (notified.has(r.id)) return;
      try {
        new Notification(r.title, { body: r.detail, tag: r.id });
      } catch {
        /* some browsers only allow notifications from a service worker */
      }
      notified.add(r.id);
      changed = true;
    });
    if (changed) writeSet(NOTIFIED_KEY, notified);
  }, [reminders, permission]);

  const dismiss = (id) =>
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      writeSet(DISMISSED_KEY, next);
      return next;
    });

  const enableAlerts = async () => {
    try {
      setPermission(await Notification.requestPermission());
    } catch {
      setPermission('denied');
    }
  };

  const showAlertToggle = permission === 'default';
  if (reminders.length === 0 && !showAlertToggle) return null;

  return (
    <section aria-label="Reminders" className="animate-fade-up space-y-2">
      {reminders.map((r) => {
        const Icon = r.kind === 'appointment' ? CalendarClock : BellRing;
        return (
          <div key={r.id} role="status" className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{r.title}</p>
              <p className="truncate text-xs text-slate-600">{r.detail}</p>
            </div>
            <Link to={r.to} className="shrink-0 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700">
              {r.kind === 'appointment' ? 'View' : 'Log now'}
            </Link>
            <button
              type="button"
              onClick={() => dismiss(r.id)}
              aria-label={`Dismiss reminder: ${r.title}`}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}

      {showAlertToggle && (
        <button type="button" onClick={enableAlerts} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-brand-500 hover:text-brand-700">
          <Bell className="h-3.5 w-3.5" aria-hidden />
          Turn on browser alerts (works while Sweety is open)
        </button>
      )}
    </section>
  );
}

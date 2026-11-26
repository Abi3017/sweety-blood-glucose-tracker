import { useEffect, useState } from 'react';

/** The current Date, refreshed every `intervalMs` (default 30 s) so time-based UI stays current. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

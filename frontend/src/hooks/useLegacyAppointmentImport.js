import { useEffect } from 'react';
import { importLegacyAppointments } from '../services/appointmentService';

/**
 * On mount, moves any appointments saved in this browser by the earlier version into the user's
 * account, then calls `onImported(count)` so the screen can refresh. Runs once per mount.
 */
export function useLegacyAppointmentImport(userId, onImported) {
  useEffect(() => {
    let cancelled = false;
    importLegacyAppointments(userId)
      .then((count) => {
        if (count > 0 && !cancelled) onImported(count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}

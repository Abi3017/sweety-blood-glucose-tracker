import { useEffect, useState } from 'react';

/** Animates from 0 to `target` (number). Respects reduced-motion. */
export function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof target !== 'number' || Number.isNaN(target)) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return typeof target === 'number' ? value.toFixed(decimals) : null;
}

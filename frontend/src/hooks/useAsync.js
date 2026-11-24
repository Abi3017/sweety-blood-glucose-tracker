import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader whenever `deps` change and tracks loading/error state.
 * Stale responses from earlier calls are ignored. `reload()` re-runs it.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      if (id === callId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === callId.current) setState({ data: null, loading: false, error });
    }
  }, [run]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

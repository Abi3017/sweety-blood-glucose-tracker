import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

/** Lightweight success/error notifications announced to screen readers. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({ success: (m) => show(m, 'success'), error: (m) => show(m, 'error') }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto animate-toast-in relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border bg-white px-4 py-3 text-sm shadow-lg ${
                toast.type === 'success' ? 'border-mint-100' : 'border-red-200'
              }`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${toast.type === 'success' ? 'text-mint-500' : 'text-red-500'}`} aria-hidden />
              <p className="flex-1 text-slate-700">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
              <span className={`toast-bar absolute inset-x-0 bottom-0 h-0.5 ${toast.type === 'success' ? 'bg-mint-500' : 'bg-red-400'}`} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}

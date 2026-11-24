import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = forwardRef(function PasswordField({ label, error, hint, id: idProp, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const id = idProp || generatedId;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`block h-11 w-full rounded-xl border bg-white px-3.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 hover:text-slate-600"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error && (
        <div id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default PasswordField;

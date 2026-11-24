import { forwardRef, useId } from 'react';

/** Label + input + error/hint wired up for screen readers. Extra props go to the <input>. */
const FormField = forwardRef(function FormField(
  { label, error, hint, suffix, as = 'input', children, className = '', id: idProp, ...inputProps },
  ref,
) {
  const generatedId = useId();
  const id = idProp || generatedId;
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  const Component = as;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Component
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={`block h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'animate-shake border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          } ${suffix ? 'pr-16' : ''}`}
          {...inputProps}
        >
          {children}
        </Component>
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sm text-slate-500">{suffix}</div>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;

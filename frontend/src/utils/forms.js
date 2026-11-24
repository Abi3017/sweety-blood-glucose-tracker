/**
 * Copies field-level API errors (error.details) onto react-hook-form fields.
 * Returns true when at least one field error was applied.
 */
export function applyServerErrors(error, setError, fields) {
  let applied = false;
  (error?.details || []).forEach(({ field, message }) => {
    if (fields.includes(field)) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  });
  return applied;
}

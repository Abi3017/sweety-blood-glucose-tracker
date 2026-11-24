import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Sweety` : 'Sweety – Blood Glucose Tracker';
  }, [title]);
}

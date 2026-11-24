import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3" aria-label="Pagination">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}</span>–<span className="font-medium text-slate-700">{to}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>
        <span className="px-1 text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

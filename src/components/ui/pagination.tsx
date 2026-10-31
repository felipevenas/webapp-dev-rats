import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/cn';
import { Button } from '@/components/ui/button';
import { buildPageItems } from '@/components/ui/pagination-utils';

interface PaginationProps {
  /** Zero-based current page. */
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const items = buildPageItems(safePage, totalPages);
  const from = totalElements === undefined || !pageSize ? null : safePage * pageSize + 1;
  const to =
    totalElements === undefined || !pageSize ? null : Math.min((safePage + 1) * pageSize, totalElements);

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      {from !== null && to !== null && totalElements !== undefined ? (
        <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          {from}-{to} de {totalElements}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={safePage === 0}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft aria-hidden />
        </Button>

        <span className="px-1 font-mono text-[11px] text-muted sm:hidden" aria-live="polite">
          {safePage + 1} / {totalPages}
        </span>

        {items.map((item) =>
          typeof item === 'number' ? (
            <Button
              key={item}
              type="button"
              variant={item === safePage ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => onPageChange(item)}
              aria-label={`Página ${item + 1}`}
              aria-current={item === safePage ? 'page' : undefined}
              className={cn(
                'hidden font-mono text-[11px] sm:inline-flex',
                item === safePage && 'border-line-strong text-fg',
              )}
            >
              {item + 1}
            </Button>
          ) : (
            <span
              key={item}
              className="hidden px-1 font-mono text-[11px] text-faint sm:inline"
              aria-hidden
            >
              …
            </span>
          ),
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

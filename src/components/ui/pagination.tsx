import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/core/lib/cn';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  /** Zero-based current page. */
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function buildPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const items: PageItem[] = [0];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages - 2, page + 1);

  if (start > 1) items.push('ellipsis-start');
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < totalPages - 2) items.push('ellipsis-end');
  items.push(totalPages - 1);

  return items;
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
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          {from}–{to} de {totalElements}
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-1">
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
              className={cn('font-mono text-[11px]', item === safePage && 'border-line-strong text-fg')}
            >
              {item + 1}
            </Button>
          ) : (
            <span key={item} className="px-1 font-mono text-[11px] text-faint" aria-hidden>
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

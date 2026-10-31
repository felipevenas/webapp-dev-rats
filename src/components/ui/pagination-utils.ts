export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

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

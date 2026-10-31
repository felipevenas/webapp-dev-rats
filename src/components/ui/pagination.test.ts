import { describe, expect, it } from 'vitest';
import { buildPageItems } from './pagination-utils';

describe('pagination helpers', () => {
  it('lists every page when there are few pages', () => {
    expect(buildPageItems(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(buildPageItems(4, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('collapses the middle ranges with ellipsis', () => {
    expect(buildPageItems(0, 10)).toEqual([0, 1, 'ellipsis-end', 9]);
    expect(buildPageItems(5, 10)).toEqual([0, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 9]);
    expect(buildPageItems(9, 10)).toEqual([0, 'ellipsis-start', 8, 9]);
  });

  it('never repeats the first or last page', () => {
    const items = buildPageItems(1, 8);
    expect(items.filter((item) => item === 0)).toHaveLength(1);
    expect(items.filter((item) => item === 7)).toHaveLength(1);
  });
});

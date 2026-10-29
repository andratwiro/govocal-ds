import {describe, it, expect} from 'vitest';
import {pageItems} from '../src/components/gv/Pagination.tsx';

describe('pageItems (Pagination)', () => {
  it('shows every page up to seven', () => {
    expect(pageItems(1, 1)).toEqual([1]);
    expect(pageItems(2, 4)).toEqual([1, 2, 3, 4]);
    expect(pageItems(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('past seven, keeps seven slots: first page, last page, an ellipsis for the rest', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12]);
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 12]);
    expect(pageItems(6, 12)).toEqual([1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 12]);
    expect(pageItems(9, 12)).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12]);
    expect(pageItems(12, 12)).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12]);
    for (let p = 1; p <= 40; p++) expect(pageItems(p, 40)).toHaveLength(7);
  });
  it('always holds the current page', () => {
    for (let p = 1; p <= 20; p++) expect(pageItems(p, 20)).toContain(p);
  });
  it('never shows an empty pager', () => {
    expect(pageItems(1, 0)).toEqual([1]);
  });
});

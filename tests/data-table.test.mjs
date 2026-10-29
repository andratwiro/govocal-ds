import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {toKeySet} from '../src/components/gv/DataTable.tsx';

describe('toKeySet (Data table)', () => {
  it("turns React Aria's 'all' into every key given", () => {
    expect(toKeySet('all', ['a', 'b', 'c'])).toEqual(new Set(['a', 'b', 'c']));
  });
  it('keeps a Set of keys as it is, numbers included', () => {
    expect(toKeySet(new Set([2, 5]), [1, 2, 3, 4, 5])).toEqual(new Set([2, 5]));
  });
  it('can keep ticks from other pages: "all" means the rows shown plus the ones already ticked', () => {
    const ticked = ['p1-3'];
    const shown = ['p2-1', 'p2-2'];
    expect([...toKeySet('all', [...ticked, ...shown])]).toEqual(['p1-3', 'p2-1', 'p2-2']);
  });
});

describe('Data table API', () => {
  const src = readFileSync('src/components/gv/DataTable.tsx', 'utf8');
  it('has no selectionBehavior to guess: the check column follows selectionMode alone', () => {
    expect(src).toMatch(/Omit<AriaTableProps, [^>]*'selectionBehavior'/);
    expect(src).not.toMatch(/selectionBehavior === 'toggle'/);
  });
});

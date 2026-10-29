import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {toKeySet, virtualMetrics} from '../src/components/gv/DataTable.tsx';
import {inventPeople, sortPeople} from '../src/stories/data/people.ts';

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

// A virtualised table's layout needs its heights and widths as numbers before it can measure the stylesheet's
// (`virtualMetrics`, the first frame's and a test runner's). They must be the stylesheet's own sums.
describe('Data table, virtualised: metrics', () => {
  const tokens = new Map([...readFileSync('src/tokens.css', 'utf8').matchAll(/(--gv-[\w-]+):\s*([\d.]+)px;/g)]
    .map(m => [m[1], Number(m[2])]));
  const css = readFileSync('src/components/gv/DataTable.css', 'utf8');
  const virtual = css.slice(css.indexOf('.gv-data-table[data-virtualized] {'));
  const all = (text, name) => [...text.matchAll(new RegExp(`--gv-data-table-${name}:\\s*([^;]+);`, 'g'))].map(m => m[1]);
  // A calc() of tokens and px, worked out with the table's edge (20 default, 8 compact).
  const px = (expr, edge) => {
    const flat = expr.replace(/var\((--gv-[\w-]+)\)/g, (_, name) => {
      if (name === '--gv-data-table-edge') return String(edge);
      if (!tokens.has(name)) throw new Error(`${name} is not a px token`);
      return String(tokens.get(name));
    }).replace(/calc/g, '').replace(/px/g, '');
    return Function(`return ${flat}`)();
  };
  const [edgeDefault] = all(css, 'edge').map(e => px(e, 0));
  const edgeCompact = px(all(css.slice(css.indexOf(".gv-data-table[data-density='compact'] {")), 'edge')[0], 0);
  const [row1, row2, compactRow1, compactRow2] = all(virtual, 'row-height');
  const [head, compactHead] = all(virtual, 'head-height');
  const [check] = all(virtual, 'check-width');
  const [end] = all(virtual, 'end-width');

  it('the default density: one line, two lines', () => {
    for (const lines of [1, 2]) {
      expect(virtualMetrics('default', lines)).toEqual({
        rowHeight: px(lines === 2 ? row2 : row1, edgeDefault), headHeight: px(head, edgeDefault),
        checkWidth: px(check, edgeDefault), endWidth: px(end, edgeDefault)
      });
    }
  });
  it('compact: one line, two lines', () => {
    for (const lines of [1, 2]) {
      expect(virtualMetrics('compact', lines)).toEqual({
        rowHeight: px(lines === 2 ? compactRow2 : compactRow1, edgeCompact), headHeight: px(compactHead, edgeCompact),
        checkWidth: px(check, edgeCompact), endWidth: px(end, edgeCompact)
      });
    }
  });
  it('registers the four as lengths, so the page hands them over in px', () => {
    for (const name of ['row-height', 'head-height', 'check-width', 'end-width']) {
      expect(css).toMatch(new RegExp(`@property --gv-data-table-${name} \\{\\s*syntax: '<length>';`));
    }
  });
});

describe('Invented people (the long-list stories)', () => {
  it('5,000 with unique ids, the same every time, quickly', () => {
    const start = performance.now();
    const people = inventPeople(5000);
    expect(performance.now() - start).toBeLessThan(500);
    expect(new Set(people.map(p => p.id)).size).toBe(5000);
    expect(inventPeople(5000)).toEqual(people);
    expect(people[49]).toMatchObject({id: 'person-50', name: 'Admin 50', role: 'Platform admin', email: 'user50@example.org'});
    expect(people[9].role).toBe('Project manager');
  });
  it('a later page continues the numbering', () => {
    expect(inventPeople(2, 101).map(p => p.id)).toEqual(['person-101', 'person-102']);
  });
  it('sorts names by their number, and either way', () => {
    const list = inventPeople(12);
    expect(sortPeople(list, 'name', 'ascending').slice(-3).map(p => p.name)).toEqual(['Resident 9', 'Resident 11', 'Resident 12']);
    const ideas = sortPeople(list, 'ideas', 'descending').map(p => p.ideas);
    expect(ideas).toEqual([...ideas].sort((a, b) => b - a));
  });
});

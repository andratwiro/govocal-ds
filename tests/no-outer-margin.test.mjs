import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {declarations, resolveSelectors, subject} from '../scripts/lib/cssdecl.mjs';

// No Component or Pattern sets an outer margin: the page that places a part owns the space around it (a Stack's
// `gap`, a Grid's areas, its own `className`), so a part that brings its own margin adds space the page can't see
// and fights the gap it sits in.
//
// "Outer" means the part's root: the element that takes the caller's `className` (the class beside `className` in
// its `clsx(…)`, `ownClass(…)` or `keepClass(…)`), or, for a part that takes none, the first `gv-` block its TSX
// writes. A sub-part whose root is one of its parent's `__elements` (Side panel's `SidePanelActions`,
// `gv-side-panel__actions`) lives only inside that parent, so its margin is the parent's own rhythm, not an outer one.
// A margin is outer when a rule whose subject (the last compound of its selector, nesting resolved) carries
// that root class sets a margin other than 0. Margins inside a part (on its `__elements`, or a parent spacing its own
// children: `.gv-x__item > .gv-new-dot`) are the part's own layout and are allowed.
const DIRS = ['src/components/gv', 'src/patterns'];

// Today's outer margins whose removal would change the look, by stylesheet and root class. The list only shrinks:
// a new one fails, and so does an entry that is gone (take it off). Logged in docs/DECISIONS.md.
export const OUTER_MARGINS = {
  // The 12 between the bubble and what it points at. React Aria positions the overlay, so the margin never meets a
  // page's layout; moving it to `offset` changes how the tail lines up.
  'src/components/gv/Coachmark.css': ['gv-coachmark'],
  // The phone's picture bleeds to the screen's edges (negative inline and top margins) inside the phone's padding.
  'src/patterns/PhonePreview.css': ['gv-phone-image']
};

/** The root classes of a part's TSX. */
export function roots(tsx) {
  const out = new Set();
  const merged = [...tsx.matchAll(/(?:clsx|ownClass|keepClass)\(([^;]*?)\bclassName\b/g)];
  for (const m of merged)
    for (const [c] of m[1].matchAll(/gv-[a-z0-9-]+(?:__[a-z0-9-]+)?/g)) if (!c.includes('__')) out.add(c);
  if (!merged.length) {
    const first = tsx.match(/className=(?:\{[^}]*?)?['"`](gv-[a-z0-9-]+)/);
    if (first) out.add(first[1]);
  }
  return out;
}

/** The root classes a stylesheet gives an outer margin, sorted. */
export function outerMargins(css, rootClasses) {
  const out = new Set();
  for (const d of declarations(css, {selectorStrings: true})) {
    if (!/^margin(-|$)/.test(d.prop) || /^0(px)?(\s+0(px)?){0,3}$/.test(d.value.trim())) continue;
    for (const sel of resolveSelectors(d.selectors))
      for (const [, c] of subject(sel).replace(/\([^)]*\)/g, '').matchAll(/\.([\w-]+)/g))
        if (rootClasses.has(c)) out.add(c);
  }
  return [...out].sort();
}

const sheets = DIRS.flatMap(d => readdirSync(d).filter(f => f.endsWith('.css')).map(f => `${d}/${f}`));
const found = Object.fromEntries(sheets.map(f => {
  const tsx = f.replace(/\.css$/, '.tsx');
  const own = existsSync(tsx) ? roots(readFileSync(tsx, 'utf8')) : new Set();
  return [f, outerMargins(readFileSync(f, 'utf8'), own)];
}).filter(([, list]) => list.length));

describe('outer margins', () => {
  it('reads a root\'s margin through nesting and modifiers, and leaves the inside alone', () => {
    const css = `.gv-x { margin: 0; &[data-open] { margin-block-end: var(--gv-space-8); } }
      .gv-x__title { margin: var(--gv-space-4) 0 0; } .gv-x__list > .gv-dot { margin-top: 2px; }
      .gv-y:not(.gv-x) { margin: 4px; }`;
    expect(outerMargins(css, new Set(['gv-x']))).toEqual(['gv-x']);
    expect(outerMargins('.gv-x { margin: 0 0; } .gv-x .gv-x__a { margin: 4px }', new Set(['gv-x']))).toEqual([]);
  });
  it('finds a part\'s root by the class it merges with className', () => {
    expect([...roots("className={clsx('gv-card', isCompact && 'gv-card--compact', className)}")]).toEqual(['gv-card', 'gv-card--compact']);
    expect([...roots("className={clsx('gv-side-panel__actions', className)}")]).toEqual([]);
    expect([...roots('<AriaPopover className="gv-coachmark"><div className="gv-coachmark__hd" />')]).toEqual(['gv-coachmark']);
  });
  it('no Component or Pattern sets one beyond the list', () => {
    const extra = Object.entries(found).flatMap(([f, list]) => list.filter(c => !OUTER_MARGINS[f]?.includes(c))
      .map(c => `${f}: .${c}`));
    expect(extra, 'leave the space around a part to the page that places it (a Stack\'s gap, its className)')
      .toEqual([]);
  });
  it('lists none that is gone (the list only shrinks)', () => {
    const gone = Object.entries(OUTER_MARGINS).flatMap(([f, list]) => list.filter(c => !found[f]?.includes(c))
      .map(c => `${f}: .${c}`));
    expect(gone, 'take it off OUTER_MARGINS').toEqual([]);
  });
});

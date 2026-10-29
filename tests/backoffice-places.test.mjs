import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';
import {paints} from '../scripts/lib/places.mjs';

// The consumer's side of docs/API.md's rule "className and style place, never paint": the back office's own CSS may
// only place things (where a part goes, how big its box is, the space between parts). Colour, type, borders,
// shadows, radius and the like come from the parts and their props. The allowed list is PLACES in scripts/lib/places.mjs, written out in
// docs/API.md, "Page CSS places". A custom property is allowed when it is the page's own (`--bo-*`): a `--gv-*` one
// would repaint the system.
const DIR = 'backoffice/src';

// Today's paint, per stylesheet, as `selector: property`. The list only shrinks: a new one fails, and so does an
// entry that is gone (take it off). The back office's move onto Stack, Inline and Grid empties it.
export const PAINTS = JSON.parse(readFileSync(new URL('./backoffice-paints.json', import.meta.url), 'utf8'));

const sheets = readdirSync(DIR, {recursive: true}).filter(f => f.endsWith('.css')).map(f => `${DIR}/${f}`);
const found = Object.fromEntries(sheets.map(f => [f, paints(readFileSync(f, 'utf8'))]).filter(([, l]) => l.length));

describe('back-office CSS places, never paints', () => {
  it('tells placing from painting', () => {
    expect(paints(`.a { display: grid; gap: var(--gv-space-8); margin-block: 0; inline-size: 50%; --bo-w: 3fr;
      & .b { color: var(--gv-text-primary); border-radius: var(--gv-radius-8); --gv-surface-panel: red; } }`))
      .toEqual(['.a .b: --gv-surface-panel', '.a .b: border-radius', '.a .b: color']);
  });
  it('adds no paint beyond the list', () => {
    const extra = Object.entries(found).flatMap(([f, list]) => list.filter(p => !PAINTS[f]?.includes(p))
      .map(p => `${f}: ${p}`));
    expect(extra, 'paint comes from a part and its props; page CSS only places (docs/API.md, "Page CSS places")')
      .toEqual([]);
  });
  it('lists no paint that is gone (the list only shrinks)', () => {
    const gone = Object.entries(PAINTS).flatMap(([f, list]) => list.filter(p => !found[f]?.includes(p))
      .map(p => `${f}: ${p}`));
    expect(gone, 'take it off tests/backoffice-paints.json').toEqual([]);
  });
});

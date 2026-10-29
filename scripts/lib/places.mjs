// What page CSS may set: the properties that place a part, never paint it (docs/API.md, "Page CSS places").
// tests/backoffice-places.test.mjs reads the back office's stylesheets with it.
import {declarations, resolveSelectors} from './cssdecl.mjs';

export const PLACES = [
  'display', 'position', 'inset', /^inset-/, 'top', 'right', 'bottom', 'left', 'z-index',
  /^grid(-|$)/, /^flex(-|$)/, 'order', 'gap', 'row-gap', 'column-gap',
  /^align-/, /^justify-/, /^place-/,
  'width', 'height', /^(min|max)-(width|height|inline-size|block-size)$/, 'inline-size', 'block-size', 'aspect-ratio',
  /^margin(-|$)/, /^padding(-|$)/, /^overflow(-[xy]|-inline|-block)?$/, 'box-sizing', 'container', 'container-type',
  'container-name', 'isolation'
];
export const places = prop => (prop.startsWith('--') ? !prop.startsWith('--gv-') :
  PLACES.some(p => (typeof p === 'string' ? p === prop : p.test(prop))));

/** Each declaration in a stylesheet that paints, as `selector: property`, sorted and unique. */
export function paints(css) {
  const out = new Set();
  for (const d of declarations(css, {selectorStrings: true})) {
    if (places(d.prop)) continue;
    for (const sel of resolveSelectors(d.selectors)) out.add(`${sel.replace(/\s+/g, ' ')}: ${d.prop}`);
  }
  return [...out].sort();
}


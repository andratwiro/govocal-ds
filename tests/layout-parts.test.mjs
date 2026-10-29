import {describe, it, expect} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Stack} from '../src/components/gv/Stack.tsx';
import {Inline} from '../src/components/gv/Inline.tsx';
import {Grid, GridItem} from '../src/components/gv/Grid.tsx';

// The layout parts turn token names into custom properties their stylesheets read, and nothing else: the CSS
// defaults hold for a prop left out, and className / style still place the part.
describe('Stack', () => {
  it('gap and padding become spacing tokens; the axis props win over padding', () => {
    const html = renderToStaticMarkup(h(Stack, {gap: '16', padding: '24', paddingBlock: '8'}, 'x'));
    expect(html).toBe('<div class="gv-stack" style="--gv-stack-gap:var(--gv-space-16);' +
      '--gv-stack-padding-inline:var(--gv-space-24);--gv-stack-padding-block:var(--gv-space-8)">x</div>');
  });
  it('sets nothing it was not given; className and style place it', () => {
    expect(renderToStaticMarkup(h(Stack, {elementType: 'ul', className: 'page__list', style: {gridArea: 'list'}})))
      .toBe('<ul class="gv-stack page__list" style="grid-area:list"></ul>');
  });
});

describe('Inline', () => {
  it('row gap falls back to gap in the stylesheet; alignment and wrap are attributes', () => {
    const html = renderToStaticMarkup(h(Inline, {gap: '8', justifyContent: 'end', wrap: 'nowrap'}));
    expect(html).toBe('<div class="gv-inline" style="--gv-inline-gap:var(--gv-space-8)" data-justify="end" ' +
      'data-wrap="nowrap"></div>');
  });
});

describe('Grid', () => {
  it('a count is equal columns; areas are quoted rows', () => {
    const html = renderToStaticMarkup(h(Grid, {columns: 3, areas: ['head head head', 'a b c'], gap: '16'}));
    expect(html).toContain('--gv-grid-columns:repeat(3, minmax(0, 1fr))');
    expect(html).toContain('--gv-grid-areas:&quot;head head head&quot; &quot;a b c&quot;');
    expect(html).toContain('--gv-grid-row-gap:var(--gv-space-16);--gv-grid-column-gap:var(--gv-space-16)');
  });
  it('a track list passes as it is', () => {
    expect(renderToStaticMarkup(h(Grid, {columns: '2fr 1fr'}))).toContain('--gv-grid-columns:2fr 1fr');
  });
  it('a Grid item takes one grid-area: its name, or start and span', () => {
    const area = it => renderToStaticMarkup(h(GridItem, it)).match(/--gv-grid-item-area:([^"]*)/)?.[1];
    expect(area({area: 'detail'})).toBe('detail');
    expect(area({columnSpan: 'all'})).toBe('auto / 1 / auto / -1');
    expect(area({columnSpan: 2, rowSpan: 3})).toBe('auto / auto / span 3 / span 2');
    expect(area({columnStart: 2})).toBe('auto / 2 / auto / auto');
    expect(area({})).toBeUndefined();
  });
});

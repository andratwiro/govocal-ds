import {describe, it, expect} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Text} from '../src/components/gv/Text.tsx';
import {VisuallyHidden} from '../src/components/gv/VisuallyHidden.tsx';
import {PageHeader} from '../src/components/gv/PageHeader.tsx';
import {TileGrid} from '../src/components/gv/TileGrid.tsx';

describe('Text', () => {
  it('a kind and a colour paint it; strong only where the kind has a strong weight', () => {
    const html = renderToStaticMarkup(h(Text, {kind: 'small', isStrong: true, color: 'meta'}, 'Posted'));
    expect(html).toBe('<span class="react-aria-Text gv-base-text gv-text" data-kind="small" data-strong="true" data-color="meta">Posted</span>');
  });
  it('without a kind or a colour it is a slot\'s plain text, as React Aria draws it', () => {
    expect(renderToStaticMarkup(h(Text, {slot: 'description'}, 'Words'))).toBe('<span class="react-aria-Text gv-base-text" slot="description">Words</span>');
  });
  it('elementType picks the element; className places it', () => {
    const html = renderToStaticMarkup(h(Text, {elementType: 'h2', kind: 'body', className: 'page-title'}, 'Where'));
    expect(html).toMatch(/^<h2 class="react-aria-Text gv-base-text gv-text page-title" data-kind="body">/);
  });
});

describe('VisuallyHidden', () => {
  it('keeps its element in the reading order, clipped', () => {
    const html = renderToStaticMarkup(h(VisuallyHidden, {elementType: 'h2'}, 'Inputs'));
    expect(html).toMatch(/^<h2 style="[^"]*clip/);
    expect(html).toContain('>Inputs</h2>');
  });
});

describe('PageHeader', () => {
  it('breadcrumbs in a nav, the title as h1 with the actions, then the description', () => {
    const html = renderToStaticMarkup(h(PageHeader, {title: 'Tokens', description: 'About', actions: h('button', null, 'New'),
      breadcrumbs: h('ol', null, 'trail')}));
    const order = ['<nav aria-label="Breadcrumbs"', '<h1 class="gv-page-header__title">Tokens</h1>', '<button>New</button>',
      '<p class="gv-page-header__description">About</p>'].map(s => html.indexOf(s));
    expect(order.every(i => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
  it('headingLevel sets the title\'s level; className places it', () => {
    const html = renderToStaticMarkup(h(PageHeader, {title: 'Inputs', headingLevel: 2, className: 'page-head'}));
    expect(html).toBe('<header class="gv-page-header page-head"><div class="gv-page-header__row"><h2 class="gv-page-header__title">Inputs</h2></div></header>');
  });
});

describe('TileGrid', () => {
  it('defaults: 280, a row, 16 apart, a div', () => {
    expect(renderToStaticMarkup(h(TileGrid, null, 'x'))).toBe(
      '<div class="gv-tile-grid" data-min="280" data-layout="row" data-density="default">x</div>');
  });
  it('a gallery list of 160 tiles, compact, named', () => {
    const html = renderToStaticMarkup(h(TileGrid, {elementType: 'ul', minTileWidth: 160, layout: 'gallery', density: 'compact',
      'aria-label': 'Projects', className: 'page-grid'}, h('li', null, 'x')));
    expect(html).toBe('<ul aria-label="Projects" class="gv-tile-grid page-grid" data-min="160" data-layout="gallery" data-density="compact"><li>x</li></ul>');
  });
});

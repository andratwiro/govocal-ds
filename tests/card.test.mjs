import {describe, it, expect} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Card} from '../src/components/gv/Card.tsx';

describe('Card', () => {
  it('variant is its fill: outlined unless filled', () => {
    expect(renderToStaticMarkup(h(Card, {title: 'Exports'}))).toContain('data-variant="outlined"');
    expect(renderToStaticMarkup(h(Card, {title: 'Exports', variant: 'filled'}))).toContain('data-variant="filled"');
  });
  it('media comes first, before the title, in every layout', () => {
    for (const props of [{}, {layout: 'stacked'}, {control: 'expand'}]) {
      const html = renderToStaticMarkup(h(Card, {title: 'Park', media: h('img', {src: 'park.svg', alt: ''}), ...props}));
      expect(html.indexOf('gv-card__media')).toBeGreaterThan(-1);
      expect(html.indexOf('gv-card__media')).toBeLessThan(html.indexOf('Park'));
      expect(html).toContain('data-media="true"');
    }
  });
  it('status shows the review status', () => {
    expect(renderToStaticMarkup(h(Card, {title: 'Sorting', status: 'to-set'}))).toContain('data-state="to-set"');
  });
  it('a menu card shows its value as the pill', () => {
    const html = renderToStaticMarkup(h(Card, {title: 'Sorting', control: 'menu', defaultValue: 'recent',
      menuItems: [{id: 'trending', label: 'Trending'}, {id: 'recent', label: 'Most recent'}]}));
    expect(html).toContain('Most recent');
  });
  it('places with className and style, keeping its own class', () => {
    const html = renderToStaticMarkup(h(Card, {title: 'x', className: 'page-card', style: {gridArea: 'a'}}));
    expect(html).toMatch(/^<section class="gv-card page-card" style="grid-area:a"/);
  });
});

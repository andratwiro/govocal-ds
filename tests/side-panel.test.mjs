import {describe, it, expect} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SidePanel, SidePanelRecordHead} from '../src/components/gv/SidePanel.tsx';

describe('Side panel: isOpen', () => {
  it('a floating panel is closed until the page opens it', () => {
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas'}, 'The idea'))).toBe('');
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas', isOpen: true}, 'The idea'))).toContain('The idea');
  });
  it('an inline panel is shown unless the page closes it', () => {
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas', isInline: true}, 'The idea'))).toContain('The idea');
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas', isInline: true, isOpen: false}, 'The idea'))).toBe('');
  });
  it('defaultOpen opens a floating panel the page doesn\'t control', () => {
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas', defaultOpen: true}, 'The idea'))).toContain('The idea');
    expect(renderToStaticMarkup(h(SidePanel, {label: 'Collect ideas', isInline: true, defaultOpen: false}, 'The idea'))).toBe('');
  });
  it('the width is a preset on the root, 560 unless narrow', () => {
    expect(renderToStaticMarkup(h(SidePanel, {label: 'x', isOpen: true}, 'y'))).toContain('data-width="default"');
    expect(renderToStaticMarkup(h(SidePanel, {label: 'x', isOpen: true, width: 'narrow'}, 'y'))).toContain('data-width="narrow"');
  });
  it('places with className and style on its root', () => {
    const html = renderToStaticMarkup(h(SidePanel, {label: 'x', isInline: true, className: 'page-col', style: {gridArea: 'side'}}, 'y'));
    expect(html).toMatch(/^<div class="gv-side-panel page-col" style="grid-area:side"/);
  });
});

describe('Side panel: record head', () => {
  it('shows the words, then Posted by <author> and the date', () => {
    const html = renderToStaticMarkup(h(SidePanelRecordHead, {author: 'Resident A', date: '26 October 2026'}, 'More benches'));
    expect(html).toContain('<div class="gv-side-panel__record-text">More benches</div>');
    expect(html).toContain('Posted by <span class="gv-side-panel__record-author">Resident A</span>');
    expect(html).toContain('<span>26 October 2026</span>');
  });
  it('a title is a heading (level 2 by default), the role follows the name', () => {
    const html = renderToStaticMarkup(h(SidePanelRecordHead, {title: 'Shade', headingLevel: 3, author: 'Resident F', authorRole: 'Registered user'}, 'Words'));
    expect(html).toContain('<h3 class="gv-side-panel__record-title">Shade</h3>');
    expect(html).toContain('Resident F</span> · Registered user');
    expect(html).not.toContain('<span></span>');
  });
  it('its actions row follows the meta line', () => {
    const html = renderToStaticMarkup(h(SidePanelRecordHead, {author: 'Resident A', actions: h('div', {id: 'row'})}, 'Words'));
    expect(html.indexOf('record-meta')).toBeLessThan(html.indexOf('id="row"'));
  });
  it('no meta line without author or date', () => {
    expect(renderToStaticMarkup(h(SidePanelRecordHead, {}, 'Words'))).not.toContain('record-meta');
  });
});

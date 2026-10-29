import {describe, it, expect, vi, afterEach} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../src/components/Tabs.tsx';

const list = h(TabList, {'aria-label': 'Reports'}, h(Tab, {id: 'all'}, 'All'), h(Tab, {id: 'mine'}, 'Mine'));

describe('Tabs: the TabPanels contract', () => {
  afterEach(() => vi.restoreAllMocks());
  it('a TabPanel outside TabPanels warns in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderToStaticMarkup(h(Tabs, {defaultSelectedKey: 'all'}, list, h(TabPanel, {id: 'all'}, 'A'), h(TabPanel, {id: 'mine'}, 'M')));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('TabPanel "all" sits outside TabPanels'));
  });
  it('inside TabPanels it says nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const html = renderToStaticMarkup(h(Tabs, {defaultSelectedKey: 'all'}, list,
      h(TabPanels, null, h(TabPanel, {id: 'x-all'}, 'A'))));
    expect(warn).not.toHaveBeenCalled();
    expect(html).toContain('class="react-aria-TabPanels"');
  });
  it('a caller\'s class is added to React Aria\'s, never instead of it', () => {
    const html = renderToStaticMarkup(h(Tabs, {defaultSelectedKey: 'all', className: 'page-tabs'},
      h(TabList, {'aria-label': 'R', className: 'page-list'}, h(Tab, {id: 'all', className: 'page-tab'}, 'All')),
      h(TabPanels, {className: 'page-panels'}, h(TabPanel, {id: 'all', className: 'page-panel'}, 'A'))));
    for (const c of ['react-aria-Tabs page-tabs', 'react-aria-TabList page-list', 'react-aria-Tab page-tab',
      'react-aria-TabPanels page-panels', 'react-aria-TabPanel page-panel']) expect(html).toContain(`class="${c}"`);
  });
});

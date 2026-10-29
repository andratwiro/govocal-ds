import {describe, it, expect, afterEach} from 'vitest';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {queue, toast} from '../src/components/Toast.tsx';
import {AppProvider} from '../src/components/gv/AppProvider.tsx';

describe('toast()', () => {
  afterEach(() => queue.clear());
  it('queues a title and a description, 5 seconds by default', () => {
    const key = toast('Idea archived', 'Moved to the archive.');
    const [t] = queue.visibleToasts;
    expect(t.key).toBe(key);
    expect(t.content).toEqual({title: 'Idea archived', description: 'Moved to the archive.'});
    expect(t.timeout).toBe(5000);
  });
  it('takes an action, an icon and a timeout; 0 keeps it until closed', () => {
    const undo = () => {};
    toast('Idea deleted', undefined, {action: 'Undo', onAction: undo, icon: null, timeout: 0});
    const [t] = queue.visibleToasts;
    expect(t.content).toMatchObject({title: 'Idea deleted', action: 'Undo', onAction: undo, icon: null});
    expect(t.timeout).toBeUndefined();
  });
  it('has no second name for the description', async () => {
    const src = (await import('node:fs')).readFileSync('src/components/Toast.tsx', 'utf8');
    expect(src).not.toMatch(/\bbody\??:/);
  });
});

describe('AppProvider', () => {
  it('renders its children and draws no DOM of its own', () => {
    expect(renderToStaticMarkup(h(AppProvider, {locale: 'en-GB'}, h('main', null, 'Page')))).toBe('<main>Page</main>');
  });
});

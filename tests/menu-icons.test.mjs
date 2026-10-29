import {it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

// A menu item's icon goes in its `icon` slot (Menu's "With icons" story). Put inside the label, it lays out as text and
// lands after the words.
it('back-office menu items put their icon in the icon slot', () => {
  const files = readdirSync('backoffice/src', {recursive: true}).filter(f => f.endsWith('.tsx'));
  const hits = files.flatMap(f => [...readFileSync(`backoffice/src/${f}`, 'utf8')
    .matchAll(/<MenuItem\b[^>]*>\s*<[A-Z]\w*\s+aria-hidden/g)].map(() => f));
  expect(hits).toEqual([]);
});

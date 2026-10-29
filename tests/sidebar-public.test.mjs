import {readFileSync, readdirSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// The public sidebar shows only what a reader can use (docs/NAMING.md, "Tags"): an entry that exists only for a test
// carries `test-only`, which .storybook/main.ts hides from the sidebar. Caught by its name: a story file whose title,
// or a story whose name, says test, e2e, fixture, harness or debug. (A Controls playground is for readers: it stays.)
const TESTY = /\b(tests?|e2e|fixtures?|harness|debug)\b/i;
const files = readdirSync('src', {recursive: true}).filter(f => f.endsWith('.stories.tsx')).map(f => `src/${f}`);

describe('the public sidebar', () => {
  it('declares the test-only tag as hidden', () => {
    expect(readFileSync('.storybook/main.ts', 'utf8')).toMatch(/'test-only':\s*\{excludeFromSidebar:\s*true\}/);
  });
  it('keeps test-only entries out of it', () => {
    const found = files.flatMap(f => {
      const s = readFileSync(f, 'utf8');
      const meta = s.match(/const meta[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
      if (/'test-only'/.test(meta)) return [];
      const title = meta.match(/title:\s*'([^']+)'/)?.[1] ?? '';
      const names = [...[...s.matchAll(/^export const (\w+)\s*:\s*Story\b/gm)].map(m => m[1].replace(/(?<=[a-z])(?=[A-Z])/g, ' ')),
        ...[...s.matchAll(/^ {2}name:\s*'([^']+)'/gm)].map(m => m[1])];
      return [title, ...names].filter(n => TESTY.test(n)).map(n => `${f}: "${n}"`);
    });
    expect(found, "tag these files `test-only` (or rename the story if a reader would use it)").toEqual([]);
  });
});

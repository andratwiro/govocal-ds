import {readFileSync, readdirSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

// The copy check over docs pages (Foundations › Voice and tone): headings in sentence case, and none of the word list's
// Avoid words (src/foundations/words.json). Docs pages are every .mdx under src/ plus the Markdown files a docs page
// shows as it is (an `import … from '…/docs/X.md?raw'`). Code (fenced blocks, `inline`, JSX expressions) is not copy.
const mdx = readdirSync('src', {recursive: true}).filter(f => f.endsWith('.mdx')).map(f => `src/${f}`);
const shown = mdx.flatMap(f => [...readFileSync(f, 'utf8').matchAll(/from '((?:\.\.\/)+docs\/[\w-]+\.md)\?raw'/g)]
  .map(m => new URL(m[1], `file:///${f}`).pathname.slice(1)));
const pages = [...new Set([...mdx, ...shown])].sort();

const {words} = JSON.parse(readFileSync('src/foundations/words.json', 'utf8'));
const AVOID = words.flatMap(w => w.avoid);

// Prose only: no fenced code, no inline code, no HTML comments or MDX comments, no import/export lines.
const prose = text => text
  .replace(/```[\s\S]*?```/g, m => m.replace(/[^\n]/g, ' '))
  .replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' '))
  .replace(/^(import|export) .*$/gm, '')
  .replace(/`[^`\n]*`/g, '');

// Words a sentence-case heading may still capitalise: names of things, Storybook sections and part names.
const NAMES = new Set(['Go', 'Vocal', 'Figma', 'React', 'Aria', 'Storybook', 'Arabic', 'English', 'Dutch', 'German',
  'Overview', 'Foundations', 'Components', 'Patterns', 'Base', 'Back', 'Welcome', 'Lifecycle', 'Principles', 'Recipes',
  'Input', 'Community', 'Inspiration', 'Insights', 'Platform', 'Chromatic', 'GitHub', 'Vite', 'Jest', 'Node', 'TypeScript',
  'MapLibre', 'ArcGIS', 'Lucide', 'Public', 'Sans', 'WCAG', 'APG', 'Craft']);
// Title Case: every word after the first is capitalised (small words like "and" or "of" aside), and one of them is
// not a name.
const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'to', 'for', 'by', 'with', 'at', 'from', 'as', 'is']);
function titleCase(heading) {
  const rest = heading.replace(/[`*_[\]()]/g, ' ').split(/\s+/).filter(Boolean).slice(1)
    .filter(w => /^[A-Za-z][a-z]+$/.test(w) && !SMALL.has(w.toLowerCase()));
  return rest.length >= 1 && rest.every(w => /^[A-Z]/.test(w)) && rest.some(w => !NAMES.has(w));
}

describe('the copy check over docs pages', () => {
  it('reads the docs pages and the word list', () => {
    expect(pages.length).toBeGreaterThan(10);
    expect(AVOID.length).toBeGreaterThan(3);
  });

  it('tells Title Case from sentence case', () => {
    for (const h of ['Questions For Developers', 'Who Owns What', 'Voice And Tone']) expect(titleCase(h), h).toBe(true);
    for (const h of ['Questions for developers', 'What comes from React Aria', 'Not in Figma', 'Go Vocal design system'])
      expect(titleCase(h), h).toBe(false);
  });

  it('headings are in sentence case (Foundations › Voice and tone)', () => {
    const found = pages.flatMap(f => prose(readFileSync(f, 'utf8')).split('\n')
      .map((line, i) => [line.match(/^#{1,6}\s+(.*)$/)?.[1], i + 1])
      .filter(([h]) => h && titleCase(h)).map(([h, n]) => `${f}:${n} "${h}"`));
    expect(found, 'write these headings in sentence case').toEqual([]);
  });

  it("uses none of the word list's Avoid words (Foundations › Word list)", () => {
    const found = pages.filter(f => f !== 'src/foundations/WordList.mdx').flatMap(f => prose(readFileSync(f, 'utf8'))
      .split('\n').flatMap((line, i) => AVOID
        .filter(w => new RegExp(`(?<![\\w-])${w.replace(/[-]/g, '\\-')}(?![\\w-])`, 'i').test(line))
        .map(w => `${f}:${i + 1} "${w}"`)));
    expect(found, 'use the word list\'s word instead').toEqual([]);
  });
});

import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {join} from 'node:path';

// Rob, 29 Oct 2026: nothing the site shows names a person. Say "Figma", "the prototype", or "Not in Figma".
const DIRS = ['src', '.storybook', 'site', 'backoffice/src', 'backoffice/index.html'];
const NAMED = /\bTali\b|\bher (prototype|Figma|tokens|system|look|spec|frames?)\b/i;

const files = p => statSync(p).isDirectory() ? readdirSync(p).flatMap(f => files(join(p, f))) : [p];

describe('no names on the site', () => {
  it('catches a name', () => {
    expect(NAMED.test("Components from Tali's Figma")).toBe(true);
    expect(NAMED.test('Built from her prototype')).toBe(true);
    expect(NAMED.test('<EditorTool icon={Italic} label="Italic" />')).toBe(false);
  });
  it('src, .storybook, site and the back office name nobody', () => {
    const hits = DIRS.filter(existsSync).flatMap(files)
      .filter(f => /\.(tsx?|mdx|css|html|json|mjs)$/.test(f))
      .flatMap(f => readFileSync(f, 'utf8').split('\n').map((l, i) => NAMED.test(l) ? `${f}:${i + 1}` : null).filter(Boolean));
    expect(hits).toEqual([]);
  });
});

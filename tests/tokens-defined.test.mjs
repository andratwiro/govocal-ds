import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {retired} from '../scripts/lib/rename.mjs';

// Every token a file reads exists, or the file (or its .css/.tsx twin) declares it: a guessed name (--gv-text-warning
// before it is made) or one copied from an old Figma frame fails here, not as an unset colour in a browser.
// tokens.md "Guard tests".
const ROOTS = ['src', 'backoffice/src', '.storybook', 'e2e'];
const files = ROOTS.filter(existsSync).flatMap(r => readdirSync(r, {recursive: true})
  .filter(f => /\.(css|tsx?|mdx|mjs|js|html)$/.test(f) && !/(^|\/)tokens\.css$/.test(f)).map(f => `${r}/${f}`));
const tokensCss = readFileSync('src/tokens.css', 'utf8');
const defined = new Set([...tokensCss.matchAll(/^\s*(--gv-[\w-]+):/gm)].map(m => m[1]));
const map = JSON.parse(readFileSync('tokens/renames.json', 'utf8'));
const rules = new Map(map.renames.map(r => [r.from, r]));
const gone = new Set(retired(map));
const theme = readFileSync('src/components/theme.css', 'utf8');

// What a retired name became, for the failure message.
const replacement = name => {
  if (map.starter?.[name]) return map.starter[name];
  const r = rules.get(name);
  if (!r) return '?';
  if (r.delete) return `nothing (${r.why})`;
  if (r.by) return Object.entries(r.by).map(([k, v]) => `${v} for ${k}`).join(', ');
  if (r.drop) return `${r.drop} on a position, else ${r.scale}`;
  return r.to;
};

// Each custom property a file declares itself: `--x:` in CSS, `'--x':` or `['--x']` in a style object, setProperty.
const declaredIn = source => new Set([...source.matchAll(/(--[\w-]+)['"]?\s*\]?\s*:/g), ...source.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)]
  .map(m => m[1]));

// A name with a ${…} in it (a template string) stands for every token its fixed parts match.
const pattern = name => new RegExp(`^${name.split(/\$\{[^}]*\}/).map(s => s.replace(/[-]/g, '\\-')).join('[\\w-]+')}$`);

// A component's stylesheet and its script are one file here: MotionPreview.tsx sets the variable MotionPreview.css reads.
const twins = file => ['.css', '.tsx', '.ts'].map(x => file.replace(/\.[a-z]+$/, x)).filter(f => f !== file && existsSync(f))
  .map(f => readFileSync(f, 'utf8')).join('\n');

export function undefinedTokens(file, source, {tokens = defined, retiredNames = gone} = {}) {
  const own = declaredIn(source + '\n' + twins(file));
  const out = [];
  for (const m of source.matchAll(/var\(\s*(--gv-(?:[\w-]|\$\{[^}]*\})+)/g)) {
    const name = m[1], line = source.slice(0, m.index).split('\n').length;
    if (name.includes('${')) {
      const re = pattern(name);
      if (![...tokens].some(t => re.test(t))) out.push(`${file}:${line} ${name} matches no token`);
      continue;
    }
    if (retiredNames.has(name)) out.push(`${file}:${line} ${name} is retired: use ${replacement(name)}`);
    else if (!tokens.has(name) && !own.has(name)) out.push(`${file}:${line} ${name} is not a token (src/tokens.css)`);
  }
  return out;
}

describe('every --gv- name in use is a token', () => {
  it('finds a guessed name, a retired one with its replacement, and a template that matches nothing', () => {
    const tokens = new Set(['--gv-text-primary', '--gv-type-ui', '--gv-type-ui-strong']);
    const retiredNames = new Set(['--gv-text-live']);
    expect(undefinedTokens('a.css', 'a { color: var(--gv-text-warning); }', {tokens, retiredNames}))
      .toEqual(['a.css:1 --gv-text-warning is not a token (src/tokens.css)']);
    expect(undefinedTokens('a.css', 'a {\n  color: var(--gv-text-live);\n}', {tokens, retiredNames})[0])
      .toMatch(/^a\.css:2 --gv-text-live is retired: use /);
    expect(undefinedTokens('a.tsx', 'x = `var(--gv-type-${r}-tracking)`', {tokens, retiredNames}))
      .toEqual(['a.tsx:1 --gv-type-${r}-tracking matches no token']);
  });
  it('lets tokens, local variables and templates that match through', () => {
    const tokens = new Set(['--gv-text-primary', '--gv-type-ui', '--gv-type-ui-strong']);
    expect(undefinedTokens('a.css', 'a { --gv-side-panel-shift: 0; translate: var(--gv-side-panel-shift); color: var(--gv-text-primary); }',
      {tokens})).toEqual([]);
    expect(undefinedTokens('a.tsx', "s = {'--gv-x': 1}; t = 'var(--gv-x)'; u = `var(--gv-type-${role})`", {tokens})).toEqual([]);
  });
  it(`in ${ROOTS.join(', ')}`, () => {
    expect(files.flatMap(f => undefinedTokens(f, readFileSync(f, 'utf8')))).toEqual([]);
  });
});

describe('no starter alias is left', () => {
  // The React Aria starter's second set of names (--spacing-*, --radius, --focus-ring-color, …) moved onto --gv- names;
  // theme.css keeps only what a stylesheet also sets as its own variable (--background-color, --border-color).
  const kept = declaredIn(theme);
  it('nothing reads a starter alias that theme.css no longer defines', () => {
    const hits = [];
    for (const f of files) {
      const source = readFileSync(f, 'utf8'), own = declaredIn(source);
      for (const m of source.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1];
        if (map.starter?.[name] !== undefined && !kept.has(name) && !own.has(name))
          hits.push(`${f}:${source.slice(0, m.index).split('\n').length} ${name}: use ${replacement(name)}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

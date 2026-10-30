import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, resolve, relative, basename} from 'node:path';

const files = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : [p];
});
const src = files('backoffice/src');
const ALLOWED_PACKAGES = new Set(['react', 'react-dom/client', 'react-router', 'lucide-react']);
// The system's public entry points (package.json exports). `npm run api:imports` moves deep imports onto them.
const ENTRY_POINTS = new Set(['govocal-ds', 'govocal-ds/base', 'govocal-ds/tokens.css']);

describe('back office uses only the system', () => {
  it('imports the system only through govocal-ds, govocal-ds/base and govocal-ds/tokens.css', () => {
    const bad = [];
    for (const f of src.filter(f => /\.(ts|tsx)$/.test(f))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g)) {
        const spec = m[1] ?? m[2];
        if (spec.startsWith('.')) {
          const target = relative('.', resolve(f, '..', spec));
          if (!target.startsWith('backoffice/src')) bad.push(`${f}: ${spec}`);
        } else if (!ALLOWED_PACKAGES.has(spec) && !ENTRY_POINTS.has(spec)) bad.push(`${f}: ${spec}`);
      }
    }
    expect(bad, 'run `npm run api:imports`').toEqual([]);
  });
  it('borrows no story data or pictures: it has its own (backoffice/src/pictures)', () => {
    const data = src.filter(f => /\.(ts|tsx)$/.test(f) && /from\s+['"][^'"]*src\/stories\//.test(readFileSync(f, 'utf8')));
    expect(data).toEqual([]);
  });
  it('has one CSS file, layout only, tokens only', () => {
    const css = src.filter(f => f.endsWith('.css'));
    expect(css).toEqual(['backoffice/src/layout.css']);
    const text = readFileSync(css[0], 'utf8');
    expect(text).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(/);
    expect(text).not.toMatch(/font-size:\s*\d|font:\s*\d/);
  });
});

/** The names a barrel exports, with the module each comes from. */
const barrel = file => [...readFileSync(file, 'utf8').matchAll(/export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/g)]
  .flatMap(([, list, from]) => list.split(',').map(s => s.trim()).filter(Boolean)
    .map(s => ({name: s.replace(/^type\s+/, '').split(/\s+as\s+/).pop(), from})));
const index = barrel('src/index.ts');
const base = barrel('src/base.ts');
const sources = files('src/components').concat(files('src/patterns'))
  .filter(f => /\.tsx?$/.test(f) && !/\.stories\.tsx$/.test(f));
const exportedValues = f => [...readFileSync(f, 'utf8').matchAll(/^export\s+(?:function|const)\s+([A-Za-z_]\w*)/gm)]
  .map(m => m[1]);
const fromModule = f => './' + relative('src', f).replace(/\.tsx?$/, '');

// The starter files painted as Components (Storybook's Components tree), and the content parts they compose.
const STARTER_COMPONENTS = ['Button', 'CheckboxGroup', 'Link', 'Menu', 'NumberField', 'RadioGroup', 'SearchField',
  'Select', 'Switch', 'Tabs', 'TextField', 'Toast', 'Tooltip', 'Content', 'Separator'];
// Starter files a Component replaces under the same name, kept out of both entry points.
const REPLACED = ['Checkbox', 'Modal'];
// Exported for the file's own tests, stories or siblings, never for a page.
const INTERNAL = new Set([
  'niceScale', 'describeSeries', 'describeChart', 'describePoint', 'nearestIndex', // Chart's maths, unit-tested
  'illustrations', 'loopSeconds', 'motionPlan', 'AUTO_LIMIT_S', 'cycleSeconds', // the Illustrations gallery's
  'listColumnsTemplate', 'pageItems', 'activeFacets',
  'SelectListBox', 'DropdownListBox', 'DropdownItem', // the list boxes inside Select
  'Toast', // ToastRegion draws it
  'keepClass', 'ownClass', // the className contract's helpers
  'boundsOf', 'initialView', 'worldPoint', 'clusterPoints', 'nextInDirection', 'parseCredits', 'placeCard', // the map's maths, unit-tested
  'createMapLibreEngine', // loaded on demand by maplibreEngine(); importing it would pull MapLibre into the page's bundle
  'virtualMetrics', // the virtualised Data table's fallback row metrics, for its tests
  'useShownLocale', // the multilingual fields' shown-language state; pages use the fields' `locale` props
  'Text' // Content.tsx's slot Text stays the starter files' own; the barrel's Text is gv/Text (React Aria's underneath)
]);

describe('story fixtures (src/stories/)', () => {
  it('are reached only from stories and from each other, never from a Component or Pattern', () => {
    const bad = sources.filter(f => /from\s+['"][^'"]*\/stories\//.test(readFileSync(f, 'utf8')));
    expect(bad).toEqual([]);
  });
});

describe('public entry points', () => {
  it('export each name once, across govocal-ds and govocal-ds/base', () => {
    const seen = new Map();
    const twice = [];
    for (const {name, from} of [...index, ...base]) {
      if (seen.has(name)) twice.push(`${name}: ${seen.get(name)} and ${from}`);
      seen.set(name, from);
    }
    expect(twice).toEqual([]);
  });
  it('carry every Component and Pattern a page may use', () => {
    const owned = sources.filter(f => f.includes('/gv/') || f.startsWith('src/patterns/') ||
      STARTER_COMPONENTS.includes(basename(f).replace(/\.tsx?$/, '')));
    const missing = owned.flatMap(f => exportedValues(f).filter(n => !INTERNAL.has(n))
      .filter(n => !index.some(e => e.name === n && e.from === fromModule(f))).map(n => `${n} (${f})`));
    expect(missing, 'add it to src/index.ts, or to INTERNAL here with the reason').toEqual([]);
  });
  it('place every starter file: govocal-ds/base, or replaced by a Component', () => {
    const starter = sources.filter(f => /^src\/components\/[^/]+\.tsx$/.test(f))
      .map(f => basename(f, '.tsx')).filter(n => !STARTER_COMPONENTS.includes(n));
    const unplaced = starter.filter(n => !REPLACED.includes(n) && !base.some(e => e.from === `./components/${n}`));
    expect(unplaced, 'export it from src/base.ts, or list it in REPLACED').toEqual([]);
    const leaked = [...index, ...base].filter(e => REPLACED.some(n => e.from === `./components/${n}`));
    expect(leaked).toEqual([]);
  });
});

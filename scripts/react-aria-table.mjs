// Writes docs/REACT-ARIA.md: for each Storybook entry, what comes from React Aria (the parts whose behaviour it wires,
// whether its props pass straight through, whether it formats by locale) and what survives a change of base library
// (its CSS, its stories). Nothing here reads e2e/, so a new spec never makes it stale. Read from the code, so it follows it: the parts a
// file imports from 'react-aria-components', followed through the system's own files it imports. Overview › What comes
// from React Aria shows it. `npm run components:index` runs it; `--check` fails when the file is stale.
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join, normalize} from 'node:path';

const OUT = 'docs/REACT-ARIA.md';
const read = p => readFileSync(p, 'utf8');

// A system file → the React Aria parts it imports itself, its own local imports, and whether it formats by locale.
const cache = new Map();
function scan(file) {
  if (cache.has(file)) return cache.get(file);
  const s = existsSync(file) ? read(file) : '';
  const rac = new Map();      // local name → React Aria name, values only
  const racTypes = new Map(); // local name → React Aria type name
  const local = [];
  for (const m of s.matchAll(/^import\s+(type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/gm)) {
    const [, allTypes, names, from] = m;
    for (const raw of names.split(',').map(n => n.trim()).filter(Boolean)) {
      const isType = !!allTypes || raw.startsWith('type ');
      const [orig, alias = orig] = raw.replace(/^type\s+/, '').split(/\s+as\s+/).map(x => x.trim());
      if (/^react-aria-components(\/|$)|^react-aria$|^@react-aria\//.test(from)) (isType ? racTypes : rac).set(alias, orig);
    }
    if (from.startsWith('.')) local.push(from);
  }
  for (const m of s.matchAll(/^import\s+(?!type\b)[^'{]*'(\.[^']+)'/gm)) if (!m[1].endsWith('.css')) local.push(m[1]);
  const files = local.filter(f => !f.endsWith('.css') && !/\/stories\//.test(f))
    .map(f => [`${f}.tsx`, `${f}.ts`, `${f}/index.tsx`, f].map(c => normalize(join(dirname(file), c))).find(c => existsSync(c) && /\.tsx?$/.test(c)))
    .filter(Boolean);
  const formats = /\buse(Locale|NumberFormatter|DateFormatter|Collator|Filter|ListFormatter|PercentFormatter)\b/.test(s);
  const css = /^import\s+'\.\/[^']+\.css'/m.test(s);
  const result = {s, rac, racTypes, files, formats, css};
  cache.set(file, result);
  return result;
}

// The React Aria parts a file imports itself.
const own = file => [...scan(file).rac.values()].filter(n => /^[A-Z]/.test(n) && !/(Context|Provider)$/.test(n));

// Every React Aria part a file reaches, itself and through every system file it imports, however deep; and whether
// anything on the way formats by locale. Each file is visited once per walk, so an import cycle ends.
function reachAll(file) {
  const parts = new Set();
  let formats = false;
  const seen = new Set();
  const walk = f => {
    if (seen.has(f)) return;
    seen.add(f);
    const me = scan(f);
    for (const p of own(f)) parts.add(p);
    formats ||= me.formats || [...me.rac.values()].some(n => /^(Date|Time|Number)(Field|Picker|Input|RangePicker)$|Calendar$/.test(n));
    me.files.forEach(walk);
  };
  walk(file);
  return {parts, formats};
}

// A part's React Aria parts: those it imports itself (direct), and, per system file it imports, the ones reached through
// that file and not imported directly.
function reach(file) {
  const direct = own(file);
  const through = [];
  for (const f of scan(file).files) {
    const parts = [...reachAll(f).parts].filter(p => !direct.includes(p));
    if (parts.length) through.push({file: f, parts});
  }
  const all = reachAll(file);
  return {direct, through, parts: [...all.parts], formats: all.formats};
}

// The React Aria props type the part's own props extend, if any (straight through: React Aria's docs describe them).
function passThrough(file, component) {
  const {s, racTypes} = scan(file);
  const m = s.match(new RegExp(`(?:interface|type)\\s+${component}Props\\b[^{=]*?(?:extends|=)\\s*([^{]+)`));
  if (!m) return '';
  const found = [...racTypes.keys()].filter(t => new RegExp(`\\b${t}\\b`).test(m[1]));
  if (found.some(t => /Props$/.test(racTypes.get(t)))) return found.map(t => racTypes.get(t)).filter(t => /Props$/.test(t)).join(', ');
  // Extends a Base part's props, which extend React Aria's.
  const base = m[1].match(/\b(\w+Props)\b/g) ?? [];
  for (const f of scan(file).files) for (const b of base) {
    const sub = scan(f);
    if (new RegExp(`(?:interface|type)\\s+${b}\\b`).test(sub.s)) {
      const inner = passThrough(f, b.replace(/Props$/, ''));
      if (inner) return inner;
    }
  }
  return '';
}


// A system file's name in the sidebar ("components/gv/IconButton" → Icon button), from its stories; a file with no
// entry of its own (a helper) is named after its file the same way ("ProgressCircle" → Progress circle).
const names = new Map();
for (const f of readdirSync('src', {recursive: true}).filter(f => f.endsWith('.stories.tsx')).sort()) {
  const s = read(`src/${f}`);
  const meta = s.match(/const meta[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
  const title = meta.match(/title:\s*'([^']+)'/)?.[1] ?? (/^components\/\w+\.stories/.test(f) ? `Base/${f.match(/(\w+)\.stories/)[1]}` : null);
  if (!title || title.includes('/Recipes/')) continue;
  const named = f.match(/(\w+)\.stories\.tsx$/)[1];
  const component = meta.match(/component:\s*([A-Z]\w*)/)?.[1] ?? named;
  const from = s.match(new RegExp(`import\\s*\\{[^}]*\\b${component}\\b[^}]*\\}\\s*from\\s*'(\\.[^']+)'`))?.[1] ?? `./${named}`;
  const file = [`${from}.tsx`, `${from}/index.tsx`].map(p => normalize(join('src', dirname(f), p))).find(p => existsSync(p));
  // A Component's name wins over the Base primitive it covers.
  if (file && (!names.has(file) || !title.startsWith('Base/'))) names.set(file, title.split('/').at(-1));
}
const partName = f => names.get(f) ??
  f.match(/(\w+)\.tsx?$/)[1].replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ').replace(/ [A-Z](?=[a-z])/g, c => c.toLowerCase());

const rows = [];
const skipped = []; // entries with no component file of their own (none today)
for (const f of readdirSync('src', {recursive: true}).filter(f => f.endsWith('.stories.tsx')).sort()) {
  const s = read(`src/${f}`);
  const meta = s.match(/const meta[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
  const title = meta.match(/title:\s*'([^']+)'/)?.[1] ?? (/^components\/\w+\.stories/.test(f) ? `Base/${f.match(/(\w+)\.stories/)[1]}` : null);
  if (!title || !/^(Components|Patterns|Base)\//.test(title) || title.includes('/Recipes/')) continue;
  if (/'covered'/.test(meta)) continue; // hidden: a Component replaces it, and has its own row
  // The meta's component, or (a meta without one, as Data table's) the file the stories file is named after.
  const named = f.match(/(\w+)\.stories\.tsx$/)[1];
  const component = meta.match(/component:\s*([A-Z]\w*)/)?.[1] ?? named;
  const from = s.match(new RegExp(`import\\s*\\{[^}]*\\b${component}\\b[^}]*\\}\\s*from\\s*'(\\.[^']+)'`))?.[1] ?? `./${named}`;
  const file = [`${from}.tsx`, `${from}/index.tsx`].map(p => normalize(join('src', dirname(f), p))).find(p => existsSync(p));
  if (!file) { skipped.push(title); continue; }
  const {direct, through, parts, formats} = reach(file);
  const stories = [...s.matchAll(/^export const [A-Z]\w*\s*:\s*Story\b/gm)].length;
  rows.push({title, component, direct, through, parts, pass: passThrough(file, component), formats,
    css: scan(file).css, stories});
}

const TIERS = ['Components', 'Patterns', 'Base'];
rows.sort((a, b) => TIERS.indexOf(a.title.split('/')[0]) - TIERS.indexOf(b.title.split('/')[0]) || a.title.localeCompare(b.title));
const code = xs => xs.map(x => `\`${x}\``).join(', ');
const behaviour = r => !r.parts.length ? 'None: plain React and CSS' :
  [r.direct.length ? code(r.direct) : '', ...r.through.map(t => `through ${partName(t.file)}: ${code(t.parts)}`)]
    .filter(Boolean).join('; ');
const line = r => `| ${r.title.split('/').slice(1).join(' › ')} | ${behaviour(r)} | ${r.pass ? code(r.pass.split(', ')) : '–'} | ` +
  `${r.formats ? 'yes' : '–'} | ${r.css ? 'yes' : '–'} | ${r.stories} |`;

const withRac = rows.filter(r => r.parts.length).length;
const body = [
  '# What comes from React Aria',
  '',
  'Generated by `npm run components:index` from the code (`scripts/react-aria-table.mjs`); never edit by hand.',
  '',
  'Every interactive part is built on React Aria Components. This table says, per part, what React Aria gives it and',
  'what would survive a change of base library. It decides nothing: the base library is a question for developers',
  '(Overview › Questions for developers).',
  '',
  `**${withRac} of ${rows.length} parts** wire behaviour from React Aria; the rest are plain React and CSS.`,
  '',
  '**What comes from React Aria** (would be rewritten on another library):',
  '',
  '- **Behaviour from React Aria\'s …**: the React Aria parts it is built on: first those it uses itself, then, per',
  '  system part it is built from, the ones that part brings, followed however deep (`through Icon button: `Button``',
  '  means its Icon button is a React Aria Button). Their keyboard behaviour, focus, ARIA roles and right-to-left layout',
  '  come from React Aria.',
  '- **Props straight through**: its props extend that React Aria type, so React Aria\'s docs describe the rest of them',
  '  (`isDisabled`, `onPress`, `selectionMode`…).',
  '- **Locale**: it formats numbers, dates or lists by React Aria\'s locale (`AppProvider`\'s `locale`).',
  '',
  '**What survives a swap** (kept whatever the base library):',
  '',
  '- the tokens, and the part\'s **CSS** on them;',
  '- its **stories**, each a state to rebuild and compare;',
  '- the **browser tests** in `e2e/`: they find elements by role and name, never by React Aria\'s classes, so they test',
  '  the behaviour, not the library;',
  '- its docs page.',
  '',
  ...TIERS.flatMap(t => {
    const list = rows.filter(r => r.title.startsWith(`${t}/`));
    return list.length ? [`## ${t}`, '',
      '| Part | Behaviour from React Aria\'s … | Props straight through | Locale | CSS | Stories |',
      '|---|---|---|---|---|---|', ...list.map(line), ''] : [];
  })
].join('\n');

if (process.argv.includes('--check')) {
  const now = existsSync(OUT) ? read(OUT) : '';
  if (now !== body) { console.error(`${OUT} is stale: run npm run components:index`); process.exit(1); }
} else {
  writeFileSync(OUT, body);
  console.log(`${OUT}: ${rows.length} parts, ${withRac} on React Aria` + (skipped.length ? `; no component file: ${skipped.join(', ')}` : ''));
}

// npm run tokens:rename: moves every stylesheet, story, page and test onto today's token names (tokens/renames.json).
// Safe to re-run, and meant to be: after a merge, on a newer main, before a commit. A second run changes nothing.
//   - retired names → their replacement (a split one by the CSS property or style key it sits under);
//   - the React Aria starter's variables (--spacing-3, --radius, --focus-ring-color, --highlight-*, …) → gv names, then
//     theme.css drops every one nothing reads;
//   - a 2px focus outline → outline: var(--gv-focus-ring), and its offset → --gv-focus-ring-offset(-inset);
//   - per-role tracking declarations go (one --gv-font-tracking on :root); weights, sizes and lines → font primitives;
//   - z-index 10, 50, 100 → --gv-layer-*; a disabled or dragging opacity → --gv-opacity-*;
//   - in a component's stylesheet (src/components, src/patterns, backoffice/src): a tint that is a token
//     (color-mix(in srgb, var(--gv-color-red-500) 12%, transparent) → var(--gv-surface-danger)), and a primitive that
//     paints a whole colour → the semantic token with its value (tokens/renames.json, paint).
// Stylesheets, the <style> of an .html page or an .svg illustration, and TS, TSX and MDX (by the style key).
// Whatever it can't decide, it prints. `-- --check` changes nothing and exits 1 if anything would change.
import {readFileSync, writeFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {compile, renameCss, renameScript} from './lib/rename.mjs';
import {declarations} from './lib/cssdecl.mjs';

const ROOTS = ['src', 'backoffice/src', '.storybook', 'e2e'];
const THEME = 'src/components/theme.css';
// Component stylesheets: where paint comes only from semantic tokens (tests/paint.test.mjs).
const PAINT = f => /^(src\/components|src\/patterns|backoffice\/src)\//.test(f) && f !== THEME;
const check = process.argv.includes('--check');
const map = JSON.parse(readFileSync('tokens/renames.json', 'utf8'));
const rules = compile(map);

const walk = dir => existsSync(dir) ? readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
}) : [];
const files = ROOTS.flatMap(walk).filter(f => /\.(css|tsx?|mdx|html|svg)$/.test(f) && f !== 'src/tokens.css').sort();
const sources = new Map(files.map(f => [f, readFileSync(f, 'utf8')]));

// A starter name some stylesheet sets for itself (Tabs' --border-color) is a local variable there: never replaced.
const local = new Set();
for (const [f, text] of sources) if (f.endsWith('.css') && f !== THEME)
  for (const d of declarations(text)) if (d.prop in rules.starter) local.add(d.prop);

const notes = [];
const out = new Map();
for (const [f, text] of sources) {
  let result;
  if (f.endsWith('.css')) result = renameCss(text, rules, {file: f, local, paint: PAINT(f)});
  else if (/\.(html|svg)$/.test(f)) {
    const ns = [];
    const html = text.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, b) => {
      const r = renameCss(css, rules, {file: f, local});
      ns.push(...r.notes);
      return a + r.text + b;
    });
    result = {text: html, notes: ns};
  } else result = renameScript(text, rules, {file: f, local});
  notes.push(...result.notes);
  out.set(f, result.text);
}

// theme.css keeps only the starter names something still reads.
if (out.has(THEME)) {
  const all = [...out.values()].join('\n');
  const reads = name => new RegExp(`var\\(\\s*${name}\\s*[,)]`).test(all);
  let theme = out.get(THEME);
  const gone = declarations(theme).filter(d => d.prop in rules.starter && !reads(d.prop)).sort((a, b) => b.start - a.start);
  for (const d of gone) {
    const lineStart = theme.lastIndexOf('\n', d.start - 1) + 1;
    const lineEnd = theme.indexOf('\n', d.end);
    theme = theme.slice(0, lineStart) + theme.slice(lineEnd + 1);
  }
  // A comment heading nothing any more goes too; then no double blank lines.
  theme = theme.replace(/^[ \t]*\/\*[^\n]*\*\/[ \t]*\n(?=[ \t]*(\n|\/\*|\}))/gm, '').replace(/\n{3,}/g, '\n\n')
    .replace(/\{\n\n/g, '{\n').replace(/\n\n\}/g, '\n}');
  out.set(THEME, theme);
  // What the deleted aliases said can't matter any more.
  const deletedLines = new Set(declarations(sources.get(THEME)).filter(d => gone.some(g => g.prop === d.prop))
    .map(d => `${THEME}:${d.line}:`));
  for (let i = notes.length - 1; i >= 0; i--) if ([...deletedLines].some(l => notes[i].startsWith(l))) notes.splice(i, 1);
  for (const name of local) notes.push(`${THEME}: ${name} stays: a stylesheet also sets it as its own variable`);
}

const changed = files.filter(f => out.get(f) !== sources.get(f));
if (!check) for (const f of changed) writeFileSync(f, out.get(f));
for (const n of [...new Set(notes)]) console.log(`  ${n}`);
console.log(`tokens:rename: ${changed.length} of ${files.length} files ${check ? 'would change' : 'changed'}` +
  `${notes.length ? `; ${new Set(notes).size} notes above` : ''}`);
if (check && changed.length) { for (const f of changed) console.log(`  would change ${f}`); process.exit(1); }

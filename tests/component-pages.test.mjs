import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {APG, OPTIONAL, SECTIONS, WRITTEN, boldNames, bullets, keyboardRows, parseGuide} from '../scripts/lib/guide.mjs';

// The component page (docs/HOW-TO.md, "Write a component page"): every part's usage guidance lives in
// `<Name>.guide.md` beside its `<Name>.stories.tsx`, and the docs page, the components manifest and docs/COMPONENTS.md
// read it from there.
//
// A part is one Storybook docs page under Components/ or Patterns/: one stories file whose meta title starts with
// `Components/` or `Patterns/`. Patterns/Recipes/ is not a part (a recipe is markup to copy, with no "use X instead").
// Base is not a part either: primitives with a one-line page (Base/Introduction). On 30 Oct 2026 that is 101 parts:
// 77 Components and 24 Patterns (the plan's 83 counted the 29 Oct tree, before Link, Radio group, Checkbox group,
// the Tables & lists and Text groups, the multilingual and map parts, and Stack, Inline and Grid).
//
// Every part has its guide (all written on 30 Oct 2026), and a guide must be complete: a new part arrives with its
// page.

function parts() {
  const out = [];
  for (const f of readdirSync('src', {recursive: true}).filter(f => f.endsWith('.stories.tsx')).sort()) {
    const file = join('src', f);
    const s = readFileSync(file, 'utf8');
    const meta = s.match(/const meta[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
    const title = meta.match(/title:\s*'([^']+)'/)?.[1];
    if (!title || !/^(Components|Patterns)\//.test(title) || title.startsWith('Patterns/Recipes/')) continue;
    const component = meta.match(/component:\s*([A-Z]\w*)/)?.[1];
    const from = component && s.match(new RegExp(`import\\s*\\{[^}]*\\b${component}\\b[^}]*\\}\\s*from\\s*'(\\.[^']+)'`))?.[1];
    const source = from && ['.tsx', '/index.tsx'].map(ext => join(dirname(file), from + ext)).find(p => existsSync(p));
    out.push({title, name: title.split('/').at(-1), group: title.split('/').slice(0, -1).join(' / '), file, stories: s,
      source, guide: file.replace(/\.stories\.tsx$/, '.guide.md')});
  }
  return out;
}

/** React Aria parts that take focus or keys (any name that starts with one: `RadioField`, `SwitchButton`). */
const INTERACTIVE_ARIA = /^(Button|Link|Menu|Dialog|Modal|Popover|Tooltip|Table|Row|GridList|ListBox|Tree|Select|ComboBox|TextField|SearchField|NumberField|Checkbox|Radio|Switch|Tabs?|ToggleButton|Toolbar|Slider|DatePicker|DateField|Disclosure|DropZone|FileTrigger|Calendar|TextArea|Input)\w*$/;

/** Parts the scan below calls interactive whose own page has no keys to tell, each with its reason. */
const NOT_INTERACTIVE = new Map([
  ['App provider', 'it renders the toast region, whose keys are Toast\'s page'],
  ['Panel', 'its count Badge is never removable; the actions and body it holds keep their own keys'],
  ['Quote', 'its tag Badge is never removable: a quote is read, never pressed'],
]);

function names(spec) {
  return spec.split(',').map(n => n.trim()).filter(n => n && !n.startsWith('type ')).map(n => n.split(/\s+as\s+/)[0]);
}

/** Whether a file's code takes presses or keys: it handles them, renders a React Aria part that does, or imports one
 * of the system's own parts that does (followed through local imports). */
function interactiveFile(file, seen = new Set()) {
  if (seen.has(file)) return false;
  seen.add(file);
  const src = readFileSync(file, 'utf8');
  if (/\bon(Press|Action|KeyDown|RowAction)\b|<button\b/.test(src)) return true;
  for (const [, spec, from] of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
    if (/^react-aria-components/.test(from) && names(spec).some(n => INTERACTIVE_ARIA.test(n))) return true;
    if (!from.startsWith('.')) continue;
    const local = ['.tsx', '/index.tsx'].map(ext => join(dirname(file), from + ext)).find(p => existsSync(p));
    if (local && interactiveFile(local, seen)) return true;
  }
  return false;
}

/** Whether the part takes presses or keys, so its page owes an APG pattern and a keyboard table. */
function isInteractive(part) {
  return Boolean(part.source) && !NOT_INTERACTIVE.has(part.name) && interactiveFile(part.source);
}

/** The description docs/COMPONENTS.md gives a part (its doc comment's first sentence), or ''. */
function purposes() {
  const out = new Map();
  let group = '';
  for (const line of readFileSync('docs/COMPONENTS.md', 'utf8').split('\n')) {
    if (line.startsWith('## ')) group = line.slice(3);
    const m = line.match(/^- \*\*([^*]+)\*\*(?: `\w+`)?(?: \([^)]*\))?(?:: (.*?))?(?: Stories: .*)?$/);
    if (m) out.set(`${group} / ${m[1]}`, m[2] ?? '');
  }
  return out;
}

/** Whether a story (by its export name) has a play function: `play:` in its object, or `Name.play = …`. */
function hasPlay(stories, name) {
  const block = new RegExp(`export const ${name}\\b[\\s\\S]*?(?=\\nexport |$)`).exec(stories)?.[0] ?? '';
  return /(?:^|[\s{,])play\s*:/.test(block) || new RegExp(`\\b${name}\\.play\\s*=`).test(stories);
}

const all = parts();
const partNames = new Set(all.map(p => p.name.toLowerCase()));
const written = all.filter(p => existsSync(p.guide));

/** Every problem in one part's guide, as strings ("<name>: …"). */
function problems(part) {
  const out = [];
  const say = msg => out.push(`${part.title}: ${msg}`);
  const {sections, order} = parseGuide(readFileSync(part.guide, 'utf8'));
  const expected = SECTIONS.filter(s => WRITTEN.includes(s) || (OPTIONAL.includes(s) && order.includes(s)));
  if (order.join(' · ') !== expected.join(' · ')) say(`sections must be, in this order: ${expected.join(' · ')} (found ${order.join(' · ')})`);
  for (const s of WRITTEN) if (!sections[s]) say(`"${s}" is empty`);
  if (!purposes().get(`${part.group} / ${part.name}`)) say('no Purpose: give the component a doc comment, then npm run components:index');

  const instead = bullets(sections['When not to use'] ?? '');
  if (!instead.length) say('"When not to use" has no bullets');
  for (const b of instead) if (!boldNames(b).length) say(`"When not to use" names no part in bold: "${b}"`);
  for (const section of ['When not to use', 'Related']) {
    for (const n of boldNames(sections[section] ?? '')) if (!partNames.has(n.toLowerCase())) say(`"${section}" names "${n}", which is not a part`);
  }
  if (!boldNames(sections.Related ?? '').length) say('"Related" names no part in bold');

  const behaviour = sections.Behaviour ?? '';
  const rows = keyboardRows(behaviour);
  if (isInteractive(part)) {
    // A plain text input (Text field, Search field) has no APG pattern; its page says so in those words instead.
    if (!APG.test(behaviour) && !/^No WAI-ARIA APG pattern covers\b/m.test(behaviour)) {
      say('interactive: "Behaviour" must link its WAI-ARIA APG pattern (https://www.w3.org/WAI/ARIA/apg/patterns/…), or start "No WAI-ARIA APG pattern covers" for a plain text input');
    }
    if (!rows.length) say('interactive: "Behaviour" needs a keyboard table (| Key | What it does | Tested by |)');
  } else if (!rows.length && !/^Not interactive\b/.test(behaviour)) {
    say('"Behaviour" is a keyboard table, or starts "Not interactive"');
  }
  for (const [key, does, proof] of rows) {
    if (!key || !does || !proof) { say(`keyboard row "${key}" needs three cells: key, what it does, what checks it`); continue; }
    const spec = proof.match(/`(e2e\/[\w.-]+\.spec\.ts)`/)?.[1];
    const play = proof.match(/`play: (\w+)`/)?.[1];
    if (spec && !existsSync(spec)) say(`keyboard row "${key}" cites ${spec}, which doesn't exist`);
    if (play && !hasPlay(part.stories, play)) {
      say(`keyboard row "${key}" cites the play function of story ${play}, which has none`);
    }
    if (!spec && !play) say(`keyboard row "${key}": "Tested by" names \`e2e/<spec>.spec.ts\` or \`play: <Story>\``);
  }
  return out;
}

describe('component pages', () => {
  it('finds the parts', () => {
    expect(all.length).toBeGreaterThan(90);
  });

  it('every written guide is complete', () => {
    expect(written.flatMap(problems)).toEqual([]);
  });

  it('every part is written, or was waiting on 30 Oct 2026', () => {
    const missing = all.filter(p => !existsSync(p.guide)).map(p => p.title);
    expect(missing, 'write its <Name>.guide.md (docs/HOW-TO.md, "Write a component page")').toEqual([]);
  });

  it('every guide sits beside a part\'s stories', () => {
    const guides = readdirSync('src', {recursive: true}).filter(f => f.endsWith('.guide.md')).map(f => join('src', f));
    expect(guides.filter(g => !all.some(p => p.guide === g))).toEqual([]);
  });
});


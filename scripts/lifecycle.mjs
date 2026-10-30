// Each part's lifecycle stage (Overview/Lifecycle, docs/DECISIONS.md "Lifecycle: the rule"), from repo facts, written as
// one `status:<stage>` tag in its stories file's meta `tags`. `npm run lifecycle` writes the tags; `-- --check` lists
// the files whose tag is missing or differs from the rule, and fails. tests/lifecycle.test.mjs runs the check.
//
// The rule, in order:
//   stable    = a developer has reviewed its API: listed in REVIEWED below, with the review's date. None yet.
//   candidate = its shape is settled outside this repo's stories: Figma draws it (no `not-in-figma` tag) or two or more
//               back-office files import it; and its behaviour is proven: it is not interactive (its guide's Behaviour
//               starts "Not interactive"), or a test of its own presses it (a play function in its stories, or an e2e
//               spec that opens one of its stories by id). Its guide is complete (tests/component-pages.test.mjs).
//   draft     = everything else.
// A part is one Components/ or Patterns/ stories file (not Patterns/Recipes/), as in tests/component-pages.test.mjs.
// Base is not a part: primitives with a one-line page, no stage.
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {parseGuide, titleToId} from './lib/guide.mjs';

/** Parts a developer has reviewed, by title, with when: they are stable. The Lifecycle page's "Who moves a part". */
export const REVIEWED = new Map([]);

const META = /const meta[^=]*=\s*\{([\s\S]*?)\n\};/;

function walk(dir, ext) {
  return readdirSync(dir, {recursive: true}).filter(f => f.endsWith(ext)).sort().map(f => join(dir, f));
}

/** The names a part's code exports (its meta component's file), or its title in PascalCase when it has none. */
function exportsOf(file, stories, meta, name) {
  const component = meta.match(/component:\s*([A-Z]\w*)/)?.[1];
  const from = component && stories.match(new RegExp(`import\\s*\\{[^}]*\\b${component}\\b[^}]*\\}\\s*from\\s*'(\\.[^']+)'`))?.[1];
  const source = from && ['.tsx', '/index.tsx'].map(ext => join(dirname(file), from + ext)).find(p => existsSync(p));
  const names = new Set(component ? [component] : [name.replace(/(^|\s)(\w)/g, (_, __, c) => c.toUpperCase()).replace(/\W/g, '')]);
  if (source) {
    for (const [, n] of readFileSync(source, 'utf8').matchAll(/^export (?:function|const) ([A-Za-z]\w*)/gm)) names.add(n);
  }
  return names;
}

/** Back-office file → the names it imports from 'govocal-ds'. */
function backofficeImports() {
  const out = new Map();
  for (const f of walk('backoffice/src', '.tsx')) {
    const names = new Set();
    for (const [, spec] of readFileSync(f, 'utf8').matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'govocal-ds'/g)) {
      for (const n of spec.split(',')) names.add(n.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]);
    }
    out.set(f, names);
  }
  return out;
}

/** Every part with the facts the rule reads and the stage it gives. */
export function parts() {
  const imports = backofficeImports();
  const specs = walk('e2e', '.spec.ts').map(f => readFileSync(f, 'utf8')).join('\n');
  const out = [];
  for (const file of walk('src', '.stories.tsx')) {
    const stories = readFileSync(file, 'utf8');
    const meta = stories.match(META)?.[1] ?? '';
    const title = meta.match(/title:\s*'([^']+)'/)?.[1];
    if (!title || !/^(Components|Patterns)\//.test(title) || title.startsWith('Patterns/Recipes/')) continue;
    const name = title.split('/').at(-1);
    const tags = [...(meta.match(/^ {2}tags:\s*\[([^\]]*)\]/m)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]);
    const guide = file.replace(/\.stories\.tsx$/, '.guide.md');
    const behaviour = existsSync(guide) ? parseGuide(readFileSync(guide, 'utf8')).sections.Behaviour ?? '' : '';
    const names = exportsOf(file, stories, meta, name);
    const usedIn = [...imports].filter(([, n]) => [...names].some(x => n.has(x))).map(([f]) => f);
    const id = titleToId(title);
    const inFigma = !tags.includes('not-in-figma');
    const interactive = !/^Not interactive\b/.test(behaviour);
    const ownTest = /(?:^|[\s{,])play\s*:|\.play\s*=/m.test(stories) || specs.includes(`${id}--`);
    const settled = inFigma || usedIn.length >= 2;
    const proven = !interactive || ownTest;
    const stage = REVIEWED.has(title) ? 'stable' : existsSync(guide) && settled && proven ? 'candidate' : 'draft';
    out.push({file, title, tags, reviewed: REVIEWED.has(title), inFigma, usedIn: usedIn.length, interactive, ownTest, stage,
      status: tags.filter(t => t.startsWith('status:'))});
  }
  return out;
}

/** The meta's tags line with exactly this one status tag. */
function retag(stories, stage) {
  return stories.replace(META, block => block.replace(/^( {2}tags:\s*\[)([^\]]*)(\])/m, (_, open, list, close) => {
    const kept = [...list.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(t => !t.startsWith('status:'));
    return `${open}${[...kept, `status:${stage}`].map(t => `'${t}'`).join(', ')}${close}`;
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes('--check');
  const all = parts();
  const wrong = all.filter(p => p.status.length !== 1 || p.status[0] !== `status:${p.stage}`);
  if (check) {
    for (const p of wrong) console.log(`${p.file}: has ${p.status.join(', ') || 'no status tag'}, the rule says status:${p.stage}`);
    if (wrong.length) { console.log('Run npm run lifecycle.'); process.exit(1); }
  } else {
    for (const p of wrong) writeFileSync(p.file, retag(readFileSync(p.file, 'utf8'), p.stage));
  }
  const count = s => all.filter(p => p.stage === s).length;
  console.log(`${all.length} parts: ${count('draft')} draft, ${count('candidate')} candidate, ${count('stable')} stable` +
    (check ? '' : `; ${wrong.length} files retagged`));
}

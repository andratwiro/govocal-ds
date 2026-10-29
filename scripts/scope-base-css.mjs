#!/usr/bin/env node
// npm run css:scope: Base's stylesheets stop painting React Aria's global class names (the review's H3).
//
// React Aria gives every element it renders without a className a global class, `react-aria-X`. The starter's
// stylesheets (src/components/*.css) selected those names, so importing any one part repainted every unclassed React
// Aria element of the page that imported it: a host app's own Buttons, Inputs, Popovers. This script gives each element
// the system renders its own class beside React Aria's, `gv-base-<x>` (`react-aria-TextField` → `gv-base-text-field`),
// and points Base's stylesheets at it. `react-aria-X` stays on every element, so tests and the parts' own stylesheets
// that select it keep matching.
//
//   TSX (src/components/**, src/patterns/**, src/stories/**, src/overview/**; stories included): on each element that
//   carries a `react-aria-X` the starter's CSS styles:
//     - `className={keepClass(c, …)}` (React Aria's own class kept at runtime) → `keepClass(c, 'gv-base-x', …)`;
//     - a string that names the class (`"react-aria-Input inset"`, `clsx('react-aria-Label', …)`) → `react-aria-X
//       gv-base-x` inside that string;
//     - a React Aria element with no className → `className="react-aria-X gv-base-x"`, when its spread props (if any)
//       are the rest of a destructuring that took `className` out. A spread of an object written in the file with a
//       className of its own needs nothing (React Aria adds no class then).
//   CSS (src/components/*.css, Base's own): `.react-aria-X` → `.gv-base-x` for every X the system now tags wherever it
//   renders it. A top-level selector left naming only React Aria's class (an element React Aria renders by itself: a
//   drop indicator, a loading row) is scoped by its part: `:where(.gv-base-tree) .react-aria-TreeLoader` (`:where`
//   adds no specificity), or, for a part's parent, `.react-aria-ModalOverlay:where(:has(> .gv-base-modal))`.
//
// Re-runnable and idempotent: run it after a merge, on a newer main, before a commit; a second run changes nothing.
// What it can't decide (any other spread, a selector with no part to scope it by) it prints and leaves alone, and a
// name with such an element is not renamed in CSS. `--check` writes nothing and exits 1 if anything would change;
// tests/css-scope.test.mjs runs it and fails on a printed note too.
import ts from 'typescript';
import {readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {join, basename} from 'node:path';

const check = process.argv.includes('--check');
const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const TSX = ['src/components', 'src/patterns', 'src/stories', 'src/overview'].flatMap(walk).filter(f => f.endsWith('.tsx')).sort();
const BASE_CSS = readdirSync('src/components').filter(f => f.endsWith('.css')).map(f => `src/components/${f}`).sort();

const kebab = name => name.replace(/^UNSTABLE_/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const own = name => `gv-base-${kebab(name)}`;
const TOKEN = /(?<![\w-])react-aria-([A-Za-z]+)(?![\w-])/g;
const stripComments = css => css.replace(/\/\*[\s\S]*?\*\//g, '');

// The React Aria names Base's stylesheets style (by React Aria's class, or by ours after an earlier run): only
// elements carrying one of these need a class of their own.
const pascal = k => k.replace(/(^|-)([a-z0-9])/g, (m, d, c) => c.toUpperCase());
const STYLED = new Set();
for (const f of BASE_CSS) {
  const css = stripComments(readFileSync(f, 'utf8'));
  for (const [, x] of css.matchAll(/\.react-aria-([A-Za-z]+)(?![\w-])/g)) STYLED.add(x);
  for (const [, k] of css.matchAll(/\.gv-base-([a-z0-9-]+)(?![\w-])/g)) STYLED.add(pascal(k));
}

// ── TSX ──
const notes = [];
const tagged = new Set(); // names that carry gv-base-x wherever the system renders them
const untaggable = new Set(); // names with an element this script can't reach
const sources = new Map(); // file → new text
for (const file of TSX) {
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const rac = new Map(); // local name → React Aria export
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !/^react-aria-components(\/|$)/.test(st.moduleSpecifier.text)) continue;
    const nb = st.importClause?.namedBindings;
    if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) rac.set(el.name.text, (el.propertyName ?? el.name).text);
  }
  const edits = []; // {at, del, ins}
  const literalEdits = node => { // every string literal under node: react-aria-X → react-aria-X gv-base-x
    const visit = n => {
      if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
        const raw = n.getText(sf);
        const next = raw.replace(TOKEN, (m, x, i) => {
          if (!STYLED.has(x)) return m;
          tagged.add(x);
          return raw.slice(i + m.length).startsWith(` ${own(x)}`) ? m : `${m} ${own(x)}`;
        });
        if (next !== raw) edits.push({at: n.getStart(sf), del: raw.length, ins: next});
      }
      ts.forEachChild(n, visit);
    };
    visit(node);
  };
  // What a spread `{...e}` brings to an element's className: 'has' (an object written here with a className), 'none'
  // (the rest of a destructuring that took className out), or 'unknown'.
  const spreadClass = e => {
    if (!ts.isIdentifier(e)) return 'unknown';
    const found = [];
    const look = n => {
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === e.text) found.push(n);
      if (ts.isBindingElement(n) && n.dotDotDotToken && ts.isIdentifier(n.name) && n.name.text === e.text) found.push(n);
      ts.forEachChild(n, look);
    };
    look(sf);
    if (found.length !== 1) return 'unknown';
    const [d] = found;
    if (ts.isVariableDeclaration(d)) {
      const init = d.initializer;
      const named = init && ts.isObjectLiteralExpression(init) && init.properties.some(p =>
        ts.isPropertyAssignment(p) && p.name.getText(sf) === 'className' && (ts.isStringLiteral(p.initializer) ||
          (ts.isCallExpression(p.initializer) && /^(clsx|keepClass|ownClass)$/.test(p.initializer.expression.getText(sf)))));
      return named ? 'has' : 'unknown';
    }
    return d.parent.elements.some(b => !b.dotDotDotToken && (b.propertyName ?? b.name).getText(sf) === 'className') ? 'none' : 'unknown';
  };
  const visit = n => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const props = n.attributes.properties;
      const cls = props.find(p => ts.isJsxAttribute(p) && p.name.getText(sf) === 'className');
      const tag = n.tagName.getText(sf);
      const x = rac.get(tag)?.replace(/^UNSTABLE_/, '');
      if (cls) {
        const init = cls.initializer;
        const expr = init && ts.isJsxExpression(init) ? init.expression : init;
        if (expr) literalEdits(expr);
        // keepClass(c, …) on a React Aria element: React Aria's own class comes at runtime, so name ours as an extra.
        if (x && STYLED.has(x) && expr && ts.isCallExpression(expr) && expr.expression.getText(sf) === 'keepClass') {
          tagged.add(x);
          const has = expr.arguments.some(a => ts.isStringLiteral(a) && a.text === own(x));
          if (!has) {
            const first = expr.arguments[0];
            if (first) edits.push({at: first.getEnd(), del: 0, ins: `, '${own(x)}'`});
            else edits.push({at: expr.arguments.pos, del: 0, ins: `undefined, '${own(x)}'`});
          }
        }
      } else if (x && STYLED.has(x)) {
        const spreads = props.filter(p => ts.isJsxSpreadAttribute(p)).map(p => spreadClass(p.expression));
        if (spreads.includes('has')) {
          // The spread carries a className of its own: React Aria adds no class of its own, nothing to tag.
        } else if (spreads.every(k => k === 'none')) {
          tagged.add(x);
          edits.push({at: n.tagName.getEnd(), del: 0, ins: ` className="react-aria-${x} ${own(x)}"`});
        } else {
          untaggable.add(x);
          notes.push(`${file}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}: <${tag} {...}> may carry React Aria's ` +
            `default class; give it keepClass(…, '${own(x)}') by hand (.react-aria-${x} stays global until then)`);
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  let next = text;
  for (const e of edits.sort((a, b) => b.at - a.at)) next = next.slice(0, e.at) + e.ins + next.slice(e.at + e.del);
  if (next !== text) sources.set(file, next);
}
for (const x of untaggable) tagged.delete(x);

// ── CSS ──
// An element React Aria renders by itself (a calendar's weekday headers, a drop indicator, a loading row, a modal's
// overlay) carries only React Aria's class. A selector left naming only such a class at the top level is scoped by its
// part's own class: under the part (`:where(.gv-base-tree) .react-aria-TreeLoader`; `:where` adds no specificity), or,
// for a part's parent, by what it holds (`.react-aria-ModalOverlay:where(:has(> .gv-base-modal))`). A name not listed
// here goes under its stylesheet's part, when that part is tagged; otherwise it is left global and printed.
const under = root => (p, lead) => `${lead}:where(.${root}) ${p.slice(lead.length)}`;
const holding = (x, child) => p => p.replace(new RegExp(`\\.react-aria-${x}(?![\\w-])`), `$&:where(:has(> .${child}))`);
const SCOPE = {
  ModalOverlay: holding('ModalOverlay', 'gv-base-modal'), // the modal's parent
  ResizableTableContainer: holding('ResizableTableContainer', 'gv-base-table'), // the table's parent
  CalendarHeaderCell: under('gv-base-calendar-grid') // both calendars' grid (Calendar.css styles RangeCalendar's too)
};

function splitTop(prelude) { // a selector list → its parts, commas kept with the part before them
  const parts = [];
  let depth = 0, start = 0;
  for (let i = 0; i < prelude.length; i++) {
    const c = prelude[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) { parts.push(prelude.slice(start, i + 1)); start = i + 1; }
  }
  parts.push(prelude.slice(start));
  return parts;
}

function scopeCss(file, css) {
  let out = '', pending = '';
  const stack = [{scoped: false}];
  const part = basename(file, '.css');
  const rename = s => s.replace(/\.react-aria-([A-Za-z]+)(?![\w-])/g, (m, x) => tagged.has(x) ? `.${own(x)}` : m);
  const prelude = text => {
    const lead = text.match(/^\s*/)[0];
    const body = text.slice(lead.length);
    const parent = stack.at(-1).scoped;
    if (body.startsWith('@')) { stack.push({scoped: parent}); return text; }
    let all = true;
    const parts = splitTop(body).map(sel => {
      const p = rename(sel);
      if (parent || /\.gv-/.test(p)) return p;
      if (!/\.react-aria-/.test(p)) { all = false; return p; } // a utility (`.button-base`) or a state: not Base's to scope
      const x = p.match(/\.react-aria-([A-Za-z]+)/)[1];
      const lead2 = p.match(/^\s*/)[0];
      if (stack.length === 1 && SCOPE[x]) return SCOPE[x](p, lead2);
      if (stack.length === 1 && tagged.has(part)) return under(own(part))(p, lead2);
      notes.push(`${file}: \`${p.trim()}\` stays global (React Aria's ${x}: no part of its own to scope it by)`);
      return p; // left as it was, and its nested rules with it
    });
    stack.push({scoped: parent || all});
    return lead + parts.join('');
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { // a comment: copied as is
      const end = css.indexOf('*/', i + 2);
      const stop = end < 0 ? css.length : end + 2;
      out += pending + css.slice(i, stop);
      pending = '';
      i = stop - 1;
    } else if (c === '"' || c === "'") { // a string: kept whole
      let j = i + 1;
      while (j < css.length && css[j] !== c) j += css[j] === '\\' ? 2 : 1;
      pending += css.slice(i, j + 1);
      i = j;
    } else if (c === '{') { out += prelude(pending) + c; pending = ''; }
    else if (c === '}') { out += pending + c; pending = ''; stack.pop(); }
    else if (c === ';') { out += pending + c; pending = ''; }
    else pending += c;
  }
  return out + pending;
}

const cssOut = new Map();
for (const f of BASE_CSS) {
  const text = readFileSync(f, 'utf8');
  const next = scopeCss(f, text);
  if (next !== text) cssOut.set(f, next);
}

const changed = [...sources.keys(), ...cssOut.keys()];
for (const n of notes) console.warn(`note: ${n}`);
if (check) {
  if (changed.length) { console.error(`css:scope would change ${changed.length} files:\n  ${changed.join('\n  ')}`); process.exit(1); }
  console.log(`css:scope: nothing to change (${tagged.size} React Aria names scoped)`);
} else {
  for (const [f, t] of [...sources, ...cssOut]) writeFileSync(f, t);
  console.log(`css:scope: ${changed.length} files changed, ${tagged.size} React Aria names scoped`);
}

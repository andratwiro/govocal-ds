#!/usr/bin/env node
// Moves a consumer's imports of the system onto its public entry points: 'govocal-ds', 'govocal-ds/base' and
// 'govocal-ds/tokens.css'. Re-runnable: a second run changes nothing.
//
//   npm run api:imports                                 # the back office (backoffice/src)
//   node scripts/use-public-api.mjs <dir|file>... [--check]
//
// For each relative import that reaches into src/ (a deep path such as '../../src/components/gv/Modal'):
// - every name is followed to the part it really is (through re-exports such as Menu's Text) and imported from the
//   entry point that exports that part, under the same local name (`Tag as TagItem` stays `Tag as TagItem`);
// - the file ends with one import per entry point, names sorted, `type` kept on type-only names;
// - names already imported from 'govocal-ds' or 'govocal-ds/base' are merged in and moved to the entry that now
//   exports them;
// - '…/src/tokens.css' becomes 'govocal-ds/tokens.css'; '…/src/components/theme.css' goes (every component's CSS
//   imports it already);
// - a name no entry point exports (story fixtures, internals) stays where it is and is listed as a warning.
// --check writes nothing and exits 1 when a file would change (for CI).
import ts from 'typescript';
import {readFileSync, writeFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative, resolve, dirname} from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const SRC = join(ROOT, 'src');
// The entry points that carry parts (CSS entries handled apart), in the order a file imports them.
const ENTRIES = Object.entries(pkg.exports)
  .filter(([, file]) => /\.tsx?$/.test(file))
  .map(([entry, file]) => ({spec: pkg.name + entry.slice(1), file: resolve(ROOT, file)}));
const CSS = {
  [resolve(ROOT, pkg.exports['./tokens.css'])]: `${pkg.name}/tokens.css`,
  [join(SRC, 'components/theme.css')]: null
};
const WIDTH = 120;

const args = process.argv.slice(2);
const check = args.includes('--check');
const targets = args.filter(a => a !== '--check');
if (!targets.length) {
  console.error('usage: node scripts/use-public-api.mjs <dir|file>... [--check]');
  process.exit(2);
}
const walk = p => statSync(p).isDirectory() ? readdirSync(p).flatMap(f => walk(join(p, f))) : [p];
const files = targets.flatMap(t => walk(resolve(t))).filter(f => /\.tsx?$/.test(f) && !f.endsWith('.d.ts'));

const config = ts.getParsedCommandLineOfConfigFile(join(ROOT, 'tsconfig.json'), {}, {
  ...ts.sys, onUnRecoverableConfigFileDiagnostic: d => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); }
});
const program = ts.createProgram([...files, ...ENTRIES.map(e => e.file)], config.options);
const checker = program.getTypeChecker();
const final = sym => (sym.flags & ts.SymbolFlags.Alias) ? checker.getAliasedSymbol(sym) : sym;

// The part behind each public name: its declaration's symbol → {entry, name}.
const owner = new Map();
for (const entry of ENTRIES) {
  const mod = checker.getSymbolAtLocation(program.getSourceFile(entry.file));
  for (const exp of checker.getExportsOfModule(mod)) {
    const part = final(exp);
    if (!owner.has(part)) owner.set(part, {entry: entry.spec, name: exp.name});
  }
}

const isSystemPath = (file, spec) => {
  if (!spec.startsWith('.')) return false;
  const target = resolve(dirname(file), spec);
  return target.startsWith(SRC + '/');
};
const isEntry = spec => ENTRIES.some(e => e.spec === spec);

let changed = 0;
const warnings = [];
for (const file of files) {
  const sf = program.getSourceFile(file);
  const text = sf.getFullText();
  const rel = relative(ROOT, file);
  const imports = sf.statements.filter(ts.isImportDeclaration);
  // entry spec → Map(local name → {imported, isType})
  const wanted = new Map(ENTRIES.map(e => [e.spec, new Map()]));
  const edits = []; // {start, end, text}
  let anchor = null; // where the merged imports go: the first system import's position
  for (const decl of imports) {
    const spec = decl.moduleSpecifier.text;
    const clause = decl.importClause;
    const system = isSystemPath(file, spec);
    if (!system && !isEntry(spec)) continue;
    const start = decl.getStart(sf);
    const end = lineEnd(text, decl.end);
    if (!clause) {
      // A side-effect import: CSS.
      if (!system) continue;
      const target = resolve(dirname(file), spec);
      if (target in CSS) {
        const to = CSS[target];
        edits.push({start, end, text: to ? `import '${to}';\n` : ''});
      } else warnings.push(`${rel}: '${spec}' (a side-effect import with no entry point; left as is)`);
      continue;
    }
    if (clause.name || (clause.namedBindings && !ts.isNamedImports(clause.namedBindings))) {
      warnings.push(`${rel}: '${spec}' (a default or namespace import; left as is)`);
      continue;
    }
    const kept = [];
    for (const el of clause.namedBindings?.elements ?? []) {
      const imported = (el.propertyName ?? el.name).text;
      const local = el.name.text;
      const isType = clause.isTypeOnly || el.isTypeOnly;
      const sym = checker.getSymbolAtLocation(el.name);
      const hit = sym && owner.get(final(sym));
      if (hit) wanted.get(hit.entry).set(local, {imported: hit.name, isType});
      else {
        kept.push(el);
        warnings.push(`${rel}: ${imported} from '${spec}' (no entry point exports it; left as is)`);
      }
    }
    if (anchor === null) anchor = start;
    if (kept.length) {
      const names = kept.map(el => el.getText(sf));
      edits.push({start, end, text: render(names, spec, clause.isTypeOnly)});
    } else edits.push({start, end, text: ''});
  }
  if (anchor !== null) {
    const merged = ENTRIES.map(e => wanted.get(e.spec)).flatMap((names, i) => {
      if (!names.size) return [];
      const list = [...names].map(([local, {imported, isType}]) => ({local, imported, isType}))
        .sort((a, b) => a.imported.localeCompare(b.imported, 'en') || a.local.localeCompare(b.local, 'en'));
      const allTypes = list.every(n => n.isType);
      const parts = list.map(n => `${n.isType && !allTypes ? 'type ' : ''}${n.imported}${n.local !== n.imported ? ` as ${n.local}` : ''}`);
      return [render(parts, ENTRIES[i].spec, allTypes)];
    }).join('');
    edits.push({start: anchor, end: anchor, text: merged, first: true});
  }
  if (!edits.length) continue;
  // Apply from the end; an insertion at the anchor goes before the removal that starts there.
  edits.sort((a, b) => b.start - a.start || (a.first ? 1 : 0) - (b.first ? 1 : 0));
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  if (out !== text) {
    changed++;
    if (check) console.log(`would change ${rel}`);
    else { writeFileSync(file, out); console.log(`rewrote ${rel}`); }
  }
}
for (const w of [...new Set(warnings)]) console.warn(`warning: ${w}`);
console.log(`${changed} file${changed === 1 ? '' : 's'} ${check ? 'would change' : 'changed'}, ${files.length} read.`);
if (check && changed) process.exit(1);

/** The import line(s) for these specifiers, wrapped at WIDTH like the back office's own imports. */
function render(names, spec, typeOnly) {
  const head = `import ${typeOnly ? 'type ' : ''}{`;
  const tail = `} from '${spec}';`;
  const one = head + names.join(', ') + tail;
  if (one.length <= WIDTH) return one + '\n';
  const lines = [];
  let line = head;
  names.forEach((n, i) => {
    const last = i === names.length - 1;
    const piece = n + (last ? tail : ',');
    const fresh = line === head || line === '  ';
    if (!fresh && line.length + 1 + piece.length > WIDTH) { lines.push(line); line = '  '; }
    line += (line === head || line === '  ' ? '' : ' ') + piece;
  });
  lines.push(line);
  return lines.join('\n') + '\n';
}

/** The end of the line a statement ends on, newline included, so a removed import leaves no blank line. */
function lineEnd(text, pos) {
  const nl = text.indexOf('\n', pos);
  return nl === -1 ? text.length : nl + 1;
}

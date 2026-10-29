// The public API report: every name `govocal-ds` and `govocal-ds/base` export, with each component's props, read
// from TypeScript. Written to docs/API-REPORT.md, so every change to the API shows up as a diff developers review
// (React Spectrum's api-diff practice). `npm run api:report` writes it; `--check` exits 1 when it is stale, which
// tests/api-report.test.mjs runs.
//
// A component's own props (declared in this repo) are listed with their types; props passed straight through from a
// library (React Aria, React, the DOM) are listed by name only, under the library they come from, so a pass-through
// is flagged and its count still moves when React Aria adds one.
import ts from 'typescript';
import {readFileSync, writeFileSync} from 'node:fs';
import {relative, resolve} from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'docs/API-REPORT.md');
const ENTRIES = [['govocal-ds', 'src/index.ts'], ['govocal-ds/base', 'src/base.ts']];

// TypeScript prints an inferred type from another file as `import("/abs/path/…")`; the checkout's own path never goes
// in the report, or it would differ in every clone: `import("react")`, `import("src/index")`.
const unroot = s => s.replace(/import\("([^"]+)"\)/g, (_, p) => `import("${p.includes('node_modules/')
  ? p.replace(/^.*node_modules\/(@types\/)?/, '').replace(/\/index$/, '') : relative(ROOT, p)}")`);
const one = s => unroot(s.replace(/\s+/g, ' ').replace(/\(\s/g, '(').replace(/\s\)/g, ')').trim());

/** Where a declaration lives: `src/…` for ours, the package name for a library's. */
function origin(decl) {
  const file = decl.getSourceFile().fileName;
  const m = file.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (m) return m[1].replace(/^@types\//, '');
  if (/typescript\/lib\/lib\./.test(file)) return 'the DOM';
  return relative(ROOT, file);
}

export function report() {
  const config = ts.getParsedCommandLineOfConfigFile(resolve(ROOT, 'tsconfig.json'), {}, {
    ...ts.sys, onUnRecoverableConfigFileDiagnostic: d => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); }
  });
  const program = ts.createProgram(ENTRIES.map(([, f]) => resolve(ROOT, f)), config.options);
  const checker = program.getTypeChecker();

  const typeText = (type, node) => one(checker.typeToString(type, node,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope));
  const described = sym => sym.getDocumentationComment(checker).length > 0 ||
    sym.getJsDocTags(checker).some(t => t.name === 'default');

  /** The props of an object type: ours with their types, a library's by name, grouped by library. */
  function props(type, node) {
    const own = [];
    const passed = new Map();
    for (const p of checker.getPropertiesOfType(type)) {
      const decl = p.valueDeclaration ?? p.declarations?.[0];
      if (!decl) continue;
      const from = origin(decl);
      if (!from.startsWith('src/')) {
        // React's and the DOM's attributes (hundreds) go by the interface that declares them; a library's by name.
        const bulk = from === 'react' || from === 'the DOM';
        const parent = decl.parent && (ts.isInterfaceDeclaration(decl.parent) || ts.isTypeAliasDeclaration(decl.parent))
          ? decl.parent.name.text : decl.parent?.parent && ts.isTypeAliasDeclaration(decl.parent.parent)
            ? decl.parent.parent.name.text : 'attributes';
        const key = bulk ? `${from}'s ${parent}` : from;
        if (!passed.has(key)) passed.set(key, {bulk, names: new Set()});
        passed.get(key).names.add(p.name);
        continue;
      }
      const optional = p.flags & ts.SymbolFlags.Optional ? '?' : '';
      const text = decl.type ? one(decl.type.getText()) : typeText(checker.getTypeOfSymbolAtLocation(p, node), node);
      own.push(`- \`${p.name}${optional}: ${text}\`${described(p) ? '' : ' (no description)'}`);
    }
    own.sort();
    const lines = [...own];
    for (const [from, {bulk, names}] of [...passed].sort(([a], [b]) => a.localeCompare(b)))
      lines.push(bulk ? `- Passed through: ${names.size} of ${from}`
        : `- Passed through from ${from} (${names.size}): ${[...names].sort().map(n => `\`${n}\``).join(', ')}`);
    return lines;
  }

  /** A component: a PascalCase function whose first parameter is its props. */
  function componentProps(sym, decl) {
    if (!/^[A-Z]/.test(sym.name)) return null;
    const sigs = checker.getTypeOfSymbolAtLocation(sym, decl).getCallSignatures();
    if (sigs.length !== 1) return null;
    const [param] = sigs[0].getParameters();
    if (!param) return [];
    const type = checker.getTypeOfSymbolAtLocation(param, decl);
    if (!(type.flags & ts.TypeFlags.Object) && !type.isIntersection()) return null;
    const ret = typeText(sigs[0].getReturnType(), decl);
    if (!/Element|ReactNode|ReactPortal|null/.test(ret)) return null;
    return props(type, decl);
  }

  function entry(name, sym, components) {
    const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
    const decl = target.valueDeclaration ?? target.declarations?.[0];
    const from = decl ? origin(decl) : '?';
    const head = kind => `### \`${name}\`\n\n${kind}, from \`${from}\`.`;
    if (target.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable)) {
      const type = checker.getTypeOfSymbolAtLocation(target, decl);
      const comp = componentProps(target, decl);
      if (comp) return [head('Component'), ...(comp.length ? ['', ...comp] : ['', 'No props.'])].join('\n');
      if (target.flags & ts.SymbolFlags.Function)
        return [head('Function'), '', '```ts', ...type.getCallSignatures().map(s => one(checker.signatureToString(s,
          decl, ts.TypeFormatFlags.NoTruncation))), '```'].join('\n');
      return [head('Value'), '', '```ts', typeText(type, decl), '```'].join('\n');
    }
    if (target.flags & ts.SymbolFlags.Interface) {
      const part = name.replace(/Props$/, '');
      if (part !== name && components.has(part)) return `${head('Interface')} The props of \`${part}\`, listed there.`;
      const type = checker.getDeclaredTypeOfSymbol(target);
      const list = props(type, decl);
      return [head('Interface'), ...(list.length ? ['', ...list] : [])].join('\n');
    }
    if (target.flags & ts.SymbolFlags.TypeAlias) {
      const text = ts.isTypeAliasDeclaration(decl) ? one(decl.type.getText()) : typeText(checker.getDeclaredTypeOfSymbol(target), decl);
      const params = decl.typeParameters ? `<${decl.typeParameters.map(p => p.getText()).join(', ')}>` : '';
      return [head('Type'), '', '```ts', `type ${name}${params} = ${text}`, '```'].join('\n');
    }
    if (target.flags & ts.SymbolFlags.Class) return head('Class');
    return head('Export');
  }

  const out = [
    '# Public API report',
    '',
    'Generated by `npm run api:report` from TypeScript; never edit it by hand. Every name the two entry points export,',
    'with each component\'s props: its own with their types, the ones passed straight through from a library by name',
    '(React Aria\'s behaviour props, React\'s, the DOM\'s). An API change shows up here as a diff to review;',
    '`tests/api-report.test.mjs` fails while this file is stale. The convention it follows: `docs/API.md`.',
  ];
  for (const [entryName, file] of ENTRIES) {
    const source = program.getSourceFile(resolve(ROOT, file));
    const mod = checker.getSymbolAtLocation(source);
    const exports = checker.getExportsOfModule(mod).sort((a, b) => a.name.localeCompare(b.name));
    out.push('', `## \`${entryName}\` (${exports.length} names)`);
    const components = new Set(exports.filter(sym => {
      const t = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
      const d = t.valueDeclaration;
      return d && t.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable) && componentProps(t, d);
    }).map(sym => sym.name));
    for (const sym of exports) out.push('', entry(sym.name, sym, components));
  }
  // TypeScript writes inferred types with absolute paths (import("/home/…/node_modules/…")): make them relative, so
  // the report reads the same in any checkout.
  return (out.join('\n') + '\n').replaceAll(`import("${ROOT}/`, 'import("./');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const text = report();
  if (process.argv.includes('--check')) {
    const current = (() => { try { return readFileSync(OUT, 'utf8'); } catch { return ''; } })();
    if (current !== text) {
      console.error('docs/API-REPORT.md is stale: run `npm run api:report` and review the diff.');
      process.exit(1);
    }
    console.log('docs/API-REPORT.md is current.');
  } else {
    writeFileSync(OUT, text);
    console.log(`docs/API-REPORT.md: ${text.split('\n').length} lines`);
  }
}

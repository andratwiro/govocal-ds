import {describe, it, expect} from 'vitest';
import ts from 'typescript';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

/*
 * Words (docs/API.md rule 11). The system never translates: every word a part says comes from the page, as a content
 * prop (`title`, `label`, `aria-label`, `placeholder`, `children`…) or through `labels` over the part's English
 * defaults, which live in one exported object per part, `const xLabels: XLabels = {…}`. Numbers and dates follow the
 * React Aria locale (AppProvider's `locale`), never a fixed one.
 *
 * This guard reads every part's source (src/components, src/patterns; not stories or story data) and fails on:
 *   - a fixed locale: a literal like 'en-GB', any toLocaleString / toLocaleDateString / toLocaleTimeString call
 *     (they follow the browser, not React Aria), or an Intl formatter built with a literal locale;
 *   - a JSX text node (words or symbols) between tags;
 *   - a literal string with letters in a word attribute or property (aria-label, title, placeholder, alt, label,
 *     description, textValue, tooltip, `…Label`, `labels={{…}}`, …), in a JSX child expression, or in an arrow
 *     function a word attribute takes (`selectionLabel={n => `${n} selected`}`), through `? :`, `??`, `||`, `&&`,
 *     `+`, parentheses and template literals;
 *   - a literal default of a destructured prop that reads as words: under a word-like name (`placeholder = 'Add'`),
 *     or with a space or a capital (`unit = 'Votes cast'`).
 * Anything inside a `…Labels` declaration is exempt: that is where the English defaults belong.
 *
 * Blind spots (what it can't see; a reviewer still reads for them):
 *   - words kept in a variable or a word table under a name it doesn't know (`const WORD = {done: 'Done'}`,
 *     `{one: 'like', many: 'likes'}`) and passed on later;
 *   - a lowercase one-word default under a neutral name (`unit = 'votes'`);
 *   - words a function returns or builds (`return 'Draft'`, `names.join(' and ')`, `.toLowerCase()` on a label);
 *   - words handed to a call (`toast('Saved')`, `format('Page')`) rather than a word property;
 *   - word order and plural rules inside a part's English defaults (a host overrides the whole phrase).
 *
 * ALLOWED holds what is still there on purpose: symbols drawn as text (–, /, ·, …) and the starters the structure
 * work deletes. It only shrinks: an entry that no longer matches fails (remove it), and MAX_ALLOWED never goes up.
 */

const ALLOWED = [
  // Symbols between values: punctuation, not words.
  {file: 'src/components/DateRangePicker.tsx', text: '–'},
  {file: 'src/components/Tabs.tsx', text: '('},
  {file: 'src/components/Tabs.tsx', text: ')'},
  {file: 'src/components/Tabs.tsx', text: ','},
  {file: 'src/components/TextField.tsx', text: '/'},
  {file: 'src/components/gv/BarRow.tsx', text: ','},
  {file: 'src/components/gv/Breadcrumbs.tsx', text: '/'},
  {file: 'src/components/gv/DateRangeField.tsx', text: '–'},
  {file: 'src/components/gv/DashboardCard.tsx', text: '#'},
  {file: 'src/components/gv/DataTable.tsx', text: '+'},
  {file: 'src/components/gv/Pagination.tsx', text: '…'},
  {file: 'src/components/gv/PropertyList.tsx', text: '–'},
  {file: 'src/components/gv/SidePanel.tsx', text: '·'},
  {file: 'src/components/gv/StatTile.tsx', text: ','},
  {file: 'src/patterns/CommonGroundRow.tsx', text: '–'},
  // Starters nothing imports, deleted by the structure work (an entry whose file is gone is skipped).
  {file: 'src/components/ColorPicker.tsx', text: 'Hex'},
  {file: 'src/components/ComboBox.tsx', text: 'No items selected'},
  {file: 'src/components/CommandPalette.tsx', text: 'Search commands'},
  {file: 'src/components/CommandPalette.tsx', text: 'Search commands'},
  {file: 'src/components/CommandPalette.tsx', text: 'No results found.'}
];
const MAX_ALLOWED = 20;

const walk = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const FILES = ['src/components', 'src/patterns'].flatMap(walk)
  .filter(f => /\.tsx?$/.test(f) && !/\.stories\.tsx$/.test(f) && !f.includes('/story-'));

const LOCALE = /^[a-z]{2,3}(-[A-Z][a-z]{3})?-[A-Z]{2}$/;
const TO_LOCALE = /^toLocale(Date|Time)?String$/;
const WORD_NAME = /^(aria-(label|description|roledescription|valuetext|placeholder)|title|placeholder|alt|label|labels|description|textValue|tooltip|summary|caption|heading|message|words?|renderEmptyState|[a-z]\w*(Label|Title|Placeholder|Text|Message))$/;
const LETTER = /\p{L}/u;
const READS_AS_WORDS = /\s|\p{Lu}/u;

/** The string pieces an expression shows, through the operators that pass a string on. */
function literals(node, out = []) {
  if (!node) return out;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) out.push(node.text);
  else if (ts.isTemplateExpression(node)) {
    out.push(node.head.text, ...node.templateSpans.map(s => s.literal.text));
    node.templateSpans.forEach(s => literals(s.expression, out));
  } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression?.(node)) literals(node.expression, out);
  else if (ts.isConditionalExpression(node)) { literals(node.whenTrue, out); literals(node.whenFalse, out); }
  else if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind;
    if (op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.PlusToken) literals(node.left, out);
    if ([ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.PlusToken].includes(op)) literals(node.right, out);
  } else if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) literals(node.body, out);
  else if (ts.isObjectLiteralExpression(node)) {
    for (const p of node.properties) if (ts.isPropertyAssignment(p)) literals(p.initializer, out);
  }
  return out;
}

const isLabelsDeclaration = node => ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && /Labels$/.test(node.name.text);
const propName = name => (ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : ts.isJsxNamespacedName?.(name) ? name.getText() : name.getText());

/** Every fixed word and fixed locale in one file: `{line, kind, text}`. */
export function findWords(file, source = readFileSync(file, 'utf8')) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const found = [];
  const add = (node, kind, text) => found.push({line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, kind, text});
  const words = (node, kind) => literals(node).filter(t => LETTER.test(t)).forEach(t => add(node, kind, t.trim()));

  const visit = node => {
    if (isLabelsDeclaration(node)) return;
    // Fixed locales.
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && LOCALE.test(node.text)) add(node, 'locale', node.text);
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && TO_LOCALE.test(node.expression.name.text)) {
      add(node, 'locale', node.expression.name.text);
    }
    if (ts.isNewExpression(node) && node.expression.getText(sf).startsWith('Intl.') && node.arguments?.[0]
      && (ts.isStringLiteral(node.arguments[0]) || ts.isArrayLiteralExpression(node.arguments[0]))) {
      add(node, 'locale', node.getText(sf));
    }
    // Words.
    if (ts.isJsxText(node) && node.text.trim()) add(node, 'text', node.text.trim().replace(/\s+/g, ' '));
    if (ts.isJsxAttribute(node) && node.initializer && WORD_NAME.test(propName(node.name))) {
      words(ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer, propName(node.name));
    }
    if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      words(node.expression, 'child');
    }
    if (ts.isPropertyAssignment(node) && WORD_NAME.test(propName(node.name)) && !ts.isObjectLiteralExpression(node.initializer)) {
      words(node.initializer, propName(node.name));
    }
    if (ts.isBindingElement(node) && node.initializer && ts.isObjectBindingPattern(node.parent)) {
      const name = propName(node.propertyName ?? node.name);
      const shown = literals(node.initializer).filter(t => LETTER.test(t));
      if (shown.some(t => WORD_NAME.test(name) || READS_AS_WORDS.test(t) || /Name$/.test(name))) shown.forEach(t => add(node, `${name} =`, t));
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}

describe('words come from the page (docs/API.md rule 11)', () => {
  const all = FILES.flatMap(file => findWords(file).map(w => ({file, ...w})));
  const allowed = ALLOWED.filter(a => existsSync(a.file));

  it('no part uses a fixed locale: numbers and dates follow the React Aria locale', () => {
    expect(all.filter(w => w.kind === 'locale').map(w => `${w.file}:${w.line} ${w.text}`)).toEqual([]);
  });

  it('no part says a word of its own outside its `…Labels` defaults', () => {
    const left = [...allowed];
    const bad = all.filter(w => w.kind !== 'locale').filter(w => {
      const i = left.findIndex(a => a.file === w.file && a.text === w.text);
      if (i < 0) return true;
      left.splice(i, 1);
      return false;
    });
    expect(bad.map(w => `${w.file}:${w.line} ${w.kind}: ${JSON.stringify(w.text)}`),
      'take the words from the page: a content prop, or `labels` over the part\'s `xLabels` (docs/API.md rule 11)').toEqual([]);
    expect(left.map(a => `${a.file}: ${JSON.stringify(a.text)}`), 'gone from the source: remove these from ALLOWED').toEqual([]);
  });

  it('the allow-list only shrinks', () => {
    expect(ALLOWED.length).toBeLessThanOrEqual(MAX_ALLOWED);
  });

  it('catches the words it is meant to', () => {
    const src = `
      export const fooLabels = {close: 'Close', count: n => \`\${n} items\`};
      function Foo({placeholder = 'Add a title', variant = 'default', unit = 'Votes cast', l}) {
        const n = (12).toLocaleString('en-GB');
        return <div aria-label="Close" title={l.title ?? 'Fallback'}>Hello{' '}{ok ? 'Yes' : l.no}<X labels={{close: 'Shut'}} count={k => \`\${k} more\`} /></div>;
      }`;
    const got = findWords('t.tsx', src).map(w => `${w.kind}: ${w.text}`);
    expect(got).toEqual([
      'placeholder =: Add a title', 'unit =: Votes cast', 'locale: toLocaleString', 'locale: en-GB', 'aria-label: Close',
      'title: Fallback', 'text: Hello', 'child: Yes', 'labels: Shut'
    ]);
  });
});

// The token codemod's rules (scripts/rename-tokens.mjs runs them over the tree). Pure functions of a source text and
// tokens/renames.json, so the same run on a newer main does the same thing, and a second run changes nothing.
import {declarations} from './cssdecl.mjs';

const NAME = /--gv-[a-z0-9-]+(?![a-z0-9-])/g;
const FOCUS_SELECTOR = /focus/i;
// A focus outline as the components wrote it: 2px solid in one of the focus colours.
const FOCUS_OUTLINE = /^(2px|var\(\s*--gv-space-2\s*\)|var\(\s*--gv-border-width-2\s*\))\s+solid\s+var\(\s*--(focus-ring-color|gv-border-selected|gv-border-focused|highlight-background|gv-action-primary|gv-action-checked)\s*\)$/;
const OFFSET = {'2px': 'var(--gv-focus-ring-offset)', 'var(--gv-space-2)': 'var(--gv-focus-ring-offset)',
  '-2px': 'var(--gv-focus-ring-offset-inset)', 'calc(-1 * var(--gv-space-2))': 'var(--gv-focus-ring-offset-inset)',
  'calc(var(--gv-space-2) * -1)': 'var(--gv-focus-ring-offset-inset)'};
const LAYER = {10: 'var(--gv-layer-sticky)', 50: 'var(--gv-layer-panel)', 100: 'var(--gv-layer-overlay)'};
const DISABLED_OPACITY = new Set(['0.45', '.45', '0.5', '.5', '0.55', '.55']);
const SCALE_PROP = /^(padding(-[a-z-]+)?|gap|row-gap|column-gap|--[\w-]*(padding|gap)[\w-]*)$/;

export function compile(map) {
  const byFrom = new Map(map.renames.map(r => [r.from, r]));
  return {byFrom, starter: map.starter ?? {}};
}

/** Retired names: every `from` the codemod rewrites everywhere (a `when` rename keeps its old name elsewhere). */
export const retired = map => map.renames.filter(r => !r.when).map(r => r.from);

/**
 * What a colour on this property paints: surface (fills), border (borders, outlines, rings), text (color), icon
 * (color on an svg or icon), link (a link's colour), or null when the property can't say.
 */
export function classify(prop, selectors = '') {
  const p = prop.toLowerCase();
  const sel = Array.isArray(selectors) ? selectors.join(' ') : selectors;
  if (p.startsWith('--')) {
    if (/border|outline|ring/.test(p)) return 'border';
    if (/link/.test(p)) return 'link';
    if (/(^|-)(text|foreground)(-|$)/.test(p)) return 'text';
    if (/icon/.test(p)) return 'icon';
    if (/background|fill|surface|track|^--(button|indicator)-color$/.test(p)) return 'surface';
    return null;
  }
  if (/^(background|background-color|fill)$/.test(p)) return 'surface';
  if (/^(border|outline|column-rule)(-|$)|^box-shadow$/.test(p)) return 'border';
  if (p === 'stroke') return 'icon';
  if (/^(color|caret-color|text-decoration-color|-webkit-text-fill-color)$/.test(p))
    return /svg|icon|lucide|chevron|__check|-check\b|tick|caret|arrow/i.test(sel) ? 'icon' : /link/i.test(sel) ? 'link' : 'text';
  return null;
}

const FALLBACK = {link: ['text'], icon: ['text'], text: ['icon']};
const pick = (by, cls) => cls && (by[cls] ?? FALLBACK[cls]?.map(c => by[c]).find(Boolean));

// One token name in one declaration: its new name, or the name itself with a note saying why it stayed.
function renameName(name, {byFrom}, prop, sel, notes, where) {
  const r = byFrom.get(name);
  if (!r || r.delete || r.drop) return name;
  if (r.when) return new RegExp(r.when, 'i').test(sel) ? r.to : name;
  if (r.by) {
    const to = pick(r.by, classify(prop, sel));
    if (!to) { notes.push(`${where}: ${name} on ${prop}: can't tell which of ${Object.values(r.by).join(', ')}; left as it is`); return name; }
    return to;
  }
  // A flagged rename names a state: a use outside that state (by its selector or its own custom property's name) is
  // listed for a look, with the same value either way.
  if (r.flag && !new RegExp(r.flag, 'i').test(`${sel} ${prop}`))
    notes.push(`${where}: ${name} → ${r.to} outside a ${r.flag} state (${sel}): check it`);
  return r.to;
}

/** A value with every token renamed for its property; dropped scale steps become raw lengths, or the scale step. */
export function renameValue(value, rules, prop = '', sel = '', notes = [], where = '') {
  let v = value.replace(/var\(\s*(--gv-[a-z0-9-]+)\s*\)/g, (m, name) => {
    const r = rules.byFrom.get(name);
    if (!r?.drop) return m;
    return SCALE_PROP.test(prop) ? `var(${r.scale})` : r.drop;
  });
  v = v.replace(/calc\(\s*-1\s*\*\s*(\d+px)\s*\)|calc\(\s*(\d+px)\s*\*\s*-1\s*\)/g, (m, a, b) => `-${a ?? b}`);
  return v.replace(NAME, name => renameName(name, rules, prop, sel, notes, where));
}

const aliasOf = (aliases, local) => name => aliases[name] && !local.has(name);

/**
 * A stylesheet with every rule applied: the focus ring, the starter's names, the renames, layers and opacities.
 * Returns {text, notes}. `local` holds starter names some stylesheet defines for itself (left as they are).
 */
export function renameCss(source, rules, {file = '', local = new Set()} = {}) {
  const notes = [];
  const edits = [];
  const decls = declarations(source);
  const isAlias = aliasOf(rules.starter, local);
  // Each innermost rule that draws (or will draw) a focus ring: its outline-offset becomes the ring's offset.
  const ringRules = new Set(decls.filter(d => d.prop === 'outline' &&
    (d.value === 'var(--gv-focus-ring)' || (FOCUS_OUTLINE.test(d.value) && FOCUS_SELECTOR.test(d.selectors.join(' ')))))
    .map(d => d.selectors.join(' > ')));
  for (const d of decls) {
    const sel = d.selectors.join(' > ');
    const where = `${file}:${d.line}`;
    let v = d.value;
    const r = /^var\(\s*(--gv-[a-z0-9-]+)\s*\)$/.exec(v.trim());
    if (r && rules.byFrom.get(r[1])?.delete) {
      // The whole declaration goes, with its line when it has one to itself.
      let start = d.start, end = d.end;
      if (source[end] === ';') end++;
      const lineStart = source.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = source.indexOf('\n', end);
      if (/^\s*$/.test(source.slice(lineStart, start)) && /^\s*$/.test(source.slice(end, lineEnd === -1 ? source.length : lineEnd))) {
        start = lineStart; end = lineEnd === -1 ? source.length : lineEnd + 1;
      } else while (start > 0 && /[ \t]/.test(source[start - 1])) start--;
      edits.push([start, end, '']);
      continue;
    }
    if (d.prop === 'outline' && FOCUS_OUTLINE.test(v) && FOCUS_SELECTOR.test(sel)) v = 'var(--gv-focus-ring)';
    else if (d.prop === 'outline' && FOCUS_OUTLINE.test(v) && !/drop-target/.test(sel))
      notes.push(`${where}: a 2px outline outside a focus state (${sel}): not made a focus ring`);
    if (d.prop === 'outline-offset' && ringRules.has(sel)) {
      const key = v.replace(/\s+/g, ' ').trim();
      if (OFFSET[key]) v = OFFSET[key];
      else if (!/--gv-focus-ring-offset/.test(v)) notes.push(`${where}: a focus ring's offset of ${v}: no token, left as it is`);
    }
    v = v.replace(/var\(\s*(--[\w-]+)/g, (m, name) => isAlias(name) ? `var(${rules.starter[name]}` : m);
    v = renameValue(v, rules, d.prop, sel, notes, where);
    if (d.prop === 'z-index' && LAYER[v.trim()]) v = LAYER[v.trim()];
    if (d.prop === 'opacity') {
      if (/disabled/i.test(sel) && DISABLED_OPACITY.has(v.trim())) v = 'var(--gv-opacity-disabled)';
      else if (/dragging/i.test(sel) && v.trim() === '0.6') v = 'var(--gv-opacity-dragging)';
    }
    if (d.prop === 'letter-spacing' && /--gv-type-[a-z-]+-tracking/.test(v))
      notes.push(`${where}: letter-spacing ${v}: a role's tracking inside a longer value; remove it by hand`);
    if (v !== d.value) edits.push([d.valueStart, d.valueEnd, v]);
  }
  let text = source;
  for (const [start, end, with_] of edits.sort((a, b) => b[0] - a[0])) text = text.slice(0, start) + with_ + text.slice(end);
  // A comment that names a retired token says the new name (one it can't pick, it lists).
  text = text.replace(/\/\*[\s\S]*?\*\//g, (comment, at) => comment.replace(NAME, name => {
    const r = rules.byFrom.get(name);
    if (!r || r.when || r.delete || r.drop) return name;
    if (r.by) {
      notes.push(`${file}:${text.slice(0, at).split('\n').length}: a comment names ${name}: say which of ${Object.values(r.by).join(', ')}`);
      return name;
    }
    return r.to;
  }));
  return {text, notes};
}

const kebab = key => key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);

/**
 * TS, TSX and MDX: the starter's names and every `--gv-…` name renamed, a split one by the style key or attribute it
 * sits under (`background: …`, `stroke="…"`); a
 * role's tracking in a style object goes with its key. What it can't decide (a template string, a name with no
 * key) is listed in notes.
 */
export function renameScript(source, rules, {file = '', local = new Set()} = {}) {
  const notes = [];
  const isAlias = aliasOf(rules.starter, local);
  let text = source.replace(/var\(\s*(--[\w-]+)/g, (m, name) => isAlias(name) ? `var(${rules.starter[name]}` : m).replace(/,?(\s*)letterSpacing:\s*(['"`])var\(--gv-type-[a-z-]+-tracking\)\2(\s*,)?/g,
    (m, space, q, trailing) => m.startsWith(',') && trailing ? ',' : '');
  if (/--gv-type-\$\{[^}]*\}-(tracking|size|line|weight)/.test(text))
    notes.push(`${file}: builds --gv-type-\${…}-<part> names in a template string: rewrite by hand`);
  text = text.split('\n').map((line, i) => {
    if (!/--gv-/.test(line)) return line;
    return line.replace(/(var\(\s*)?(--gv-[a-z0-9-]+)(?![a-z0-9-])(\s*\))?/g, (m, open, name, close, at) => {
      const r = rules.byFrom.get(name);
      if (!r) return m;
      const where = `${file}:${i + 1}`;
      if (r.delete) { notes.push(`${where}: ${name} has no replacement (${r.why}): remove it by hand`); return m; }
      if (r.drop) {
        if (open && close) return r.drop;
        notes.push(`${where}: ${name} is no token any more (${r.why}): by hand`); return m;
      }
      const before = line.slice(0, at);
      // The style key (`background: '…'`) or the SVG attribute (`stroke="…"`) the name sits under.
      const key = /([A-Za-z-]+)\s*(?::|=\{?)\s*[`'"]?[^,`'"{}]*$/.exec(before)?.[1];
      const to = renameName(name, rules, key ? kebab(key) : '', line, notes, where);
      return (open ?? '') + to + (close ?? '');
    });
  }).join('\n');
  return {text, notes};
}

// A small reader for the system's stylesheets: every declaration with its property, value, place in the source and
// the selectors it sits under (nesting included). Comments and strings are masked first, so an index into the masked
// text is the same place in the source. Used by the token codemod (scripts/rename-tokens.mjs) and the token guards.

/** The source with comments (and quoted strings, when `strings`) blanked to spaces, newlines kept. */
export function mask(source, {strings = true} = {}) {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
  if (strings) out = out.replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, s => s[0] + ' '.repeat(s.length - 2) + s[0]);
  return out;
}

/**
 * Each declaration as {prop, value, start, end, valueStart, valueEnd, selectors, line}. `start..end` covers
 * `prop: value` (without the `;`), `valueStart..valueEnd` the value, trimmed. `selectors` is the chain of rule
 * preludes it sits in, outermost first (at-rules included, as written). Their quoted strings are blanked unless
 * `selectorStrings` (`[data-zoom="50"]` stays itself, for a guard that lists selectors).
 */
export function declarations(source, {selectorStrings = false} = {}) {
  const text = mask(source);
  const preludes = selectorStrings ? mask(source, {strings: false}) : text;
  const out = [];
  const stack = [];
  let from = 0, depth = 0; // depth of round brackets: a ; or { inside url(...) or a function never splits
  const flush = (end, opensBlock) => {
    const raw = text.slice(from, end);
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (opensBlock) { stack.push(preludes.slice(from, end).trim().replace(/\s+/g, ' ')); return; }
    if (!body || !stack.length) return;
    const colon = body.indexOf(':');
    if (colon <= 0) return;
    const prop = body.slice(0, colon).trim();
    if (!/^(--[\w-]+|-?[a-zA-Z][\w-]*)$/.test(prop)) return;
    const start = from + lead;
    const after = body.slice(colon + 1);
    const valueStart = start + colon + 1 + (after.length - after.trimStart().length);
    const valueEnd = start + body.length;
    out.push({prop, value: source.slice(valueStart, valueEnd), start, end: valueEnd, valueStart, valueEnd,
      selectors: [...stack], line: source.slice(0, start).split('\n').length});
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (depth) continue;
    else if (c === '{') { flush(i, true); from = i + 1; }
    else if (c === ';') { flush(i, false); from = i + 1; }
    else if (c === '}') { flush(i, false); stack.pop(); from = i + 1; }
  }
  return out;
}

/** The custom properties a stylesheet defines, by name. */
export const definedIn = source => new Set(declarations(source).filter(d => d.prop.startsWith('--')).map(d => d.prop));

/**
 * A declaration's `selectors` chain as the full selectors it applies to: nesting resolved (`&` replaced by the
 * parent, or a descendant of it), a list split on its commas, at-rules dropped.
 */
export function resolveSelectors(chain) {
  let out = [''];
  for (const prelude of chain) {
    if (prelude.startsWith('@')) continue;
    const parts = splitList(prelude);
    out = out.flatMap(parent => parts.map(s => s.includes('&') ? s.replaceAll('&', parent) : parent ? `${parent} ${s}` : s));
  }
  return out.filter(Boolean);
}

/** A selector list split on its top-level commas (none inside `:is(…)` or `[…]`). */
function splitList(list) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && !depth) { out.push(list.slice(start, i).trim()); start = i + 1; }
  }
  return [...out, list.slice(start).trim()];
}

/** The last compound of a selector, the element it styles: `.a > .b[data-x]:hover` → `.b[data-x]:hover`. */
export function subject(selector) {
  let depth = 0, cut = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (!depth && /[\s>+~]/.test(c)) cut = i + 1;
  }
  return selector.slice(cut).trim();
}

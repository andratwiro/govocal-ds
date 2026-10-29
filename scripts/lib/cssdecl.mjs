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
 * preludes it sits in, outermost first (at-rules included, as written).
 */
export function declarations(source) {
  const text = mask(source);
  const out = [];
  const stack = [];
  let from = 0, depth = 0; // depth of round brackets: a ; or { inside url(...) or a function never splits
  const flush = (end, opensBlock) => {
    const raw = text.slice(from, end);
    const lead = raw.length - raw.trimStart().length;
    const body = raw.trim();
    if (opensBlock) { stack.push(body.replace(/\s+/g, ' ')); return; }
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

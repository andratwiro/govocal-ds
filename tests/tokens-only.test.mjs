import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

// Every stylesheet under src/ except the generated tokens.css, which is where the values live.
const css = readdirSync('src', {recursive: true}).filter(f => f.endsWith('.css') && f !== 'tokens.css')
  .map(f => [`src/${f}`, readFileSync(`src/${f}`, 'utf8')]);

// The families the guard reads, by property. A custom property joins the family its name says: the starter's
// aliases in theme.css (--spacing-*, --radius-*, --font-size-*, --popover-shadow) and local --gap, --padding.
const familyOf = prop => {
  if (/^--/.test(prop)) {
    if (/^--(spacing|gap|padding|margin)(-|$)|-(gap|padding|margin)$/.test(prop)) return 'space';
    if (/^--radius(-|$)|-radius$/.test(prop)) return 'space';
    if (/^--font-size(-|$)/.test(prop)) return 'size';
    if (/^--line-height(-|$)/.test(prop)) return 'line';
    if (/^--font-weight(-|$)/.test(prop)) return 'strict';
    if (/-shadow$/.test(prop)) return 'shadow';
    return null;
  }
  if (/^(padding|margin|inset|scroll-padding|scroll-margin)(-[a-z-]+)?$|^(gap|row-gap|column-gap|grid-gap|top|right|bottom|left)$/.test(prop))
    return 'space';
  if (/^border(-[a-z]+){0,2}-radius$/.test(prop)) return 'space';
  if (prop === 'font-size') return 'size';
  if (prop === 'line-height') return 'line';
  if (/^(font|font-family|font-weight)$/.test(prop)) return 'strict';
  if (prop === 'box-shadow') return 'shadow';
  return null;
};

// Base 4 (the project lead's call, docs/DECISIONS.md "Token names"): the only space and radius steps. A step off these
// is gone from tokens.css and fails here with the scale to pick from.
export const SPACE = [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 104];
export const RADIUS = [2, 4, 6, 8, 10, 12, 14, 22];
// A position or offset (top, inset, a margin that nudges a mark onto a line) may take a raw 1px or 3px: an offset, not
// spacing. Padding, gap and radius never do; strokes are 1, 1.5, 2 or 3px wherever they are (a box-shadow ring).
const POSITION = /^(inset(-[a-z-]+)?|top|right|bottom|left|margin(-[a-z-]+)?)$/;
const OFFSET = new Set([1, 3]);

const GLOBAL = /^(inherit|initial|unset|revert|revert-layer)$/;
// Units that follow the viewport or container, not a design value (the starter centres its modal with 50vw).
const RELATIVE = /^(%|vw|vh|vi|vb|vmin|vmax|dvh|dvw|svh|svw|lvh|lvw|cqw|cqh|cqi|cqb|cqmin|cqmax)$/;
// A stroke or ring: 1px, 1.5px, 2px or 3px wide, in a box-shadow with no blur.
const STROKE = new Set([1, 1.5, 2, 3]);
const NUMBER = /(?<![\w.#-])(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)/gi;

// Split on commas outside parentheses: a box-shadow's layers.
const layers = value => {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++;
    else if (value[i] === ')') depth--;
    else if (value[i] === ',' && depth === 0) { out.push(value.slice(start, i)); start = i + 1; }
  }
  return [...out, value.slice(start)];
};

// Why one value breaks the rule, or null. var(--x) is a token (or the starter's alias of one, checked where it
// is defined); its fallback, if any, is read like any other value.
export function rawValue(family, value, prop = '') {
  const v = value.replace(/var\(\s*--[\w-]+\s*/g, 'var(').replace(/!important/g, '').trim();
  const words = v.replace(/var\(/g, ' ').replace(/[(),/*+]/g, ' ').split(/\s+/).filter(Boolean);
  if (family === 'strict' || family === 'size' || family === 'line') {
    // font, font-family, font-weight, font-size, line-height: tokens and the global keywords only; line-height
    // also takes 0 and 1 (no leading), font-size and line-height a percentage.
    const bad = words.filter(w => !GLOBAL.test(w) &&
      !(family !== 'strict' && /^0+(\.0+)?[a-z%]*$/.test(w)) &&
      !(family === 'line' && /^1(\.0+)?$/.test(w)) &&
      !(family !== 'strict' && /^\d*\.?\d+%$/.test(w)));
    return bad.length ? bad.join(' ') : null;
  }
  for (const layer of family === 'shadow' ? layers(v) : [v]) {
    const lengths = [];
    let depth = 0, calc = 0;
    const parens = [];
    // Walk the value once: numbers inside calc()/min()/max()/clamp() may be unitless (a factor).
    const re = new RegExp(NUMBER.source + '|([a-z-]*)\\(|\\)', 'gi');
    for (const m of layer.matchAll(re)) {
      if (m[3] !== undefined) { parens.push(/^(calc|min|max|clamp)$/i.test(m[3])); if (parens.at(-1)) calc++; depth++; continue; }
      if (m[0] === ')') { if (parens.pop()) calc--; depth--; continue; }
      const n = Number(m[1]), unit = m[2].toLowerCase();
      if (n === 0 || RELATIVE.test(unit)) { if (depth === 0) lengths.push(0); continue; }
      if (!unit && calc > 0) continue;
      if (family === 'shadow' && unit === 'px' && STROKE.has(Math.abs(n)) && depth === 0) { lengths.push(n); continue; }
      if (family === 'space' && unit === 'px' && OFFSET.has(Math.abs(n)) && POSITION.test(prop)) continue;
      return m[0];
    }
    // A shadow layer with a blur is a real shadow: it comes whole from a --gv-shadow-* token.
    if (family === 'shadow' && lengths.length >= 3 && lengths[2] !== 0) return layer.trim();
  }
  return null;
}

// A drawing, not UI (the phone preview's bezel), may keep a number: the declaration says so on its own line,
// `border-radius: 44px; /* raw: a drawing of a phone, not UI */`.
const RAW_NOTE = /^;[ \t]*\/\*\s*raw:\s*[^*\s]/;

// Each spacing, radius, type or shadow declaration holding a value that is not a token or an allowed literal.
export function rawTokens(source) {
  // Comments become spaces of the same length, so an index in `text` is the same place in `source`.
  const text = source.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' '));
  const hits = [];
  for (const m of text.matchAll(/(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const [decl, prop, value] = m;
    const family = familyOf(prop);
    const off = [...value.matchAll(/--gv-(space|radius)-(\d+)(?![\w-])/g)]
      .filter(([, scale, n]) => !(scale === 'space' ? SPACE : RADIUS).includes(Number(n)));
    if (off.length) {
      hits.push(`${text.slice(0, m.index).split('\n').length}: ${decl.replace(/\s+/g, ' ').trim()} (off base 4: ` +
        `space ${SPACE.join('·')}, radius ${RADIUS.join('·')}·full)`);
      continue;
    }
    if (!family || rawValue(family, value, prop) === null) continue;
    if (RAW_NOTE.test(source.slice(m.index + decl.length))) continue;
    hits.push(`${text.slice(0, m.index).split('\n').length}: ${decl.replace(/\s+/g, ' ').trim()}`);
  }
  return hits;
}

describe('spacing, radius, type and shadow come only from tokens', () => {
  it('catches raw lengths, weights, sizes, families and shadows', () => {
    const fails = [
      'a { padding: 13px var(--gv-space-16); }',
      'a { margin-inline-start: -2px; }',
      'a { gap: 8px; }',
      'a { inset: 5px; }',
      'a { padding: 1px; }',
      'a { gap: 3px; }',
      'a { border-radius: calc(var(--gv-radius-22) - 1px); }',
      'a { gap: var(--gv-space-14); }',
      'a { margin: var(--gv-space-5); }',
      'a { border-radius: var(--gv-radius-3); }',
      'a { top: 12px; }',
      'a { margin-right: 1.75rem; }',
      'a { padding: calc(var(--gv-space-8) + 4px); }',
      'a { padding: var(--x, 4px); }',
      'a { border-radius: 9999px; }',
      'a { border-start-end-radius: 6px; }',
      'a { font-size: 11px; }',
      'a { font-size: 1rem; }',
      'a { line-height: 1.5; }',
      'a { line-height: 18px; }',
      'a { line-height: normal; }',
      'a { line-height: 1.5em; }',
      'a { font-weight: 500; }',
      'a { font-weight: bold; }',
      'a { font-weight: normal; }',
      'a { font-family: monospace; }',
      'a { font-family: var(--gv-font-family, sans-serif); }',
      'a { font: 500 12px/16px var(--gv-font-family); }',
      'a { box-shadow: 0 2px 8px var(--gv-border-default); }',
      'a { box-shadow: 0 0 0 4px var(--gv-surface-info); }',
      'a { box-shadow: var(--gv-shadow-raised), 0 1px 3px var(--x); }',
      ':root { --spacing: 4px; }',
      ':root { --font-size-sm: 12px; }',
      ':root { --radius-xl: 14px; }',
      ':root { --popover-shadow: 0 8px 24px var(--x); }',
      'a {\n  --gap: 6px;\n}',
      'a { border-radius: 44px; /* a drawing */ }',
      'a { border-radius: 44px; /* raw: */ }',
      'a { border-radius: 44px;\n  /* raw: a drawing of a phone */ }'
    ];
    for (const source of fails) expect(rawTokens(source), source).toHaveLength(1);
    expect(rawTokens('a {\n  color: var(--x);\n  padding:\n    0 15px;\n}')).toEqual(['3: padding: 0 15px']);
  });

  it('lets tokens, keywords, zero, percentages, factors, rings and strokes through', () => {
    const passes = [
      'a { padding: 0 var(--gv-space-12); margin: 0 auto; inset: 0; gap: 0px; }',
      'a { margin-inline-start: calc(-1 * var(--gv-space-8)); padding: calc(var(--gap) / 2); }',
      'a { padding-inline-start: calc(var(--gv-space-12) + (var(--level) - 1) * var(--spacing-4)); }',
      'a { top: 50%; left: 50%; margin-left: 50vw; top: calc(var(--visual-viewport-height) / 2); }',
      'a { border-radius: var(--gv-radius-full); border-radius: 50%; border-radius: 0 0 var(--radius) var(--radius); }',
      'a { border-radius: inherit; }',
      'a { font: var(--gv-type-ui); font: inherit; font-family: var(--gv-font-family); }',
      'a { font-size: var(--gv-font-size-12); line-height: var(--gv-font-line-height-16); }',
      'a { font-weight: var(--gv-font-weight-medium); font-weight: inherit; }',
      'a { line-height: 1; line-height: 0; font-size: 100%; }',
      'a { box-shadow: none; box-shadow: var(--gv-shadow-overlay); }',
      'a { box-shadow: inset 0 0 0 1px var(--gv-border-subtle); }',
      'a { box-shadow: 0 0 0 1.5px var(--gv-border-selected), var(--gv-shadow-raised); }',
      'a { box-shadow: 0 0 0 3px color-mix(in srgb, var(--gv-border-selected) 10%, transparent); }',
      'a { box-shadow: inset 0 -1px 0 var(--gv-border-subtle); }',
      'a { box-shadow: inset 0 0 0 var(--button-border-size) var(--button-border); }',
      ':root { --spacing: var(--gv-space-4); --spacing-9: var(--gv-size-control-36); --radius: var(--gv-radius-8); }',
      ':root { --font-size: var(--gv-font-size-13); --popover-shadow: var(--gv-shadow-overlay); }',
      'a { --button-border-size: 0.5px; --check-width: 26px; --origin: translateY(8px); }',
      'a { width: 14px; height: 36px; border: 1px solid var(--x); outline-offset: 2px; }',
      '/* padding: 13px; font-weight: 500 */ a { color: var(--x); }',
      '@media (max-width: 600px) { a:not(.b) { padding: var(--gv-space-4); } }',
      'a { border-radius: 44px; /* raw: a drawing of a phone, not UI */ }',
      'a { inset-inline-start: calc(var(--gv-space-16) - 1px / 2); }',
      'a { margin-inline-start: -1px; inset: 3px; margin: -3px calc(-1 * var(--gv-space-4)) 0 0; top: -1px; }',
      'a { border-radius: calc(var(--gv-radius-22) - var(--gv-border-width-1)); padding: var(--gv-space-104); }'
    ];
    for (const source of passes) expect(rawTokens(source), source).toEqual([]);
  });

  it('tokens.css holds exactly the base-4 space and radius steps', () => {
    const tokens = readFileSync('src/tokens.css', 'utf8');
    const steps = scale => [...tokens.matchAll(new RegExp(`--gv-${scale}-(\\d+):`, 'g'))].map(m => Number(m[1]));
    expect(steps('space')).toEqual(SPACE);
    expect(steps('radius')).toEqual(RADIUS);
  });

  it('src CSS writes spacing, radius, type and shadow only via tokens', () => {
    const offenders = css.flatMap(([f, s]) => rawTokens(s).map(hit => `${f}:${hit}`));
    expect(offenders).toEqual([]);
  });
});

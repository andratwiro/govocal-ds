import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';

// The names follow one grammar (tokens.md §3, docs/NAMING.md "Token names"), so a person or an agent can say what a
// token is for from its name and can't guess one that isn't there. tokens.md "Guard tests".
const css = readFileSync('src/tokens.css', 'utf8');
const lines = [...css.matchAll(/^\s*(--gv-[\w-]+):\s*([^;]+);(.*)$/gm)].map(([, name, value, rest]) => ({name, value: value.trim(),
  description: rest.match(/\/\*\s*([\s\S]*?)\s*\*\//)?.[1] ?? ''}));
const names = [...new Set(lines.map(l => l.name))];

// The words of the colour grammar: --gv-{surface|text|icon|border}-{role}[-strong][-{state}].
export const PROPERTIES = ['surface', 'text', 'icon', 'border'];
export const ROLES = {
  hierarchy: ['primary', 'secondary', 'tertiary', 'body', 'placeholder', 'quiet', 'neutral', 'default', 'subtle'],
  place: ['app', 'panel', 'backdrop', 'row', 'control'],
  intent: ['brand', 'accent', 'link', 'info', 'success', 'warning', 'danger', 'selected', 'inverse']
};
export const STATES = ['hovered', 'pressed', 'selected', 'disabled', 'focused'];
const ROLE = Object.values(ROLES).flat().join('|'), STATE = STATES.join('|');
const COLOUR = new RegExp(`^--gv-(${PROPERTIES.join('|')})(?=-)(-(${ROLE}))?(-strong)?(-(${STATE}))?$`);
// The one component tier (tokens.md §5): the dark side nav, in the same property words.
const SIDE_NAV = new RegExp(`^--gv-side-nav-(${PROPERTIES.join('|')})(-(current|accent|focused|hovered))?$`);
// Everything that isn't a semantic colour has its own short grammar.
const OTHER = [
  /^--gv-color-[a-z]+-\d+$/, /^--gv-color-alpha-[a-z]+(-\d+)?$/, /^--gv-chart-[a-z]+(-[a-z0-9]+)*$/,
  /^--gv-space-\d+$/, /^--gv-radius-(\d+|full)$/, /^--gv-size-(icon|control|avatar)-\d+$/,
  /^--gv-font-(family|family-document|tracking|size-\d+|line-height-\d+|weight-(regular|medium))$/,
  /^--gv-type-(stat|stat-small|title|body|body-strong|ui|ui-strong|small|small-strong)$/,
  // A document's roles (a report's pages): one family of their own, so a platform themes its documents' type apart
  // from the interface's. Named for what the text is in a document, never for the screen that shows it.
  /^--gv-type-document-(display|heading|lead|body)$/,
  /^--gv-shadow-(raised|raised-strong|overlay)$/, /^--gv-motion-(duration|easing)-[a-z]+$/, /^--gv-border-width-\d+$/,
  /^--gv-focus-ring(-offset(-inset)?)?$/, /^--gv-opacity-[a-z]+$/, /^--gv-layer-[a-z]+$/
];
export const fits = name => COLOUR.test(name) || SIDE_NAV.test(name) || OTHER.some(re => re.test(name));

const HUES = /(?<![a-z])(red|orange|amber|yellow|olive|green|teal|cyan|blue|navy|indigo|purple|violet|pink|magenta|slate|grey|gray|black|white|brown|terracotta|mint|lime)(?![a-z])/;
// Words that name a component or a Go Vocal screen: they belong in the component tier, never in a semantic name.
const COMPONENTS = /(?<![a-z])(button|toast|badge|pill|chip|toolbar|card|modal|dialog|tooltip|tabs?|menu|avatar(?!-\d)|checkbox|switch|input|field|select|banner|coachmark|sidebar|segment|stage|ai|live|notification|action|state|meta|hover|table|list)(?![a-z])/;

describe('token names', () => {
  it('reads the grammar: these fit, these do not', () => {
    for (const ok of ['--gv-surface-panel', '--gv-surface-danger-strong', '--gv-surface-danger-pressed', '--gv-text-link-hovered',
      '--gv-border-control-hovered', '--gv-border-strong', '--gv-surface-hovered', '--gv-border-focused', '--gv-side-nav-icon-current',
      '--gv-color-slate-750', '--gv-chart-line-primary', '--gv-space-104', '--gv-radius-full', '--gv-font-line-height-24'])
      expect(fits(ok), ok).toBe(true);
    for (const bad of ['--gv-surface-hover', '--gv-action-primary', '--gv-text-live', '--gv-surface-pill', '--gv-text-warning-dark',
      '--gv-state-notification', '--gv-surface-strong-danger', '--gv-type-ui-tracking', '--gv-shadow-dialog', '--gv-color-brand'])
      expect(fits(bad), bad).toBe(false);
  });
  it('every token in tokens.css fits the grammar', () => {
    expect(names.filter(n => !fits(n))).toEqual([]);
  });
  it('no hue word outside color-* and chart-*', () => {
    expect(names.filter(n => !/^--gv-(color|chart)-/.test(n) && HUES.test(n.slice(5)))).toEqual([]);
  });
  it('no component word outside the component tier (side-nav-*)', () => {
    expect(names.filter(n => !/^--gv-side-nav-/.test(n) && COMPONENTS.test(n.slice(5)))).toEqual([]);
  });
  it('every token carries its description', () => {
    // The first line of each name; the reduced-motion block repeats three durations without one.
    expect(names.filter(n => !lines.find(l => l.name === n).description.trim())).toEqual([]);
  });
});

// ---- Near-duplicates: the same property, colours under ΔE 2 (CIEDE2000, alpha laid on white) ----

const byName = new Map(lines.map(l => [l.name, l.value]));
const resolve = (value, depth = 0) => {
  const m = value.match(/^var\((--gv-[\w-]+)\)$/);
  return m && depth < 10 ? resolve(byName.get(m[1]) ?? '', depth + 1) : value;
};
const rgb = value => {
  let m = value.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(m[2] ? parseInt(m[2], 16) / 255 : 1);
  m = value.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[/,]\s*([\d.]+%?))?\s*\)$/);
  if (!m) return null;
  const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : Number(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), a];
};
const onWhite = ([r, g, b, a]) => [r, g, b].map(c => c * a + 255 * (1 - a));
const lab = ([r, g, b]) => {
  const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [R, G, B] = [r, g, b].map(lin);
  const xyz = [(0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, 0.2126 * R + 0.7152 * G + 0.0722 * B,
    (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883];
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  const [fx, fy, fz] = xyz.map(f);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
// CIEDE2000 (Sharma, Wu & Dalal's formulation).
export function deltaE([L1, a1, b1], [L2, a2, b2]) {
  const rad = Math.PI / 180, C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2, Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const h = (b, a) => (a === 0 && b === 0) ? 0 : (Math.atan2(b, a) / rad + 360) % 360;
  const hp1 = h(b1, ap1), hp2 = h(b2, ap2);
  const dL = L2 - L1, dC = Cp2 - Cp1;
  let dh = hp2 - hp1;
  if (Cp1 * Cp2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dh * rad / 2);
  const Lb = (L1 + L2) / 2, Cpb = (Cp1 + Cp2) / 2;
  let hb = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) hb = Math.abs(hp1 - hp2) > 180 ? (hp1 + hp2 + (hp1 + hp2 < 360 ? 360 : -360)) / 2 : (hp1 + hp2) / 2;
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad)
    - 0.2 * Math.cos((4 * hb - 63) * rad);
  const SL = 1 + 0.015 * (Lb - 50) ** 2 / Math.sqrt(20 + (Lb - 50) ** 2), SC = 1 + 0.045 * Cpb, SH = 1 + 0.015 * Cpb * T;
  const RT = -2 * Math.sqrt(Cpb ** 7 / (Cpb ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hb - 275) / 25) ** 2)) * rad);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

// Pairs that stay two tokens on purpose, and why. Merging one is the designer's call (tokens.md Phase 2), never a
// silent code change; tokens/renames.json merges the ones code could (text-segment, surface-ai, …).
// One value, two jobs: each name says what it is for, so the designer can pull them apart without a code change.
export const EXPLAINED = {
  'surface-app surface-neutral': 'the page behind everything vs a neutral pill or track that sits on panels',
  'surface-app surface-pressed': 'the page vs a row or button held down',
  'surface-neutral surface-pressed': 'a neutral pill or track at rest vs a row held down',
  'surface-hovered surface-tertiary': 'a row under the pointer vs a resting tertiary fill (a table header): two Figma variables',
  'surface-disabled surface-secondary': 'a field that cannot be used vs a secondary panel fill',
  'text-placeholder text-tertiary': 'a hint in an empty field vs settled tertiary words: two Figma variables',
  'text-brand text-link': 'brand words that are not links (new markers, ranks) vs a link: a link may change colour alone',
  'icon-disabled icon-quiet': 'an icon in a control that cannot be used vs a quiet one that can',
  'border-disabled border-subtle': 'the edge of a control that cannot be used vs a quiet divider',
  'border-focused border-selected': 'the focus ring vs a selected edge: one navy, kept apart so focus can change alone',
  'border-inverse border-row': 'a white ring on a busy fill (overlapping avatars) vs a row line on a panel'
};
// Steps of a ladder: neighbouring near-whites sit under ΔE 2 of each other by design, the quiet layering the prototype
// draws (panel, secondary, tertiary, app). Two tokens on different steps are explained by the ladder.
export const LADDERS = {
  surface: ['neutral-0', 'neutral-25', 'slate-50', 'slate-100'],
  border: ['slate-50', 'slate-100']
};

describe('near-duplicate tokens', () => {
  // The primitive a token resolves to, by its ramp name (slate-100), for the ladders.
  const primitive = (value, depth = 0) => {
    const m = value.match(/^var\((--gv-[\w-]+)\)$/);
    if (!m || depth > 10) return null;
    return m[1].startsWith('--gv-color-') ? m[1].slice(11) : primitive(byName.get(m[1]) ?? '', depth + 1);
  };
  const colours = names.filter(n => COLOUR.test(n)).map(n => {
    const c = rgb(resolve(byName.get(n)));
    return c && {n: n.slice(5), prop: n.split('-')[3], step: primitive(byName.get(n)), lab: lab(onWhite(c))};
  }).filter(Boolean);
  const pairs = [];
  for (let i = 0; i < colours.length; i++) for (let j = i + 1; j < colours.length; j++) {
    const [a, b] = [colours[i], colours[j]];
    if (a.prop !== b.prop) continue;
    const d = deltaE(a.lab, b.lab);
    const ladder = LADDERS[a.prop] ?? [];
    const steps = a.step !== b.step && ladder.includes(a.step) && ladder.includes(b.step);
    if (d < 2) pairs.push([[a.n, b.n].sort().join(' '), +d.toFixed(2), steps]);
  }
  it('ΔE 2000 agrees with a known pair', () => {
    expect(deltaE([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 3);
  });
  it('every same-property pair under ΔE 2 is explained (or merged in tokens/renames.json)', () => {
    expect(pairs.filter(([k, , steps]) => !steps && !EXPLAINED[k])).toEqual([]);
  });
  it('every explained pair is still a near-duplicate: one the designer pulled apart leaves the list', () => {
    const seen = new Set(pairs.map(([k]) => k));
    expect(Object.keys(EXPLAINED).filter(k => !seen.has(k))).toEqual([]);
  });
});

import {refName} from './names.mjs';

const isRef = v => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
const varOf = ref => `var(${refName(ref)})`;
const lookup = (tokens, ref) => ref.slice(1, -1).split('.').reduce((node, key) => node?.[key], tokens);
// A reference followed to the value it ends at.
const resolve = (tokens, v, seen = []) => {
  if (!isRef(v)) return v;
  const t = lookup(tokens, v);
  if (!t || !('$value' in t)) throw new Error(`${seen.at(-1) ?? v}: ${v} names no token`);
  if (seen.includes(v)) throw new Error(`${v} refers to itself`);
  return resolve(tokens, t.$value, [...seen, v]);
};

const rgb = c => {
  const [r, g, b] = c.components.map(v => Math.round(v * 255));
  return c.alpha >= 1 ? c.hex : `rgb(${r} ${g} ${b} / ${c.alpha})`;
};
const colour = v => isRef(v) ? varOf(v) : rgb(v);
const dim = d => isRef(d) ? varOf(d) : `${d.value}${d.unit}`;

// storybook-design-token (addon) reads "/** @tokens <Category> @presenter <Presenter> */ ... */
// /** @tokens-end */" blocks inside the stylesheet it's pointed at. One block per semantic group
// (plus the primitive scales), all annotated so the Foundations pages can group and filter them.
const open = (name, presenter) => `/** @tokens ${name} @presenter ${presenter} */`;
const close = '/** @tokens-end */';
const block = (name, presenter, lines) => lines.length ? [open(name, presenter), ...lines, close] : [];
// A comment on the declaration's own line is the addon's description column.
const note = t => t.$description ? ` /* ${t.$description.replaceAll('*/', '')} */` : '';

// Motion (Not in Figma, tokens/motion.tokens.json): DTCG duration {value, unit} and cubicBezier [x1, y1, x2, y2].
const REDUCED = 'com.govocal.reducedMotion';
const time = (d, path) => {
  if (!d || typeof d.value !== 'number' || d.value < 0 || !['ms', 's'].includes(d.unit))
    throw new Error(`${path}: a duration is {value, unit: "ms" | "s"}`);
  return `${d.value}${d.unit}`;
};
const bezier = (v, path) => {
  if (!Array.isArray(v) || v.length !== 4 || v.some(n => typeof n !== 'number') || [v[0], v[2]].some(x => x < 0 || x > 1))
    throw new Error(`${path}: a cubicBezier is [x1, y1, x2, y2] with x1 and x2 in 0..1`);
  return `cubic-bezier(${v.join(', ')})`;
};

// Size (Not in Figma, tokens/size.tokens.json): DTCG dimension {value, unit: "px"}, grouped by what it sizes. Each
// token is named by its value, as the Figma space and radius scales are, so a name can never drift from its value.
const SIZE_KINDS = {icon: 'Icon size', control: 'Control height', avatar: 'Avatar size'};
const px = (d, path, name) => {
  if (!d || typeof d.value !== 'number' || d.value <= 0 || d.unit !== 'px')
    throw new Error(`${path}: a size is {value, unit: "px"}`);
  if (String(d.value) !== name) throw new Error(`${path}: a size is named by its value (${d.value})`);
  return `${d.value}px`;
};

// The colour groups, property first (docs/NAMING.md, Token names); any other colour group follows them, the chart
// palette last.
const COLOUR_ORDER = ['surface', 'text', 'icon', 'border'];
const NOT_COLOUR = new Set(['color', 'space', 'radius', 'size', 'type', 'shadow', 'motion', 'font', 'focus',
  'border-width', 'opacity', 'layer']);
const byNumber = entries => [...entries].sort(([a], [b]) => (Number(a) || (a === 'full' ? Infinity : 0)) -
  (Number(b) || (b === 'full' ? Infinity : 0)));

const quoteFamily = f => /^[\w-]+$/.test(f) && !/\s/.test(f) ? f : `'${f}'`;
const familyCss = v => (Array.isArray(v) ? v : [v, 'system-ui', 'sans-serif']).map(quoteFamily).join(', ');

// The font primitive whose value is `value` (a dimension or a weight), as var(), or null.
function fontVar(tokens, prefix, value) {
  for (const [key, t] of Object.entries(tokens.font ?? {})) {
    if (!key.startsWith(prefix)) continue;
    const v = resolve(tokens, t.$value);
    if (typeof value === 'number' ? v === value : v?.value === value.value && v?.unit === value.unit)
      return `var(--gv-font-${key})`;
  }
  return null;
}

export function toCss(tokens) {
  const sections = [];

  const colorLines = [];
  for (const [family, steps] of Object.entries(tokens.color))
    for (const [step, t] of Object.entries(steps)) colorLines.push(`--gv-color-${family}-${step}: ${rgb(t.$value)};${note(t)}`);
  sections.push(block('Colour primitives', 'Color', colorLines));

  // Type: one family; with font primitives (tokens/semantic.tokens.json), each role's shorthand is built from them.
  const font = tokens.font ?? {};
  const families = new Set(Object.values(tokens.type).map(t => {
    const f = resolve(tokens, t.$value.fontFamily);
    return Array.isArray(f) ? f[0] : f;
  }));
  if (families.size !== 1) throw new Error(`expected one font family, got ${[...families]}`);
  const family = font.family ? resolve(tokens, font.family.$value) : [...families][0];
  // A second family may stand in for another role group (family-document: a document's face, themed per platform);
  // its value is a reference to the one family, so the interface and every document share Public Sans by default.
  const moreFamilies = Object.entries(font).filter(([k]) => k.startsWith('family-'))
    .map(([k, t]) => `--gv-font-${k}: ${isRef(t.$value) ? varOf(t.$value) : familyCss(t.$value)};${note(t)}`);
  sections.push(block('Font family', 'FontFamily', [`--gv-font-family: ${familyCss(family)};${note(font.family ?? {})}`,
    ...moreFamilies]));
  const fontLines = prefix => Object.entries(font).filter(([k]) => k.startsWith(prefix))
    .map(([k, t]) => `--gv-font-${k}: ${typeof t.$value === 'number' ? t.$value : dim(t.$value)};${note(t)}`);
  sections.push(block('Font size', 'FontSize', fontLines('size-')));
  sections.push(block('Line height', 'LineHeight', fontLines('line-height-')));
  sections.push(block('Font weight', 'FontWeight', fontLines('weight-')));
  sections.push(block('Letter spacing', 'LetterSpacing', fontLines('tracking')));

  const groups = Object.keys(tokens).filter(g => !NOT_COLOUR.has(g) && !g.startsWith('$'));
  const colourGroups = [...COLOUR_ORDER.filter(g => groups.includes(g)),
    ...groups.filter(g => !COLOUR_ORDER.includes(g) && g !== 'chart'), ...groups.filter(g => g === 'chart')];
  for (const group of colourGroups) {
    const lines = Object.entries(tokens[group]).map(([role, t]) => `--gv-${group}-${role}: ${colour(t.$value)};${note(t)}`);
    sections.push(block(group, 'Color', lines));
  }

  sections.push(block('Space', 'Spacing', byNumber(Object.entries(tokens.space)).map(([n, t]) =>
    `--gv-space-${n}: ${dim(t.$value)};${note(t)}`)));
  sections.push(block('Radius', 'BorderRadius', byNumber(Object.entries(tokens.radius)).map(([n, t]) =>
    `--gv-radius-${n}: ${dim(t.$value)};${note(t)}`)));

  // The addon has no size presenter: Spacing draws each as a bar of its length (the Size page draws its own).
  for (const [kind, steps] of Object.entries(tokens.size ?? {})) {
    if (!SIZE_KINDS[kind]) throw new Error(`size.${kind}: a size kind is one of ${Object.keys(SIZE_KINDS).join(', ')}`);
    sections.push(block(SIZE_KINDS[kind], 'Spacing', Object.entries(steps).map(([n, t]) =>
      `--gv-size-${kind}-${n}: ${px(t.$value, `size.${kind}.${n}`, n)};${note(t)}`)));
  }

  // Focus, stroke widths, opacity and layers (Not in Figma, apart from the two stroke widths). The Foundations page
  // draws them itself; Opacity also gets the addon's presenter.
  const plainLines = (group, value) => Object.entries(tokens[group] ?? {}).map(([n, t]) =>
    `--gv-${group}-${n}: ${value(t.$value, `${group}.${n}`)};${note(t)}`);
  const border = v => typeof v === 'object' && !isRef(v) && 'style' in v
    ? `${dim(v.width)} ${v.style} ${colour(v.color)}` : dim(v);
  const number = (v, path) => {
    if (typeof v !== 'number') throw new Error(`${path}: a number token's value is a number`);
    return String(v);
  };
  sections.push(plainLines('border-width', border));
  sections.push(plainLines('focus', border));
  sections.push(block('Opacity', 'Opacity', plainLines('opacity', number)));
  sections.push(plainLines('layer', number));

  // Type roles: `font: var(--gv-type-<role>)`, the one way to set text. With font primitives, the shorthand is built
  // from them (a part with no matching primitive stays a number, so a missing primitive shows in the diff). No
  // per-role size, line, weight or tracking parts: an override takes a font primitive.
  const roleLines = [];
  for (const [role, t] of Object.entries(tokens.type)) {
    const v = t.$value;
    const size = resolve(tokens, v.fontSize), weight = resolve(tokens, v.fontWeight);
    const line = Math.round(size.value * v.lineHeight);
    const sizeCss = isRef(v.fontSize) ? varOf(v.fontSize) : fontVar(tokens, 'size-', size) ?? dim(size);
    const weightCss = isRef(v.fontWeight) ? varOf(v.fontWeight) : fontVar(tokens, 'weight-', weight) ?? weight;
    const lineCss = fontVar(tokens, 'line-height-', {value: line, unit: 'px'}) ?? `${line}px`;
    const familyVar = isRef(v.fontFamily) ? varOf(v.fontFamily) : 'var(--gv-font-family)';
    roleLines.push(`--gv-type-${role}: ${weightCss} ${sizeCss}/${lineCss} ${familyVar};${note(t)}`);
    // One tracking for every role, set once on :root (theme.css). A role that ever needs its own gets its own token
    // and a guard for that role; until then a role that tracks differently is refused.
    const tracking = resolve(tokens, v.letterSpacing), one = font.tracking && resolve(tokens, font.tracking.$value);
    if (one && (tracking.value !== one.value || tracking.unit !== one.unit))
      throw new Error(`type.${role} tracks ${dim(tracking)}, not --gv-font-tracking (${dim(one)}): give it its own token`);
  }
  sections.push(roleLines);

  sections.push(block('Shadow', 'Shadow', Object.entries(tokens.shadow).map(([name, t]) =>
    `--gv-shadow-${name}: ${t.$value.map(s =>
      `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${rgb(s.color)}`).join(', ')};${note(t)}`)));

  // The addon has Animation and Easing presenters; the Motion page gives durations its own (a bar that plays them).
  const durations = Object.entries(tokens.motion?.duration ?? {});
  sections.push(block('Motion duration', 'Animation', durations.map(([n, t]) =>
    `--gv-motion-duration-${n}: ${time(t.$value, `motion.duration.${n}`)};${note(t)}`)));
  sections.push(block('Motion easing', 'Easing', Object.entries(tokens.motion?.easing ?? {}).map(([n, t]) =>
    `--gv-motion-easing-${n}: ${bezier(t.$value, `motion.easing.${n}`)};${note(t)}`)));

  // Reduced motion: each duration that names a reduced value resolves to it (1ms, near zero but not 0, so React
  // Aria's exit animations still run and end and the overlay unmounts). Kept outside the @tokens blocks: the addon's
  // table shows the real values.
  const reduced = durations.filter(([, t]) => t.$extensions?.[REDUCED]).map(([n, t]) =>
    `    --gv-motion-duration-${n}: ${time(t.$extensions[REDUCED], `motion.duration.${n} ${REDUCED}`)};`);
  const media = reduced.length ? `\n/* Reduced motion (Not in Figma): near-zero durations; loops are stopped by their components. */\n` +
    `@media (prefers-reduced-motion: reduce) {\n  :root {\n${reduced.join('\n')}\n  }\n}\n` : '';

  const body = sections.filter(s => s.length).map(lines => lines.map(l => `  ${l}`).join('\n')).join('\n\n');
  return `/* Generated by scripts/build-tokens.mjs from tokens/foundations.tokens.json (Figma), ` +
    `tokens/semantic.tokens.json, motion.tokens.json and size.tokens.json (Not in Figma). Do not edit by hand. */\n` +
    `:root {\n${body}\n}\n${media}`;
}

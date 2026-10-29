const rgb = c => {
  const [r, g, b] = c.components.map(v => Math.round(v * 255));
  return c.alpha >= 1 ? c.hex : `rgb(${r} ${g} ${b} / ${c.alpha})`;
};
const ref = v => `var(--gv-${v.slice(1, -1).replaceAll('.', '-')})`;
const dim = d => `${d.value}${d.unit}`;

// storybook-design-token (addon) reads "/** @tokens <Category> @presenter <Presenter> */ ... */
// /** @tokens-end */" blocks inside the stylesheet it's pointed at. One block per semantic group
// (plus the primitive scales), all annotated so the Foundations page can group and filter them.
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

export function toCss(tokens) {
  const sections = [];

  const colorLines = [];
  for (const [family, steps] of Object.entries(tokens.color))
    for (const [step, t] of Object.entries(steps)) colorLines.push(`--gv-color-${family}-${step}: ${rgb(t.$value)};`);
  sections.push(block('Colour primitives', 'Color', colorLines));

  const families = new Set(Object.values(tokens.type).map(t => t.$value.fontFamily));
  if (families.size !== 1) throw new Error(`expected one font family, got ${[...families]}`);
  const fontFamilyLine = `--gv-font-family: '${[...families][0]}', system-ui, sans-serif;`;
  sections.push(block('Font family', 'FontFamily', [fontFamilyLine]));

  for (const [group, roles] of Object.entries(tokens)) {
    if (['color', 'space', 'radius', 'type', 'shadow', 'motion'].includes(group)) continue;
    const lines = Object.entries(roles).map(([role, t]) => `--gv-${group}-${role}: ${ref(t.$value)};`);
    sections.push(block(group, 'Color', lines));
  }

  sections.push(block('Space', 'Spacing', Object.entries(tokens.space).map(([n, t]) => `--gv-space-${n}: ${dim(t.$value)};`)));
  sections.push(block('Radius', 'BorderRadius', Object.entries(tokens.radius).map(([n, t]) => `--gv-radius-${n}: ${dim(t.$value)};`)));

  // The addon has FontSize / LineHeight / FontWeight presenters but none for a "font" shorthand:
  // split each type role into its own size/line/weight vars for those presenters, and keep the
  // shorthand (+ tracking) vars too, unannotated, for components that already paint with them.
  const shorthandLines = [];
  const sizeLines = [], lineLines = [], weightLines = [];
  for (const [role, t] of Object.entries(tokens.type)) {
    const v = t.$value, line = Math.round(v.fontSize.value * v.lineHeight);
    shorthandLines.push(`--gv-type-${role}: ${v.fontWeight} ${dim(v.fontSize)}/${line}px var(--gv-font-family);`);
    shorthandLines.push(`--gv-type-${role}-tracking: ${dim(v.letterSpacing)};`);
    sizeLines.push(`--gv-type-${role}-size: ${dim(v.fontSize)};`);
    lineLines.push(`--gv-type-${role}-line: ${line}px;`);
    weightLines.push(`--gv-type-${role}-weight: ${v.fontWeight};`);
  }
  sections.push(block('Font size', 'FontSize', sizeLines));
  sections.push(block('Line height', 'LineHeight', lineLines));
  sections.push(block('Font weight', 'FontWeight', weightLines));
  if (shorthandLines.length) sections.push(shorthandLines);

  sections.push(block('Shadow', 'Shadow', Object.entries(tokens.shadow).map(([name, t]) =>
    `--gv-shadow-${name}: ${t.$value.map(s =>
      `${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${rgb(s.color)}`).join(', ')};`)));

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
  return `/* Generated by scripts/build-tokens.mjs from tokens/foundations.tokens.json (Figma) and ` +
    `tokens/motion.tokens.json (Not in Figma). Do not edit by hand. */\n` +
    `:root {\n${body}\n}\n${media}`;
}

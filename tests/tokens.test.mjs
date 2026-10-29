import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {parseFoundations} from '../scripts/lib/foundations.mjs';
import {toCss} from '../scripts/lib/css.mjs';
import {mergeTokens} from '../scripts/lib/merge.mjs';
import {parseIcons} from '../scripts/lib/icons.mjs';

const text = (name, chars, style = {}) => ({type: 'TEXT', name, characters: chars, style});
const swatch = (path, prim, color, opacity, id) => ({type: 'FRAME', name: path, children: [
  {type: 'RECTANGLE', name: 'Swatch', fills: [{type: 'SOLID', color, opacity}],
    boundVariables: {fills: [{type: 'VARIABLE_ALIAS', id}]}},
  text(path.split('/')[1], path.split('/')[1]), text(prim, prim)]});
const page = {type: 'CANVAS', name: 'Foundations', children: [{type: 'FRAME', name: 'Foundations', children: [
  {type: 'FRAME', name: 'Color', children: [{type: 'FRAME', name: 'surface', children: [
    {type: 'FRAME', name: 'surface swatches', children: [
      swatch('surface/app', 'slate/100', {r: 0.929, g: 0.937, b: 0.941, a: 1}, undefined, 'VariableID:1:38'),
      swatch('surface/hover-strong', 'slate/100', {r: 0.929, g: 0.937, b: 0.941, a: 1}, undefined, 'VariableID:1:43'),
      swatch('surface/live', 'alpha/green-12', {r: 0.031, g: 0.514, b: 0.227, a: 1}, 0.12, 'VariableID:10:4')]}]}]},
  {type: 'FRAME', name: 'Typography', children: [{type: 'FRAME', name: 'Stat small', children: [
    {type: 'FRAME', name: 'Label', children: [text('Stat small', 'Stat small'), text('20/24 Medium', '20/24 Medium')]},
    text('sample', 'Small number tiles', {fontFamily: 'Public Sans', fontSize: 20, lineHeightPx: 24, fontWeight: 500, letterSpacing: 0})]}]},
  {type: 'FRAME', name: 'space/14', children: [text('space/14', 'space/14'),
    {type: 'RECTANGLE', name: 'Bar', absoluteBoundingBox: {width: 14, height: 12},
      boundVariables: {size: {x: {type: 'VARIABLE_ALIAS', id: 'VariableID:1:100'}}}}]},
  {type: 'FRAME', name: 'space/0', children: [text('space/0', 'space/0'),
    {type: 'RECTANGLE', name: 'Bar', absoluteBoundingBox: {width: 1, height: 12}}]},
  {type: 'FRAME', name: 'radius/full', children: [{type: 'RECTANGLE', name: 'Shape', cornerRadius: 999,
    boundVariables: {rectangleCornerRadii: {RECTANGLE_TOP_LEFT_CORNER_RADIUS: {type: 'VARIABLE_ALIAS', id: 'VariableID:1:119'}}}},
    text('radius/full', 'radius/full')]},
  {type: 'FRAME', name: 'shadow/dialog', children: [{type: 'FRAME', name: 'Sample', effects: [{type: 'DROP_SHADOW',
    visible: true, color: {r: 0.0588, g: 0.0784, b: 0.1373, a: 0.24}, offset: {x: 0, y: 24}, radius: 60}]},
    text('shadow/dialog', 'shadow/dialog')]}]}]};

describe('parseFoundations', () => {
  const {tokens, variableIds} = parseFoundations(page);
  it('keeps primitives once and points semantic roles at them', () => {
    expect(tokens.color.slate['100'].$value.hex).toBe('#edeff0');
    expect(tokens.surface.app.$value).toBe('{color.slate.100}');
    expect(tokens.surface['hover-strong'].$value).toBe('{color.slate.100}');
  });
  it('reads alpha from the paint opacity', () => {
    expect(tokens.color.alpha['green-12'].$value.alpha).toBeCloseTo(0.12, 2);
  });
  it('reads type, space, radius and shadow', () => {
    expect(tokens.type['stat-small'].$value).toMatchObject({fontFamily: 'Public Sans', fontWeight: 500,
      fontSize: {value: 20, unit: 'px'}, lineHeight: 1.2});
    expect(tokens.space['14'].$value).toEqual({value: 14, unit: 'px'});
    // Figma can't draw a 0-wide bar, so space/0 is drawn 1px wide: the name wins.
    expect(tokens.space['0'].$value).toEqual({value: 0, unit: 'px'});
    expect(tokens.radius.full.$value).toEqual({value: 9999, unit: 'px'});
    expect(tokens.shadow.dialog.$value[0]).toMatchObject({offsetY: {value: 24, unit: 'px'}, blur: {value: 60, unit: 'px'}});
  });
  it('maps Figma variable ids to CSS names', () => {
    expect(variableIds['VariableID:1:38']).toBe('--gv-surface-app');
    expect(variableIds['VariableID:1:100']).toBe('--gv-space-14');
    expect(variableIds['VariableID:1:119']).toBe('--gv-radius-full');
  });
  it('refuses one primitive with two values', () => {
    const bad = structuredClone(page);
    bad.children[0].children[0].children[0].children[0].children[1].children[0].fills[0].color.r = 0.5;
    expect(() => parseFoundations(bad)).toThrow(/slate\/100/);
  });
});

describe('toCss', () => {
  const css = toCss(parseFoundations(page).tokens);
  it('writes primitives, semantic aliases and scales', () => {
    expect(css).toContain('--gv-color-slate-100: #edeff0;');
    expect(css).toContain('--gv-surface-app: var(--gv-color-slate-100);');
    expect(css).toMatch(/--gv-color-alpha-green-12: rgb\(8 131 58 \/ 0\.12\);/);
    expect(css).toContain('--gv-space-14: 14px;');
    expect(css).toContain('--gv-radius-full: 9999px;');
    expect(css).toContain("--gv-type-stat-small: 500 20px/24px var(--gv-font-family);");
    expect(css).toContain("--gv-font-family: 'Public Sans', system-ui, sans-serif;");
    expect(css).toMatch(/--gv-shadow-dialog: 0px 24px 60px 0px rgb\(15 20 35 \/ 0\.24\);/);
  });
});

describe('toCss annotations for storybook-design-token', () => {
  const css = toCss(parseFoundations(page).tokens);
  it('opens one annotated category per kind', () => {
    for (const c of ['Colour primitives @presenter Color', 'surface @presenter Color', 'Space @presenter Spacing',
      'Radius @presenter BorderRadius', 'Font size @presenter FontSize', 'Line height @presenter LineHeight',
      'Font weight @presenter FontWeight', 'Shadow @presenter Shadow'])
      expect(css).toContain(`/** @tokens ${c} */`);
  });
  it('splits type roles for the presenters', () => {
    expect(css).toContain('--gv-type-stat-small-size: 20px;');
    expect(css).toContain('--gv-type-stat-small-line: 24px;');
    expect(css).toContain('--gv-type-stat-small-weight: 500;');
  });
});

describe('parseIcons', () => {
  it('drops size suffixes and the Icon/ prefix, and dedupes', () => {
    const iconsPage = {type: 'CANVAS', name: 'Icons', children: [{type: 'FRAME', name: 'Icons', children: [
      {type: 'COMPONENT', name: 'x'},
      {type: 'COMPONENT', name: 'link/16'},
      {type: 'COMPONENT', name: 'link/20'},
      {type: 'COMPONENT', name: 'chevron-right-thin'}
    ]}]};
    expect(parseIcons(iconsPage)).toEqual(['chevron-right-thin', 'link', 'x']);
  });
});

// Motion is Not in Figma: hand-authored in tokens/motion.tokens.json, merged at build time, never pulled.
const ms = (value, unit = 'ms') => ({value, unit});
const motionFile = {
  $description: 'Not in Figma',
  motion: {
    duration: {
      fast: {$type: 'duration', $value: ms(120), $description: 'Hover and press.',
        $extensions: {'com.govocal.reducedMotion': ms(1)}},
      loop: {$type: 'duration', $value: ms(1.6, 's')}
    },
    easing: {standard: {$type: 'cubicBezier', $value: [0.25, 0.1, 0.25, 1], $description: 'In place.'}}
  }
};

describe('mergeTokens', () => {
  const figma = parseFoundations(page).tokens;
  it('adds the hand-authored groups to the Figma ones, leaving the Figma ones as they are', () => {
    const merged = mergeTokens(figma, motionFile);
    expect(merged.motion.duration.fast.$value).toEqual(ms(120));
    expect(merged.surface).toBe(figma.surface);
    expect(merged.$description).toBeUndefined();
    expect(figma.motion).toBeUndefined();
  });
  it('refuses a group that both files define', () => {
    expect(() => mergeTokens({...figma, motion: {}}, motionFile)).toThrow(/motion/);
  });
  it('a Figma pull writes only the Figma files', () => {
    const pull = readFileSync('scripts/figma-pull.mjs', 'utf8');
    expect(pull).not.toMatch(/motion|size\.tokens/);
    expect(readFileSync('scripts/build-tokens.mjs', 'utf8')).toContain('tokens/motion.tokens.json');
    expect(readFileSync('scripts/build-tokens.mjs', 'utf8')).toContain('tokens/size.tokens.json');
  });
});

describe('toCss motion', () => {
  const css = toCss(mergeTokens(parseFoundations(page).tokens, motionFile));
  it('writes durations and easings, annotated for the Animation and Easing presenters', () => {
    expect(css).toContain('/** @tokens Motion duration @presenter Animation */');
    expect(css).toContain('--gv-motion-duration-fast: 120ms; /* Hover and press. */');
    expect(css).toContain('--gv-motion-duration-loop: 1.6s;');
    expect(css).toContain('/** @tokens Motion easing @presenter Easing */');
    expect(css).toContain('--gv-motion-easing-standard: cubic-bezier(0.25, 0.1, 0.25, 1); /* In place. */');
  });
  it('shortens a duration under reduced motion only where the token says so', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(reduced).toMatch(/^@media \(prefers-reduced-motion: reduce\) \{\n {2}:root \{\n {4}--gv-motion-duration-fast: 1ms;\n {2}\}\n\}\n$/);
    expect(reduced).not.toContain('loop');
  });
  it('writes no motion and no media block without motion tokens', () => {
    const plain = toCss(parseFoundations(page).tokens);
    expect(plain).not.toContain('--gv-motion');
    expect(plain).not.toContain('@media');
  });
  it('refuses a duration without a time unit and a curve that is not four numbers in range', () => {
    const bad = (duration, easing) => () => toCss(mergeTokens(parseFoundations(page).tokens,
      {motion: {duration: {x: {$type: 'duration', $value: duration}}, easing: {y: {$type: 'cubicBezier', $value: easing}}}}));
    expect(bad({value: 120, unit: 'px'}, [0, 0, 1, 1])).toThrow(/motion.duration.x/);
    expect(bad(ms(120), [0, 0, 1])).toThrow(/motion.easing.y/);
    expect(bad(ms(120), [1.2, 0, 1, 1])).toThrow(/motion.easing.y/);
  });
});

// Sizes are Not in Figma too: hand-authored in tokens/size.tokens.json, one group per kind, each named by its value.
const px = value => ({$type: 'dimension', $value: {value, unit: 'px'}});
const sizeFile = {
  $description: 'Not in Figma',
  size: {
    icon: {'16': {...px(16), $description: 'The default icon.'}, '20': px(20)},
    control: {'36': {...px(36), $description: 'Fields and the default Button.'}}
  }
};

describe('toCss size', () => {
  const css = toCss(mergeTokens(parseFoundations(page).tokens, motionFile, sizeFile));
  it('writes one block per kind, annotated for the Spacing presenter, with each description', () => {
    expect(css).toContain('/** @tokens Icon size @presenter Spacing */');
    expect(css).toContain('--gv-size-icon-16: 16px; /* The default icon. */');
    expect(css).toContain('--gv-size-icon-20: 20px;');
    expect(css).toContain('/** @tokens Control height @presenter Spacing */');
    expect(css).toContain('--gv-size-control-36: 36px; /* Fields and the default Button. */');
  });
  it('writes no size without size tokens', () => {
    expect(toCss(parseFoundations(page).tokens)).not.toContain('--gv-size');
  });
  it('refuses a size that is not px, not named by its value, or of an unknown kind', () => {
    const bad = size => () => toCss(mergeTokens(parseFoundations(page).tokens, {size}));
    expect(bad({icon: {'16': {$type: 'dimension', $value: {value: 1, unit: 'rem'}}}})).toThrow(/size.icon.16/);
    expect(bad({icon: {'16': px(15)}})).toThrow(/size.icon.16/);
    expect(bad({icon: {'0': px(0)}})).toThrow(/size.icon.0/);
    expect(bad({gutter: {'16': px(16)}})).toThrow(/size.gutter/);
  });
});

describe('src/tokens.css', () => {
  it('is the build of the Figma file, the motion file and the size file (run npm run tokens:build)', () => {
    const read = path => JSON.parse(readFileSync(path, 'utf8'));
    expect(readFileSync('src/tokens.css', 'utf8')).toBe(toCss(mergeTokens(read('tokens/foundations.tokens.json'),
      read('tokens/motion.tokens.json'), read('tokens/size.tokens.json'))));
  });
});

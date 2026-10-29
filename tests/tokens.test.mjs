import {describe, it, expect} from 'vitest';
import {readFileSync, existsSync} from 'node:fs';
import {parseFoundations} from '../scripts/lib/foundations.mjs';
import {toCss} from '../scripts/lib/css.mjs';
import {mergeTokens, describe as describeTokens} from '../scripts/lib/merge.mjs';
import {loadTokens} from '../scripts/lib/build.mjs';
import {cssOf} from '../scripts/lib/names.mjs';
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
    {...text('sample', 'Small number tiles', {fontFamily: 'Public Sans', fontSize: 20, lineHeightPx: 24, fontWeight: 500, letterSpacing: 0}),
      boundVariables: Object.fromEntries([['fontFamily', '1:141'], ['fontSize', '45:2'], ['lineHeight', '1:163'],
        ['fontWeight', '1:167'], ['letterSpacing', '1:169']].map(([k, id]) => [k, [{type: 'VARIABLE_ALIAS', id: `VariableID:${id}`}]]))}]}]},
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
  it('names nothing differently from Figma when the id map agrees, so the report is empty', () => {
    expect(parseFoundations(page, {names: variableIds}).report).toEqual([]);
  });
  it('refuses one primitive with two values', () => {
    const bad = structuredClone(page);
    bad.children[0].children[0].children[0].children[0].children[1].children[0].fills[0].color.r = 0.5;
    expect(() => parseFoundations(bad)).toThrow(/slate\/100/);
  });
});

describe('parseFoundations names tokens by Figma variable id', () => {
  const names = {'VariableID:1:38': '--gv-surface-app', 'VariableID:1:43': '--gv-surface-pressed',
    'VariableID:10:4': '--gv-surface-success', 'VariableID:1:100': '--gv-space-14', 'VariableID:1:119': '--gv-radius-full'};
  it('takes the name the id map gives, whatever the frame is called, and reports where Figma differs', () => {
    const {tokens, report} = parseFoundations(page, {names});
    expect(tokens.surface.pressed.$value).toBe('{color.slate.100}');
    expect(tokens.surface['hover-strong']).toBeUndefined();
    expect(report.map(r => r.text)).toEqual([
      'Figma still calls VariableID:1:43 `surface/hover-strong`; code calls it `--gv-surface-pressed`',
      'Figma still calls VariableID:10:4 `surface/live`; code calls it `--gv-surface-success`']);
  });
  it('gives an id the map lacks its frame name, adds it to the map and says so', () => {
    const {tokens, variableIds, report} = parseFoundations(page, {names: {}});
    expect(tokens.surface.live.$value).toBe('{color.alpha.green-12}');
    expect(variableIds['VariableID:10:4']).toBe('--gv-surface-live');
    expect(report.filter(r => r.kind === 'new')).toHaveLength(5);
  });
  it('drops a merged or dropped id (the target wins) and reports it until Figma deletes it', () => {
    const renames = [
      {from: '--gv-surface-pressed', to: '--gv-surface-app', figmaId: 'VariableID:1:43', merge: true, why: 'same value'},
      {from: '--gv-space-14', drop: '14px', figmaId: 'VariableID:1:100', why: 'not on the scale'}];
    const {tokens, report} = parseFoundations(page, {names, renames});
    expect(Object.keys(tokens.surface)).toEqual(['app', 'success']);
    expect(tokens.space['14']).toBeUndefined();
    expect(report.map(r => r.text)).toEqual(expect.arrayContaining([
      'Figma still has VariableID:1:43 `surface/hover-strong` (slate/100); code merged it into `--gv-surface-app` (same value)',
      'Figma still has VariableID:1:100 `space/14`; code dropped it (not on the scale)']));
  });
  it('renames what has no variable id (primitives, shadows) by the rename map', () => {
    const renames = [{from: '--gv-color-slate-100', to: '--gv-color-grey-100'}, {from: '--gv-shadow-dialog', to: '--gv-shadow-overlay'}];
    const {tokens, report} = parseFoundations(page, {names, renames});
    expect(tokens.color.grey['100'].$value.hex).toBe('#edeff0');
    expect(tokens.surface.app.$value).toBe('{color.grey.100}');
    expect(tokens.shadow.overlay.$value[0].blur).toEqual({value: 60, unit: 'px'});
    expect(report.map(r => r.text)).toEqual(expect.arrayContaining([
      'Figma still calls `slate/100`; code calls it `--gv-color-grey-100`',
      'Figma still calls `shadow/dialog`; code calls it `--gv-shadow-overlay`']));
  });
  it('refuses two variables that would share one name unless one is marked a merge', () => {
    expect(() => parseFoundations(page, {names: {...names, 'VariableID:1:43': '--gv-surface-app'}}))
      .toThrow(/VariableID:1:38 and VariableID:1:43 are both named --gv-surface-app/);
  });
});

// The cached Figma file (.cache/, linked from the main checkout; never downloaded by a test). CI has no cache: skipped.
const cache = 'tokens/figma.config.json';
const cacheFile = existsSync(cache) && `.cache/figma-${JSON.parse(readFileSync(cache, 'utf8')).fileKey}.json`;
describe.skipIf(!cacheFile || !existsSync(cacheFile))('the cached Figma file', () => {
  it('pulls to exactly the committed Figma token files and report (npm run tokens:pull -- --cached)', async () => {
    const {page: pageOf, config} = await import('../scripts/lib/figma.mjs');
    const file = JSON.parse(readFileSync(cacheFile, 'utf8'));
    const read = path => JSON.parse(readFileSync(path, 'utf8'));
    const renames = existsSync('tokens/renames.json') ? read('tokens/renames.json').renames : [];
    const pulled = parseFoundations(pageOf(file, config.foundationsPage), {names: read('tokens/variable-ids.json'), renames});
    expect(pulled.tokens).toEqual(read('tokens/foundations.tokens.json'));
    expect(pulled.variableIds).toEqual(read('tokens/variable-ids.json'));
    expect(pulled.report).toEqual(read('tokens/figma-report.json').report);
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

// The font primitives, hand-written (tokens/semantic.tokens.json) with the Figma ids the samples bind.
const fontFile = {font: {
  family: {$type: 'fontFamily', $value: ['Public Sans', 'system-ui', 'sans-serif'], $description: 'The face.'},
  'size-20': {$type: 'dimension', $value: {value: 20, unit: 'px'}, $description: 'Stat small.'},
  'line-height-24': {$type: 'dimension', $value: {value: 24, unit: 'px'}},
  'weight-medium': {$type: 'fontWeight', $value: 500},
  tracking: {$type: 'dimension', $value: {value: 0, unit: 'px'}}}};
const fontIds = {'VariableID:1:141': '--gv-font-family', 'VariableID:45:2': '--gv-font-size-20',
  'VariableID:1:163': '--gv-font-line-height-24', 'VariableID:1:167': '--gv-font-weight-medium', 'VariableID:1:169': '--gv-font-tracking'};

describe('parseFoundations reads the font variables a type sample binds', () => {
  it('writes each bound part as a reference to its font token, and the line height as DTCG\'s ratio', () => {
    expect(parseFoundations(page, {names: fontIds}).tokens.type['stat-small'].$value).toEqual({fontFamily: '{font.family}',
      fontSize: '{font.size-20}', lineHeight: 1.2, fontWeight: '{font.weight-medium}', letterSpacing: '{font.tracking}'});
  });
  it('keeps the drawn value of a part whose variable has no name', () => {
    expect(parseFoundations(page).tokens.type['stat-small'].$value.fontSize).toEqual({value: 20, unit: 'px'});
  });
});

describe('toCss annotations for storybook-design-token', () => {
  const css = toCss(parseFoundations(page).tokens);
  it('opens one annotated category per kind', () => {
    const withFont = toCss(mergeTokens(parseFoundations(page).tokens, fontFile));
    for (const c of ['Colour primitives @presenter Color', 'surface @presenter Color', 'Space @presenter Spacing',
      'Radius @presenter BorderRadius', 'Font size @presenter FontSize', 'Line height @presenter LineHeight',
      'Font weight @presenter FontWeight', 'Letter spacing @presenter LetterSpacing', 'Shadow @presenter Shadow'])
      expect(withFont).toContain(`/** @tokens ${c} */`);
  });
  it('writes the font primitives, each with its description as the line comment', () => {
    const withFont = toCss(mergeTokens(parseFoundations(page).tokens, fontFile));
    expect(withFont).toContain('/** @tokens Font size @presenter FontSize */\n  --gv-font-size-20: 20px; /* Stat small. */');
    expect(withFont).toContain('--gv-font-line-height-24: 24px;');
    expect(withFont).toContain('--gv-font-weight-medium: 500;');
    expect(withFont).toContain("--gv-font-family: 'Public Sans', system-ui, sans-serif; /* The face. */");
    expect(withFont).toContain('/** @tokens Letter spacing @presenter LetterSpacing */\n  --gv-font-tracking: 0px;');
  });
  it('builds each role from the font primitives, by reference or by value', () => {
    const fromRefs = toCss(mergeTokens(parseFoundations(page, {names: fontIds}).tokens, fontFile));
    expect(fromRefs).toContain('--gv-type-stat-small: var(--gv-font-weight-medium) var(--gv-font-size-20)/var(--gv-font-line-height-24) var(--gv-font-family);');
    // A role pulled without bound variables (literal parts) finds the same primitives by value.
    expect(toCss(mergeTokens(parseFoundations(page).tokens, fontFile))).toContain(
      '--gv-type-stat-small: var(--gv-font-weight-medium) var(--gv-font-size-20)/var(--gv-font-line-height-24) var(--gv-font-family);');
  });
  it('writes no per-role size, line, weight or tracking: an override takes a font primitive', () => {
    expect(css).not.toMatch(/--gv-type-[a-z-]+-(size|line|weight|tracking):/);
  });
  it('refuses a role that tracks differently from --gv-font-tracking', () => {
    const tokens = mergeTokens(parseFoundations(page).tokens, fontFile);
    tokens.type['stat-small'].$value.letterSpacing = {value: 0.5, unit: 'px'};
    expect(() => toCss(tokens)).toThrow(/type.stat-small tracks 0.5px/);
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
  it('merges by token path: a hand-written token joins a Figma group', () => {
    const merged = mergeTokens(figma, {surface: {danger: {$type: 'color', $value: '{color.slate.100}'}}});
    expect(Object.keys(merged.surface)).toEqual(['app', 'hover-strong', 'live', 'danger']);
    expect(figma.surface.danger).toBeUndefined();
  });
  it('refuses a token path that two files define, naming it', () => {
    expect(() => mergeTokens(figma, {surface: {app: {$type: 'color', $value: '{color.slate.100}'}}}))
      .toThrow(/token "surface.app" is in two token files/);
    expect(() => mergeTokens(figma, {surface: {app: {deeper: {$type: 'color', $value: '{x}'}}}})).toThrow(/surface.app/);
  });
  it('a Figma pull writes only the Figma files', () => {
    const pull = readFileSync('scripts/figma-pull.mjs', 'utf8');
    expect(pull).not.toMatch(/motion|size\.tokens|semantic\.tokens/);
    const build = readFileSync('scripts/lib/build.mjs', 'utf8');
    for (const f of ['motion', 'size', 'semantic']) expect(build).toContain(`tokens/${f}.tokens.json`);
  });
});

describe('describe (tokens/descriptions.json)', () => {
  const tree = () => ({surface: {app: {$type: 'color', $value: '{color.slate.100}'}},
    color: {slate: {'50': {$type: 'color', $value: {}}, '100': {$type: 'color', $value: {}}}}});
  const name = path => cssOf(...path);
  it('lays a description on each token by CSS name, and a `-*` key on a whole ramp', () => {
    const out = describeTokens(tree(), {'--gv-surface-app': 'The page.', '--gv-color-slate-*': 'Cool grey.',
      '--gv-color-slate-50': 'The lightest.'}, name);
    expect(out.surface.app.$description).toBe('The page.');
    expect(out.color.slate['50'].$description).toBe('The lightest.');
    expect(out.color.slate['100'].$description).toBe('Cool grey.');
  });
  it('refuses a name that is no token, and a token described twice', () => {
    expect(() => describeTokens(tree(), {'--gv-surface-gone': 'x'}, name)).toThrow(/--gv-surface-gone/);
    const t = tree(); t.surface.app.$description = 'Own.';
    expect(() => describeTokens(t, {'--gv-surface-app': 'x'}, name)).toThrow(/--gv-surface-app has a \$description/);
  });
  it('leaves the tree it was given alone', () => {
    const t = tree();
    describeTokens(t, {'--gv-surface-app': 'x'}, name);
    expect(t.surface.app.$description).toBeUndefined();
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
  it('is the build of the Figma file, the hand-written ones and the descriptions (run npm run tokens:build)', () => {
    expect(readFileSync('src/tokens.css', 'utf8')).toBe(toCss(loadTokens()));
  });
  it('describes every token', () => {
    const missing = [];
    const walk = (node, path) => Object.entries(node).forEach(([k, v]) => {
      if (k.startsWith('$') || typeof v !== 'object') return;
      if ('$value' in v) { if (!v.$description?.trim()) missing.push(cssOf(...path, k)); } else walk(v, [...path, k]);
    });
    walk(loadTokens(), []);
    expect(missing).toEqual([]);
  });
  it('every Figma id on a hand-written token is the one tokens/variable-ids.json gives that name', () => {
    const ids = JSON.parse(readFileSync('tokens/variable-ids.json', 'utf8'));
    const marked = [];
    const walk = (node, path) => Object.entries(node).forEach(([k, v]) => {
      if (k.startsWith('$') || typeof v !== 'object') return;
      if ('$value' in v) { const id = v.$extensions?.['com.figma.variableId']; if (id) marked.push([id, `--gv-${[...path, k].join('-')}`]); }
      else walk(v, [...path, k]);
    });
    for (const f of ['tokens/semantic.tokens.json', 'tokens/size.tokens.json']) walk(JSON.parse(readFileSync(f, 'utf8')), []);
    expect(marked.length).toBeGreaterThan(10);
    for (const [id, name] of marked) expect(ids[id], id).toBe(name);
  });
});

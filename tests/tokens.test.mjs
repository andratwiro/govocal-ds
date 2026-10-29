import {describe, it, expect} from 'vitest';
import {parseFoundations} from '../scripts/lib/foundations.mjs';
import {toCss} from '../scripts/lib/css.mjs';

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

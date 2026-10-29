import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {compile, classify, paintValue, renameCss, renameScript, renameValue, retired} from '../scripts/lib/rename.mjs';

// The codemod's rules (scripts/lib/rename.mjs), on fixtures: one entry of each kind tokens/renames.json holds.
const map = {
  renames: [
    {from: '--gv-surface-stage', to: '--gv-surface-tertiary', figmaId: 'VariableID:1:40', why: 'rename'},
    {from: '--gv-surface-hover-strong', to: '--gv-surface-pressed', flag: 'pressed|active', why: 'state word'},
    {from: '--gv-icon-quiet', to: '--gv-icon-disabled', when: 'disabled', why: 'disabled'},
    {from: '--gv-text-accent', to: '--gv-text-link', figmaId: 'VariableID:1:58', why: 'split',
      by: {link: '--gv-text-link', icon: '--gv-icon-brand', text: '--gv-text-brand'}},
    {from: '--gv-action-primary', to: '--gv-surface-brand-strong', why: 'split',
      by: {surface: '--gv-surface-brand-strong', border: '--gv-border-selected', text: '--gv-text-brand', icon: '--gv-icon-brand'}},
    {from: '--gv-type-ui-tracking', delete: true, why: 'one tracking on :root'},
    {from: '--gv-type-ui-weight', to: '--gv-font-weight-regular', why: 'by value'},
    {from: '--gv-space-1', drop: '1px', scale: '--gv-space-2', why: 'an offset, not a space'},
    {from: '--gv-space-14', to: '--gv-space-16', merge: true, snap: true, why: 'base 4'},
    {from: '--gv-space-3', drop: '3px', scale: '--gv-space-4', why: 'an offset, not a space'},
  ],
  paint: {
    primitives: [
      {from: '--gv-color-red-500', by: {surface: '--gv-surface-danger-strong', text: '--gv-text-danger', icon: '--gv-icon-danger'}},
      {from: '--gv-color-navy-900', when: 'hover', by: {text: '--gv-text-link-hovered'}},
    ],
    tints: [
      {mix: ['--gv-color-red-500'], pct: [10, 12], to: '--gv-surface-danger'},
      {mix: ['--gv-icon-warning'], pct: [30], to: '--gv-border-warning'},
    ],
  },
  starter: {'--spacing-3': '--gv-space-12', '--focus-ring-color': '--gv-border-focused',
    '--highlight-background': '--gv-action-primary', '--border-color': '--gv-border-control'},
};
const rules = compile(map);
const css = src => renameCss(src, rules, {file: 'x.css'});

describe('renameCss', () => {
  it('renames a plain name, and only a whole name', () => {
    expect(css('a { background: var(--gv-surface-stage); }').text).toBe('a { background: var(--gv-surface-tertiary); }');
    expect(css('a { background: var(--gv-surface-stage-x); }').text).toBe('a { background: var(--gv-surface-stage-x); }');
  });
  it('splits a name by the property it paints', () => {
    const out = css(`.b {
  background: var(--gv-action-primary);
  border: 1px solid var(--gv-action-primary);
  color: var(--gv-action-primary);
  --button-color: var(--gv-action-primary);
  & svg { color: var(--gv-action-primary); }
}
a.link { color: var(--gv-text-accent); }`).text;
    expect(out).toContain('background: var(--gv-surface-brand-strong);');
    expect(out).toContain('border: 1px solid var(--gv-border-selected);');
    expect(out).toContain('  color: var(--gv-text-brand);');
    expect(out).toContain('--button-color: var(--gv-surface-brand-strong);');
    expect(out).toContain('& svg { color: var(--gv-icon-brand); }');
    expect(out).toContain('a.link { color: var(--gv-text-link); }');
  });
  it('lists a split name on a property that says nothing, and leaves it', () => {
    const {text, notes} = css('a { --x: var(--gv-action-primary); }');
    expect(text).toContain('var(--gv-action-primary)');
    expect(notes.join()).toMatch(/x\.css:1: --gv-action-primary on --x: can't tell/);
  });
  it('renames a `when` name only in its state', () => {
    expect(css('a[data-disabled] { color: var(--gv-icon-quiet); }').text).toContain('--gv-icon-disabled');
    expect(css('a { color: var(--gv-icon-quiet); }').text).toContain('--gv-icon-quiet');
  });
  it('renames a flagged name everywhere and lists a use outside its state', () => {
    expect(css('a[data-pressed] { background: var(--gv-surface-hover-strong); }').notes).toEqual([]);
    expect(css(':root { --button-background-pressed: var(--gv-surface-hover-strong); }').notes).toEqual([]);
    const {text, notes} = css('a[data-selected] { background: var(--gv-surface-hover-strong); }');
    expect(text).toContain('--gv-surface-pressed');
    expect(notes.join()).toMatch(/outside a pressed\|active state/);
  });
  it('snaps a space step to the scale', () => {
    expect(css('a { gap: var(--gv-space-14); }').text).toBe('a { gap: var(--gv-space-16); }');
  });
  it('turns a dropped step into the raw offset on a position or stroke, else the scale step', () => {
    expect(css('a { margin-top: var(--gv-space-1); padding: var(--gv-space-1) 0; }').text)
      .toBe('a { margin-top: 1px; padding: var(--gv-space-2) 0; }');
    expect(css('a { top: calc(-1 * var(--gv-space-1)); }').text).toBe('a { top: -1px; }');
    expect(css('a { border: var(--gv-space-1) solid var(--x); inset: var(--gv-space-3); }').text)
      .toBe('a { border: 1px solid var(--x); inset: 3px; }');
    // A size computed from a padding moves with the padding.
    expect(css('a { padding: var(--gv-space-3); height: calc(36px - 2 * var(--gv-space-3)); }').text)
      .toBe('a { padding: var(--gv-space-4); height: calc(36px - 2 * var(--gv-space-4)); }');
  });
  it('deletes a tracking declaration with its line', () => {
    expect(css('a {\n  font: var(--gv-type-ui);\n  letter-spacing: var(--gv-type-ui-tracking);\n}').text)
      .toBe('a {\n  font: var(--gv-type-ui);\n}');
    expect(css('a { font: x; letter-spacing: var(--gv-type-ui-tracking); }').text).toBe('a { font: x; }');
  });
  it('renames a weight override to the font primitive', () => {
    expect(css('a { font-weight: var(--gv-type-ui-weight); }').text).toBe('a { font-weight: var(--gv-font-weight-regular); }');
  });
  it('moves the starter names onto gv names, through the split', () => {
    expect(css('a { padding: var(--spacing-3); background: var(--highlight-background); }').text)
      .toBe('a { padding: var(--gv-space-12); background: var(--gv-surface-brand-strong); }');
  });
  it('leaves a starter name a stylesheet sets for itself', () => {
    const src = '.tabs { --border-color: red; border: 1px solid var(--border-color); }';
    expect(renameCss(src, rules, {local: new Set(['--border-color'])}).text).toBe(src);
    expect(css('a { border: 1px solid var(--border-color); }').text).toContain('var(--gv-border-control)');
  });
  it('makes a 2px focus outline the focus ring, with its offset', () => {
    const out = css(`a {
  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: -2px;
  }
  &[data-focused] { outline: 2px solid var(--gv-border-selected); outline-offset: 2px; }
  &[data-focus-visible].x { outline: 2px solid var(--focus-ring-color); outline-offset: 0; }
}`);
    expect(out.text).toContain('outline: var(--gv-focus-ring);\n    outline-offset: var(--gv-focus-ring-offset-inset);');
    expect(out.text).toContain('outline: var(--gv-focus-ring); outline-offset: var(--gv-focus-ring-offset); }');
    expect(out.notes.join()).toMatch(/a focus ring's offset of 0: no token/);
  });
  it('leaves a 2px outline outside a focus state, and lists it (a drop target silently)', () => {
    const plain = css('a[data-selected] { outline: 2px solid var(--gv-border-selected); }');
    expect(plain.text).toContain('2px solid var(--gv-border-selected)');
    expect(plain.notes.join()).toMatch(/outside a focus state/);
    expect(css('a[data-drop-target] { outline: 2px solid var(--gv-border-selected); }').notes).toEqual([]);
  });
  it('puts z-index 10, 50, 100 on the layers and a disabled or dragging opacity on its token', () => {
    expect(css('a { z-index: 100; } b { z-index: 50; } c { z-index: 10; } d { z-index: 2; }').text)
      .toBe('a { z-index: var(--gv-layer-overlay); } b { z-index: var(--gv-layer-panel); } c { z-index: var(--gv-layer-sticky); } d { z-index: 2; }');
    expect(css('a[data-disabled] { opacity: 0.5; } a[data-dragging] { opacity: 0.6; } a { opacity: 0.5; }').text)
      .toBe('a[data-disabled] { opacity: var(--gv-opacity-disabled); } a[data-dragging] { opacity: var(--gv-opacity-dragging); } a { opacity: 0.5; }');
  });
  it('renames a plain name in a comment, and lists a split one there', () => {
    const {text, notes} = css('/* var(--gv-surface-stage), --gv-action-primary */ a { color: red; }');
    expect(text).toBe('/* var(--gv-surface-tertiary), --gv-action-primary */ a { color: red; }');
    expect(notes.join()).toMatch(/x\.css:1: a comment names --gv-action-primary/);
  });
  it('changes nothing the second time', () => {
    const src = `a[data-focus-visible] { outline: 2px solid var(--focus-ring-color); outline-offset: 2px;
  background: var(--highlight-background); letter-spacing: var(--gv-type-ui-tracking); gap: var(--gv-space-14);
  margin: var(--gv-space-1); z-index: 100; }`;
    const once = css(src).text;
    expect(css(once).text).toBe(once);
    expect(css(once).notes).toEqual([]);
  });
});

describe('paint, in a component', () => {
  const paint = src => renameCss(src, rules, {file: 'x.css', paint: true}).text;
  it('makes a tint recipe its token, by the property', () => {
    expect(paint('a { background: color-mix(in srgb, var(--gv-color-red-500) 10%, transparent); }'))
      .toBe('a { background: var(--gv-surface-danger); }');
    expect(paint('a { border: 1px solid color-mix(in srgb, var(--gv-icon-warning) 30%, var(--gv-surface-panel)); }'))
      .toBe('a { border: 1px solid var(--gv-border-warning); }');
    // Another percentage, or the tint on the wrong property, is a recipe: left as it is.
    expect(paint('a { background: color-mix(in srgb, var(--gv-color-red-500) 20%, transparent); }')).toContain('20%');
    expect(paint('a { color: color-mix(in srgb, var(--gv-icon-warning) 30%, transparent); }')).toContain('30%');
  });
  it('moves a whole primitive onto the semantic token for its property, in its state', () => {
    expect(paint('a { background: var(--gv-color-red-500); color: var(--gv-color-red-500); & svg { color: var(--gv-color-red-500); } }'))
      .toBe('a { background: var(--gv-surface-danger-strong); color: var(--gv-text-danger); & svg { color: var(--gv-icon-danger); } }');
    expect(paint('a[data-hovered] { color: var(--gv-color-navy-900); } a { color: var(--gv-color-navy-900); }'))
      .toBe('a[data-hovered] { color: var(--gv-text-link-hovered); } a { color: var(--gv-color-navy-900); }');
  });
  it('leaves a primitive inside another recipe, one with no token for its property, and anything outside a component', () => {
    const recipe = 'a { color: color-mix(in srgb, var(--x) 50%, var(--gv-color-red-500)); }';
    expect(paint(recipe)).toBe(recipe);
    expect(paint('a { border-color: var(--gv-color-red-500); }')).toBe('a { border-color: var(--gv-color-red-500); }');
    expect(css('a { background: var(--gv-color-red-500); }').text).toBe('a { background: var(--gv-color-red-500); }');
  });
  it('changes nothing the second time', () => {
    const once = paint('a { background: color-mix(in srgb, var(--gv-color-red-500) 12%, transparent); color: var(--gv-color-red-500); }');
    expect(paint(once)).toBe(once);
  });
  it('paintValue reads the selector for an icon', () => {
    expect(paintValue('var(--gv-color-red-500)', rules, 'color', '.x__icon')).toBe('var(--gv-icon-danger)');
  });
});

describe('renameScript', () => {
  const script = src => renameScript(src, rules, {file: 'x.tsx'});
  it('renames by the style key a name sits under', () => {
    expect(script(`<div style={{background: 'var(--gv-action-primary)', color: 'var(--gv-action-primary)'}} />`).text)
      .toBe(`<div style={{background: 'var(--gv-surface-brand-strong)', color: 'var(--gv-text-brand)'}} />`);
    expect(script(`const s = {borderColor: 'var(--gv-action-primary)'};`).text).toBe(`const s = {borderColor: 'var(--gv-border-selected)'};`);
  });
  it('renames a plain name in any string, and lists a split one with no key', () => {
    expect(script(`tokens={['--gv-surface-stage']}`).text).toBe(`tokens={['--gv-surface-tertiary']}`);
    expect(script(`const n = '--gv-action-primary';`).notes.join()).toMatch(/can't tell/);
  });
  it('drops a role\'s tracking key from a style object', () => {
    expect(script(`{font: 'var(--gv-type-ui)', letterSpacing: 'var(--gv-type-ui-tracking)'}`).text).toBe(`{font: 'var(--gv-type-ui)'}`);
    expect(script(`{letterSpacing: 'var(--gv-type-ui-tracking)', font: 'var(--gv-type-ui)'}`).text).toBe(`{ font: 'var(--gv-type-ui)'}`);
  });
  it('moves the starter names onto gv names, an SVG attribute naming what it paints', () => {
    expect(script(`<circle stroke="var(--highlight-background)" />`).text).toBe(`<circle stroke="var(--gv-icon-brand)" />`);
    expect(script(`{padding: 'var(--spacing-3)'}`).text).toBe(`{padding: 'var(--gv-space-12)'}`);
  });
  it('finds the key a few lines up when the value is a ternary', () => {
    const src = `style={{\n  '--fill-color':\n    big\n      ? 'var(--x)'\n      : 'var(--gv-action-primary)'\n}}`;
    expect(script(src).text).toContain(`: 'var(--gv-surface-brand-strong)'`);
  });
  it('lists names built in a template string', () => {
    expect(script('const v = `var(--gv-type-${role}-size)`;').notes.join()).toMatch(/template string/);
  });
});

describe('classify', () => {
  it('reads what a property paints', () => {
    expect(classify('background-color')).toBe('surface');
    expect(classify('border-left-color')).toBe('border');
    expect(classify('box-shadow')).toBe('border');
    expect(classify('color', '.x svg')).toBe('icon');
    expect(classify('color', '.gv-link')).toBe('link');
    expect(classify('color', '.x')).toBe('text');
    expect(classify('--inset-border')).toBe('border');
    expect(classify('--field-background')).toBe('surface');
    expect(classify('--x')).toBeNull();
  });
});

describe('renameValue', () => {
  it('names each part of a longer value', () => {
    expect(renameValue('0 0 0 1px var(--gv-action-primary), var(--gv-surface-stage)', rules, 'box-shadow'))
      .toBe('0 0 0 1px var(--gv-border-selected), var(--gv-surface-tertiary)');
  });
});

describe('tokens/renames.json', () => {
  const real = JSON.parse(readFileSync('tokens/renames.json', 'utf8'));
  const targets = real.renames.flatMap(r => [r.to, ...Object.values(r.by ?? {}), r.scale]).filter(Boolean);
  it('never renames to a name it also renames (so a second run changes nothing)', () => {
    const from = new Set(real.renames.filter(r => !r.when).map(r => r.from));
    expect(targets.filter(t => from.has(t))).toEqual([]);
    expect(Object.values(real.starter).filter(t => t.startsWith('--') && !t.startsWith('--gv-'))).toEqual([]);
  });
  it('gives each entry a reason and one kind', () => {
    for (const r of real.renames) {
      expect(r.why, r.from).toBeTruthy();
      expect([r.to && !r.by, r.by, r.delete, r.drop].filter(Boolean).length, r.from).toBe(1);
    }
  });
  it('lists each name once', () => {
    const from = real.renames.map(r => r.from);
    expect(from.filter((f, i) => from.indexOf(f) !== i)).toEqual([]);
  });
  it('names only tokens that exist (run npm run tokens:build)', () => {
    const defined = new Set(readFileSync('src/tokens.css', 'utf8').match(/--gv-[a-z0-9-]+(?=:)/g));
    expect(targets.filter(t => !defined.has(t))).toEqual([]);
    expect(retired(real).filter(f => defined.has(f))).toEqual([]);
    // Paint moves a primitive that exists onto a semantic token that exists.
    const paint = [...real.paint.primitives.flatMap(p => [p.from, ...Object.values(p.by)]),
      ...real.paint.tints.flatMap(t => [t.to, ...t.mix])].filter(n => !retired(real).includes(n));
    expect(paint.filter(n => !defined.has(n))).toEqual([]);
  });
});

// Every stylesheet in the tree, run twice: the second run is the first.
describe('the codemod on the tree', () => {
  const walk = dir => readdirSync(dir).flatMap(f => statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]);
  const real = compile(JSON.parse(readFileSync('tokens/renames.json', 'utf8')));
  it('changes nothing the second time', () => {
    for (const f of walk('src').filter(f => f.endsWith('.css') && f !== 'src/tokens.css')) {
      const once = renameCss(readFileSync(f, 'utf8'), real, {file: f}).text;
      expect(renameCss(once, real, {file: f}).text, f).toBe(once);
    }
  });
});

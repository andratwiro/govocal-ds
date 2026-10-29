import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {declarations} from '../scripts/lib/cssdecl.mjs';

const dir = 'src/components';
// Every stylesheet of the system, gv/ and src/patterns/ included.
const css = [dir, 'src/patterns'].filter(existsSync).flatMap(d =>
  readdirSync(d, {recursive: true}).filter(f => f.endsWith('.css')).map(f => [`${d}/${f}`, readFileSync(`${d}/${f}`, 'utf8')]));

describe('paint comes only from tokens', () => {
  it('has no raw colours outside tokens.css', () => {
    const offenders = css.filter(([, s]) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\boklch\(|\bhsla?\(/.test(s)).map(([f]) => f);
    expect(offenders).toEqual([]);
  });
  it('has no dark-mode blocks (no dark tokens yet)', () => {
    expect(css.filter(([, s]) => s.includes('prefers-color-scheme: dark')).map(([f]) => f)).toEqual([]);
  });
  it('uses the token font, not system-ui', () => {
    expect(css.filter(([, s]) => /system-ui/.test(s)).map(([f]) => f)).toEqual([]);
  });
  it('theme.css imports the generated tokens', () => {
    expect(readFileSync(`${dir}/theme.css`, 'utf8')).toMatch(/@import ['"]\.\.\/tokens\.css['"]/);
  });
  it('has no named colour keywords as declaration values', () => {
    // transparent / currentColor / inherit are fine; everything else paints through var(--gv-*).
    const namedColour = /(?<![\w-])(white|black|red|green|blue|gray|grey|silver)(?![\w-])/i;
    const offenders = [];
    for (const [file, source] of css) {
      const noComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
      // only look inside declaration values (property: value;), never selectors or comments
      for (const m of noComments.matchAll(/[a-zA-Z-]+\s*:\s*([^;{}]+);/g)) {
        if (namedColour.test(m[1])) {
          offenders.push(`${file}: ${m[0].trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// The primitives a component still paints with because no semantic token fits yet: the designer names them in phase 3
// (tokens.md). Each is [file, primitive, why]; an entry that no longer matches fails too, so the list only shrinks.
export const RESIDUAL = [
  ['src/components/Tooltip.css', 'neutral-800', "the tooltip's dark fill and its arrow: no surface token for a dark tip"],
  ['src/components/Tabs.css', 'slate-750', 'a tab label one step stronger than text-secondary: text-neutral or text-secondary when the designer picks'],
  ['src/components/NavigationTree.css', 'slate-750', 'as Tabs'],
  ['src/components/RadioGroup.css', 'slate-750', 'as Tabs'],
  ['src/components/Slider.css', 'slate-250', "the slider's empty track: no track token"],
  ['src/components/utilities.css', 'slate-250', 'the inset track fill shared by Slider and Switch: as Slider'],
  ['src/components/utilities.css', 'slate-400', "the inset track's hairline: no track token"],
  ['src/components/TagGroup.css', 'slate-500', "the prototype's 0.5px cool-grey tag edge: border-control is a step lighter"],
  ['src/components/Button.css', 'teal-500', "the kbd hint's hairline: no token for it"],
  ['src/components/gv/DataTable.css', 'teal-400', "a project tile's teal: the prototype's per-method tile colours have no tokens"],
  ['src/components/gv/DataTable.css', 'blue-400', 'as teal-400'],
  ['src/components/Toast.css', 'slate-750', "a mix that greys the dark green for the toast's body text"],
  ['src/components/Toast.css', 'slate-500', "a mix that greys the dark green for the toast's close icon"],
  ['src/components/Toast.css', 'green-400', "the action's hover edge and its 8% and 14% tints: no success-hovered tokens yet"]
];

// Each var(--gv-color-*) a stylesheet paints with, outside a `raw:` note, as [file, primitive, line].
export function primitives(file, source) {
  const out = [];
  for (const d of declarations(source)) {
    if (/^;[ \t]*\/\*\s*raw:\s*[^*\s]/.test(source.slice(d.end))) continue;
    for (const m of d.value.matchAll(/var\(\s*--gv-color-([\w-]+)/g)) out.push([file, m[1], d.line]);
  }
  return out;
}

describe('components paint with semantic tokens, not primitives', () => {
  const theme = `${dir}/theme.css`;
  const used = css.filter(([f]) => f !== theme).flatMap(([f, s]) => primitives(f, s));
  it('finds primitives, and lets a raw note and other tokens through', () => {
    expect(primitives('a.css', 'a { color: var(--gv-color-red-500); }')).toEqual([['a.css', 'red-500', 1]]);
    expect(primitives('a.css', 'a { color: color-mix(in srgb, var(--gv-text-danger) 50%, var(--gv-color-slate-500)); }'))
      .toEqual([['a.css', 'slate-500', 1]]);
    expect(primitives('a.css', 'a { mask: linear-gradient(\n  var(--gv-color-neutral-900),\n  transparent\n); /* raw: a mask */ }')).toEqual([]);
    expect(primitives('a.css', 'a { color: var(--gv-text-danger); /* var(--gv-color-red-500) */ }')).toEqual([]);
  });
  it('no component or pattern paints with a --gv-color-* primitive (theme.css aside) but the listed residuals', () => {
    const allowed = new Set(RESIDUAL.map(([f, p]) => `${f} ${p}`));
    expect(used.filter(([f, p]) => !allowed.has(`${f} ${p}`)).map(([f, p, l]) => `${f}:${l} --gv-color-${p}`)).toEqual([]);
  });
  it('the back office paints with no primitive either', () => {
    const bo = 'backoffice/src';
    const files = existsSync(bo) ? readdirSync(bo, {recursive: true}).filter(f => f.endsWith('.css')) : [];
    expect(files.flatMap(f => primitives(`${bo}/${f}`, readFileSync(`${bo}/${f}`, 'utf8')))
      .map(([f, p, l]) => `${f}:${l} --gv-color-${p}`)).toEqual([]);
  });
  it('every residual is still used: a fixed one leaves the list', () => {
    const seen = new Set(used.map(([f, p]) => `${f} ${p}`));
    expect(RESIDUAL.filter(([f, p]) => !seen.has(`${f} ${p}`)).map(([f, p]) => `${f} ${p}`)).toEqual([]);
  });
});

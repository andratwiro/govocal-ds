import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';

// Illustrations are content: one self-contained SVG per file in src/illustrations/, painted only with the page's
// --gv-* tokens (the paint test's rule, held here for .svg), animated in its own <style> under its own root class.
// The recipe: .superpowers/sdd/illustration-guide.md.
const DIR = 'src/illustrations';
const files = readdirSync(DIR).filter(f => f.endsWith('.svg')).sort();
const svgs = files.map(f => [f.replace(/\.svg$/, ''), readFileSync(`${DIR}/${f}`, 'utf8')]);
const tokenCss = readFileSync('src/tokens.css', 'utf8');
const tokens = new Set([...tokenCss.matchAll(/(--gv-[\w-]+)\s*:/g)].map(m => m[1]));
// The motion tokens (main 049da75, tests/motion.test.mjs there): this branch's tokens.css predates them; the names
// stand in until the merge brings the file, after which they come from tokens.css like every other token.
if (!tokens.has('--gv-motion-duration-loop')) {
  for (const t of ['duration-fast', 'duration-medium', 'duration-slow', 'duration-loop', 'easing-standard', 'easing-enter', 'easing-exit', 'easing-move']) tokens.add(`--gv-motion-${t}`);
}

// The motion guard's rule (tests/motion.test.mjs on main), held here for the <style> inside each .svg: a duration or
// an easing only through var(--gv-motion-*). A scene's story declares --gvi-cycle: calc(var(--gv-motion-duration-loop) * N)
// on the root; the Illustration component reads N to time `once` and `auto`.
const TIME = /(?<![\w.-])-?\d*\.?\d+m?s\b/g;
const ZERO = /^-?0*\.?0+m?s$/;
const EASING = /(?<![\w-])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-])|(?<![\w-])(cubic-bezier|steps|linear)\(/;
export function rawMotion(css) {
  const hits = [];
  for (const m of css.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const [decl, prop, value] = m;
    const time = [...value.matchAll(TIME)].some(([t]) => !ZERO.test(t));
    const easing = /^(transition|animation)|^--/.test(prop) && EASING.test(value);
    if (time || easing) hits.push(decl.replace(/\s+/g, ' ').trim());
  }
  return hits;
}
const GROUPS = ['Empty states', 'Method scenes', 'Other'];
const MOTIONS = ['auto', 'once', 'loop', 'hover', 'still'];

const root = svg => svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const style = svg => [...svg.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');

/** The selectors of every rule outside @keyframes, @media unwrapped (a brace-matching walk, no regex over blocks). */
export function selectors(css) {
  const out = [];
  const walk = text => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open < 0) break;
      const prelude = text.slice(i, open).replace(/^[\s;}]+/, '').trim();
      let depth = 1, j = open + 1;
      while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (prelude.startsWith('@media')) walk(body);
      else if (!prelude.startsWith('@')) for (const sel of prelude.split(',')) if (sel.trim()) out.push(sel.trim());
      i = j;
    }
  };
  walk(css);
  return out;
}

/** Problems with one illustration file, [] when it follows the format. */
export function problems(name, svg) {
  const out = [];
  const tag = root(svg);
  const css = style(svg);
  const cls = `gvi-${name}`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) out.push('file name is not kebab-case');
  if (attr(tag, 'class') !== cls) out.push(`root class is not ${cls}`);
  if (!/^0 0 \d+(\.\d+)? \d+(\.\d+)?$/.test(attr(tag, 'viewBox') ?? '')) out.push('root viewBox is not "0 0 w h"');
  if (attr(tag, 'aria-hidden') !== 'true' || attr(tag, 'focusable') !== 'false') out.push('root is not aria-hidden="true" focusable="false"');
  if (!GROUPS.includes(attr(tag, 'data-group'))) out.push(`data-group is not one of ${GROUPS.join(', ')}`);
  if (!MOTIONS.includes(attr(tag, 'data-motion'))) out.push(`data-motion is not one of ${MOTIONS.join(', ')}`);
  if (!/^\d+( \d+)*$/.test(attr(tag, 'data-sizes') ?? '')) out.push('data-sizes is not a list of widths');
  if (!attr(tag, 'data-source')) out.push('data-source (the prototype anchor) is missing');
  // Self-contained: real shapes only, nothing fetched, nothing that clashes when drawn twice on a page.
  for (const [re, why] of [
    [/<foreignObject/i, 'foreignObject'], [/<script/i, 'script'], [/<image/i, 'image'], [/<title/i, 'title (the alt prop names it)'],
    [/\shref=|xlink:/i, 'href'], [/url\(/i, 'url()'], [/\sid="/i, 'id (two copies would clash)'], [/\son\w+=/i, 'event handler'],
    [/@import/i, '@import']
  ]) if (re.test(svg)) out.push(`uses ${why}`);
  // Paint only through tokens: no raw colour anywhere, presentation colours only none/currentColor.
  if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:ok)?(?:lch|lab)\(|\bhwb\(/.test(svg)) out.push('raw colour');
  for (const m of svg.matchAll(/\s(fill|stroke|stop-color|flood-color|color)="([^"]*)"/g)) {
    if (!['none', 'currentColor'].includes(m[2])) out.push(`${m[1]}="${m[2]}" (paint in <style> with var(--gv-*))`);
  }
  const named = /(?<![\w-])(white|black|red|green|blue|gray|grey|silver|yellow|orange|purple|pink)(?![\w-])/i;
  for (const m of css.matchAll(/[a-zA-Z-]+\s*:\s*([^;{}]+);/g)) if (named.test(m[1])) out.push(`named colour: ${m[0].trim()}`);
  // Every custom property is a real token or the file's own --gvi-* (derived from tokens in the file).
  const own = new Set([...css.matchAll(/(--gvi-[\w-]+)\s*:/g)].map(m => m[1]));
  for (const m of svg.matchAll(/var\((--[\w-]+)/g)) {
    const v = m[1];
    if (v.startsWith('--gvi-') ? !own.has(v) : !tokens.has(v)) out.push(`var(${v}) is neither a token nor defined here`);
  }
  // Scoped: every selector under the root class, every keyframe named after the file.
  for (const s of selectors(css)) if (!s.startsWith(`.${cls}`)) out.push(`selector not under .${cls}: ${s}`);
  const frames = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1]);
  for (const k of frames) if (!k.startsWith(`${cls}-`)) out.push(`@keyframes ${k} is not named ${cls}-…`);
  for (const m of css.matchAll(/animation(?:-name)?\s*:\s*([^;]+);/g)) {
    for (const word of m[1].split(/[\s,]+/)) if (word.startsWith('gvi-') && !frames.includes(word)) out.push(`animation uses missing ${word}`);
  }
  for (const hit of rawMotion(css)) out.push(`raw motion (use var(--gv-motion-*)): ${hit}`);
  const moving = frames.length > 0;
  const cycle = new RegExp(`\\.${cls}\\s*\\{[^}]*--gvi-cycle:\\s*calc\\(var\\(--gv-motion-duration-loop\\)\\s*\\*\\s*[\\d.]+\\)`).test(css);
  if (moving && !cycle) out.push(`animates but its root rule declares no --gvi-cycle: calc(var(--gv-motion-duration-loop) * N)`);
  if (!moving && /--gvi-cycle/.test(css)) out.push('declares --gvi-cycle but nothing animates');
  if (moving && !/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*animation:\s*none/.test(css)) {
    out.push('animates but has no prefers-reduced-motion block turning animation off');
  }
  if (svg.length > 60000) out.push('over 60 KB');
  return out;
}

describe('illustration format', () => {
  it('catches what breaks the format', () => {
    const ok = '<svg viewBox="0 0 10 10" class="gvi-x" aria-hidden="true" focusable="false" data-group="Other" data-motion="still" ' +
      'data-sizes="10" data-source="x"><style>.gvi-x .a { fill: var(--gv-surface-panel); }</style><rect class="a"/></svg>';
    expect(problems('x', ok)).toEqual([]);
    expect(problems('x', ok.replace('.gvi-x .a', '.a'))).toContain('selector not under .gvi-x: .a');
    expect(selectors('.r {\n  --m: color-mix(in oklch, var(--a) 5%, var(--b));\n}\n@keyframes k { 0%, 50% { opacity: 0; } }\n@media (x) {\n  .r * { a: b; }\n}\n.r .s, .r .t { c: d; }'))
      .toEqual(['.r', '.r *', '.r .s', '.r .t']);
    expect(problems('x', ok.replace('var(--gv-surface-panel)', '#fff'))).toContain('raw colour');
    expect(problems('x', ok.replace('<rect class="a"/>', '<rect fill="white"/>'))).toContain('fill="white" (paint in <style> with var(--gv-*))');
    expect(problems('x', ok.replace('--gv-surface-panel', '--gv-nope'))).toContain('var(--gv-nope) is neither a token nor defined here');
    const moving = ok
      .replace('</style>', '.gvi-x { --gvi-cycle: calc(var(--gv-motion-duration-loop) * 2); } .gvi-x .a { animation: gvi-x-in var(--gvi-cycle) var(--gv-motion-easing-move) infinite; } @keyframes gvi-x-in { from { opacity: 0; } }</style>');
    expect(problems('x', moving)).toContain('animates but has no prefers-reduced-motion block turning animation off');
    expect(problems('x', moving.replace('var(--gvi-cycle) var(--gv-motion-easing-move)', '2s ease-in-out'))).toEqual(expect.arrayContaining([
      'raw motion (use var(--gv-motion-*)): animation: gvi-x-in 2s ease-in-out infinite']));
    expect(problems('x', moving.replace('--gvi-cycle: calc(var(--gv-motion-duration-loop) * 2)', '--gvi-cycle: 3.2s'))).toContain(
      'animates but its root rule declares no --gvi-cycle: calc(var(--gv-motion-duration-loop) * N)');
    const calm = moving.replace('</style>', '@media (prefers-reduced-motion: reduce) { .gvi-x * { animation: none !important; } }</style>');
    expect(problems('x', calm)).toEqual([]);
    expect(problems('x', calm.replace(/gvi-x-in/g, 'spin'))).toContain('@keyframes spin is not named gvi-x-…');
  });

  it.each(svgs)('%s follows the format', (name, svg) => {
    expect(problems(name, svg)).toEqual([]);
  });

  it('names.ts lists exactly the files', () => {
    const ts = readFileSync(`${DIR}/names.ts`, 'utf8');
    const listed = [...ts.match(/illustrationNames\s*=\s*\[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    expect(listed).toEqual(svgs.map(([n]) => n));
  });
});

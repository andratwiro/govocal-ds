import {cssOf, pathOf, refOf} from './names.mjs';

const children = n => n.children ?? [];
function* walk(n) { yield n; for (const c of children(n)) yield* walk(c); }
const slug = s => s.trim().toLowerCase().replace(/\s+/g, '-');
const px = value => ({value: Math.round(value * 100) / 100, unit: 'px'});
const hex2 = v => Math.round(v * 255).toString(16).padStart(2, '0');

function colorValue(fill) {
  const {r, g, b, a = 1} = fill.color;
  const alpha = Math.round(a * (fill.opacity ?? 1) * 1000) / 1000;
  return {colorSpace: 'srgb', components: [r, g, b].map(v => Math.round(v * 10000) / 10000), alpha,
    hex: `#${hex2(r)}${hex2(g)}${hex2(b)}`};
}
const sameColor = (x, y) => x.hex === y.hex && Math.abs(x.alpha - y.alpha) < 0.005;

/**
 * Reads the Figma Foundations page: the frames drawn there (`group/role` swatches, `space/N` bars, `radius/N` shapes,
 * `shadow/name` samples, the Typography roles) and the variable each one binds.
 *
 * A token is named by its Figma variable id, not by its frame: `names` (tokens/variable-ids.json) maps each id to its
 * CSS name, so code can rename before Figma does. An id the map doesn't know takes its frame's name and joins the map.
 * `renames` (tokens/renames.json) says which ids code has merged into another token or dropped (they make no token:
 * the target's value wins) and renames what has no variable id (primitives, shadows). Every place where Figma's name
 * differs from code's is in `report`: the designer's checklist. It never fails the pull.
 */
export function parseFoundations(page, {names = {}, renames = []} = {}) {
  const tokens = {color: {}, space: {}, radius: {}, type: {}, shadow: {}};
  const variableIds = {...names};
  const report = [];
  const plain = new Map(renames.filter(r => r.to && !r.when && !r.by).map(r => [r.from, r.to]));
  const retired = new Map(renames.filter(r => r.figmaId && (r.merge || r.drop)).map(r => [r.figmaId, r]));
  const named = new Map(); // CSS name → the id that took it, so two variables can't silently share one name
  const said = new Set();
  const note = entry => { if (!said.has(entry.text)) { said.add(entry.text); report.push(entry); } };

  // The CSS name of what a frame draws, or null when code merged or dropped its variable.
  const nameOf = (id, figma, fallback, value) => {
    const gone = id && retired.get(id);
    if (gone) {
      const how = gone.drop ? `code dropped it (${gone.why})` : `code merged it into \`${gone.to}\` (${gone.why})`;
      note({kind: gone.drop ? 'drop' : 'merge', id, figma, code: gone.drop ? null : gone.to,
        text: `Figma still has ${id} \`${figma}\`${value ? ` (${value})` : ''}; ${how}`});
      return null;
    }
    const css = id && names[id] !== undefined ? names[id] : plain.get(fallback) ?? fallback;
    if (css === null) {
      note({kind: 'drop', id, figma, code: null, text: `Figma still has ${id} \`${figma}\`; code has no token for it`});
      return null;
    }
    if (id) {
      if (named.has(css) && named.get(css) !== id)
        throw new Error(`${named.get(css)} and ${id} are both named ${css}: mark one a merge in tokens/renames.json`);
      named.set(css, id);
      if (!(id in variableIds)) {
        variableIds[id] = css;
        note({kind: 'new', id, figma, code: css, text: `New in Figma: ${id} \`${figma}\` is \`${css}\``});
      }
    }
    if (css !== fallback) note({kind: 'rename', id: id ?? null, figma, code: css,
      text: `Figma still calls ${id ? `${id} ` : ''}\`${figma}\`; code calls it \`${css}\``});
    return css;
  };
  const boundRef = (bound, field) => {
    const id = bound?.[field]?.[0]?.id ?? bound?.[field]?.id;
    const css = id && names[id];
    return css ? refOf(css) : null;
  };

  for (const n of walk(page)) {
    if (n.type !== 'FRAME') continue;
    const kids = children(n);
    const rect = name => kids.find(k => k.type === 'RECTANGLE' && k.name === name);
    let m;
    if ((m = n.name.match(/^([a-z-]+)\/([a-z0-9-]+)$/)) && rect('Swatch')) {
      const prim = kids.filter(k => k.type === 'TEXT').at(-1).characters.trim();
      const [figmaFamily, figmaStep] = prim.split('/');
      const primCss = nameOf(null, prim, cssOf('color', figmaFamily, figmaStep));
      const [, rest] = pathOf(primCss);
      const [family, ...step] = rest.split('-');
      const value = colorValue(rect('Swatch').fills[0]);
      tokens.color[family] ??= {};
      const known = tokens.color[family][step.join('-')];
      if (known && !sameColor(known.$value, value)) throw new Error(`${prim} has two values: ${known.$value.hex} and ${value.hex}`);
      tokens.color[family][step.join('-')] ??= {$type: 'color', $value: value};
      const id = rect('Swatch').boundVariables?.fills?.[0]?.id;
      const css = nameOf(id, n.name, cssOf(m[1], m[2]), prim);
      if (!css) continue;
      const [group, role] = pathOf(css);
      tokens[group] ??= {};
      tokens[group][role] = {$type: 'color', $value: refOf(primCss)};
    } else if ((m = n.name.match(/^space\/(\d+)$/)) && rect('Bar')) {
      const id = rect('Bar').boundVariables?.size?.x?.id;
      const css = nameOf(id, n.name, cssOf('space', m[1]));
      if (!css) continue;
      // Figma can't draw a 0-wide bar (space/0 is drawn 1px), so the name wins for 0.
      const width = m[1] === '0' ? 0 : rect('Bar').absoluteBoundingBox.width;
      tokens.space[pathOf(css)[1]] = {$type: 'dimension', $value: px(width)};
    } else if ((m = n.name.match(/^radius\/(\d+|full)$/)) && rect('Shape')) {
      const id = rect('Shape').boundVariables?.rectangleCornerRadii?.RECTANGLE_TOP_LEFT_CORNER_RADIUS?.id;
      const css = nameOf(id, n.name, cssOf('radius', m[1]));
      if (!css) continue;
      const r = rect('Shape').cornerRadius ?? 0;
      tokens.radius[pathOf(css)[1]] = {$type: 'dimension', $value: px(r >= 999 ? 9999 : r)};
    } else if ((m = n.name.match(/^shadow\/([a-z0-9-]+)$/))) {
      const css = nameOf(null, n.name, cssOf('shadow', m[1]));
      const sample = kids.find(k => k.name === 'Sample');
      const effects = (sample?.effects ?? []).filter(e => e.visible !== false && e.type === 'DROP_SHADOW');
      tokens.shadow[pathOf(css)[1]] = {$type: 'shadow', $value: effects.map(e => ({color: colorValue({color: e.color}),
        offsetX: px(e.offset.x), offsetY: px(e.offset.y), blur: px(e.radius), spread: px(e.spread ?? 0)}))};
    } else if (n.name === 'Typography') {
      // Each role's sample binds the font variables (family, size, line height, weight, tracking): a part whose
      // variable has a name becomes a reference to that font token; the line height stays the ratio DTCG asks for.
      for (const role of kids.filter(k => k.type === 'FRAME' && children(k).some(c => c.name === 'Label'))) {
        const sample = children(role).find(c => c.type === 'TEXT');
        const s = sample.style, bound = sample.boundVariables;
        tokens.type[slug(role.name)] = {$type: 'typography', $value: {
          fontFamily: boundRef(bound, 'fontFamily') ?? s.fontFamily,
          fontSize: boundRef(bound, 'fontSize') ?? px(s.fontSize),
          lineHeight: Math.round((s.lineHeightPx / s.fontSize) * 10000) / 10000,
          fontWeight: boundRef(bound, 'fontWeight') ?? s.fontWeight,
          letterSpacing: boundRef(bound, 'letterSpacing') ?? px(s.letterSpacing ?? 0)}};
      }
    }
  }
  return {tokens, variableIds, report};
}

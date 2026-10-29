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

export function parseFoundations(page) {
  const tokens = {color: {}, space: {}, radius: {}, type: {}, shadow: {}};
  const variableIds = {};
  for (const n of walk(page)) {
    if (n.type !== 'FRAME') continue;
    const kids = children(n);
    const rect = name => kids.find(k => k.type === 'RECTANGLE' && k.name === name);
    let m;
    if ((m = n.name.match(/^([a-z-]+)\/([a-z0-9-]+)$/)) && rect('Swatch')) {
      const [, group, role] = m;
      const prim = kids.filter(k => k.type === 'TEXT').at(-1).characters.trim();
      const [family, step] = prim.split('/');
      const value = colorValue(rect('Swatch').fills[0]);
      tokens.color[family] ??= {};
      const known = tokens.color[family][step];
      if (known && !sameColor(known.$value, value)) throw new Error(`${prim} has two values: ${known.$value.hex} and ${value.hex}`);
      tokens.color[family][step] ??= {$type: 'color', $value: value};
      tokens[group] ??= {};
      tokens[group][role] = {$type: 'color', $value: `{color.${family}.${step}}`};
      const id = rect('Swatch').boundVariables?.fills?.[0]?.id;
      if (id) variableIds[id] = `--gv-${group}-${role}`;
    } else if ((m = n.name.match(/^space\/(\d+)$/)) && rect('Bar')) {
      // Figma can't draw a 0-wide bar (space/0 is drawn 1px), so the name wins for 0.
      const width = m[1] === '0' ? 0 : rect('Bar').absoluteBoundingBox.width;
      tokens.space[m[1]] = {$type: 'dimension', $value: px(width)};
      const id = rect('Bar').boundVariables?.size?.x?.id;
      if (id) variableIds[id] = `--gv-space-${m[1]}`;
    } else if ((m = n.name.match(/^radius\/(\d+|full)$/)) && rect('Shape')) {
      const r = rect('Shape').cornerRadius ?? 0;
      tokens.radius[m[1]] = {$type: 'dimension', $value: px(r >= 999 ? 9999 : r)};
      const id = rect('Shape').boundVariables?.rectangleCornerRadii?.RECTANGLE_TOP_LEFT_CORNER_RADIUS?.id;
      if (id) variableIds[id] = `--gv-radius-${m[1]}`;
    } else if ((m = n.name.match(/^shadow\/([a-z0-9-]+)$/))) {
      const sample = kids.find(k => k.name === 'Sample');
      const effects = (sample?.effects ?? []).filter(e => e.visible !== false && e.type === 'DROP_SHADOW');
      tokens.shadow[m[1]] = {$type: 'shadow', $value: effects.map(e => ({color: colorValue({color: e.color}),
        offsetX: px(e.offset.x), offsetY: px(e.offset.y), blur: px(e.radius), spread: px(e.spread ?? 0)}))};
    } else if (n.name === 'Typography') {
      for (const role of kids.filter(k => k.type === 'FRAME' && children(k).some(c => c.name === 'Label'))) {
        const s = children(role).find(c => c.type === 'TEXT').style;
        tokens.type[slug(role.name)] = {$type: 'typography', $value: {fontFamily: s.fontFamily,
          fontSize: px(s.fontSize), lineHeight: Math.round((s.lineHeightPx / s.fontSize) * 10000) / 10000,
          fontWeight: s.fontWeight, letterSpacing: px(s.letterSpacing ?? 0)}};
      }
    }
  }
  return {tokens, variableIds};
}

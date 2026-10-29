import {readFile} from 'node:fs/promises';
import {fetchFile, page, config} from './lib/figma.mjs';

const name = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ');
if (!name) { console.error('usage: npm run figma:spec -- "<Component name>" [--fresh]'); process.exit(2); }
const file = await fetchFile();
const ids = JSON.parse(await readFile('tokens/variable-ids.json', 'utf8'));
const styleName = id => file.styles?.[id]?.name;
const v = (node, key) => {
  const b = node.boundVariables?.[key];
  const id = Array.isArray(b) ? b[0]?.id : b?.id;
  return id ? (ids[id] ?? id) : null;
};
const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
function line(n) {
  const out = [n.type.toLowerCase(), JSON.stringify(n.name)];
  const bb = n.absoluteBoundingBox; if (bb) out.push(`${bb.width}×${bb.height}`);
  if (n.layoutMode && n.layoutMode !== 'NONE') out.push(`${n.layoutMode.toLowerCase()} gap ${v(n, 'itemSpacing') ?? n.itemSpacing}`,
    `pad ${['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map(k => v(n, k) ?? n[k] ?? 0).join(' ')}`);
  if (n.cornerRadius) out.push(`radius ${v(n, 'rectangleCornerRadii') ?? n.cornerRadius}`);
  const fill = n.fills?.find(f => f.visible !== false && f.color);
  if (fill) out.push(`fill ${v(n, 'fills') ?? hex(fill.color)}`);
  const stroke = n.strokes?.find(f => f.visible !== false && f.color);
  if (stroke) out.push(`stroke ${v(n, 'strokes') ?? hex(stroke.color)} ${n.strokeWeight ?? 1}px`);
  if (n.type === 'TEXT') out.push(`type ${styleName(n.styles?.text) ?? `${n.style.fontSize}/${n.style.lineHeightPx}`}`, JSON.stringify(n.characters.slice(0, 40)));
  if (n.type === 'INSTANCE') out.push(`instance of ${file.components?.[n.componentId]?.name ?? n.componentId}`);
  return out.join(' · ');
}
function print(n, depth = 0) {
  console.log('  '.repeat(depth) + line(n));
  for (const c of n.children ?? []) if (c.visible !== false) print(c, depth + 1);
}
const root = page(file, config.componentsPage);
const target = [...function* w(n) { yield n; for (const c of n.children ?? []) yield* w(c); }(root)]
  .find(n => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name);
if (!target) { console.error(`No component called "${name}" on ${config.componentsPage}`); process.exit(1); }
if (target.componentPropertyDefinitions) console.log('properties:', JSON.stringify(Object.fromEntries(
  Object.entries(target.componentPropertyDefinitions).map(([k, d]) => [k.split('#')[0], d.variantOptions ?? d.type]))));
print(target);

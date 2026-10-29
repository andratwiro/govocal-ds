const children = n => n.children ?? [];
function* walk(n) { yield n; for (const c of children(n)) yield* walk(c); }

// Tali's Icons page in Figma names each component "Icon/<name>/<size>" (one COMPONENT per size,
// e.g. "Icon/link/16" and "Icon/link/20"); a few carry a variant suffix like "16 alt". Drop the
// "Icon/" prefix and any trailing size segment, then dedupe: link/16 and link/20 both become "link".
export function parseIcons(iconsPage) {
  const names = new Set();
  for (const n of walk(iconsPage)) {
    if (n.type !== 'COMPONENT' && n.type !== 'COMPONENT_SET') continue;
    let parts = n.name.split('/');
    if (parts[0] === 'Icon') parts = parts.slice(1);
    while (parts.length > 1 && /^\d/.test(parts.at(-1).trim())) parts.pop();
    const name = parts.join('/').trim();
    if (name) names.add(name);
  }
  return [...names].sort();
}

// Figma names icons kebab-case ("chevron-right"); lucide-react exports them PascalCase ("ChevronRight").
export const toPascalCase = name => name.split(/[-/]/).map(p => p[0].toUpperCase() + p.slice(1)).join('');

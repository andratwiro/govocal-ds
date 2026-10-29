// How a token's path and its CSS name map onto each other (docs/NAMING.md, Token names): the CSS name is `--gv-` plus
// the path joined with `-`; a group is one segment, and a name inside a group may hold dashes (`side-nav.icon-current`
// is `--gv-side-nav-icon-current`, `font.size-13` is `--gv-font-size-13`). Groups whose own name has a dash are listed
// here, so a CSS name splits back into its path.
export const DASHED_GROUPS = ['side-nav', 'border-width'];

/** `--gv-side-nav-icon-current` → ['side-nav', 'icon-current']; `--gv-space-16` → ['space', '16']. */
export function pathOf(css) {
  const name = css.replace(/^--gv-/, '');
  const group = DASHED_GROUPS.find(g => name.startsWith(`${g}-`)) ?? name.split('-')[0];
  return [group, name.slice(group.length + 1)];
}

/** ['surface', 'brand-strong'] → `--gv-surface-brand-strong`. */
export const cssOf = (...path) => `--gv-${path.join('-')}`;

/** `{surface.brand-strong}` → `--gv-surface-brand-strong`. */
export const refName = ref => cssOf(...ref.slice(1, -1).split('.'));

/** `--gv-surface-brand-strong` → `{surface.brand-strong}`. A primitive (`--gv-color-navy-650`) keeps its family. */
export function refOf(css) {
  const [group, rest] = pathOf(css);
  if (group === 'color') { const [family, ...step] = rest.split('-'); return `{color.${family}.${step.join('-')}}`; }
  return `{${group}.${rest}}`;
}

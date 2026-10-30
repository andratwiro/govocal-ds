# Inline

## When to use

- To put parts side by side in a row that wraps, a spacing token apart, with no CSS of your own: a dialog's buttons (8
  apart, at the end), badges or topics, a row's controls.
- To push the last part to the end (`justifyContent="space-between"`), or line the row up at the start, centre or end.
- To align parts of different heights on each other (`alignItems`, `center` by default; `baseline` for text).
- As a list (`elementType="ul"`): the bullets go, each child is an `<li>`.

## When not to use

- For parts one under another: use **Stack**.
- For regions in fixed columns: use **Grid**.
- For equal tiles that fill the width: use **Tile grid**.
- For a labelled group of controls with arrow keys: use React Aria's Toolbar, as **Table toolbar** and **Selection bar**
  do.
- To pick one of a few options: use **Segmented control**.

## Anatomy

1. **The row**: children side by side, `gap` apart (a spacing step, 0 by default), wrapping onto new lines when full
   (`wrap`, on by default), with `rowGap` between lines when it differs.
2. **Children**: centred on each other by default.

No margin of its own. Padding only when asked (`padding`, `paddingInline`, `paddingBlock`, spacing steps too).

## Behaviour

Not interactive: it takes no focus or keys, and adds no role (choose `elementType` for meaning).

## Content

No words. `gap` and `rowGap` take a spacing step's name as a string (`"6"`, `"8"`, `"16"`); numbers and pixel values
don't compile.

## Accessibility

**The row gives you:** the reading order as the visual order, in both directions (it follows right to left).

**You still own:**
- The right element and, for a list, its name.
- Tab order matching what people see: never reorder with CSS.
- A Toolbar instead when the controls should be one Tab stop with arrow keys.

## Related

- **Stack**: parts in a column.
- **Grid**: regions in columns.
- **Tile grid**: like tiles that wrap.
- **Button**: a row of buttons is the commonest Inline.
- **Table toolbar**: a row of tools with arrow keys.

## Provenance

- **Built by:** agents, for the benchmark's "compose a screen without CSS" (after Grafana's Stack). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** new on 30 Oct 2026, so the back office's pages haven't moved onto it yet.

## Changes

- 30 Oct 2026: this page written.
- 30 Oct 2026: added with Stack and Grid; `wrap` is `'wrap' | 'nowrap'`, `wrap` by default, not a boolean
  (docs/DECISIONS.md, "Compose without CSS").

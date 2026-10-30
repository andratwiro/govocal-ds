# Stack

## When to use

- To put parts one under another, a spacing token apart, with no CSS of your own: a page's column (the Page header,
  then its Panels, 8 apart), a form's fields, a panel's sections.
- To align the parts across the column (`alignItems`: start, centre, end) when they shouldn't stretch to its width.
- As a list (`elementType="ul"` or `"ol"`): the bullets and indent go, and each child is an `<li>`.

## When not to use

- For parts side by side in a row: use **Inline**.
- For a page's distinct regions in columns (a list beside its detail): use **Grid**.
- For many like tiles that wrap to the width: use **Tile grid**.
- For a line between groups: add a **Divider**; a Stack's gap is space, not a line.
- For a frame with a head around the parts: use **Panel** or **Card**.

## Anatomy

1. **The stack**: a column with `gap` between its children (a spacing step: `gap="16"` is `--gv-space-16`; 0 by
   default).
2. **Children**: stretched to its width by default.

No margin of its own: the page or its parent places it. Padding only when asked (`padding`, `paddingInline`,
`paddingBlock`, spacing steps too).

## Behaviour

Not interactive: it can't be reached with Tab and answers no keys, and adds no role (choose `elementType` for meaning: `section`, `nav`,
`ul`…).

## Content

No words. The `gap` takes a spacing step's name as a string (`"8"`, `"16"`, `"24"`); `gap={16}` or `gap="13px"` don't
compile, so the scale stays closed.

## Accessibility

**The stack gives you:** the reading order as the visual order, and no extra element in the accessibility tree beyond
the one you choose.

**You still own:**
- The right element (`elementType`) and, for a `section` or a list, its name (`aria-label` or `aria-labelledby`).
- Keeping the source order the reading order: a Stack never reorders.

## Related

- **Inline**: parts in a row.
- **Grid**: regions in columns.
- **Tile grid**: like tiles that wrap.
- **Page header**: the top of a page's column.
- **Panel**: what a page's column usually holds.

## Provenance

- **Built by:** AI agents, for the benchmark's "compose a screen without CSS" (after Grafana's Stack). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** new on 30 Oct 2026, so the back office's pages haven't moved onto it yet; no responsive gaps.

## Changes

- 30 Oct 2026: this page written.
- 30 Oct 2026: added with Inline and Grid; spacing props take a token step as a string; the TSX sets custom properties
  the stylesheet reads (docs/DECISIONS.md, "Compose without CSS").

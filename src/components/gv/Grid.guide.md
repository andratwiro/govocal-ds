# Grid

## When to use

- To place a page's distinct regions in columns and named areas, a spacing token apart, with no CSS of your own: a list
  beside its detail (`columns="minmax(0, 1fr) 360px"`, `areas={['head head', 'list detail']}`), a form in two
  columns, a dashboard's fixed layout.
- With a **Grid item** (`GridItem`) for a region that takes a named `area`, spans columns (`columnSpan`, `"all"` for
  the full row) or starts at a column; any other child goes in as it is.
- With `columns` as a count (`3`, equal columns) or a track list, and `rows` when rows aren't simply as tall as their
  content.

## When not to use

- For many like tiles that should wrap to fit the width (Stat tiles, cards, panels side by side): use **Tile grid**.
- For one column of parts: use **Stack**.
- For one row: use **Inline**.
- For tabular data in rows and columns: use **Data table**.

## Anatomy

1. **The grid**: its columns (`columns`, 1 by default), optional rows and named `areas`, with `gap` (or `rowGap` and
   `columnGap`) between them, each a spacing step.
2. **Grid items** (optional): regions placed by `area`, `columnSpan`, `columnStart` or `rowSpan`.

No margin of its own. Padding only when asked (`padding`, `paddingInline`, `paddingBlock`, spacing steps too). It keeps
its columns at every width.

## Behaviour

Not interactive: it can't be reached with Tab and answers no keys, and adds no role (choose `elementType` for meaning: `main`, `form`,
`section`, a list).

## Content

No words. Gaps take a spacing step's name as a string (`"16"`); numbers and pixel values don't compile. Area names are
yours, short and lower case (`list`, `detail`, `head`).

## Accessibility

**The grid gives you:** regions in the source order, whatever their place on screen.

**You still own:**
- A source order that reads well: areas can place a region anywhere, but screen readers and Tab follow the source.
- The right element and, for a `form` or `section`, its name (`aria-label`).

## Related

- **Tile grid**: like tiles that wrap to the width.
- **Stack**: parts in a column.
- **Inline**: parts in a row.
- **Side panel**: an inline Side panel is a common detail region.
- **Data table**: the list region beside a detail.

## Provenance

- **Built by:** AI agents, for the benchmark's "compose a screen without CSS" (after Amsterdam's Grid). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** no responsive areas: it keeps its columns on a narrow screen (the back office is a desktop admin);
  new on 30 Oct 2026, so the back office's pages haven't moved onto it yet.

## Changes

- 30 Oct 2026: this page written.
- 30 Oct 2026: added beside Tile grid with one line between them: Grid places distinct regions in columns you name,
  Tile grid fits like tiles (docs/DECISIONS.md, "Compose without CSS").
- 30 Oct 2026: on a narrow screen it keeps its columns; tiles that should wrap are a Tile grid (docs/DECISIONS.md,
  "Compose without CSS").

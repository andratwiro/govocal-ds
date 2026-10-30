# Tile grid

## When to use

- For many like tiles in as many equal columns as fit, wrapping onto new rows: a row of Stat tiles (`minTileWidth={160}`,
  `density="compact"`), dashboard cards, panels side by side (`360`).
- **Gallery** (`layout="gallery"`) for a list of cards to pick from (projects, templates): the columns keep their width,
  so a short last row leaves room instead of stretching.
- As a list (`elementType="ul"`, with an `aria-label`), each tile in an `<li>`.

## When not to use

- For a page's distinct regions in named columns (a list beside its detail): use **Grid**.
- For one column of parts: use **Stack**; for one row, **Inline**.
- For tabular data: use **Data table**.

## Anatomy

1. **The grid**: as many columns as fit at `minTileWidth` (160, 220, 280 or 360) or more; one column on a narrow
   screen.
2. **Tiles**: Stat tiles, Cards, Panels; stretched across the row (`row`, the default) or kept at their column width
   (`gallery`).

Gap: 16, or 12 with `density="compact"`. No margin of its own.

## Behaviour

Not interactive: it takes no focus or keys, and adds no role (choose `elementType="ul"` for a list).

## Content

No words. Pick `minTileWidth` from the four presets by what the tile needs to read well: 160 for a Stat tile, 280 for
a card with a picture, 360 for a panel.

## Accessibility

**The grid gives you:** tiles in the source order at every width, and a real list when you ask for one.

**You still own:**
- A name for the list (`aria-label`) when it is one.
- A source order that reads well when the tiles wrap.

## Related

- **Grid**: regions in named columns.
- **Stat tile**: the commonest tile.
- **Card**: gallery tiles with a picture.
- **Panel**: panels side by side.
- **Stack**: parts in a column.

## Provenance

- **Built by:** agents, from the back office's seven `auto-fit` grids (Stat tile rows, card galleries, side-by-side
  panels). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the four widths are raw pixels in its stylesheet until layout size tokens exist; the back office's
  own grids haven't moved onto it yet.

## Changes

- 30 Oct 2026: this page written.
- 30 Oct 2026: Grid added beside it with one line between them; each doc comment sends the other job to the other
  (docs/DECISIONS.md, "Compose without CSS").
- 29 Oct 2026: added from the back office's `auto-fit` grids; widths as presets (`160 | 220 | 280 | 360`), `layout`
  and `density` (docs/DECISIONS.md, "Composition contracts in code").

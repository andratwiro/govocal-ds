# Tile grid

## When to use

- To lay out many tiles of the same kind in equal columns, as many as fit, wrapping onto new rows when the screen is
  narrower: a row of Stat tiles, dashboard cards, panels side by side. The tiles can be of different heights; each
  row is as tall as its tallest tile.
- As a gallery for a list of cards to pick from (projects, templates): the columns keep their width, so a short last
  row leaves empty room instead of stretching its cards. The "Row or gallery" story shows both.
- Marked as a list (for screen readers: "list, 3 items") when the tiles are a set of the same kind of thing people go
  through one by one, such as projects or templates; a developer sets it (`elementType="ul"`). A row of Stat tiles or a
  pair of panels is not a list.

## When not to use

- For a few different regions with their own widths, such as a list beside its detail: use **Grid**. Two panels of
  the same kind that should be equal and wrap: Tile grid. A main column and a side column: Grid.
- For parts one under the other: use **Stack**. For a few parts in one row that keep their own widths (buttons,
  chips): use **Inline**. Tile grid makes every column the same width.
- For rows and columns of data: use **Data table**.

## Anatomy

1. **The grid**: as many equal columns as fit, each at least the chosen width (below), and one column when the grid is
   narrower than that width (the tile then shrinks to the grid's width).
2. **Tiles**: Stat tiles, Cards, Panels. In a row (the default) they stretch to fill it; in a gallery they keep their
   column's width.

The gap between tiles is 16px, or 12px in the compact density (for Stat tiles). The grid adds no space around itself:
put it in a **Stack** for the space above and below. There is no limit on the number of columns or tiles.

## Behaviour

Not interactive: the grid itself can't be reached with Tab; Tab goes to the tiles' own buttons or links, in reading
order (left to right, then the next row).

## Content

The grid has no words of its own. Pick the least width a tile needs to read well:
- 160px: a Stat tile.
- 220px: two short things side by side, such as a pair of fields or small cards with no picture.
- 280px: a card with a picture, or a dashboard card.
- 360px: a panel with a chart or a list in it.

When it is a list, give it a name for screen readers that says what the tiles are, in a word or two ("Projects",
"Templates"); a visible heading right above it can be that name.

## Accessibility

**The grid gives you:** the tiles in the order you put them, at every width, and a real list when you ask for one.

**You still own** (the screen's designer and developer):
- A name for the list when it is one (above).
- An order that still reads well when the tiles wrap: the most important first, since on a narrow screen the first
  tile is the only one seen without scrolling.

## Related

- **Grid**: regions in named columns.
- **Stat tile**: the commonest tile.
- **Card**: gallery tiles with a picture.
- **Panel**: panels side by side.
- **Stack**: parts in a column.

## Provenance

- **Built by:** AI agents, from the back office's seven grids that fit as many columns as they can (Stat tile rows,
  card galleries, side-by-side panels). Not in Figma: in Figma, an auto layout that wraps does the same.
- **Reviewed by a person:** not yet.
- **Known limits:** the four widths are plain pixel values, not tokens, until layout size tokens exist (so Tokens
  lists `--gv-tile-grid-min`, the grid's own setting for the chosen width). No back-office screen uses it yet.

## Changes

- 30 Oct 2026: this page written.
- 30 Oct 2026: a "Row or gallery" story; the page reworded after a fresh-eyes read.
- 30 Oct 2026: Grid added beside it; each page sends the other's job to the other (docs/DECISIONS.md, "Compose
  without CSS").
- 29 Oct 2026: added from the back office's grids, with four set widths (160, 220, 280, 360px), row or gallery, and two
  gaps (docs/DECISIONS.md, "Composition contracts in code": the rules a part keeps in its code, not in the page's CSS).

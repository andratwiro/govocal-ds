# List header cell

## When to use

- As one column head inside a **List header**; the header makes its cells from its `columns`, so most pages never use
  a cell on its own.
- On its own only to build a header the List header can't draw, keeping Figma's four looks: a sortable label, a
  sortable number, a static label ("Label · square") and the "Add column" plus.

## When not to use

- For a whole row of column heads: use **List header**.
- For the column heads of a list of records: use **Data table**, which draws and sorts its own.
- For a button anywhere else: use **Button** or **Icon button**.

## Anatomy

1. **Label**: the column's name; at the start for a label column, at the end for a number column.
2. **Sort arrow** (when `isSorted`): a 16 down arrow after the label, which turns bold.
3. **Plus** (`kind="add-column"`): a 16 plus in place of a label.

One line, the height of the List header. A sortable cell darkens on hover; a static one doesn't react.

## Behaviour

Behaviour from React Aria's Button. A sortable cell and the "Add column" cell are buttons, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/); a sortable one is a toggle, pressed while the list
is sorted by it. A static cell is plain text and takes no focus.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the next sortable or "Add column" cell; static cells are skipped. | `play: Keyboard` |
| Enter | Presses the cell: sorts by its column, or adds a column. | `play: Keyboard` |
| Space | Presses the cell, as Enter. | `play: Keyboard` |

## Content

- One or two words, sentence case, saying what's in the column: "Likes", "Agree", "Time left".
- The "Add column" cell has no words on screen; its name is "Add column" (`labels` or `aria-label` in other
  languages).

## Accessibility

**The cell gives you:** a real button with a focus ring inside the cell, a pressed state on the sorted column, a named
plus, and plain text for static columns.

**You still own:**
- An `onPress` on every cell that isn't static; without it, it's a button that does nothing.
- The sort itself, and saying so when the order matters.

## Related

- **List header**: the row of cells, which you'll use instead almost every time.
- **List row**: the row whose cells line up under these heads.
- **Data table**: its own sortable column heads.

## Provenance

- Built by agents from Figma's List header cell (its `Type` and `· sorted` variants) and the prototype.
- Reviewed by a person: not yet.
- Known limits: one sort direction (the arrow only points down); the sorted state is a pressed toggle, not a column's
  sort order.

## Changes

- 30 Oct 2026: this page written, with its first doc comment; a play function proves the keyboard table.
- 29 Oct 2026: "Add column" comes through `labels`.
- 29 Oct 2026: `variant` (label, number, add column) became `kind`; `isStatic` and `isSorted` (docs/DECISIONS.md,
  "Public API and prop names").
- 29 Oct 2026: closer to Figma and the prototype: a sortable label darkens on hover, 1.75 icon strokes, an inset focus
  ring.
- 29 Oct 2026: built from Figma and the prototype.

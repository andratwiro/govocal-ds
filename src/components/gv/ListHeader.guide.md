# List header

## When to use

- Over a participation method's rows in a phase's Manage tab, to name their columns: Option, Votes, Online, Offline,
  Comments over **Voting row**s; Proposal, Votes, Status, Comments, Time left over **Proposals row**s.
- With the method's own column set from Figma (`Method`: Ideation, Common ground, Proposals, Voting), each column's
  width as drawn, the first one filling what's left.
- With `selectAll` when the rows below carry a checkbox (Ideation, Common ground), so one press ticks every row.
- With `onSort` when people can sort the rows by a column, and `onAddColumn` for the Ideation method's "Add column".

## When not to use

- For a list of records with sorting, selection, a toolbar and paging: use **Data table**, which draws its own header.
- For a single column head on its own: use **List header cell**.
- For a heading over a group of rows or a section: use **Section label**.

## Anatomy

1. **Lead slot** (28 wide): the select-all **Checkbox**, or empty (`hasLeadSlot`) so the columns still line up with
   the rows' checkboxes.
2. **Columns**: one **List header cell** per column; the first fills (at least 160), the rest keep their width.
3. **Trail slot** (28 wide): the "Add column" button, or empty.

The 28 slots at both ends match those of **List row** and **Common ground row**, so heads and values line up.

## Behaviour

 The header is a row of column
heads; with `onSort`, each sortable column holds a button, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), and the sorted column's head says its order with
`aria-sort`, as in the [Sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).
Select-all is a checkbox, after the [Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/). Static
columns, and every column when there is no `onSort`, are plain text and take no focus (`play: NotSortable`).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the select-all checkbox, then to each sortable column in turn; static columns are skipped. | `play: Keyboard` |
| Space (on select all) | Ticks or unticks every row. | `play: Keyboard` |
| Enter or Space (on a column) | Sorts the list by that column. | `play: Keyboard` |
| Enter (on the sorted column) | Turns the order round, when the page flips `sortDirection`. | `play: Sorting` |

The select-all checkbox shows a dash while only some rows are ticked; the page passes `isIndeterminate`.

## Content

- Column labels: one or two words, sentence case, naming what the column holds: "Votes", "Time left", "Comments".
- A number column (`kind: 'number'`) sits at the end of its cell, so the digits line up under it.
- Mark a column `isStatic` when sorting by it means nothing (a title, a status, an assignee).
- "Select all" and "Add column" come through `labels` in other languages.

## Accessibility

**The header gives you:** a row of column heads (`role="row"`), sortable columns as buttons only when there is an
`onSort`, `aria-sort` with the direction on the sorted column, a named select-all checkbox with its mixed state, and
static columns as plain text.

**You still own:**
- The table around it: the header is a row, so the list it heads is a `role="table"` named for what it lists
  ("Options", "Proposals"), with its rows as `role="row"` (List row: `isRow`).
- `sortDirection` on the sorted column, flipped when the page turns the order round.
- Telling people the list is now sorted by another column (the arrow moves; say it if order matters).

## Related

- **List header cell**: one of its columns.
- **List row**: the Ideation row that lines up under it.
- **Voting row**, **Proposals row**, **Common ground row**: the methods' rows under it.
- **Data table**: the full list, when people need more than a method's rows.

## Provenance

- Built by AI agents from Figma's List header (its four `Method` column sets) and the prototype's Manage table (the
  select-all checkbox).
- Reviewed by a person: not yet.
- Known limits: the page sorts the rows itself (the header only reports a press).

## Changes

- 30 Oct 2026: with no `onSort` the column heads are plain text (no dead focus stops); the header is a row of column
  heads and the sorted one says its order with `aria-sort` and `sortDirection`, in place of a pressed toggle; stories
  use local pictures (docs/DECISIONS.md, "Component page fixes").
- 30 Oct 2026: this page written, with its first doc comment; a play function proves the keyboard table.
- 29 Oct 2026: "Select all" and "Add column" come through `labels`.
- 29 Oct 2026: `isStatic`, `isSorted` and `hasLeadSlot` replace the story-only method prop (docs/DECISIONS.md,
  "Public API and prop names").
- 29 Oct 2026: Voting and Proposals Manage show a Panel over the method's List header and rows (docs/DECISIONS.md,
  "Back office redesign on the current components").
- 29 Oct 2026: closer to Figma and the prototype: column widths honoured, the first column fills, 28 select-all and
  add-column slots.

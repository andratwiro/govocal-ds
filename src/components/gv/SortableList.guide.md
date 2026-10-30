# Sortable list

## When to use

- Where the order is the setting and people choose it: a report's key figures in the widget settings (the numbers
  editor), a survey's answer options, the columns of an export.
- With a trailing control on each row (a chevron that opens the row's fields), put in the row's content.

## When not to use

- For picking one or more items from a list: use **Option list**.
- For rows of records people sort by a column: use **Data table**.
- For moving a whole block on a document's page: use **Block frame** (its ↑ ↓).

## Anatomy

1. **Row**: 40 tall, a row line under it.
2. **Handle**: a 24 grip at the start, quiet grey, primary on hover.
3. **Content**: whatever the page renders, 8 after the handle (a value, a label, a trailing control).
4. **Drop line**: 2 in the selected navy with a dot at its start, drawn between rows while dragging; the dragged row
   dims.

## Behaviour

React Aria's grid list with drag and drop, after the WAI-ARIA
[Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/). A pointer drags a row by its handle; the keyboard picks
it up, moves the drop line and drops it. `onReorder` hands back every row in its new order.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves into the list, onto a row's handle. | `e2e/report-parts.spec.ts` |
| Enter (on a handle) | Picks the row up; the drop line appears. | `play: Keyboard` |
| Down arrow / Up arrow (while carrying) | Moves the drop line to the next or previous place. | `play: Keyboard` |
| Enter (while carrying) | Drops the row at the line. | `play: Keyboard` |
| Escape (while carrying) | Puts the row back where it was. | `e2e/report-parts.spec.ts` |

## Content

- Name each row in words with `itemLabel` ("3,600 Participants"): the handle's name is built from it.
- The handle's name comes from `labels.drag` ("Move 3,600 Participants").
- Keep rows to one line; open the details elsewhere.

## Accessibility

**The part gives you:** drag and drop that works without a pointer, a named handle per row, React Aria's spoken steps
while carrying (picked up, where it will drop, dropped), and a drop line that doesn't move the rows.

**You still own:**
- Keeping the new order (`onReorder`) and saving it.
- A name for the list (`aria-label`).

## Related

- **Block frame**: moving blocks on a page.
- **Option list**: picking from a list.
- **Data table**: rows of records.

## Changes

- 30 Oct 2026: built (drag by handle, keyboard reordering, trailing controls, disabled), with this page.

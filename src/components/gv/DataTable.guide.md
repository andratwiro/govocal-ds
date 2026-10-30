# Data table

## When to use

- For a list of records people scan, sort and act on: users, inputs, projects, reports, emails, tags. Every admin list
  in the back office is a Data table.
- When people tick several rows to act on them together (assign, change status, export), and open one row to see it in
  full beside the list.
- For long lists too: past about 200 rows, turn on `isVirtualized` and the table draws only the rows in view, with the
  same look and keyboard.
- The usual shape of a list page: a **Panel** with the list's title, a **Table toolbar** (count, search, filters), the
  table, and **Pagination** in the Panel's foot.

## When not to use

- For a few facts about one record (label and value): use **Property list**.
- To pick one or several options in a form or a popover: use **Option list**, or **Checkbox group** for a few options in view.
- To show how numbers compare (a ranking, a breakdown): use **Bar row** or a **Chart**.
- For a conversation of comments and replies: use **Comment thread**.
- For a person's notifications: use **Notification list**.
- When nothing can be done with the rows and there are only two or three: a sentence or a **Property list** reads better.

## Anatomy

1. **Header row**: the column labels, small and quiet over a hairline. A sortable column shows an arrow when sorted
   and under the pointer.
2. **Check column** (when rows can be ticked): a checkbox per row, and select-all in the header.
3. **Rows**: hairline-divided, no zebra, a soft hover. The open row gets a tint and a bar at its start edge.
4. **Cells**: text (with an optional thumbnail and warning marks), a person, an assignee, tags, a value over a sub-line.
5. **Options column** (optional): a "…" menu at the end of each row.
6. **Add column** (optional): a "+" at the end of the header to pick which columns show.
7. **Empty state**: the words shown when no row matches.
8. **Loading row** (optional): "Loading more…" at the end while the next rows arrive.

## Behaviour

The table follows the WAI-ARIA [Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/): the whole table is one
stop for Tab, and the arrow keys move inside it. A press on a row opens it; only the checkbox, Space, or a Shift, ⌘
or Ctrl click ticks it, so people can open a record while others stay ticked.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the table, onto a row. | `play: Keyboard` |
| ↓ and ↑ | Move focus to the next or previous row. | `play: Keyboard` |
| Space | Ticks or unticks the focused row. | `play: Keyboard` |
| Enter | Opens the focused row (in a Side panel beside the table); ticked rows stay ticked. | `e2e/data-table-open.spec.ts` |
| Page Down | Moves focus a screenful of rows down (checked on a 5,000-row list). | `e2e/data-table-virtual.spec.ts` |
| End and Home | Move focus to the last or the first row. | `e2e/data-table-virtual.spec.ts` |

When the Side panel opened from a row closes, focus goes back to that row and the arrow keys carry on from there
(`e2e/side-panel.spec.ts`).

## Content

- Column labels: one or two words, nouns, sentence case: "Name", "Role", "Ideas", "Joined".
- Name the table for what it lists, with `aria-label` or the Panel's title: "Users", "Ideas".
- The first column names the row (`isRowHeader`): a person's name, an idea's title.
- Counts are numbers (`align="number"`): centred, figures of one width. Dates and numbers follow the page's language.
- Long text wraps to three lines and then stops with "…"; a virtualised table keeps every row to one or two lines.
- The empty state says what is missing and, when the person can fix it, how: "No users here.", "No ideas match these
  filters."
- Each row's "…" is named for its row: "Options for Resident A".
- The loading row says "Loading more…" by default; pass your own words in the page's language.

## Accessibility

**The table gives you:** a grid that screen readers announce with its row count (also when virtualised), the sorted
column and its direction, which rows are ticked, the open row (`aria-current`), and the keyboard above.

**You still own:**
- A name for the table (`aria-label`), and a row header column (`isRowHeader`).
- Names for the row options ("Options for …") and for any icon in a cell.
- Keeping `openKey` on the record the Side panel shows, and putting focus back with the panel's `returnFocus` when the
  pager walks to another record.
- The empty state's words, and the words a Selection bar says for ticked rows ("3 selected").

## Related

- **Table toolbar**: the count, search and filters above the table.
- **Filter menu** and **Filter chips**: filtering the rows.
- **Selection bar**: the actions for ticked rows.
- **Pagination**: pages of rows in the Panel's foot.
- **Side panel**: one row's record beside the table.
- **Panel**: the frame a list page's table sits in.
- **Empty state**: the bigger message when a list has nothing yet.

## Changes

- 30 Oct 2026: the stories write dates and counts in the Locale toolbar's locale (they were fixed to English).
- 30 Oct 2026: this page written; its doc comment now says what it is for, and a play function proves the keyboard
  table.
- 29 Oct 2026: `isVirtualized`, `rowLines` and `onLoadMore` for long lists (docs/DECISIONS.md, "Long lists").
- 29 Oct 2026: moved to Components › Tables & lists with the rest of a list page's parts (docs/DECISIONS.md,
  "Structure: one place for each part").
- 29 Oct 2026: a press opens the row and the checkbox ticks, on the same table; `openKey` marks the open row;
  `toKeySet` turns "all" into keys.

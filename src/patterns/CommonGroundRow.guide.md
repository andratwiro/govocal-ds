# Common ground row

## When to use

- For one statement in a Common Ground phase's Manage list: the statement, its assignee, its likes, the share who
  agree and how many reactions it has, in columns under a **List header**.
- With `select` where participants' statements can be picked for a bulk status or assignee change.
- With `isNew` for a statement the team hasn't seen yet, and `hasWarning` for a flagged one.

## When not to use

- To show where people stand on a statement as a bar (agree, disagree, pass): use **Statement row**.
- For rows of another method: use **Voting row**, **Proposals row** or **List row** (ideas).
- For a sortable, filterable list with row actions: use **Data table**.

## Anatomy

1. **Leading slot** (28): the checkbox, with `select`; it shows on hover, on focus and once ticked.
2. **Statement**: the text, then the warning mark and "New".
3. **Assignee**: a filled avatar with an initial, an empty dashed ring when unassigned, nothing for a statement the
   project team wrote.
4. **Likes**: a count, or "–" for a statement nobody can like.
5. **Agree**: the share who agree.
6. **Reactions**: agree, disagree and pass so far.
7. **Trailing slot** (28).

## Behaviour

Only the checkbox takes focus, after the WAI-ARIA [Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/);
the row itself does nothing when pressed. Behaviour from React Aria's Checkbox, through the system's Checkbox.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the row's checkbox. | `play: Keyboard` |
| Space | Ticks or clears the checkbox. | `play: Keyboard` |

## Content

- The statement is the participant's sentence as written.
- Numbers are numbers: likes, the agree share (0–100) and reactions are written in the page's locale ("1,284",
  "60 %" in French).
- Name each checkbox for its statement (`select['aria-label']`), not the default "Select", so a screen reader user
  knows which one they tick.
- "New" and the warning's name ("Needs attention") come in through `labels`.

## Accessibility

**The row gives you:** a checkbox with a name, a warning mark with a name, numbers as text in their columns.

**You still own:**
- The **List header** above the rows, so each column has a name; the row's cells are not table cells.
- A name per checkbox that says which statement it ticks.
- What a ticked row does (the bulk bar), and its select-all.

## Related

- **List header**: the column names above the rows, with select-all.
- **Statement row**: the same statement's agree, disagree and pass bar.
- **List row**: the idea list's row.
- **Checkbox**: the leading checkbox.

## Provenance

- Built by agents from Figma ("Common ground row": Assignee · new, New, New · warning, Empty) and the designer's
  prototype's Manage table; the checkbox is Not in Figma.
- Reviewed by a person: not yet.
- Known limits: the back office doesn't use it yet; the row is a flex row, not
  a table row, so columns line up only with a List header of the same widths.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: no aliases: `reactionCount` and `visibleCount` went.
- 29 Oct 2026: built from Figma and the prototype.

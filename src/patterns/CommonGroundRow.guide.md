# Common ground row

## When to use

- For one statement in the Manage list of a Common Ground phase (the admin's list of a phase's statements). One row
  per statement, always under a **List header** that names the columns: Statement, Assignee, Likes, Agree, Reactions.
  The "Under its List header" story shows them together.
- Where statements can be picked for a change to many at once (a status or an assignee): the row gets a checkbox
  (`select`).
- To mark a statement nobody on the team has looked at yet ("New", `isNew`), and one flagged as needing attention (the
  warning triangle, `hasWarning`).

## When not to use

- For the agree, disagree and pass split as a coloured bar, to read where people stand: use **Statement row**. This
  row gives the admin numbers to sort and act on; Statement row shows the split at a glance.
- For rows of another participation method: use **Voting row**, **Proposals row**, or **List row** for ideas.
- When the list must sort, filter and open rows itself: use **Data table**. This row is display only: sorting is the
  List header's, filtering is the toolbar's, and a press on the row does nothing.

## Anatomy

1. **Checkbox space** (28px wide): the checkbox, only on a list where statements can be picked. It shows on hover, on
   focus and once ticked; on a touch screen without hover, the List header's select-all shows the list can be picked.
2. **Statement**: the text, wrapping onto as many lines as it needs, then the warning triangle (if flagged) and "New"
   (if new).
3. **Assignee**: who on the team reviews it. An initial in a filled circle when assigned, an empty dashed ring when
   nobody is, and nothing for a statement the project team wrote (nobody reviews those).
4. **Likes**: how many participants liked it, or "–" for a statement nobody can like (the team's own).
5. **Agree**: the percentage of reactions that are "agree".
6. **Reactions**: how many agree, disagree and pass reactions it has had up to now.
7. **End space** (28px wide): empty, so the columns line up with the List header.

The last four columns are fixed widths (88, 56, 72 and 88px); the statement takes the rest.

## Behaviour

Only the checkbox can be reached with the keyboard, and it works like any **Checkbox** (WAI-ARIA
[Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)). The row itself does nothing when pressed; the
grey on hover only shows which row the pointer is on.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the row's checkbox. | `play: Keyboard` |
| Space | Ticks or clears the checkbox. | `play: Keyboard` |

## Content

- The statement as its writer wrote it, whole: no shortening, no length limit of the row's own.
- Numbers as numbers in the page's language ("1,284"; "60 %" in French), never shortened to "1.2k". Agree is a whole
  percentage.
- A statement with no reactions yet still shows its Agree as a number (0); Reactions 0 says why.
- "–" is only for Likes on a team statement; a participant's statement with no likes says 0.
- The checkbox's name, for screen readers, names its statement: "Select Keep one quiet zone", not the default "Select".
- The words the row says on its own, which a screen passes translated (`labels`): "New", "Needs attention" (the
  triangle's name) and "Select".

## Accessibility

**The row gives you:** a checkbox with a name, a warning triangle with a name ("Needs attention"), and the numbers as
text in their columns.

**You still own** (the screen's designer and developer):
- The **List header** above the rows, so each column has a name; the row's cells are not table cells.
- A checkbox name per row that says which statement it ticks.
- What a ticked row does: the bar of actions for the picked statements, and the select-all in the List header.
- Who an initial stands for: the row shows only the initial.

## Related

- **List header**: the column names above the rows, with select-all.
- **Statement row**: the same statement's agree, disagree and pass bar.
- **List row**: the idea list's row.
- **Checkbox**: the leading checkbox.

## Provenance

- Built by AI agents from Figma ("Common ground row": Assignee · new, New, New · warning, Empty) and the designer's
  prototype's Manage table; the checkbox is Not in Figma.
- Reviewed by a person: not yet.
- Known limits: no back-office screen uses it yet (it is built from Figma and the prototype). It isn't a real table, so
  its columns line up only with a List header of the same widths, and screen readers don't hear column names.

## Changes

- 30 Oct 2026: a story under its List header; each story says what it shows; the page reworded after a fresh-eyes
  read.
- 30 Oct 2026: Behaviour names React Aria's parts as docs/REACT-ARIA.md now reads them (CheckboxField and
  CheckboxButton, through Checkbox).
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: the old setting names for reactions went; one name each.
- 29 Oct 2026: built from Figma and the prototype.

# Side panel

## When to use

- To show one record of a list beside the list, so people can work through records without leaving it: an idea in the
  Manage tab, a person in Users.
- When changes made to the record apply at once (with an Undo toast). The panel has no Save.
- With the record pager ("‹ 3 of 124 ›") when people walk the list one record at a time.
- Inline (`isInline`) when the record is a column of the page, such as a preview beside a list.
- With a kind icon and the label as its title (`icon`, `headingLevel`) when the label names the record itself, such as
  a report widget's settings ("By the numbers").
- Head-less (`isInline showHead={false}`) for a column that rests on the page and can't be closed, such as the report
  builder's assistant (the Assistant panel).

## When not to use

- For a task that must be finished or cancelled before going on (a form to fill, a choice to confirm): use **Modal**.
- To confirm something that can't be undone: use **Alert dialog**.
- For a short hint about one control: use **Help popover** or **Tooltip**.
- For the main content of a page: lay it out in **Panel**s or **Card**s on the page itself.
- For a list of short choices from a button: use **Menu**.

## Anatomy

1. **Head**: an optional kind icon (16), the context label at the start (where the record comes from, such as
   "Collect ideas"; with `headingLevel`, the record's title as a heading in Title type), the record pager (optional)
   and × at the end. `showHead={false}` leaves the head out of an inline panel.
2. **Record head** (`SidePanelRecordHead`, optional): the record's title, words, author and date, with quick actions.
3. **Sections** (`SidePanelSection`): the record's parts, with a hairline between them, such as a Property list of its
   status, assignee and tags.
4. **Footer** (optional): stays put while the body scrolls.

The panel floats at the window's end edge (560 wide, or 440 when `narrow`) over the page, which stays usable behind it.

## Behaviour

The panel is a non-modal dialog, after the WAI-ARIA [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
focus moves in when it opens and goes back when it closes, but the list behind it stays usable, so a click on another
row shows that row here.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on what opens it) | Opens the panel and moves focus into it. | `play: Keyboard` |
| Tab | Moves through the panel's controls in order: the head's buttons (pager, ×), then the body's fields and buttons. | `play: Keyboard` |
| Esc (in a field with words) | Keeps the words and leaves the field; the next Esc closes the panel. | `play: Keyboard` |
| Esc | Closes the panel and puts focus back on what opened it (the row). | `e2e/side-panel.spec.ts` |
| Enter (on ‹ or ›) | Shows the previous or next record. At the first or last record that button turns off and focus moves to the other one. | `e2e/side-panel.spec.ts` |

## Content

- The context label says where the record comes from, in a few words: the phase ("Collect ideas"), the list
  ("Users"). It also names the panel for screen readers.
- Name the pager's buttons for the record: `labels={{previous: 'Previous idea', next: 'Next idea'}}`.
- The pager's place reads "3 of 124", numbers in the page's language.
- Changes apply at once and say so in a toast with Undo ("Status changed to Accepted"), never with a Save button.
- A footer, when there is one, holds a status line ("Changes are saved as you make them") and at most a "Done".

## Accessibility

**The panel gives you:** a dialog named by its context label, focus in on open and back on close, Esc that never
throws away half-written words, a pager whose turned-off end moves focus to the other button, and the place
("3 of 124") read out as it changes.

**You still own:**
- Opening it from something focusable (a row, a button), so there is somewhere for focus to go back to.
- `returnFocus` when the pager walked to another record, so focus goes back to that record's row.
- Names for the pager's buttons and the record's quick actions, in the page's language.
- A heading for the record (`SidePanelRecordHead`'s title) so screen reader users can find their way in it.

## Related

- **Data table**: the list the panel sits beside; its `openKey` marks the open row.
- **Property list**: the record's label and value rows.
- **Modal**: the blocking dialog, for tasks.
- **Toast**: the Undo for changes made in the panel.
- **Panel**: a section of a page, not an overlay.

## Changes

- 30 Oct 2026: `icon` (a kind icon in the head), `headingLevel` (the label as a Title heading; the prototype's 15px
  snaps to Title 16) and `showHead={false}` (an inline column with no head, a region rather than a dialog).
- 30 Oct 2026: this page written; a play function proves Tab and Esc in a field.
- 29 Oct 2026: a floating panel is closed until `isOpen` or `defaultOpen` (docs/DECISIONS.md, "Composition contracts
  in code").
- 29 Oct 2026: `width="default" | "narrow"` (560, 440) replaced the fixed width; `SidePanelRecordHead` and
  `SidePanelActions` added.
- 29 Oct 2026: built as a non-modal panel with the record pager inside it (docs/DECISIONS.md, "Building from the
  prototype review").

# Alert dialog

## When to use

- To confirm something that can't be undone before it happens: delete a project, a report, a group, a draft, a page,
  a token or a webhook; block or delete a user; revoke access.
- To confirm a step with a cost that isn't a loss, as a plain (neutral) confirm: "Download the results (PDF)",
  "Anonymize all user data?", archiving a project from its overview.
- With **type to confirm** (`confirmText`) only where data is lost for good and at scale: "Type **Reset** to confirm"
  before resetting a project's participation data.
- With an **impact list** (`impact`) when one change has several consequences of different weight: the Edit form
  warning (deleting a question loses data, reordering may skew it, fixing a typo is safe).
- Opened from a row's "…" menu or a Selection bar action (`isOpen` / `onOpenChange`), or beside its own button in a
  `DialogTrigger`.

## When not to use

- For a change that can be taken back: make it at once and offer Undo in a **Toast** (a status, an assignee, a tag,
  admin rights). An Alert dialog is friction; keep it for what can't be undone.
- For a form, a choice between options or anything longer than a question and a sentence or two: use **Modal**.
- To show a record beside its list: use **Side panel**.
- For a message about the page that needs no answer now: use **Banner**.
- To explain a control: use **Help popover**.

## Anatomy

1. **Icon badge** (`tone="danger"`, or your own `icon`): the warning triangle on a soft danger square, above the title.
2. **Title**: the question ("Delete this group?"); it names the dialog.
3. **Body**: the consequence, in a sentence or two.
4. **Impact list** (optional): one row per consequence, each with a tone icon (danger, warning, success), a title and a
   line.
5. **Type to confirm** (optional): "Type **Reset** to confirm" over a text field.
6. **Footer**: a quiet Cancel, then the confirm (primary, or danger with `tone="danger"`). No ×.

420 wide (at most 94% of the window), centred over a dimmed page.

## Behaviour

Behaviour from React Aria's `Dialog` and `Heading`, through the system's Modal, Button and Text field.

The dialog (`role="alertdialog"`) follows the WAI-ARIA [Alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/): the page behind it can't be reached
while it is open, and both buttons close it. Confirm calls `onConfirm`; Cancel, Esc and a click outside call
`onCancel`.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on what opens it) | Opens the dialog. A plain confirm puts focus on the dialog itself. | `play: Keyboard` |
| (on open, danger) | Focus starts on Cancel, so a stray Enter never deletes. | `e2e/alert-dialog.spec.ts` |
| (on open, type to confirm) | Focus starts in the text field; the confirm stays off until the exact word is typed (case counts). | `e2e/alert-dialog.spec.ts` |
| Tab and Shift Tab | Move between Cancel and the confirm, and never leave the dialog. | `play: Keyboard` |
| Enter (on the confirm) | Confirms and closes; focus goes back to what opened it. | `play: Keyboard` |
| Esc | Cancels and closes; focus goes back to what opened it. | `e2e/alert-dialog.spec.ts` |

## Content

- The title is a question that names the action and the thing: "Delete this group?", "Reset all participation
  data?", "Revoke access?". Sentence case, ending in "?".
- The body says what happens and what doesn't, plainly: "Managers in this group keep their account, but lose the
  permissions it grants." End a destructive one with "This can't be undone."
- The confirm repeats the verb and the thing from the title: "Delete group", "Reset data", "Block user". Never "OK",
  "Yes" or "Confirm".
- Cancel says "Cancel" (`labels.cancel`); change it only when the question needs it ("No, cancel" against "Yes,
  continue" in the Edit form warning).
- The word to type is short and matches the action ("Reset", "Delete"); the line around it is
  `labels.typeToConfirm`.
- Impact rows: a short title for the change ("Delete a question") and one line for what it does to the data.

## Accessibility

**The dialog gives you:** `role="alertdialog"` named by its title, focus in on open and back on close, focus on Cancel
for danger and in the field for type to confirm, focus that stays inside, Esc as Cancel, and the page behind hidden
from assistive tech while it is open.

**You still own:**
- A title that is a full question and a confirm that names its action, so the choice makes sense read alone.
- Opening it from something focusable, so focus has somewhere to go back to.
- Keeping it open (`isOpen` held `true`) when the confirm's work can fail, and saying what went wrong.
- Saying what happened after it closes, usually in a **Toast** ("Group deleted").
- Every word in the page's language: the title, body, confirm and `labels`.

## Related

- **Modal**: the dialog for forms and choices, with a head and a ×.
- **Toast**: the Undo for changes that don't need a confirm, and the word after one that did.
- **Button**: the danger tone the confirm wears.
- **Menu**: the row's "…" a Delete usually starts from.
- **Selection bar**: bulk actions that may ask first ("Delete these inputs?").

## Provenance

- **Built by:** agents, from the prototype (its confirms, the reset's type to confirm and the Edit form warning). Not
  in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** the confirm closes the dialog straight away; a confirm that waits on the server must control
  `isOpen` itself. No pending state on the confirm button.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab, Shift Tab and Enter on the confirm.
- 29 Oct 2026: both buttons close it and `onCancel` runs for Cancel, Esc and a click outside; focus starts on Cancel for
  danger, in the field for type to confirm (docs/DECISIONS.md, "Composition contracts in code").
- 29 Oct 2026: tones are `neutral | danger`; impact rows `danger | warning | success` (were `caution`, `safe`).
- 29 Oct 2026: its own component, not a Modal variant: no head, no ×, an icon badge; type to confirm only where data is
  lost for good (docs/DECISIONS.md, "Building from the prototype review").

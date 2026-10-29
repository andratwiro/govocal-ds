# Modal

## When to use

- For a short task that must be finished or cancelled before going back to the page: New project, Add a phase,
  Create a report, Add a manager, Import answers, Edit a tag, Generate the report.
- To start something from a gallery or a choice of options: Start from a template, Create a report's template choice
  (`width="wide"`).
- For a record or a preview that needs the whole window for a moment: a project in the Inspiration hub, a report in
  the Community monitor (`width="wide"`).
- For settings grouped under side tabs: Project settings, with `height="fixed"` and `isFlush` so the side list and
  its panel scroll on their own.
- For a form in pages ("Page 1 of 3"), its footer's Back and Next walking them.

## When not to use

- To confirm something that can't be undone: use **Alert dialog** (no ×, Cancel first, a danger confirm).
- To show one record of a list while the list stays usable: use **Side panel**.
- For a short explanation of one control: use **Help popover**.
- For a list of actions or choices from a button: use **Menu**.
- To say a change was made: use **Toast**.

## Anatomy

1. **Head**: the title at the start and × at the end, over a hairline.
2. **Body**: padded and scrolling on its own when it is long; `isFlush` drops the padding and scrolling for a body
   that lays out its own (side tabs).
3. **Footer** (optional): the buttons, at the end, on the toolbar grey. A button with `slot="close"` closes the modal.

Widths: 420 (default, Figma's) or 866 (`width="wide"`), never more than 94% of the window. Height grows with the body,
or holds at 640 (`height="fixed"`) so a tabbed body doesn't jump.

## Behaviour

Behaviour from React Aria's `Dialog`, `Heading` and `Button`, through the system's starter Modal.

The modal follows the WAI-ARIA [Dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): the page behind is dimmed and can't
be reached while the modal is open.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on what opens it) | Opens the modal and moves focus onto the dialog. | `play: Keyboard` |
| Tab and Shift Tab | Walk the ×, the body's controls and the footer's buttons, and wrap round without leaving the modal. | `play: Keyboard` |
| Esc | Closes the modal and puts focus back on what opened it. | `play: Keyboard` |

A click outside closes it too, unless `isDismissable={false}`.

## Content

- The title names the task or the thing: "New project", "Add a phase", "Attachments", "Project settings". Sentence
  case, no full stop, no question (a question is an Alert dialog).
- The footer's main button repeats the task's verb: "Create project", "Add phase", "Save". Its partner is "Cancel".
  A modal that changes nothing as you go ends with "Done".
- Keep the body to what the task needs; a long explanation belongs on the page.
- The ×'s name is "Close" (`labels.close`).

## Accessibility

**The modal gives you:** a dialog named by its title, focus in on open and back on close, focus kept inside, Esc to
close, the page behind hidden from assistive tech, and a named ×.

**You still own:**
- Opening it from something focusable, so focus has somewhere to go back to.
- Labels for every field in the body, and a footer whose main button says what it does.
- Not losing work: a modal with a half-filled form closes on Esc or a click outside; pass `isDismissable={false}` or
  confirm when that would lose something.
- Saying what happened after it closes, usually in a **Toast** ("Project created").
- Words in the page's language (`labels.close`, title and buttons).

## Related

- **Alert dialog**: the confirm for what can't be undone.
- **Side panel**: a non-blocking record beside its list.
- **Tabs**: the grouped side tabs a settings modal holds.
- **Choice card**: the tiles a start-from dialog picks between.
- **Toast**: what to say once the task is done.

## Provenance

- **Built by:** agents, from Figma (its one Modal: Attachments) and the prototype (Share, Access, Input manager, the
  wide and fixed-height shells, the side tabs).
- **Reviewed by a person:** not yet.
- **Known limits:** no description slot under the title yet (the plan's small fixes list it); on a short window a
  640 fixed-height modal can outgrow the screen (`e2e/tabs.spec.ts` runs it in a tall one).

## Changes

- 30 Oct 2026: this page written; a play function proves Enter, Tab, Shift Tab and Esc.
- 29 Oct 2026: `padBody` became `isFlush` (default false); `size` became `width` (docs/DECISIONS.md, "Public API and prop
  names").
- 29 Oct 2026: the Component takes the name Modal; the starter part is in neither entry (docs/DECISIONS.md, "Public API
  and prop names").
- 29 Oct 2026: widths stay 420 and 866; `height="fixed"` (640, the body scrolls) for tabbed dialogs (docs/DECISIONS.md,
  "Building from the prototype review").
- 29 Oct 2026: the prototype's radius 12 with no border, over Figma's 14 with a thin border (docs/DECISIONS.md,
  "Fidelity review against Figma and the prototype").

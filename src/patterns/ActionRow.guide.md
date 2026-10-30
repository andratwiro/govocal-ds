# Action row

## When to use

- For the next things a project manager can do, one row each, in a short stack: "Next actions" on the project overview
  ("Message participants", "Create report").
- For the Insights panel's "Recommended actions", with the action's own icon at the end ("Add a report", "Share results
  with participants").
- For an action that runs in place: `status="working"` while it runs (a ring and a countdown badge), then
  `status="done"` ("Report ready") opening the result.
- With `menu` when the row offers a few ways to do it ("Share results with participants" → Go to Messaging, Add a
  text block…).
- In an `ActionRowList`, which says "All caught up. Nothing left to suggest." when there are no rows.

## When not to use

- For a step of a setup checklist that gets done: use **Setup step**.
- For the main action of a page or a dialog: use **Button**.
- For a link inside a sentence: use **Link**.
- For a row of a list of records (an idea, a person): use **List row** or **Data table**.
- For one figure with its trend: use **Stat card**.

## Anatomy

1. **Lead** (working or done only): the progress ring while it runs, the check once done.
2. **Label**: what the row does, one line.
3. **Description** (optional): a grey line under the label.
4. **Badge** (optional): a short count or state before the end ("18 new", "9s").
5. **End**: a chevron, or the action's icon (`icon`).

Rows are bordered, full width of their column, stacked 8 apart in an `ActionRowList`.

## Behaviour

A row is a link (with `href` or `onPress`), or a menu button with `menu`, after the WAI-ARIA
[Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/). A working row is a busy group with
nothing to press. Behaviour from React Aria's Button, MenuTrigger, ProgressBar and Link.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the next row; a working row is skipped. | `play: Keyboard` |
| Enter | Runs the row's action or follows its link. | `play: Keyboard` |
| Enter (on a row with a menu) | Opens the menu under the row, focus on its first item. | `e2e/build-tab.spec.ts` |
| Esc (in the menu) | Closes the menu and puts focus back on the row. | `e2e/build-tab.spec.ts` |

## Content

- Start with a verb, sentence case, a few words: "Message participants", "Create report", "Add a report".
- The description says why or what for, in one short line ("Reading the results of this phase").
- A badge is a number with its word ("18 new") or the time left while working ("9s"); write numbers in the page's
  language.
- Working and done rows change their words: "Creating report" while it runs, "Report ready" when done.
- The empty list's line comes in through `labels` or `emptyLabel`.

## Accessibility

**The row gives you:** a real link or menu button with its label as its name, a working row that says it is busy
(`aria-busy`, `aria-disabled`) with a named progress ring, decorative icons hidden, and a menu whose name defaults to
the label.

**You still own:**
- A name for the list (`aria-label`, "Next actions") or a heading above it.
- A `menuLabel` when the label isn't plain text.
- Telling people when a working row is done (the row's words change; a Toast if it finishes off screen).
- The `labels` in the page's language.

## Related

- **Panel section**: the section ("Next actions") the rows sit in.
- **Setup step**: the checklist row of a project's setup.
- **Menu**: what a row with `menu` opens.
- **Stat card**: the figure above "Next actions" on the overview.

## Provenance

- Built by agents from the designer's prototype ("Next actions" and the Insights panel's "Recommended actions");
  not in Figma.
- Reviewed by a person: not yet.
- Known limits: a working row can't be cancelled from the row; the badge is text the page writes.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab and Enter.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: the action's icon, a description, working and done states, a menu under the row and disabled.
- 29 Oct 2026: one Action row for Next actions and Insights' Recommended actions (docs/DECISIONS.md, "Built in the
  project package").

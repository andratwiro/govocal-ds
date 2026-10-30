# Volunteering row

## When to use

- In a volunteering phase's Manage list (`layout="manage"`, the default): one cause, its description and a bar
  towards its volunteer goal, with how many volunteers signed up at the end.
- In a volunteering phase's Build tab (`layout="build"`): the Causes card's rows, the title over how many signed up
  ("No sign-ups yet", "4 signed up"), with Edit and Delete.
- With `isLast` on the last row of a list, which drops its divider.

## When not to use

- For a voting option or a proposal: use **Voting row** or **Proposals row**.
- For the people who signed up to a cause: use **Data table** with person cells.
- For a card that holds the causes with its own actions (Add a cause): use **Card**, with these rows inside.
- For a vote count against a threshold: use **Vote progress**.

## Anatomy

Manage:
1. **Thumbnail**: a 52 rounded square (optional image).
2. **Cause**: the title, the description, and the thin bar towards the goal (`percent`).
3. **Volunteers**: the count over "volunteers" ("1 volunteer").

Build:
1. **Thumbnail**: 40.
2. **Cause**: the title over the sign-ups line.
3. **Actions**: Edit and Delete icon buttons, each with its tooltip.

A hairline under each row but the last.

## Behaviour

The Manage row is not interactive; its goal bar reads as a progress bar named "Volunteer goal for <title>" that says
the share reached ("60% of the goal"). The Build row's Edit and Delete are buttons, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/), each showing its tooltip on focus. Behaviour from
React Aria's ProgressBar (the goal bar), and Button and Tooltip through Icon button and Tooltip.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to Edit, then Delete; each shows its tooltip. | `play: Keyboard` |
| Enter, Space | Presses the focused button (`onEdit`, `onDelete`). | `play: Keyboard` |

## Content

- The title names the cause as a job people sign up for: "Tree-planting weekends", "Photograph the park".
- The description says what volunteers do, in one line: "Help plant shade trees along the park promenade."
- `percent` is the goal reached, 0–100; the count is a number, written in the page's locale.
- "N signed up", "No sign-ups yet", "volunteer" / "volunteers", Edit and Delete (named "Edit <title>"), and the goal
  bar's name and words ("Volunteer goal for <title>", "60% of the goal") come in through `labels`.

## Accessibility

**The row gives you:** Edit and Delete named for their cause, tooltips on focus as on hover, a decorative thumbnail
hidden from screen readers, the count as text.

**You still own:**
- Asking before Delete, or an Undo toast after it: the row only reports the press.
- The list's heading (the Causes card's title).

## Related

- **Card**: the Causes card the Build rows sit in.
- **Icon button**: Edit and Delete.
- **Tooltip**: the buttons' names on hover and focus.
- **Voting row**: another method's Manage row.

## Provenance

- Built by agents from Figma ("Volunteering row", the Manage row) and the designer's prototype (the Causes card for
  the Build layout, Not in Figma).
- Reviewed by a person: not yet.
- Known limits: the back office uses only the Build layout.

## Changes

- 30 Oct 2026: the Manage goal bar is a progress bar, named for the cause, that says the share of the goal
  (`labels.goal`, `labels.goalReached`).
- 30 Oct 2026: this page written, its doc comment added; a play function proves Edit and Delete by keyboard.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: the Build variant is `layout="build"` (where it sits), not `variant` (docs/DECISIONS.md, "Public API and
  prop names").
- 29 Oct 2026: a Build layout for the Causes card: 40 thumbnail, sign-ups line, Edit and Delete with tooltips.
- 29 Oct 2026: built from Figma and the prototype.

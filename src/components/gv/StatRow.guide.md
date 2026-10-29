# Stat row

## When to use

- For a count that leads to the things it counts: "Waiting for feedback" on the dashboard's Input status card, which
  goes to the Input manager.
- For a stack of counts that each filter a list: the Ideas overview beside a phase's Manage tab ("Waiting for a reply",
  "Unassigned", "New ideas"). Pressed, the row's filter turns on (`isSelected`); pressed again, off.
- With `isNew` when the count holds something nobody has seen yet ("New ideas").
- Static (`isStatic`) for a figure that goes nowhere: three side by side on a dashboard card (Events, Emails,
  Internal adoption), a quarter's Average and Responses in Community monitor, or a count of 0.

## When not to use

- For a headline number on a dashboard, with a note, a trend or a sparkline: use **Stat tile**.
- For a number with its sparkline that opens a detail on a project page: use **Stat card**.
- For a next action to take ("Add a phase"), not a count: use **Action row**.
- To say only that something is new, with no count: use **New dot**.
- For a label and value about one record: use **Property list**.

## Anatomy

1. **Label**: the words, above the value.
2. **New dot** (with `isNew`): after the label.
3. **Value**: the number, large, on a 28 line.
4. **Chevron**: at the far end of the value's line, on a row that leads somewhere.

Rows are 80 tall, so a stack's hover areas touch. A selected row stays painted as hovered, with a dark chevron.

## Behaviour

Behaviour from React Aria's Link. A row that leads somewhere is a link, after the WAI-ARIA
[Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/); with `href` it goes there, with `onPress` it runs the
page's action (turning a filter on). A static row takes no focus.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the next row that leads somewhere; static rows are skipped. | `play: Keyboard` |
| Enter | Follows the row: goes to its page, or turns its filter on or off. | `play: Keyboard` |

A selected row is read as the current item (`aria-current`), so people hear which filter is on.

## Content

- Label: what is counted, in a few words, sentence case: "Waiting for a reply", "New ideas", "Avg. response".
- Value: the number, formatted by the page ("1,284", "3 days"); keep it short enough for one line.
- Make the row static when its count is 0; there is nothing to go to.
- The link is read as the label and the value together ("Waiting for a reply 40"), so the label must make sense
  before a number.

## Accessibility

**The row gives you:** a real link with its focus ring, Enter to follow it, the chevron hidden from screen readers, a
named "New" dot, and the current item announced when a filter is on.

**You still own:**
- A row that is static when it goes nowhere; a link that does nothing confuses people.
- Telling people the list changed when a row turns a filter on (the list's count, a status line).

## Related

- **Stat tile**: the dashboard's headline number.
- **Stat card**: a stat with a sparkline on a project page.
- **New dot**: the "new" mark it carries.
- **Dashboard card**: where static rows sit three side by side.
- **Filter chips**: the chip that shows a row's filter is on, and removes it.

## Provenance

- Built by agents from Figma's Stat row (Default, Default · new, Hover, Static); the selected state is the prototype's
  (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: a row that turns a filter on is a link, not a toggle button; the "New" dot's name can't be changed from
  Stat row (it always says "New").

## Changes

- 30 Oct 2026: this page written, with its first doc comment; a play function proves the keyboard table.
- 29 Oct 2026: stat numbers on a 28 line (Figma 32, the prototype 28) (docs/DECISIONS.md, "Fidelity review against
  Figma and the prototype").
- 29 Oct 2026: Internal adoption's figures as static Stat rows, like Emails (docs/DECISIONS.md, "Back office redesign
  on the current components").
- 29 Oct 2026: closer to Figma and the prototype: the chevron at the far end of the number's line, rows 80 tall;
  `isSelected` for a metric whose filter is on.
- 29 Oct 2026: built from Figma and the prototype.

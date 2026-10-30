# Date range field

## When to use

- For a start date and an end date that may stay open: a phase's dates in its setup card ("Add end date" until the end
  is known).
- With times (`showTime`) for an event: "Event dates" with a start and end time beside each date.
- With a fixed time zone shown after the fields (`timeZone="Europe/Brussels"`).
- For custom dates behind a preset: Dashboard shows it only when the preset is "Custom".

## When not to use

- For a fixed choice of periods ("Last 30 days", "This year"): use **Select** (quiet, as Dashboard's preset).
- To show dates, not edit them: use **Text** or a **Property list** row.
- For a date on a timeline: use **Phase timeline**.

## Anatomy

1. **Label** (optional): "Dates", above the row; with `isRequired` the **Required marker** beside it.
2. **Start date**: a date field with its calendar button; a time field after it with `showTime`.
3. **Add end date** button, or once added: a dash, the **End date** (and time), and × to remove it.
4. **Time zone** (optional): its name after the fields, as text.
5. **Description** and **Error**: "The end date can't be before the start date." when it is.

## Behaviour

Each date follows the WAI-ARIA [Spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/) for its day,
month and year, with a calendar after the [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Digits (on a part of a date) | Type the date part by part; an end before the start shows the error. | `e2e/forms.spec.ts` |
| Up arrow (on a part of a date) | Steps that part. | `play: Keyboard` |
| Enter (on Add end date) | Shows the end date. | `play: Keyboard` |
| Enter (on ×) | Takes the end date away; Add end date is back. | `play: Keyboard` |

## Content

- The label names what the dates are for: "Dates", "Event dates".
- Each part is named after it for screen readers: "Dates, start date", "Dates, end time" (`labels`).
- Dates and times are written in the page's language (`AppProvider`'s locale).
- The button says "Add end date" and the × "Remove the end date"; the error "The end date can't be before the start
  date."; all through `labels`.
- Give the value as ISO strings ("2026-11-02", "18:30"); it comes back as React Aria values (`String()` turns them back).

## Accessibility

**The field gives you:** each date and time named after the label, the parts as spin buttons, the calendar, the end
error said in words (not colour alone) and marked invalid, and Required said both as a marker and to assistive tech.

**You still own:**
- A label, so the parts' names make sense ("Dates, start date").
- What the open end means for the page ("No end date yet").
- Saving both dates together from `onChange`.

## Related

- **Required marker**: drawn when required.
- **Select**: date presets.
- **Phase timeline**: phases' dates in a row.
- **Card**: the phase setup card it sits in.

## Provenance

- Built by AI agents from the prototype (`.pj-dates2`), from two DatePickers; not in Figma yet.
- Reviewed by a person: not yet.
- Known limits: the time zone is text only, there is no time-zone picker.

## Changes

- 30 Oct 2026: this page written; a play function proves the arrow and the end date buttons.
- 29 Oct 2026: one `value` / `defaultValue` / `onChange` holding `{start, end, startTime, endTime}`, as ISO strings or
  React Aria values (docs/DECISIONS.md).
- 29 Oct 2026: Dashboard's custom dates use it in place of the starter DateRangePicker.
- 29 Oct 2026: built from two DatePickers with "Add end date", since the starter DateRangePicker can't leave the end
  empty; the time zone shown as text.

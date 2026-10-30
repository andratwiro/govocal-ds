# Number field

## When to use

- For a whole number or an amount people type or step: the participants of a project, the number of spots of an event,
  how many projects a homepage block shows, a population in Community monitor.
- With `minValue` / `maxValue` when the number has bounds ("Number of projects", 1 to 12).
- With the label beside it (`labelPosition="side"`) in a short row of limits: Proposal requirements, Voting's Min and Max.
- With a `prefix` for a unit inside the field: Voting's "€" budget fields.

## When not to use

- For a number that is really an identifier or a code (a postcode, a phone number): use **Text field**.
- To pick one of a few fixed amounts: use **Select** or **Segmented control**.
- For a date or a time: use **Date range field**.
- To show a number, not edit it: use **Stat tile** or **Text**.

## Anatomy

1. **Label**: above, or beside with `labelPosition="side"`.
2. **Input**: the number, written in the page's language.
3. **Prefix** (optional): a unit inside the field before the number ("€"), seen but not read.
4. **Stepper**: − and + buttons at the end.
5. **Description** and **Error** (optional): under the field.

## Behaviour

The field follows the WAI-ARIA [Spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/). Behaviour
from React Aria's NumberField.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus into the number. The − and + buttons take no Tab stop: the next Tab leaves the field. | `play: Keyboard` |
| Up arrow | Adds one. | `play: Keyboard` |
| Down arrow | Takes one away, never below the minimum. | `play: Keyboard` |

## Content

- The label names what is counted, in sentence case: "Number of spots", "Participants", "Maximum".
- Put the unit in the label ("Budget (€)") or in `prefix` ("€"), never typed by people.
- Numbers follow the page's language (`AppProvider`'s locale): "1,000" in English, "1.000" in Dutch.
- An error gives the bound: "At least 1 participant."

## Accessibility

**The field gives you:** a number field named by its label, arrow keys to step, the bounds enforced, numbers read in
the page's language, and the description and error read with it.

**You still own:**
- A label (`label` or `aria-label`) that names what is counted.
- The unit said somewhere people hear it: a `prefix` is seen but not read, so name the unit in the label or the
  description when it matters.
- An error that gives the bound.

## Related

- **Text field**: free words or codes.
- **Switch**: a switch that reveals a number ("Limit the number of spots").
- **Participant action row**: a row with a number limit in it.

## Provenance

- Built by agents from Figma (Number field, node 5:234) on React Aria's starter NumberField; the side label and the
  prefix come from the prototype's Proposal requirements and Voting fields.
- Reviewed by a person: not yet.
- Known limits: no stories for the description, the error or the disabled state.

## Changes

- 30 Oct 2026: this page written, with its doc comment; a play function proves the keyboard table.
- 29 Oct 2026: moved up from Base to Components › Forms, with a side label position and a prefix slot (Voting's €
  budget fields).

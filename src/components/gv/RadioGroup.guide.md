# Radio group

## When to use

- To pick exactly one of two to six options, all in view: who can take a survey, a report's template, the kind of a
  user group, a project's visibility.
- When every option should be read before choosing (each may have a `description`: "Appears on the homepage, in the
  project list and in search.").
- In a row (`orientation="horizontal"`) for two or three short options ("Built-in survey", "External survey"), or a
  rating scale.

## When not to use

- For options that are tiles with an icon, a description or fields that open under them: use **Choice card** inside
  the Radio group.
- For more than about six options, or when space is tight: use **Select**.
- To switch between views of the same content: use **Segmented control**.
- For a yes-or-no: use a **Checkbox**, or a **Switch** when it takes effect at once.
- To pick several: use **Checkbox group**.

## Anatomy

1. **Label**: names the choice ("Who can find it").
2. **Options**: a `Radio` per option, its 16 dot and words, with an optional description line.
3. **Description** (optional): under the options.
4. **Error** (optional): one message for the group.

## Behaviour

The group follows the WAI-ARIA [Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/): the group is one
Tab stop.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus into the group, onto the chosen option; the next Tab leaves the group. | `play: Keyboard` |
| Down arrow, Up arrow | Moves to the next or previous option and chooses it. | `play: Keyboard` |
| Space | Chooses the focused option when none is chosen yet. | `e2e/form-validation.spec.ts` |

## Content

- The label asks or names the choice, in sentence case: "Who can take the survey?", "Visibility", "Report template".
- Option words are short and parallel; put the consequence in the option's `description`.
- Pick a sensible default with `defaultValue` when one exists; leave it empty when people must choose on purpose (and
  say so in the error: "Choose who can see the project.").

## Accessibility

**The group gives you:** a radio group named by its label, one Tab stop with arrow keys inside, each option's
description read with it, and an error read with the group.

**You still own:**
- A label, or `aria-label` when the group's heading is elsewhere ("Layout" in the Report view's block settings).
- A `value` on every Radio.
- Not putting interactive things inside an option's label; open them beside it (Choice card's `revealed`).

## Related

- **Choice card**: the options as bordered tiles, inside a Radio group.
- **Select**: one of many, in a popover.
- **Segmented control**: a view switch.
- **Checkbox group**: pick any number.

## Provenance

- Built by AI agents from the prototype's New project modal (options with a description, side by side) on React Aria's
  starter RadioGroup; not in Figma.
- Reviewed by a person: not yet.
- Known limits: the radio label's slate tone is a primitive no semantic token fits yet (allow-listed in
  `tests/paint.test.mjs`).

## Changes

- 30 Oct 2026: this page written; a play function proves Tab and the arrow keys.
- 29 Oct 2026: moved up from Base to Components › Forms, exported from `govocal-ds` (docs/DECISIONS.md, "Link, Radio
  group and Checkbox group").
- 29 Oct 2026: Card's radio list (`CardRadioGroup`) deprecated for Choice cards in a Radio group.

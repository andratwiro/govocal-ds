# Checkbox group

## When to use

- To pick any number of a few options, all in view under one label: a report's contents in Reporting, the events a
  webhook subscribes to in Settings, a project's topics.
- When the page needs the ticked values together (`value` / `onChange` hold the list) and one error for the whole set
  ("Pick at least one topic.").
- In a row (`orientation="horizontal"`) for two or three short options.

## When not to use

- When only one of the options may be picked: use **Radio group**.
- For one yes-or-no on its own: use a single **Checkbox**.
- For options that need a description and an icon as tiles: use **Choice card** (`ChoiceCardCheckbox`).
- For more than about seven options, or ones people search: use **Option list** or **Select** (with several).
- For settings that each apply at once: use a **Switch** per setting.

## Anatomy

1. **Label**: names the set ("Topics").
2. **Options**: a **Checkbox** per option, each with a `value`, in a column (or a row).
3. **Description** (optional): a grey line under the options.
4. **Error** (optional): one message for the set.

## Behaviour

The group follows the WAI-ARIA [Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/): every box is its
own stop.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the next box in the group, then out of it. | `play: Keyboard` |
| Shift+Tab | Moves to the box before. | `play: Keyboard` |
| Space | Ticks or unticks the focused box; the others keep theirs. | `play: Keyboard` |

## Content

- The label names the set as a noun, in sentence case: "Topics", "Report contents", "Events".
- Option words are short and parallel ("Nature", "Transport", "Housing"), in a sensible order (most used first, or
  alphabetical for long sets).
- A description says what the ticks do: "Select events to subscribe to".
- The error says what is missing: "Pick at least one topic."

## Accessibility

**The group gives you:** a group named by its label, each box's own name, the group's description and error read with
it, and the invalid state on every box.

**You still own:**
- A label (or `aria-label`) for the group, so the boxes are heard as one set.
- A `value` on every Checkbox.
- The validation ("at least one") and its message.

## Related

- **Checkbox**: one option.
- **Radio group**: pick exactly one.
- **Choice card**: the same choice as tiles.
- **Option list**: many options in a popover, with a search.

## Provenance

- Built by AI agents from neither Figma nor the prototype: React Aria's starter CheckboxGroup painted with the tokens
  (tagged Not in Figma).
- Reviewed by a person: not yet.
- Known limits: only one story (Example); the horizontal row has none.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: moved up from Base to Components › Forms, exported from `govocal-ds` (docs/DECISIONS.md, "Link, Radio
  group and Checkbox group").

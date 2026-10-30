# Checkbox

## When to use

- To say yes to one thing on its own: "I accept the terms" before a project is published.
- As one option of a **Checkbox group**, where people may tick any number: the events a webhook subscribes to in
  Settings, the topics of a project.
- **Quiet** (`isQuiet`) for a list header's select-all, dimmed until hovered or ticked.
- **Indeterminate** for a select-all when only some of the rows under it are ticked.

## When not to use

- For a setting that takes effect the moment it is flipped (notifications, a feature on or off): use **Switch**.
- To pick exactly one of a few options: use **Radio group**.
- For options drawn as bordered tiles with a description and an icon: use **Choice card**.
- To tick rows of a table: the selection column of **Data table** draws its own boxes.
- To pick several values from a long list: use **Option list** or **Select** (with several).

## Anatomy

1. **Box**: a 16 rounded square, filled with the check colour when ticked or indeterminate; an 11 tick or bar inside.
2. **Label**: the words after the box (`children`); press anywhere on them to tick.
3. **Description** (optional): a grey line under the label.
4. **Error** (optional): the message under it once the box is invalid.

## Behaviour

A checkbox follows the WAI-ARIA [Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the box. A disabled box is skipped. | `play: Keyboard` |
| Space | Ticks the box, or unticks it. | `play: Keyboard` |

## Content

- Write the label as the thing people agree to or turn on, in sentence case: "Subscribe to project updates", "Allow
  participants to co-sponsor proposals".
- Positive wording: "Send me updates", never "Don't send me updates", so a tick always means yes.
- One line; put the detail in `description` ("You can change this later in project settings.").
- No full stop after the label. A description is a sentence and ends with one.
- A required box says why in its error: "Accept the terms to publish."

## Accessibility

**The checkbox gives you:** a real checkbox to assistive tech, its label and description read with it, the mixed
state for indeterminate, Space to tick, a focus ring, and an error read as its description.

**You still own:**
- A label, or `aria-label` when the box stands alone (the quiet select-all: "Select all ideas").
- Setting `isIndeterminate` yourself from the rows under a select-all.
- An error message that says what to do, in the page's language.

## Related

- **Checkbox group**: several checkboxes under one label.
- **Switch**: on or off with effect at once.
- **Choice card**: the tile version, with `ChoiceCardCheckbox`.
- **Data table**: its own selection boxes.

## Provenance

- Built by AI agents from Figma (Checkbox, node 5:317) and the prototype: Figma draws the box; the checked, indeterminate
  and disabled states are the prototype's.
- Reviewed by a person: not yet.
- Known limits: Figma's prototype blue for "checked" has no token, so the box uses Figma's `action/checked`.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: one Checkbox: the starter part of the same name left both entry points (docs/DECISIONS.md).
- 29 Oct 2026: closer to Figma and the prototype: one 1px ring, an 11px check, no press scale, and `isQuiet` for
  Figma's dimmed select-all; checked is Figma's `action/checked`.

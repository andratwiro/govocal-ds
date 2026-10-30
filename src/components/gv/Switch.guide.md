# Switch

## When to use

- To turn one setting on or off when the change applies at once, with no Save: an automated email in Messaging, "Show
  in menu" on a custom page, a feedback filter in the Input manager.
- In a settings list with a description under each label: "Confirm email address" in Settings.
- To reveal fields that belong to the setting once it is on: "Limit the number of spots", then the number.
- With a **Badge** in its label for something new ("Content builder · New").

## When not to use

- For an answer that only counts once a form is submitted (agree to terms, pick topics): use **Checkbox**.
- To pick between two named options that aren't on and off ("Public" or "Private"): use **Radio group** or
  **Segmented control**.
- For an action that runs once (publish, send): use **Button**.
- For the on/off on a setup card: use **Card**, whose own switch is drawn at the card's size.

## Anatomy

1. **Track**: 36 × 20, near-black when on, grey when off (a step darker on hover), red when invalid.
2. **Knob**: 16, slides to the end when on.
3. **Label**: the setting's words after the track (`children`).
4. **Description** (optional): a grey line under the label.
5. **Error** (optional).

## Behaviour

A switch follows the WAI-ARIA [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the switch. A disabled switch is skipped. | `play: Keyboard` |
| Space | Turns it on, or off. | `play: Keyboard` |

## Content

- Name the setting, not the action, in sentence case: "Allow anonymous participation", "Send a confirmation email".
  Never "Turn on …" or "Enable/disable …": the switch already says on or off.
- Never change the label with the state ("On" / "Off"); the switch shows the state.
- A description says what on means: "Participants can post without creating an account."
- In a table row where the column says what it switches, the label is the `aria-label`: "Show About in menu".

## Accessibility

**The switch gives you:** a real switch to assistive tech, on/off read out, Space to flip it, a focus ring, and the
description read with it.

**You still own:**
- A visible label or an `aria-label` that names the setting.
- Applying the change at once and saying so (a Toast with Undo where it matters), since there is no Save.
- Fields a switch reveals coming right after it in the reading order.

## Related

- **Checkbox**: yes or no in a form that is submitted.
- **Card**: setup cards with their own switch.
- **Section toggle**: a section switched on and off.
- **Toast**: the Undo after a switch that changed something big.

## Provenance

- Built by AI agents from Figma (Switch, node 24:508) and the prototype (its near-black "on"); the revealed-fields and
  badge stories are not in Figma.
- Reviewed by a person: not yet.
- Known limits: "on" is the prototype's near-black, not Figma's `control/toggle-on` (the prototype wins on look,
  `Switch.css`); no invalid story.

## Changes

- 30 Oct 2026: this page written, with its doc comment; a play function proves the keyboard table.
- 29 Oct 2026: moved up from Base to Components › Forms (used on two screens or more), with the description, revealed
  fields and badge stories, and motion tokens on the knob.

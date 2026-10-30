# View option row

## When to use

- To choose which views participants get in a phase and which one they land on: a phase's Available views card in
  its Build tab (List view, Map view, Perspectives view), in a `ViewOptionList`.
- With `isAlwaysOn` for the view the phase can't turn off (List view: a check, "Always enabled").
- With `options` for what a view needs while it is on, under its words (Map view's Configure map).
- `isDefault` and `onMakeDefault` to keep exactly one default: making a view that is off the default also turns it
  on.

## When not to use

- To switch between views on the page itself (List / Map): use **Segmented control**.
- For a participant action and who can take it: use **Participant action row**.
- For an email the platform sends: use **Notification row**.
- For a plain on-or-off setting with a description: use **Switch**.

## Anatomy

1. **Switch** (or a **check** for the view that is always on, named "Always enabled").
2. **Name**: the view's name.
3. **Description** (optional): what it shows and what it is best for; may hold links to the phase's other cards.
4. **Default button**: "Make default", or a pressed "Default" with a check on the default view.
5. **Options** (optional): under the words while the view is on, the full width.

## Behaviour

The switch follows the WAI-ARIA [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/); Make default is a
toggle button, after the [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). The default view's button
stays focusable (pressed, a press does nothing) instead of disabled, so making a view the default keeps focus where it
was.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the switch, then to Make default. | `play: Keyboard` |
| Space (on the switch) | Turns the view on or off. | `play: Keyboard` |
| Enter, Space (on Make default) | Makes the view the default and turns it on if it was off; focus stays on the button, now "Default". | `play: Keyboard`, `e2e/build-tab.spec.ts` |

## Content

- The view's name ends in "view": "List view", "Map view", "Perspectives view".
- The description says what it shows, then "Best for:" and the kinds of consultation; a link names the card that
  completes it ("Make sure you add a location field to the Idea form").
- The button reads "Make default" or "Default" (`labels`); its name adds the view ("Make default Map view").
- A closed card's pill names the first other view on and counts the rest: "Map view +1".

## Accessibility

**The row gives you:** a switch named by the view, a named check for the view that is always on, a default button
whose name includes the view and whose pressed state says which is the default, focus that stays put when the
default changes, and a named group around the rows.

**You still own:**
- Keeping one default: when the default is turned off, hand it to another view (the In a card story hands it back
  to List).
- Links in the description that say where they go.
- The words in the page's language (`labels`, the descriptions).

## Related

- **Segmented control**: the List / Map switch participants and admins use on the page.
- **Participant action row**, **Notification row**: the Build tab's other switch rows.
- **Switch**: the control at the start of the row.
- **Card**: the closed-and-open card the rows sit in.

## Provenance

- Built by AI agents from the designer's prototype (a phase's Available views card); not in Figma.
- Reviewed by a person: not yet.
- Known limits: the row doesn't keep one default across a list by itself; the page does (`isDefault`,
  `onMakeDefault`, `onChange`).

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`, English by default.
- 29 Oct 2026: Default is a pressed toggle that ignores presses, not the prototype's disabled button, which dropped
  focus to the page (docs/DECISIONS.md, "Built in the project package").
- 29 Oct 2026: built from the prototype: a switch or always on, the view's words, Make default that turns an off view
  on, what it needs while on.

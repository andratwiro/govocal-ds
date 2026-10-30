# Setup step

## When to use

- For a step of a project's or a phase's setup checklist ("Before you publish"), each showing whether it is done:
  - **Open** (`kind="open"`, the default) when the step happens somewhere else: "Settings" opens the project settings.
  - **Expand** (`kind="expand"`) when the step fits in the card: "Set project card".
  - **Pick** (`kind="pick"`) when the step is one choice from a picker under the card: "Set area" (a Menu), "Set topic
    tags" (an Option list with search).
- With `value` to say what it is set to, short, in a teal badge ("Harbour", "2 tags").

## When not to use

- For an action to take next that isn't part of a checklist: use **Action row**.
- For a section of the setup with its own title: use **Panel section**.
- For a choice that belongs in a form: use **Select** or **Choice card**.

## Anatomy

1. **Check**: a dashed circle until the step is done, then a filled check.
2. **Title**: the step's name.
3. **Value** (optional): a teal value badge, cut short before the title is.
4. **Chevron**: → for Open, ⌄ for Expand and Pick.
5. **Body** (Expand) or **picker** (Pick): the content, in the card or in a popover under it as wide as the card.

## Behaviour

The card's header is a button. Expand is a disclosure, after the WAI-ARIA
[Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/); Pick opens a popover or a menu under the
card. Behaviour from React Aria's Button, Dialog, DialogTrigger, Disclosure, DisclosurePanel, Heading and MenuTrigger.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves from card to card. | `play: Keyboard` |
| Enter (Open) | Runs the step (`onPress`). | `play: Keyboard` |
| Enter (Expand) | Opens the card in place. | `play: Keyboard` |
| Enter (Pick) | Opens its picker under the card. | `play: Keyboard` |
| Esc (in a picker) | Closes it and puts focus back on the card. | `play: Keyboard` |
| Esc (in the tag search) | Empties the search first; the next Esc closes the picker. | `e2e/project-overview.spec.ts` |

## Content

- Titles start with a verb for a step to do ("Set area", "Set project card") or name the place ("Settings").
- `value` is the setting, as short as it goes: a name ("Harbour"), a count ("2 tags", "3 areas"), never a sentence.
- A done step reads "(done)" after its title for screen readers; pass `labels.done` in the page's language.

## Accessibility

**The step gives you:** a button with the title, "(done)" and the value as its name, a disclosure that says whether it
is open, a picker that returns focus to the card, and decorative circles and chevrons.

**You still own:**
- Marking a step done (`isDone`) when it is, so the check and "(done)" are true.
- Naming the picker's list ("Area", "Topic tags").
- The `labels` in the page's language.

## Related

- **Panel section**: "Before you publish", where the steps sit.
- **Option list**: the searchable picker of Set topic tags.
- **Menu**: the picker of Set area.
- **Badge**: the value badge.
- **Action row**: the next actions of a live project.

## Provenance

- Built by agents from Figma ("Setup step": Open and Expand) and the designer's prototype (the done check, the value
  badge and the Pick kind are Not in Figma).
- Reviewed by a person: not yet.
- Known limits: the value badge keeps Figma's radius 6, unlike the round Badge (docs/DECISIONS.md, "Built in the
  selectors package").

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`; what it does is `kind`.
- 29 Oct 2026: a teal value badge says what a step is set to; `pick` opens a picker under the card.
- 29 Oct 2026: built from Figma and the prototype.

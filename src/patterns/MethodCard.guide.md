# Method card

## When to use

- In the new-phase picker (the rail's +): one card per participation method, grouped under side tabs (Gather input,
  Shape decisions, Inform and recruit) in a Modal. Pressing a card creates the phase.

## When not to use

- For a choice in a form where one stays selected: use **Choice card**.
- For a project, template or tool in a gallery: use **Card** with `media`.
- For a short list of actions in a column: use **Card** with `control="link"`.

## Anatomy

1. **Media** (optional): the method's illustration on the light stage grey, 168 tall; it moves while the card is
   hovered or focused.
2. **Name**: UI strong.
3. **Description** (optional): a line or two, Small secondary.
4. **Feature chips** (optional): Badges, 6 apart, wrapping; one may be highlighted teal.

The card fills its grid cell; border radius 12.

## Behaviour

The card is one button (the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)), named by the
method and described by its line.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the card. | `play: Keyboard` |
| Enter | Creates the phase with this method. | `play: Keyboard` |

## Content

- The name is the method's, as the platform calls it: "Ideation and geo mapping", "Survey".
- The description says what participants do, in one sentence.
- Chips are short features, sentence case, no full stop: "Map pins", "Reactions and comments". Highlight at most one,
  the feature that sets the method apart.

## Accessibility

**The card gives you:** one button per method, named by the method and described by its line (the chips stay text);
the illustration hidden from screen readers; a disabled card that can't be pressed.

**You still own:**
- Telling people why a method is disabled, near the grid (a Banner), since a disabled button can't explain itself.
- A heading over each group of cards when they sit under tabs.

## Related

- **Modal**: the picker's dialog, with side tabs.
- **Illustration**: the method scenes on top.
- **Badge**: the feature chips.
- **Choice card**: when something stays selected.

## Changes

- 30 Oct 2026: built from the back office's deep dive (project §3): the rail's + opened a small form where the prototype
  opens a method picker (docs/DECISIONS.md, "Project screens").

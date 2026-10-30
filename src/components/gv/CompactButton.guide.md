# Compact button

## When to use

- For an action inside a card, a panel section or a dashboard card's foot, where a full Button would shout: "Explore"
  in a phase Insights card's foot, "Add" or "Import" in a setup card.
- **Secondary** (default) for most in-card actions; **primary** for the one action a card exists for ("Import").
- With a leading icon (`icon`) when it helps to scan: "+ Add a report".

## When not to use

- For the main actions of a page, a dialog or a panel ("Save", "Create project"): use **Button**.
- For an icon with no words in a card's head: use **Icon button** (or Card's `iconActions`).
- To go to another page: use **Link**.
- For a list of actions on one thing: use **Menu**.

## Anatomy

1. **Container**: outlined white with a soft shadow (secondary) or filled (primary), radius 8, 32 tall.
2. **Leading icon** (optional): 16, 6 before the words.
3. **Label**: the words, Small strong, one line.

## Behaviour

It follows the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/): a click, a tap, Enter or
Space presses it.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the button. A disabled one is skipped. | `play: Keyboard` |
| Enter | Presses the button. | `play: Keyboard` |
| Space | Presses the button. | `play: Keyboard` |

## Content

- A verb, one or two words: "Explore", "Add", "Import", "Add a report". Sentence case, no full stop.
- Name the thing when the card holds more than one kind ("Add a report", not "Add").
- The words are yours (children); it says nothing of its own.

## Accessibility

**The button gives you:** a real button, the focus ring, Enter and Space, and a disabled state that leaves the tab
order.

**You still own:**
- Words that make sense out of context: several "Explore"s on one page need the card's name in them, or a page a
  screen reader user can tell apart ("Explore ideas").
- Saying why a button is disabled somewhere nearby; a disabled button can't be focused, so it can't explain itself.
- The words in the page's language.

## Related

- **Button**: the page's and dialog's actions.
- **Card**: the box a compact button usually sits in.
- **Dashboard card**: its foot holds the "Explore".
- **Icon button**: an action with an icon only.

## Provenance

- **Built by:** AI agents, from Figma (Button · compact, node 33:478) and the prototype (in-card buttons: the icon gap,
  the hover lift, disabled at 45%).
- **Reviewed by a person:** not yet.
- **Known limits:** no pending state and no danger tone (a Button has both); Figma draws no disabled state.

## Changes

- 30 Oct 2026: this page written; Compact button got its first doc comment; a play function proves the keyboard table.
- 29 Oct 2026: Figma's third variant, "Primary · icon", is `variant="primary"` with an `icon`, so an icon goes with
  either style.

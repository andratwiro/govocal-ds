# Button

## When to use

- To do something on this page: save, create, confirm, cancel, publish.
- **Primary** for the one main action of a page, a dialog or a panel ("Save", "Create email", "Publish"). One per area.
- **Secondary** for the actions beside it ("Cancel", "Share", "Save as draft").
- **Quiet** for small actions in a row or a section that shouldn't pull the eye ("Edit", "Show all", "Add a manager").
- **Danger tone** to confirm something that can't be undone: primary in the confirm dialog ("Delete project"), quiet
  for an inline "Delete".
- **With a menu** (`hasMenu`) when the button opens a short list of choices ("Publish ▾").

## When not to use

- To go to another page, a section or a file: use **Link**. A button never navigates.
- For an icon with no words (a pencil, a ×, a "…"): use **Icon button**.
- For a small action inside a card or a panel section, such as "Explore" in a dashboard card's foot: use **Compact button**.
- To pick one of two to five views or options: use **Segmented control**.
- To turn a setting on or off: use **Switch**.
- For a list of actions on one thing: use **Menu** (opened from a Button with a menu, or a row's "…").

## Anatomy

1. **Container**: the filled (primary), outlined (secondary) or bare (quiet) shape. 36 tall, or 32 in dense places.
2. **Label**: the words, one line.
3. **Leading icon** (optional): a 16px icon before the words, such as the plus in "Add a manager".
4. **Menu chevron** (with `hasMenu`): after the words.
5. **Spinner** (with `isPending`): takes the place of the words while the action runs.

## Behaviour

A button follows the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). It acts when it is
pressed: a click, a tap, or a key.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the button. A disabled button is skipped. | `play: Keyboard` |
| Enter | Presses the button. | `play: Keyboard` |
| Space | Presses the button. | `play: Keyboard` |

While `isPending`, the button keeps its size and focus but ignores presses, so an action can't be sent twice.

## Content

- Start with a verb that says what happens: "Save", "Create email", "Add phase", "Copy to phase".
- Sentence case: "Add a new group", never "Add A New Group" or "ADD".
- One to three words. Name the thing when the verb alone is unclear: "Delete project", not "Delete" in a dialog.
- A destructive button names the action and the thing, the same words as the dialog's title: "Delete report".
- "Cancel" backs out of a dialog or a form without saving. "Close" ends something read-only. "Done" finishes a panel
  where changes are already saved.
- No full stop, no "Click here", no "OK" or "Submit": say what the press does.
- The spinner's name while pending is "Saving..." by default; pass `labels={{pending: '…'}}` when the action is
  something else ("Publishing...").

## Accessibility

**The button gives you:** a real button to assistive tech, the focus ring, Enter and Space, a disabled state that
leaves the tab order, and a named spinner while pending.

**You still own:**
- Words that make sense on their own, out of context: "Delete report", not "Delete" next to a report's name.
- One primary per area, so the main action is clear to everyone.
- The pending label in the page's language (`labels`).
- Saying why a button is disabled somewhere on the page; a disabled button can't be focused or hovered, so it can't
  explain itself.

## Related

- **Icon button**: the same action as an icon alone.
- **Compact button**: the smaller in-card action.
- **Link**: going somewhere instead of doing something.
- **Menu**: the list a button with a menu opens.
- **Alert dialog**: where the danger-tone confirm lives.
- **Segmented control**: a pick-one row of buttons.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: `tone="default"` renamed `neutral`, the one tone word (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: danger is `tone="danger"` on primary (confirm) or quiet (inline Delete); no outlined danger look.
- 29 Oct 2026: icon-only buttons are square, radius 8; disabled is 45% opacity; quiet is the older tertiary style, since
  blue text is the Link's (docs/DECISIONS.md, "Fidelity review against Figma and the prototype").

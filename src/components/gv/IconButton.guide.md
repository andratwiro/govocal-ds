# Icon button

## When to use

- For an action with a well-known icon and no room for words: a card's settings, a dashboard card's download, ‹ and
  › on the Projects calendar, ↑ and ↓ to arrange projects, the rail's panel toggle, a preview in the Inspiration hub.
- **Ghost** (default) in heads and rows, where it should stay quiet; **bordered** when it stands alone beside fields
  or other bordered controls (‹ ›, the filter button).
- **Strong** emphasis (near-black icon) where the action matters; default (grey) for secondary tools.
- **24** only in dense toolbars (a report block's tools); 28 everywhere else.

## When not to use

- When words fit, or the icon isn't obvious: use **Button** or **Compact button** with a leading icon.
- To go to another page: use **Link**.
- To pick one of a few views with icons (List / Map): use **Segmented control**.
- To switch a setting on or off: use **Switch**.
- For a row's several actions: one "…" that opens a **Menu**, not a row of icons.

## Anatomy

1. **Container**: a square, 28 (or 24), radius 8; no fill (ghost) or a border (bordered).
2. **Icon**: 16, at the system's 1.75 stroke, `aria-hidden`.

## Behaviour

Behaviour from React Aria's `Button`.

It follows the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/): a click, a tap, Enter or
Space presses it.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the button. A disabled one is skipped. | `play: Keyboard` |
| Enter | Presses the button. | `play: Keyboard` |
| Space | Presses the button. | `play: Keyboard` |

## Content

- `aria-label` is required: say what the press does, a verb first, in sentence case: "Download dashboard data",
  "Next month", "Show the participation rail".
- Name the thing when there are several on a page: "Move Green Corridors up", "Preview: Street trees for Northgate".
- Show the same words in a **Tooltip** for sighted people when the icon could be read two ways.
- Pass the icon `aria-hidden` and 16.

## Accessibility

**The button gives you:** a real button named by its `aria-label` (the type won't compile without one), the focus
ring, Enter and Space, and a disabled state that leaves the tab order.

**You still own:**
- A name that says the action, not the icon ("Delete idea", not "Trash").
- A Tooltip with the same words where the icon alone isn't clear.
- The name in the page's language.

## Related

- **Tooltip**: shows the button's name on hover and focus.
- **Button**: actions with words.
- **Compact button**: a small action with words, in a card.
- **Help popover**: draws a help Icon button that opens a popover.
- **Menu**: the "…" that opens a row's actions.

## Provenance

- **Built by:** agents, from Figma (Icon button: Style × Tone, 28) and the prototype (the 24 size in dense toolbars).
- **Reviewed by a person:** not yet.
- **Known limits:** Figma draws bordered only in strong; default works but has no Figma frame. No pressed (toggle)
  state.

## Changes

- 30 Oct 2026: this page written; Icon button got its first doc comment; a play function proves the keyboard table.
- 29 Oct 2026: `tone` renamed `emphasis`: `tone` means colour intent only (docs/DECISIONS.md, "Public API and prop
  names").
- 29 Oct 2026: quick-action and pager buttons moved to 28 with 16 icons; the 24's icon is 16 too (docs/DECISIONS.md,
  "Building from the prototype review").

# Tooltip

## When to use

- To show an icon button's name on hover and focus: Export over the Input manager's download icon, a report block's
  tools ("Move up", "Delete"), "Add widget".
- To name the rows of a folded rail: the Side nav shows each page's name as a tooltip once its labels are hidden.
- To say why an action is greyed out, on an action that stays focusable: "Nobody has signed up yet" on a Card's
  disabled Download (Card's `tooltip`).
- To say what a dot or a badge stands for: "18 new ideas" on a Segmented control's unread dot (its `tooltip`).
- With a tail (`showArrow`) only on the project's step cards, where it shows which card it is about.

## When not to use

- For help someone needs to read, or anything on touch screens: use **Help popover** (a press opens it).
- For the only name a control has: give the control its own name first (an **Icon button**'s `aria-label`); the
  tooltip shows that name, it doesn't replace it.
- For anything with a link or a button in it: use **Help popover** or **Menu**; a tooltip can't be entered.
- To introduce a control once: use **Coachmark**.
- For a message about the page: use **Banner**.

## Anatomy

1. **Box**: the dark label, one line up to 320 wide; longer words wrap into balanced lines and the box narrows to the
   longest line.
2. **Words**: small, white.
3. **Tail** (`showArrow`, optional): a small triangle pointing at the control.

It opens 120 ms after the pointer arrives and closes as soon as it leaves (`TooltipTrigger`'s `delay` and
`closeDelay`).

## Behaviour

Behaviour from React Aria's `Tooltip`, `TooltipTrigger` and `OverlayArrow`.

The tooltip follows the WAI-ARIA [Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): it shows while
its control has keyboard focus or the pointer on it, and the control is described by it.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab (onto the control) | Shows the tooltip. | `play: Keyboard` |
| Esc | Hides the tooltip; focus stays on the control. | `play: Keyboard` |
| Tab (away) | Hides the tooltip as focus moves on. | `play: Keyboard` |
| Tab (onto a disabled action with a tooltip) | Focus still lands on it and the tooltip says why it is off. | `e2e/build-tab.spec.ts` |

Hover shows it too, once the pointer has moved over the page (`e2e/sidebar.spec.ts`, `e2e/segmented-control.spec.ts`).

## Content

- For an icon button, the same words as its name, a verb first: "Export", "Add widget", "Show the platform menu".
- For a hint, one short sentence in sentence case: "Private, so it does not appear on the homepage, in search or in
  widgets." A full stop only when it is a sentence.
- For a disabled action, say why, not what: "Nobody has signed up yet".
- Keep it to a line or two; anything longer is a Help popover.

## Accessibility

**The tooltip gives you:** a `role="tooltip"` label that shows on keyboard focus as well as hover, describes its
control (`aria-describedby`), hides on Esc, and keeps its words in view up to 320 wide.

**You still own:**
- A real name on the control itself (`aria-label` on an Icon button); the tooltip is a description, not the name.
- A control that takes focus: a tooltip on a plain icon or text can't be reached by keyboard or touch.
- Never hiding something only a tooltip says; touch screens have no hover.
- The words in the page's language.

## Related

- **Icon button**: the control a tooltip most often names.
- **Help popover**: help that opens on a press, for touch and longer text.
- **Card**: a disabled header action with a tooltip that says why.
- **Segmented control**: segments with a tooltip for their unread dot.
- **Side nav**: the folded rail that shows names as tooltips.

## Provenance

- **Built by:** agents, from the prototype (its GVTooltip: the 120 ms delay, the 320 maximum, the hugging box, the
  tail on step cards). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** it doesn't open on the very first focus when that focus is set from code rather than by a key
  (the plan's small fixes list it); its dark fill is a primitive colour waiting for a semantic token
  (`tests/paint.test.mjs`).

## Changes

- 30 Oct 2026: this page written; Tooltip got its first doc comment; a play function proves Tab and Esc.
- 29 Oct 2026: its fill is allowlisted as a primitive until the designer names a token (docs/DECISIONS.md, "Token
  names").
- 29 Oct 2026: moved up from Base to Components, used on two or more screens (docs/DECISIONS.md, "Building from the
  prototype review").

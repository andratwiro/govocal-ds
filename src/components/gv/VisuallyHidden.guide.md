# Visually hidden

## When to use

- For words a screen reader needs and the eye doesn't: a heading that names a tab's content so the outline goes h1 →
  h2 → h3, "Loading ideas…" while a table loads.
- With `isFocusable` for a "Skip to content" link that shows while it holds keyboard focus.

## When not to use

- To hide something from everyone: leave it out of the page, as a closed **Side panel** or a folded **Panel section**
  does; visually hidden content is still read.
- For a name on an icon-only control: use the control's own `aria-label` (**Icon button**).
- For words everyone should see, however small: use **Text** (`kind="small"`).

## Anatomy

1. **Content**: clipped to nothing on screen, kept in the reading order (`span` by default; a heading or a paragraph
   with `elementType`).

## Behaviour

Not interactive: the part takes no focus itself. With `isFocusable`, what is inside it (a link) keeps its own keys
and shows while it has focus.

## Content

- Write it as if it were on screen: a heading names the section, a status says what's happening.
- Don't repeat what is already read nearby.
- Keep it short; people can't see it to know it's long.

## Accessibility

**The part gives you:** content clipped without `display: none`, so screen readers still read it, and no `className`
or `style` that could undo the hiding.

**You still own:**
- That the hidden words match what's on screen (a heading that names the visible content).
- A visible equivalent for anything sighted keyboard users need; only `isFocusable` content shows on focus.

## Related

- **Text**: words everyone sees.
- **Icon button**: names its icon with `aria-label` instead.
- **Data table**: names its loading row for screen readers.

## Provenance

- Built by AI agents on React Aria's VisuallyHidden (Not in Figma); promoted from two copies in the back office.
- Reviewed by a person: not yet.
- Known limits: none known beyond the hiding itself.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: built on React Aria's VisuallyHidden, opening the Components/Text group (docs/DECISIONS.md, "Composition
  contracts in code").

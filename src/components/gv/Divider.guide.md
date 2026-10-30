# Divider

## When to use

- To separate two groups of content that sit together with a hairline: sections of a form in a Panel, the blocks of
  a report, a project overview's parts, the composer in Messaging.
- **Vertical** (`orientation="vertical"`) between groups of items in a row, such as a toolbar's groups (at least 32
  tall).

## When not to use

- Between a Panel's head, body and foot, or between Side panel sections: **Panel** and **Side panel** draw their own
  hairlines.
- Between table rows: **Data table** draws them.
- To make space: use a **Stack** with a `gap`; a divider is a line, not spacing.
- Between groups in a menu: use the menu's own separator (**Menu**).

## Anatomy

1. **Line**: 1px in the subtle border colour, the full width (or height, when vertical) of its container.

Horizontal, it keeps the browser's 8px above and below for now (Figma draws none).

## Behaviour

Not interactive: it takes no focus or keys. Behaviour from React Aria's `Separator`: a `role="separator"` with its
orientation.

## Content

No words. If the groups need a name, give each a heading (**Section label** or a Panel title) instead of relying on the
line.

## Accessibility

**The divider gives you:** a `separator` role with its orientation, so assistive tech knows where one group ends.

**You still own:**
- Headings for the groups when they need names; a line says nothing about what follows it.
- Not using it for decoration where there is no change of group (it is announced).

## Related

- **Stack**: space between parts, with no line.
- **Panel**: draws its own hairlines.
- **Section label**: names a group.

## Provenance

- **Built by:** agents, from Figma (Divider, node 5:303).
- **Reviewed by a person:** not yet.
- **Known limits:** five back-office pages still rely on the browser's 8px margin around it, kept until each page moves
  to a gap.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: Figma has no margin; the browser's 8px kept for now, dropped page by page (docs/DECISIONS.md, "Fidelity
  review against Figma and the prototype").

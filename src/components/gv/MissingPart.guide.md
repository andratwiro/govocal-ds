# Missing part

## When to use

- On a screen built from the system, around a stand-in for a part the system doesn't have yet, so the screen says
  what is still missing: the back office's email preview, report blocks, sortable lists and drag handles.
- Inline (`isInline`) around something small in a row, such as a drag handle in a table cell or a card's picture,
  with a line near it that names what the outline means.

## When not to use

- For a place that has nothing in it yet (no inputs, no reports): use **Empty state**.
- For content that is still loading: use **Skeleton**.
- For a message about the page or a record (a warning, a status): use **Banner**.
- For a part the system already has, such as a list of records: use that part (here, **Data table**), never a frame
  around a copy of it.

## Anatomy

1. **Frame**: a 1px dashed control-grey border, radius 8, 12 in.
2. **Label**: "Missing: <name>", Small, tertiary grey, 8 above the stand-in.
3. **Stand-in**: whatever the page builds from the parts the system has.

Inline, only a dashed outline 2 outside the content, radius 4, and no label.

## Behaviour

Not interactive: the frame adds no focus or keys; the stand-in inside keeps its own.

## Content

- Name the missing part as the system would name it, in sentence case: "Email preview", "Sortable list".
- The label says "Missing: <name>"; a page in another language passes `labels={{missing: name => …}}`.
- An inline frame has no label: say near it "Dashed outline: the system has no component yet for …".

## Accessibility

**The part gives you:** the label as plain text, read before the stand-in.

**You still own:**
- A stand-in that works on its own: real headings, names and focusable controls where it has them.
- The line that names an inline frame, since the outline alone says nothing to a screen reader.

## Related

- **Empty state**: what a place shows before it has anything.
- **Skeleton**: a placeholder while content loads.
- **App frame**: the frame the back office's pages, and their missing parts, sit in.

## Changes

- 30 Oct 2026: added, from the back office's own Gap marker, so the back office's stylesheet paints nothing
  (docs/DECISIONS.md, "Compose without CSS").

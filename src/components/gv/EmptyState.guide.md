# Empty state

## When to use

- In a tab or a page body before it has anything (`layout="page"`): a phase's Manage and Insights tabs before inputs
  come in ("Insights will appear here"), Messaging before the first email ("Send your first email"), a page that
  doesn't exist.
- In a side panel, a card or a list (`layout="panel"`): "No email open", "No templates match", "Nothing highlighted
  here", the input list's side panel with nothing picked.
- With a framed, dashed box (`isFramed`) where the empty thing is a list someone fills (a draft's place).
- With its one next step (`actions`), when there is one: "New custom page".

## When not to use

- For a message about a page that does have content: use **Banner**.
- While content is loading: use **Skeleton**; empty means "nothing there", not "not here yet".
- For an empty value in a record's row: leave it out in the **Property list**, which shows "–".
- For a File list with no files: its own empty line (`emptyLabel` on **File list**) says it.

## Anatomy

1. **Drawing or icon** (optional): an **Illustration** (160 wide on a page, 96 in a panel) or a 24 icon for plainer
   back-office pages. Decorative.
2. **Title**: what isn't there yet; a heading (h3 by default, `headingLevel`) or plain text (`none`).
3. **Description** (optional): when it will fill up or what to do, up to 360 wide on a page, 240 in a panel.
4. **Action** (optional): one, usually a Button.

All centred; `isFramed` adds a dashed frame.

## Behaviour

Not interactive: the empty state can't be reached with Tab and answers no keys. An action inside it keeps its own (see **Button**).

## Content

- Title: what isn't there, in a few words, sentence case, no full stop: "No inputs yet", "Ideas will appear here",
  "No projects match".
- Description: one or two sentences on when it fills up or what to do: "Try another word.", "Residents' ideas show here
  once the phase opens."
- After a search or filter, say so and how to widen it ("No projects match. Try another word."), never "No data".
- At most one action, saying what it does: "New custom page", "Send your first email".

## Accessibility

**The empty state gives you:** a title as a real heading at the level you set (or plain text inside a card that has
one), and a drawing or icon hidden from screen readers.

**You still own:**
- A `headingLevel` that fits the page's outline, or `none` inside something already headed.
- Words that make sense without the picture.
- Moving focus somewhere sensible when a list empties under people (after a delete, a filter).

## Related

- **Illustration**: the drawings it shows.
- **Skeleton**: the placeholder while loading.
- **Banner**: a message on a page that has content.
- **Button**: its one action.

## Provenance

- Built by AI agents from the prototype's empty tabs, panels and lists (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: two layouts (page and panel); one action only, by design.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: `size` became `layout`, `action` became `actions` (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: built with the Illustration drawings, from the prototype.

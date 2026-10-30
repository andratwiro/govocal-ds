# New dot

## When to use

- To mark something new or unread next to it, without words on screen: a new input's date in the Input manager, an
  unread notification in the Notification list, a view with unread items in a Segmented control, a Stat row with new
  activity ("New ideas").

## When not to use

- For how many are new: use a count **Badge** ("12").
- For the word "New" on screen: use **Badge** ("New" on a report).
- For where something stands (Draft, Live): use **Status badge**.
- For a person: use **Avatar**.

## Anatomy

1. **Dot**: a small filled circle in the accent colour.

One size.

## Behaviour

Not interactive: the dot can't be reached with Tab and answers no keys.

## Content

- The dot's name says what it means here, for screen readers: `aria-label="New input"`, "Unread". The default is
  "New"; pass `labels` in other languages.
- Use it for one meaning per screen: new or unread, never both.
- Take it away once people have seen the thing; a dot that never goes means nothing.

## Accessibility

**The dot gives you:** an image named "New" (or your `aria-label`), so the dot is read where it sits.

**You still own:**
- A name that says what's new ("New input"), when "New" alone is vague.
- Clearing it when the thing has been seen.
- Not relying on the dot alone for something people must act on; a count or words say more.

## Related

- **Badge**: a count or the word "New".
- **Stat row**: carries the dot with `isNew`.
- **Notification list**: unread notifications carry it.
- **Segmented control**: a view with unread items carries it.

## Provenance

- Built by AI agents from Figma's New dot and the prototype.
- Reviewed by a person: not yet.
- Known limits: one size and one colour.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: its name ("New") comes through `labels`.
- 29 Oct 2026: built from Figma and the prototype.

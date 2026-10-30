# Chat thread

## When to use

- For a conversation with the assistant: the turns (Chat messages, a Chat progress last while it works), the openings
  at the foot and the composer docked under it.
- Wherever an assistant answers questions about a document: the report builder first; the survey editor and input
  analysis next.

## When not to use

- For comments between people: use **Comment thread**.
- For a feed of what happened to a document: use **Activity feed**.
- For notifications: use **Notification list**.

## Anatomy

1. **Scroll**: padding 24 24 8; it scrolls on its own.
2. **Log**: the turns, 12 apart.
3. **Openings** (optional): pushed to the foot of a short thread, 24 under the last turn at least.
4. **Jump to latest**: a small button over the foot, shown while you are scrolled up.
5. **Composer** (optional): docked under the scroll, padding 8 24 24.

The thread fills its container's height: give it one (an inline Side panel with no head, a grid row).

## Behaviour

The turns are a live log: a screen reader hears each new one. The thread keeps the latest turn in view while you
read it, even as a reply streams in; scrolled up, it stays put and shows Jump to latest, a button after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). When a pressed opening makes the openings go away,
focus moves to the composer's field.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves through the turns' buttons, then the openings, then the composer. | `play: Keyboard` |
| Enter (on an opening) | Sends it; focus moves to the composer's field. | `play: Keyboard` |

## Content

- The log's name and "Jump to latest" come from `labels`; name the log for what it is ("Conversation").
- Turns come oldest first.

## Accessibility

**The part gives you:** `role="log"` so new turns are announced, the latest turn kept in view, focus that never drops to
the page when the openings go, and a switched-off thread that takes no focus or presses.

**You still own:**
- A height for the thread.
- Hiding the openings while the assistant works.
- Words in the page's language.

## Related

- **Chat message**: one turn.
- **Chat progress**: the working row.
- **Prompt suggestions**: the openings.
- **Prompt composer**: the composer.
- **Assistant panel**: the thread in the report builder's end column.

## Changes

- 30 Oct 2026: built (empty, conversation, working, long with Jump to latest, disabled), with this page.

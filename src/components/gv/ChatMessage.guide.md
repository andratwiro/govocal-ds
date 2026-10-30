# Chat message

## When to use

- For one turn of a conversation with the assistant, in a Chat thread: what you asked (a grey bubble) and what the
  assistant answered (plain text).
- When a reply changed the document: the change line ("1 section removed. The version before is kept.") with Undo
  this change and Show what changed, kept next to the change for the whole thread.
- When a reply asks you to choose ("Rebuild it" / "Keep it"): pass a `ChatChoices` as `choices`.
- For the turn's states: streaming (still being written), undone, stopped, error with Retry.

## When not to use

- For comments between people on an idea, with avatars, replies and moderation: use **Comment thread**.
- For an Undo of a change made outside the conversation: use **Toast** (global, short-lived).
- For a short status label: use **Badge**, never a bubble.
- For a message to the whole page (an outage, a warning): use **Banner**.

## Anatomy

1. **Context line** (yours, optional): a quiet Item chip naming the block you asked about, 6 above the bubble.
2. **Bubble** (yours): the neutral tint, radius 14, padding 8 12, at most 84% wide, at the end edge; line breaks kept.
3. **Words** (the assistant's): UI 13/20, bold at medium weight; a danger mark first on an error; a caret after them
   while streaming.
4. **Change line**: Small secondary, 4 under the words.
5. **Choices**: small buttons 8 apart, 10 under the words.
6. **Actions**: Retry (error), then the Undo and Show icon buttons, each with its tooltip.

## Behaviour

The actions are buttons, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). A
choice can be made once: both buttons then turn off, the picked one marked pressed, and focus stays on the group
instead of dropping to the page.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to Undo this change, then Show what changed, then the next message's buttons. | `play: Keyboard` |
| Enter (on a choice) | Picks it; both choices turn off and focus stays on the group. | `play: Keyboard` |
| Enter (on Undo) | Undoes the change; the button turns off and stays. | `play: Keyboard` |

## Content

- The assistant writes in the first person and says what it did, in the past tense: "I removed the Reach section,
  its numbers and its chart."
- An answer that changed nothing says so: "I did not change the report."
- The change line is written by the page: what changed, how many, then "The version before is kept."
- Stopped and error turns have default words; name what was left alone through `labels`: "Stopped. The report was
  not changed."
- Choices are short verbs: "Rebuild it", "Keep it". The one the assistant would act on is primary, with ✦.

## Accessibility

**The part gives you:** who spoke, read before each turn ("You", "Assistant"); a busy state while streaming; named
icon buttons with tooltips; choices that keep focus once made.

**You still own:**
- Putting messages in a **Chat thread**, whose log announces each new turn.
- Words for every label in the page's language.
- What Show what changed does: scroll to the item and flash it, or say it's gone.

## Related

- **Chat thread**: the log the messages sit in.
- **Chat progress**: the thinking row and step trace before a reply.
- **Item chip**: the context line and items named in a reply.
- **Assistant panel**: the report builder's whole assistant.
- **Comment thread**: comments between people.

## Changes

- 30 Oct 2026: built (yours and the assistant's; change line, Undo and Show; choices; streaming, undone, stopped and
  error), with this page.

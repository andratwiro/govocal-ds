# Prompt composer

## When to use

- Where people write to the assistant: docked under a Chat thread (its `composer` slot).
- When the prompt can be about one item: pass an Item chip as `context`, with an × that goes back to the whole
  document.
- When people can attach files: `onFiles` opens the picker and takes drops; the page checks the files and says
  what's wrong with `fileError`.

## When not to use

- For a comment on an idea, posted under the author's avatar: use **Comment thread** (its composer).
- For a plain multi-line field in a form: use **Text field**.
- For a search box: use **Search field**.
- For uploading files to a record: use **Drop zone**.

## Anatomy

1. **Box**: a control border, radius 14, darker while focus is inside.
2. **Chip row** (optional): the context chip, then one chip per attachment.
3. **File error** (optional): Small danger words with their mark.
4. **Field**: UI 13/20, grows from 56 to 160 tall, then scrolls.
5. **Bar**: the paperclip (with `onFiles` or `onAttach`) at the start, the round 32 send button at the end: grey while
   empty, ink when ready, a stop square while working.

## Behaviour

The field is a text box and the round button a button, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). While the assistant works the field stays
focusable but read-only, and the button stops the run.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (in the field) | Sends the prompt; the field clears and keeps focus. | `play: Keyboard` |
| Shift+Enter | Starts a new line. | `play: Keyboard` |
| Tab (while working) | Moves from the field to the stop button. | `play: Keyboard` |
| Enter (on stop) | Stops the run; focus goes back to the field. | `play: Keyboard` |
| Enter (on the context chip's ×) | Goes back to the whole document; focus moves to the field. | `play: Keyboard` |

## Content

- The placeholder invites: "Ask the assistant…". The field's name says the same without the ellipsis.
- Send, Stop, the paperclip and the drop words come from `labels`.
- A file error says what is wrong and what to do: "This file is over 25 MB. Attach a smaller one."

## Accessibility

**The part gives you:** a named field, a send button that is off until there is something to send, a stop button
named for what it does, focus kept in the field after send and stop, the file error announced as an alert.

**You still own:**
- Names in the page's language, and a context chip whose × says where the prompt goes back to.
- Checking files and reporting what's wrong.
- Telling people when a send failed (a Chat message with Retry).

## Related

- **Chat thread**: where it docks.
- **Item chip**: the context and attachment chips.
- **Prompt suggestions**: the openings above it.
- **Assistant panel**: the composer in the report builder.
- **Comment thread**: the comment composer.

## Changes

- 30 Oct 2026: built (empty, ready, working, context, attachments, drag-over, file error, disabled), with this page.

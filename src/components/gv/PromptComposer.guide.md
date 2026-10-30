# Prompt composer

## When to use

- Where an admin writes to the AI assistant: at the bottom of a **Chat thread**, which shows the conversation above it.
  Today that is the report builder's assistant (the **Assistant panel** uses it); other screens with an assistant
  compose the same way.
- When the question can be about one thing on the screen (one block of a report): a chip at the top of the box names
  it (an **Item chip**, the "context"). Its × goes back to asking about the whole report.
- When people can attach files to their question: the paperclip opens the device's file picker, and files can be
  dropped on the box. The screen's code decides which files it accepts and, for a refused one, shows a line saying why.

## When not to use

- For a comment that other people will read, posted under the writer's name: use **Comment thread** (its composer).
  The test is the reader: the assistant, Prompt composer; people, Comment thread.
- For a multi-line answer in a form that is saved with the rest of the form: use **Text field** (its multi-line
  version).
- To find items by their words in a list: use **Search field**. Even a question about the data goes here when the
  assistant answers it in a chat.
- To add files to a record (an idea's attachments): use **Drop zone**. Files attached here only go with one question.

## Anatomy

1. **Box**: a rounded box (14px corners) with a control border, darker while someone writes in it. It takes the width
   of its container.
2. **Chip row** (only when there is a context or a file): the context chip first, then one chip per file. Chips wrap
   onto more lines; long names are cut off with "…".
3. **File error** (only for a refused file): small red words with a warning mark, under the chips and above the field.
   It stays until the screen clears it (on the next attach or a send).
4. **Field**: 13px text on a 20px line; it grows from 56px to 160px tall, then scrolls.
5. **Bar**: the paperclip at the start (only when attaching is possible), and a round 32px button at the end: grey
   while there is nothing to send, black ("ink") when there is, and a stop square while the assistant works.

While files are dragged over it, the box lights up in the AI tint and says "Drop to attach" (no story shows it yet).

## Behaviour

The field is a text box and the round button a button (WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)). While the assistant works, people can still click
into the field and read it, but not type, and the round button stops the work. On a phone, the keyboard's return key
makes a new line and the round button sends.

| Key | What it does | Tested by |
| --- | --- | --- |
| Enter (in the field) | Sends the prompt; the field clears and keeps focus. | `play: Keyboard` |
| Shift+Enter | Starts a new line. | `play: Keyboard` |
| Tab (while working) | Moves from the field to the stop button. | `play: Keyboard` |
| Enter (on stop) | Stops the work; focus goes back to the field. | `play: Keyboard` |
| Enter (on the context chip's ×) | Goes back to the whole report; focus moves to the field. | `play: Keyboard` |

## Content

- The placeholder invites, and may name the context: "Ask the assistant…" (the default), "Ask about this block…".
  Its name for screen readers says the same without the "…".
- There is no length limit or counter.
- The words it says on its own, which a screen passes translated (`labels`): "Send", "Stop", "Attach a file" (the
  paperclip's name), "Remove {file name}" (a file chip's ×) and "Drop to attach".
- The context chip's × says where the question goes back to: "Ask about the whole report".
- A file error says what is wrong and what to do, in one sentence: "This file is over 25 MB. Attach a smaller one.",
  "PDF files only. Attach a PDF.", "Up to 5 files. Remove one first." The limits are the screen's to set.

## Accessibility

**The part gives you:** a named field, a send button that is off until there is something to send, a stop button
named for what it does, focus kept in the field after send and stop, and a file error read out as soon as it appears.

**You still own** (the screen's designer and developer):
- The words in the page's language, and the context chip's × words (above).
- Checking files and saying what's wrong.
- Telling people when a send failed: a **Chat message** in the thread with a Retry, keeping their words.
- Saying why it is switched off, when it is (Assistant panel's "off" state does).

## Related

- **Chat thread**: where it docks.
- **Item chip**: the context and attachment chips.
- **Prompt suggestions**: the openings above it.
- **Assistant panel**: the report builder's assistant, which holds a Prompt composer.
- **Comment thread**: the comment composer.

## Provenance

- **Built by:** AI agents, for the report builder's assistant column (the back office's deep dive). Not in Figma:
  design with the stories.
- **Reviewed by a person:** not yet.
- **Known limits:** no story for the drag-over look; files can't be sent without words.

## Changes

- 30 Oct 2026: the Working story shows the field emptied after a send; the page reworded after a fresh-eyes read.
- 30 Oct 2026: built (empty, ready, working, context, attachments, drag-over, file error, disabled), with this page.

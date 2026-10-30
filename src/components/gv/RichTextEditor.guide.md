# Rich text editor

## When to use

- For a longer text an admin writes that may need formatting (bold, italic, a bulleted list, a link, an image, a
  video): an email's message in Messaging, an automated email's text, a policy page residents read (from the
  platform's Settings).
- Know that today the formatting buttons only light up when pressed; the words stay plain until the screen's code
  applies the formatting (Provenance). Design with it as it will work, and mark that in the hand-off.
- It has no visible label of its own. Put a heading or a label above it when the screen has none; otherwise its name
  is only heard by screen readers (below).

## When not to use

- For a text in each of the platform's languages: use **Multilingual rich text editor**.
- For a short line of plain words (a name, an email address): use **Text field**. For a longer plain text that never
  needs bold, lists, links or pictures, use Text field's multi-line version (TextArea).
- For the title of a project or an idea, one line, often per language: use **Title field**.

## Anatomy

1. **Toolbar**: the **Rich text toolbar** along the top, with a line under it: bold, italic and a bulleted list, then add
   link, add image and embed video. It is 25px tall.
2. **Writing area**: where the words go, at least 74px tall, with the placeholder "Add a short description" until
   something is written. Longer text scrolls inside it; people can't resize it. It takes `lang` and `dir`, so a text in
   another language reads and runs its own way.
3. **Hint** (optional, `description`): a grey line under the box.
4. **Error** (with `isInvalid`): `errorMessage` under the box, whose border turns red. `isDisabled` greys the whole
   field and turns the toolbar off.

The whole box takes the width of its container (Figma draws it 444px), with a 1px control border and 10px corners.
While someone writes in it, the border turns the selected colour with a light ring around it.

`variant="inline"` (not in Figma): the text typed straight on a document's page, with no border and no toolbar, in the
type and colour around it (wrap it in a document kind of **Text**), growing as you type; a **Block frame** floats the
floating Rich text toolbar over it.

## Behaviour

The toolbar follows the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/): Tab lands on it
once, and the arrow keys move between its buttons. The writing area is the browser's plain text box, so it behaves the
same in every browser.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Lands on the toolbar (one stop for all its buttons), then the next Tab goes into the writing area. | `play: Keyboard` |
| Typing | Writes in the writing area. | `play: Keyboard` |

The arrow keys inside the toolbar are on the **Rich text toolbar** page.

## Content

- Its name for screen readers says what is written, in sentence case, two or three words: "Email message", "Project
  description". Without one it is "Description". When a visible heading sits right above it, use the same words.
- The placeholder tells the writer what to write, in a few words, with no full stop: "Add a short description" (the
  default), "Write your message". It disappears once they type, so never put a rule or a limit in it.
- There is no length limit or character counter of its own.
- The toolbar buttons' names ("Bold", "Italic", "Add link"…), its name and its placeholder are words the part says
  on its own; a screen passes them translated (`labels`).

## Accessibility

**The editor gives you:** a named writing area, a named toolbar with one Tab stop, and bold, italic and list buttons
that say when they are on (they look pressed and screen readers hear "pressed").

**You still own** (the screen's designer and developer):
- Its name: what is being written (above).
- What the link, image and video buttons open: the pickers are the screen's to design and build.
- Applying the formatting, until the editor does it itself.

## Related

- **Rich text toolbar**: its toolbar.
- **Multilingual rich text editor**: the same per language.
- **Text field**: plain text, one line or several.
- **Title field**: a title.
- **Notification row**: an email whose text is written here.

## Provenance

- Built by AI agents from Figma's Rich text toolbar (Figma has the toolbar only, not the whole editor) and the
  prototype's editor; the writing area is a plain one.
- Reviewed by a person: not yet.
- Known limits: the text is plain: bold, italic and list hold a pressed state but don't format the words, and there is
  no story for the pickers.

## Changes

- 30 Oct 2026: `lang`, `dir`, `description`, `isInvalid` with `errorMessage`, and `isDisabled` (docs/DECISIONS.md, "Small
  fixes").
- 30 Oct 2026: an `inline` variant for text typed on a report's page (docs/DECISIONS.md, "Report parts").
- 30 Oct 2026: the Filled story has text; the page reworded after a fresh-eyes read.
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words (the writing area's name and placeholder, the toolbar's) come through `labels`.

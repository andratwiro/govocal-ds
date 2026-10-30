# Rich text editor

## When to use

- For a text with light formatting (bold, italic, lists, links, images, video): an email's message in Messaging, an
  automated email's text in a Notification row, a policy page residents read in Settings.
- Where there's no visible label: the editor is named by `aria-label` ("Project description").

## When not to use

- For a text in each of the platform's languages: use **Multilingual rich text editor**.
- For plain words: use **Text field**.
- For a title: use **Title field**.

## Anatomy

1. **Toolbar**: the **Rich text toolbar** (bold, italic, list; add link, add image, embed video), 25 tall with its
   bottom line.
2. **Text**: a text area under it, with the placeholder "Add a short description".

## Behaviour

The toolbar follows the WAI-ARIA [Toolbar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/); the text is the
browser's own text area. Behaviour from React Aria's Toolbar, ToggleButton and TextField.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Lands on the toolbar (one stop), then in the text. | `play: Keyboard` |
| Typing | Writes in the text. | `play: Keyboard` |

The toolbar's own keys are on the **Rich text toolbar** page.

## Content

- Name it with `aria-label`, as the thing written: "Email message", "Project description". The default is "Description".
- The placeholder prompts the author: "Add a short description" (the default).
- The toolbar's names ("Bold", "Add link"…) come through the same `labels`.

## Accessibility

**The editor gives you:** a named text area, a named toolbar with one Tab stop, pressed state on bold, italic and list.

**You still own:**
- An `aria-label` that says what is written.
- The link, image and video pickers the toolbar's buttons open (`onLink`, `onImage`, `onVideo`).
- Applying the formatting: today the text is plain and the toolbar only holds state.

## Related

- **Rich text toolbar**: its toolbar.
- **Multilingual rich text editor**: the same per language.
- **Text field**: plain text.
- **Notification row**: an email whose text is written here.

## Provenance

- Built by agents from Figma's Rich text toolbar and the prototype's editor; the text area is a plain one.
- Reviewed by a person: not yet.
- Known limits: the text is plain: bold, italic and list hold a pressed state but don't format the words, and there is
  no story for the pickers.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words (the text area's name and hint, the toolbar's) come through `labels`.

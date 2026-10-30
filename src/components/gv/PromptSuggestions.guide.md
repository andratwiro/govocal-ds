# Prompt suggestions

## When to use

- For the openings above the composer: a heading ("What should it change?") over two or three prompts people can send
  as they are.
- Scoped to one block: the heading names it ("What should change in title page?") and the prompts are its own.
- For an empty document: one row that starts a run ("Generate a report from the folder").
- Where the assistant is switched off: `kind="preview"`, what it could do (icon, title, description) without letting
  anyone press it, and a `footer` that says why and whom to ask.

## When not to use

- For a list of commands from a button: use **Menu**.
- For an empty screen with one call to action: use **Empty state**.
- For a set of options to pick one from: use **Segmented control** or **Radio group**.

## Anatomy

1. **Heading**: Title type, 8 above the rows.
2. **Prompt row**: ✦ 16 in the secondary icon grey, then UI words; 36 tall at least, radius 8, a soft fill under the
   pointer.
3. **Preview row**: icon 16, then a title and a Small secondary description; not pressable.
4. **Footer** (optional): a hairline, then Small secondary words and a button.

## Behaviour

Each prompt row is a button, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
Preview rows are text.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves from row to row. | `play: Keyboard` |
| Enter | Sends that row's prompt (or starts what it names). | `play: Keyboard` |

## Content

- The heading is a question about the document: "What should it change?".
- A prompt reads as the person would type it, an imperative in sentence case, no full stop: "Make the summary
  shorter".
- Two or three prompts; one only when there is one thing to do (Generate).
- Preview titles say what it could do ("Translate the whole report"), descriptions give an example.

## Accessibility

**The part gives you:** a heading to find the openings by, one button per prompt named by its words, and preview rows
that are not buttons (they can't be pressed).

**You still own:**
- The heading level, so it fits the page's outline (`headingLevel`).
- Moving focus somewhere sensible when the rows go away after a press (a Chat thread puts it in the composer).

## Related

- **Chat thread**: holds it in its `openings` slot.
- **Prompt composer**: the field below it.
- **Assistant panel**: picks the rows for each state.
- **Empty state**: an empty screen's call to action.

## Changes

- 30 Oct 2026: built (prompts, scoped, single, preview with footer), with this page.

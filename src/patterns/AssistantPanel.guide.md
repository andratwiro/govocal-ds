# Assistant panel

## When to use

- In the report builder's end column, as its resting state when no block is selected: the assistant, with no head,
  which can't be closed.
- For its five states, all from props: on, off (`isEnabled={false}`: a preview and "Ask your account manager"), an
  empty report (`isEmpty`: Generate), generating (`isWorking` with a Chat progress last), and scoped to a block
  (`scope`: a chip in the composer and that block's prompts).

## When not to use

- For an assistant on another screen (the survey editor, input analysis): compose **Chat thread**, **Prompt composer**
  and **Prompt suggestions** there; promote this pattern once a second screen draws the same states.
- For a block's settings: use **Side panel** with its head.
- For the version history: use **Activity feed** in a **Side panel**.

## Anatomy

1. **Column**: an inline Side panel with no head, a region named "Assistant".
2. **Thread**: a Chat thread with the turns the page passes as children.
3. **Openings**: Prompt suggestions: the report's prompts, the scoped block's, the one Generate, or the preview with
   its footer. Hidden while working.
4. **Composer**: a Prompt composer, with the scope chip first in its chip row.

## Behaviour

The openings and the composer are buttons and a text box, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). The column takes no focus when the page loads.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on the scope chip's ×) | Goes back to the whole report; the openings change and focus moves to the field. | `play: Keyboard` |
| Enter (in the field) | Sends the prompt; the openings hide and the send button becomes stop. | `play: Keyboard` |
| Tab, then Enter (on stop) | Stops the run; the page adds "Stopped. The report was not changed." | `play: Keyboard` |

## Content

- The openings' heading is "What should it change?", or "What should change in <block>?" when scoped (the English
  default lowers the block's name).
- The scope chip's × is named "Ask about the whole report".
- Off: "What the assistant could do here", three rows with examples, "Not switched on for this platform." and "Ask
  your account manager".
- Every word comes from `labels`, which also carry the thread's and the composer's words.

## Accessibility

**The part gives you:** a named region, the thread's live log, focus kept in the field after send, stop and clearing
the scope, and a switched-off thread that takes no focus.

**You still own:**
- The conversation: which turns to show, what each prompt does, Undo and Show for every change.
- Confirming Generate in a Modal before the run.
- The column's height (a grid row of the page).

## Related

- **Chat thread**: the log it holds.
- **Chat message**: each turn.
- **Chat progress**: thinking and generating.
- **Prompt composer**: the composer and scope chip.
- **Side panel**: the head-less inline column it sits in.

## Changes

- 30 Oct 2026: built (on, off, empty report, generating, scoped to a block), with this page.

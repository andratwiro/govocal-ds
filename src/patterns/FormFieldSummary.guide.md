# Form field summary

## When to use

- To show a phase's form at a glance in its Build tab: the Idea form or Proposal form card, the questions numbered,
  one line each with their type, and Edit form under them.
- In a closed-and-open Card, whose pill counts the questions ("6 questions").
- It is a recipe, not a component: copy the markup and `FormFieldSummary.css` into the page (the phase page does).
  It becomes a component when a second page needs it.

## When not to use

- For the form itself, the questions people answer: use **Text field**, **Radio group** and the other Forms parts.
- For a record's label and value pairs: use **Property list**.
- For a list of rows people press or select: use **Data table**.

## Anatomy

1. **Number**: the question's place, 1 to 6 (hidden from screen readers; the list is ordered).
2. **Question**: its words on one line, cut off with … (its whole text on hover).
3. **Type**: at the end, with "· Required" when it is.
4. **More** (past six questions): one line counting the rest ("4 more").
5. **Edit form**: a secondary button under the list.

## Behaviour

The questions take no focus and do nothing when pressed (docs/DECISIONS.md: a static list, not a grid, so it adds no
tab stops). Edit form is a button, after the WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
No React Aria part of its own; the button is the system's Button.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves straight to Edit form, past the questions. | `play: Keyboard` |
| Enter, Space (on Edit form) | Opens the form builder. | `play: Keyboard` |

## Content

- Each question as the form names it: "Title", "Description", "How often do you visit a park?".
- The type in the form builder's words: "Short answer", "Long answer", "Image upload", "Multiple choice".
- "Required" after a middle dot, only on required questions: "Short answer · Required".
- Six questions at most, then "N more". The whole form is behind Edit form.
- Give the list a name when the card's title doesn't sit right above it (`aria-label="Idea form questions"`).

## Accessibility

**The recipe gives you:** an ordered list read in order, numbers that aren't read twice, the whole question on hover
for the cut-off ones, and one tab stop (Edit form).

**You still own:**
- A name for the list (the card's title, or `aria-label`).
- The type and "Required" words in the page's language; the recipe writes them as plain text.
- The "N more" line in the page's language.

## Related

- **Card**: the Idea form card the summary sits in.
- **Participant action row**, **View option row**, **Notification row**: the other cards of a phase's Build tab.
- **Property list**: label and value rows for a record.

## Provenance

- Built by agents for the back office's phase Build tab (the Idea form card, which was a stub); not in Figma.
- Reviewed by a person: not yet.
- Known limits: a recipe, so each page holds its own copy; its words ("Required", "N more") are English in the
  markup; a cut-off question shows its whole text only on hover (`title`), not on focus.

## Changes

- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: a static list, not a grid: its rows do nothing (docs/DECISIONS.md, "Built in the project package").
- 29 Oct 2026: built as a recipe: numbered questions, one line each with the type at the end, past six counted,
  Edit form.

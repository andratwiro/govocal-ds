# Form field summary

## When to use

- To show a phase's form at a glance in its Build tab (where an admin sets a phase up): the Idea form card (the
  ideation method) or the Proposal form card (proposals), with the questions numbered, one line each with their type,
  and Edit form under them.
- Inside a **Card** that opens and closes (its chevron); closed, the card's pill counts every question ("6 questions",
  "10 questions").
- It is a recipe, not a component: only one page uses it so far, so there is nothing to import. Developers copy its
  markup from the stories' code with `FormFieldSummary.css`. In Figma, draw it from the stories (it isn't in Figma).
  The system makes it a component when a second page needs it (docs/NAMING.md, "What becomes a component").

## When not to use

- For the form itself, the questions people answer: use **Text field**, **Radio group** and the other parts under
  Components › Forms.
- For facts about one record: use **Property list** (each a label with its value, some changeable: an idea's
  status, its assignee). This summary is a numbered, read-only list of questions in order.
- For rows people press to open or tick to select: use **Data table**. Here only Edit form does anything: a question
  is changed in the form builder, not from this card.

## Anatomy

1. **Number**: the question's place in the form, 1 to 6. Screen readers skip it, because the list is numbered for them
   already.
2. **Question**: its words on one line, cut off with "…" when too long; pointing at it shows the whole text.
3. **Type**: at the end of the line, never cut off, with "· Required" when the question must be answered.
4. **More** (only past six questions): one grey line counting the rest ("4 more"). It is text, not a link.
5. **Edit form**: a secondary Button (36px) under the list. It opens the form builder.

## Behaviour

The questions can't be reached with Tab and do nothing when pressed: only Edit form can. Edit form works like any
**Button** (WAI-ARIA [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves straight to Edit form, past the questions. | `play: Keyboard` |
| Enter, Space (on Edit form) | Opens the form builder. | `play: Keyboard` |

## Content

- Each question as the form names it: "Title", "Description", "How often do you visit a park?".
- The type in the form builder's words: "Short answer", "Long answer", "Image upload", "File upload", "Multiple
  choice", "Single choice", "Number", "Tags", "Location". When a question is named after its type ("Tags"), both still
  show.
- "Required" after a middle dot, only on required questions: "Short answer · Required".
- The first six questions, in the form's order, then "N more" for the rest ("1 more" when one is left).
- When the card's title isn't right above the list, give the list a name for screen readers: "Idea form questions".

## Accessibility

**The recipe gives you:** a numbered list read in order, numbers that aren't read twice, the whole question on
pointing for a cut-off one, and one Tab stop (Edit form).

**You still own** (the developer copying it):
- A name for the list (the card's title above it, or a hidden one, above).
- The type, "Required" and "N more" words in the page's language: the recipe writes them in English.

## Related

- **Card**: the Idea form card the summary sits in.
- **Participant action row**, **View option row**, **Notification row**: what the other cards of a phase's Build tab
  hold.
- **Property list**: label and value rows for a record.

## Provenance

- Built by AI agents for the back office's phase Build tab (the Idea form card, which was a stub); not in Figma.
- Reviewed by a person: not yet.
- Known limits: a recipe, so each page holds its own copy; its words ("Required", "N more") are English in the
  markup; a cut-off question shows its whole text only when pointed at (the browser's own tooltip), not on
  keyboard focus or touch.

## Changes

- 30 Oct 2026: the page reworded after a fresh-eyes read; the Keyboard story's readout says it isn't part of the recipe.
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: a plain list: its rows do nothing and take no Tab stop (docs/DECISIONS.md, "Built in the project
  package").
- 29 Oct 2026: built as a recipe: numbered questions, one line each with the type at the end, past six counted,
  Edit form.

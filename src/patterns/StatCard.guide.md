# Stat card

## When to use

- For one figure a project is gathering, with its trend: "Collecting now" on the project overview (Participants, 215,
  weekly since the start).
- With `onPress` when the figure opens a detail (the audience); the card shows a chevron and becomes one button.
- Without `onPress` as a display-only figure.
- For Insights' tiles that show a number with its trend: Stat card is the one part for a number and its sparkline.

## When not to use

- For a row of headline numbers on a dashboard: use **Stat tile**.
- For a chart people read point by point: use **Chart** in a **Dashboard card**.
- For a figure in a list of label and value pairs: use **Stat row**.
- For an action to take next: use **Action row**.

## Anatomy

1. **Label**: what is counted ("Participants").
2. **Value**: the number, Stat small at the regular weight (lighter than a Stat tile's).
3. **Chevron** (with `onPress`): at the end of the head.
4. **Sparkline** (with two or more values in `series`): 34 high, straight segments over one flat tint, no grid, no
   value card.
5. **Caption** (optional): the line under it ("Weekly, since 6 May").

## Behaviour

With `onPress` the whole card is one button, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/); its sparkline stays a picture so the card keeps one
tab stop. Without it the card is a named group that takes no focus.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to a card that opens a detail; a display-only card is skipped. | `play: Keyboard` |
| Enter | Opens the detail. | `play: Keyboard` |

## Content

- The label is the thing counted, plural, sentence case: "Participants", "Visitors".
- `value` is text you format in the page's language ("1,890"; "1.890" in German). The back office formats it today.
- The caption says the period and start: "Weekly, since 6 May".
- Nothing yet: show "0" and a caption that says when it fills ("Numbers appear here once participants take part").
- The sparkline's spoken trend comes in through `labels`.

## Accessibility

**The card gives you:** a button named by its label, value and trend when pressable, a named group when not, a trend
sentence for the sparkline, and a decorative chevron.

**You still own:**
- The number's format in the page's language.
- The `labels` for the trend sentence.
- A detail page or panel worth opening; a chevron that leads nowhere misleads.

## Related

- **Stat tile**: headline numbers on a dashboard.
- **Chart**: the Sparkline inside it.
- **Panel section**: "Collecting now", where it sits.
- **Action row**: the actions under it.

## Provenance

- Built by AI agents from the designer's prototype (the overview's "Collecting now"); not in Figma.
- Reviewed by a person: not yet.
- Known limits: `value` is a string the page formats; the sparkline has no dates, so no value card.

## Changes

- 30 Oct 2026: a flat sparkline (`areaFill="flat"`) and a lighter numeral, as the prototype draws "Collecting now";
  it absorbs Stat tile's sparkline (docs/DECISIONS.md, "Project screens").
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: built for the project overview from the prototype.

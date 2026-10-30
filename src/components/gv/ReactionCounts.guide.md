# Reaction counts

## When to use

- To show how people reacted to an input: likes, dislikes and comments in a Side panel's record head, beside the
  quick actions (an input in the Input manager, an idea in a phase's Manage tab).
- With `comments` on a row that lists inputs by reactions (the Insights tab's Most liked); leave it out where the
  comments are listed below.
- Leave `dislikes` out where the phase doesn't allow disliking.

## When not to use

- To let people react (a like button): use **Button** or **Icon button**; Reaction counts only shows numbers.
- For one big number with a label: use **Stat tile** or **Stat row**.
- To compare reactions across items: use **Bar row** or a **Chart**.
- For a Common ground statement's agree, disagree and pass: use **Statement row**.

## Anatomy

1. **Count**: a 16 icon and its number, for each of likes (thumb up), dislikes (thumb down) and comments (speech
   bubble), in that order.

One line; a count shows only when its number is given, 0 included.

## Behaviour

Not interactive: the counts take no focus and no keys.

## Content

- Pass the real numbers; the part formats them for the page's locale ("1,284").
- Zero shows as 0, never hidden: "nobody reacted yet" is information.
- Each count is read with its word, "128 likes", "1 comment"; in other languages pass `labels`, each a function of the
  count and the formatted number, so plurals follow the language.

## Accessibility

**The counts give you:** each number read with its word ("128 likes, 3 dislikes"), the icons and bare numbers hidden
from screen readers, and numbers in the page's locale.

**You still own:**
- `labels` in the page's language, with its plural rules.
- Context: on a row, the title beside the counts says what was reacted to.

## Related

- **Side panel**: its record head, where the counts sit beside the quick actions.
- **Stat row**: a single count that leads somewhere.
- **Statement row**: a statement's votes as a bar.

## Provenance

- Built by AI agents from the prototype's side-panel reactions and Most liked rows (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: three fixed reactions (likes, dislikes, comments); no other kinds, such as votes or emoji.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: each count's words come through `labels`.
- 29 Oct 2026: built as an icon and number per reaction, read with their words.

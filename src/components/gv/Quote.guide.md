# Quote

## When to use

- To let participants speak in a document: an input's words in a report, with who said them and where they come from.
- As cards side by side in a **Grid** inside a **Figure** ("In their own words: 3 Tree planting ideas"), or `plain`
  with a rule at the start for one quote in running text.
- With a `tag` for what the words are about ("Heat and shade"), and `meta` for where they come from ("North Quarter ·
  31 reactions · Translated from German").

## When not to use

- For a comment people can reply to or moderate: use **Comment thread**.
- For the platform's own answer to an input: use **Official update**.
- For a message in the assistant's conversation: use **Chat message**.

## Anatomy

1. **Tag** (optional): a small outlined Badge.
2. **Words**: Document body, in the language's quotation marks.
3. **Person**: an avatar (optional, 28), the author in Small strong, the meta in Small secondary under it, pushed to
   the foot so quotes in a row line up.

Looks: `card` (the secondary fill, radius 8, padding 16) and `plain` (no fill, a 2 rule at the start).

## Behaviour

Not interactive: a `figure` holding a `blockquote` and a caption that names the person.

## Content

- Quote the words exactly, without quotation marks: `labels.quoted` adds the language's own ("“…”", „…“, « … »).
- The author is what the platform may show about the person ("Resident A", a first name and initial), never more.
- Say in the meta when the words were translated ("Translated from German").
- Keep a quote to two or three sentences; link to the input for the rest.

## Accessibility

**The part gives you:** the words in a `blockquote`, the person in the figure's caption so the two are read together,
and the face as decoration beside a written name.

**You still own:**
- Showing only what the platform lets you show about a person (no link between a public quote and private
  attributes).
- A language for the words when they differ from the page's (`lang` on a wrapper).

## Related

- **Figure**: the finding and source around a set of quotes.
- **Avatar**: the face or initials in `avatar`.
- **Comment thread**: comments people reply to.
- **Badge**: the tag.

## Changes

- 30 Oct 2026: built (card and plain, tag, avatar, meta, the language's quotation marks), with this page.

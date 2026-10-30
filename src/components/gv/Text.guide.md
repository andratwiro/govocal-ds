# Text

## When to use

- For words in one of the system's type styles and colours, instead of page CSS: a record's meta line
  (`kind="small" color="meta"`, "Posted 2 days ago"), a section title (`elementType="h2" kind="body" isStrong`), a
  figure (`kind="stat"`).
- To fill a part's text slot (`slot="description"` in a Menu item or a Select option); without `kind` or `color` it
  takes its look from the part.
- It replaces the back office's own note and section-title styles (121 and 19 uses, docs/DECISIONS.md) as pages move
  onto it.

## When not to use

- For a quiet label over a group of rows: use **Section label**.
- For a page's title with its actions: use **Page header**.
- For words only screen readers need: use **Visually hidden**.
- For a link inside the words: use **Link**.

## Anatomy

1. **Words**: one element (`span` by default; `p`, or `h2` to `h6` with `elementType`).

Type styles (`kind`): title, body, ui, small, stat; body, ui and small have a strong weight (`isStrong`). Colours
(`color`): primary, secondary, meta, tertiary. No margins.

## Behaviour

Not interactive: text takes no focus and no keys.

Behaviour from React Aria's Text, so it fills a part's `slot` ("description", "label") as React Aria's own does.

## Content

- Pick the style by what the words are: `title` for a page's or a dialog's title, `body` for reading text, `ui` for
  labels and controls, `small` for meta lines and captions, `stat` for a figure.
- Pick the colour by emphasis: primary for the words that matter, secondary for supporting lines, meta for a record's
  author and date, tertiary for the least.
- Sentence case everywhere.

## Accessibility

**The text gives you:** the element you ask for, so headings and paragraphs keep the page's outline; the type styles'
sizes from the tokens.

**You still own:**
- `elementType` that matches the meaning (a heading is `h2`–`h6`, not a big `span`).
- Heading levels in order on the page.
- Contrast is reported, never blocking: the tertiary colour is for words people can do without.

## Related

- **Section label**: the label over a group of rows.
- **Page header**: a page's title.
- **Visually hidden**: words for screen readers only.
- **Menu**: its items take a `Text slot="description"`.

## Provenance

- Built by agents from Foundations/Typography's type styles (the tokens from Figma); the part itself is Not in Figma.
- Reviewed by a person: not yet.
- Known limits: five type styles and four colours, by design; most back-office pages still use their own note style.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: built as one Text, React Aria's underneath, with `kind`, `isStrong` and `color`; it opened the
  Components/Text group (docs/DECISIONS.md, "Composition contracts in code").

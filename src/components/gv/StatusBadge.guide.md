# Status badge

## When to use

- For where something stands, in a list or a head: Draft or Live (`live` is green), the same pill for words that read
  the same way: "Sent", "Published", "Enabled", "Connected".
- A project's visibility in the Projects list, an email's or SMS's state in Messaging, a report's state in Community
  monitor, a webhook's state and Esri's connection in Tools, an input's status in the Input manager.

## When not to use

- For a kind, a tag or a chosen value with no "done / live" meaning: use **Badge**.
- For whether an admin has looked at a card: use **Review status**.
- For a message about a whole page or section: use **Banner**.
- For something to turn on or off: use **Switch**; the badge only shows the state, never changes it.

## Anatomy

1. **Pill**: grey (`draft`) or green (`live`).
2. **Label**: the status word, one line.

## Behaviour

Not interactive: the badge can't be reached with Tab and answers no keys.

## Content

- One word, two at most, sentence case: "Draft", "Live", "Published", "Not connected".
- Pick the tone by meaning: `live` for on, out, done, sent; `draft` for everything not yet there or off.
- Use the same word for the same state everywhere (Published, not Published here and Public there).

## Accessibility

**The badge gives you:** the status as plain text, read where it sits; its colour only repeats the word.

**You still own:**
- A word that says the state; never a coloured pill with no words.
- The column or label that says what the status is about, when it isn't clear from the row.

## Related

- **Badge**: the other pills (kind, value, count, tags).
- **Review status**: a card's review word.
- **Data table**: where most status badges sit, one per row.
- **Project header**: its Live ▾ / Publish ▾ control says the project's state.

## Provenance

- Built by AI agents from Figma's Status badge (`State`: Draft, Live) and the prototype, which uses the same pill for other
  words.
- Reviewed by a person: not yet.
- Known limits: two tones only; a warning or a danger state (Failed, Expired) has no pill yet.

## Changes

- 30 Oct 2026: this page written.
- 29 Oct 2026: the status axis is one word, `status`.
- 29 Oct 2026: a project's visibility shows as a Status badge instead of a colour bar (docs/DECISIONS.md, "Built in
  the tables package").
- 29 Oct 2026: built from Figma and the prototype.

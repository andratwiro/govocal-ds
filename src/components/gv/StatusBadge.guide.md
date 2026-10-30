# Status badge

## When to use

- To say where something stands in its life (not yet there, or out and done), in a list row or next to a title. Two
  looks: green for out, on or done; grey for everything not yet there or off.
- Real uses, all in the back office: a project's visibility in the Projects list (Published or Draft), an email's or
  an SMS's state in Messaging (Sent, or not yet), a report's state in Community monitor (Published or Draft), a
  webhook's state (Enabled or Off) and the Esri map connection (Connected or Not connected) in Tools, and an input's
  status in the Input manager (green once Accepted or Implemented, grey before).

The words used so far, by look:

| Green | Grey |
| --- | --- |
| Live, Published, Sent, Enabled, Connected, Accepted, Implemented | Draft, Off, Not connected, Proposed, Viewed, Under consideration |

## When not to use

- For a word that says what kind of thing it is: use **Badge** (a kind, a tag or a picked value, "Survey",
  "Cycling", not a stage it moves through). Ask "will this word change as the thing moves on?" Yes: Status badge.
- For whether an admin has checked a setup card ("To review", "Reviewed"): use **Review status**. Statuses of the
  content itself (an input's Accepted) stay Status badges.
- For a message about a whole page or section: use **Banner**.
- For something people turn on or off right there: use **Switch**, with no badge beside it (the switch already shows
  the state). The badge only shows a state that is changed somewhere else.

## Anatomy

1. **Pill**: a small rounded shape, grey or green. One size.
2. **Label**: the status word, on one line, never cut off: the pill grows with the word.

The two looks are named by developers `draft` (grey) and `live` (green); the word inside can be any status word.

## Behaviour

Not interactive: you can't Tab to it or press it. No tooltip; the row around it can still be pressed.

## Content

- One word, two at most, sentence case: "Draft", "Live", "Published", "Not connected". Text only, no icon.
- Pick the look by meaning: green for on, released, done or sent; grey for not yet there, waiting or off. Never pair a
  word with the other look (a green "Draft").
- Use the same word for the same state everywhere: a project is "Published" in every list, never "Public" on one
  screen. (The Project header's own control still says "Live"; see Related.)
- Translations can be longer: the pill grows, so leave room in a table column rather than shortening the word.
- Failed, Expired and other warnings have no look of their own yet: say them in grey for now, and the designer adds a
  look later (Provenance).

## Accessibility

**The badge gives you:** the status as plain text, read by screen readers where it sits; its colour only repeats the
word.

**You still own** (the screen's designer):
- A word that says the state; never a coloured pill with no words.
- The column head or label that says what the status is about, when the row doesn't make it clear.

## Related

- **Badge**: the other pills (kind, value, count, tags).
- **Review status**: a card's review word.
- **Data table**: where most status badges sit, one per row, in a Status column.
- **Project header**: the project's own page shows its state as a control to change it ("Live ▾", "Publish ▾"),
  not a badge; lists show it as a badge.

## Provenance

- Built by AI agents from Figma's Status badge (`State`: Draft, Live) and the prototype, which uses the same pill for other
  words.
- Reviewed by a person: not yet.
- Known limits: two tones only; a warning or a danger state (Failed, Expired) has no pill yet.

## Changes

- 30 Oct 2026: the page reworded after a fresh-eyes read, with the words used in each look.
- 30 Oct 2026: this page written.
- 29 Oct 2026: the setting for its look is called `status` in code (Figma calls it State).
- 29 Oct 2026: a project's visibility in the Projects list shows as a Status badge instead of a coloured bar of its own (docs/DECISIONS.md, "Built in the tables package").
- 29 Oct 2026: built from Figma and the prototype.

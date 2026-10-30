# Proposals row

## When to use

- For one proposal in a Proposals phase's Manage list, under a **List header**: its title, its votes against the
  threshold, its status, its comments and the time left. On the back office's Proposals Manage tab, 300 votes bring an
  official response.
- With `isClosed` once voting has ended (the time left reads "Closed").
- With `hasWarning` for a flagged proposal and `newCommentCount` for comments the admin hasn't seen.

## When not to use

- For a voting option (no threshold, online and offline votes): use **Voting row**.
- For an idea: use **List row**.
- For a sortable, filterable list with row actions and a side panel: use **Data table**.
- For the support bar alone: use **Vote progress**.

## Anatomy

1. **Proposal**: the thumbnail (optional), the title and the warning mark.
2. **Votes** (200): Vote progress, threshold kind ("144 / 300").
3. **Status** (144): a short status in words.
4. **Comments** (112): the count, then "N new".
5. **Time left** (104): "12 days left", or "Closed".
6. **Trailing slot** (28).

## Behaviour

Not interactive: the row takes no focus and does nothing when pressed. The vote bar reads as a progress bar named
"Votes for <title>". Behaviour from React Aria's ProgressBar, through Vote progress.

## Content

- The title is the proposal's as the resident wrote it.
- The status is a few words, sentence case: "Gathering support", "Threshold reached", "Official response".
- Counts are numbers, written in the page's locale; "N new", "N days left" ("1 day left"), "Closed" and the bar's name
  come in through `labels`; `daysLeft` gets the count, for the language's plural rules.
- Write the threshold once, above the list, in words the admin can act on ("300 votes bring an official response").

## Accessibility

**The row gives you:** the title, status and counts as text, a named progress bar, a named warning mark, a decorative
thumbnail hidden from screen readers.

**You still own:**
- The **List header** above the rows, and a list around them (`role="list"` and a name, as the back office does).
- A way to open the proposal, if the list needs one: the row has none.

## Related

- **Vote progress**: the support bar.
- **Voting row**: the voting method's row.
- **List header**: the column names.
- **Panel**: the list's container on the Manage tab.

## Provenance

- Built by agents from Figma ("Proposals row": Open, Closed, New, New · warning) and the designer's prototype.
- Reviewed by a person: not yet.
- Known limits: the row can't be selected or opened.

## Changes

- 30 Oct 2026: one day left says "1 day left", not "1 days left".
- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: used on the Proposals Manage tab, a Panel over the List header and rows (docs/DECISIONS.md, "Back
  office redesign on the current components").
- 29 Oct 2026: built from Figma and the prototype.

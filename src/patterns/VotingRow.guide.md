# Voting row

## When to use

- For one option in a Voting phase's Manage list, under a **List header**: the option, its votes as a bar against
  the leading option with "N new", online and offline votes, and its comments. The back office lists options most
  votes first; votes counted on paper are added as offline votes.
- With `hasWarning` for a flagged option and the new counts for votes and comments the admin hasn't seen.

## When not to use

- For a proposal against a threshold: use **Proposals row**.
- For an idea: use **List row**.
- For a sortable, filterable list with row actions: use **Data table**.
- For the live results of a vote on the Insights tab: use a **Dashboard card** with its live ranking.

## Anatomy

1. **Option**: the thumbnail (optional), the title and the warning mark.
2. **Votes** (200): Vote progress, count kind, with "N new".
3. **Online** (80): votes cast on the platform.
4. **Offline** (80): votes counted on paper; a zero in grey.
5. **Comments** (112): the count, then "N new".
6. **Trailing slot** (28).

## Behaviour

Not interactive: the row takes no focus and does nothing when pressed. The vote bar reads as a progress bar named
"Votes for <title>".

## Content

- The title is the option's name as residents see it ("Green Corridors for Riverside").
- `fillPercent` is the bar against the leader: `votes / top × 100`; pass it unrounded.
- Counts are numbers, written in the page's locale; "N new" and the bar's name come in through `labels`.
- `voteCount` is online plus offline.

## Accessibility

**The row gives you:** counts as text in their columns, a named progress bar, a named warning mark, a decorative
thumbnail hidden from screen readers.

**You still own:**
- The **List header** above the rows, and a list around them (`role="list"` and a name, as the back office does).
- A way to open the option, if the list needs one: the row has none.

## Related

- **Vote progress**: the vote bar.
- **Proposals row**: the proposals method's row.
- **List header**: the column names.
- **Dashboard card**: the live ranking on Insights.

## Provenance

- Built by AI agents from Figma ("Voting row": Default, New, New · warning) and the designer's prototype.
- Reviewed by a person: not yet.
- Known limits: the bar's scale is worked back from `fillPercent` (the leader's count isn't passed); the row can't be
  selected or opened.

## Changes

- 30 Oct 2026: the bar's scale is worked back from `fillPercent` unrounded, so the bar and its value read
  `fillPercent` exactly.
- 30 Oct 2026: this page written.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: used on the Voting Manage tab, a Panel over the List header and rows (docs/DECISIONS.md, "Back office
  redesign on the current components").
- 29 Oct 2026: built from Figma and the prototype.

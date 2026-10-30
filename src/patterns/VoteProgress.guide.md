# Vote progress

## When to use

- `kind="threshold"` for a proposal's support against the votes it needs: "512 / 300", the bar teal once the
  threshold is reached (a proposal that reaches it gets an official response, as the Proposals Manage tab says).
- `kind="count"` for a voting option's votes against the option with the most, with "N new" since the admin's last
  visit (`newCount`).
- Inside **Voting row** and **Proposals row**, which build it for you; use it alone only where a row of its own would
  be too much.

## When not to use

- For a share of a whole with a label (a status, a theme): use **Bar row**.
- For one headline number: use **Stat tile**.
- For a volunteering cause's sign-ups against its goal: use **Volunteering row**.

## Anatomy

1. **Count**: the votes so far, as the locale writes them.
2. **Threshold** (`threshold`): "/ 300" after the count.
3. **Track and fill**: 96 wide; grey on the way, teal once a threshold is reached.
4. **New** (`count` with `newCount`): "4 new" after the bar, in the brand colour.

## Behaviour

Not interactive: a progress bar that takes no focus. Screen readers read it as a progress bar named by `label`, with
its value and maximum. Behaviour from React Aria's ProgressBar.

## Content

- `label` names what is counted, for the option: "Votes for Green Corridors for Riverside". It isn't shown; the count
  is.
- Counts and thresholds are numbers; the part writes them in the page's locale ("1,500").
- `maxCount` is the leading option's votes, so the longest bar is the leader's.
- "/ threshold" and "N new" come in through `labels`.

## Accessibility

**The part gives you:** a progress bar with a name, its value and its maximum; the count as visible text, so the fill
is never the only signal.

**You still own:**
- A `label` that names the option or proposal, not just "Votes".
- Saying in words what reaching the threshold means, near the list (the Panel's description).
- Telling apart reached and not yet reached in words where it matters (the row's status), not only by the teal.

## Related

- **Proposals row**: the threshold kind in a row.
- **Voting row**: the count kind in a row.
- **List header**: the Votes column's name.
- **Bar row**: a labelled share for charts.

## Provenance

- Built by agents from Figma ("Vote progress": Threshold, Count, Count · new) and the designer's prototype.
- Reviewed by a person: not yet.
- Known limits: the bar is 96 wide wherever it sits (the prototype's; Figma varies by frame, docs/DECISIONS.md,
  "Fidelity review"); a count bar's maximum is the leader's votes, not a goal.

## Changes

- 30 Oct 2026: this page written; its doc comment added.
- 29 Oct 2026: its words come in through `labels`; numbers follow the locale.
- 29 Oct 2026: `kind` names what it shows (threshold, count).
- 29 Oct 2026: the bar is 96 wide, the prototype's, not Figma's per-frame widths.
- 29 Oct 2026: built from Figma and the prototype.

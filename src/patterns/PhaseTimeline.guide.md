# Phase timeline

## When to use

- For a project's phases in order in the Participation rail, each a Rail phase joined by the guide line: done, in
  progress and upcoming, with what each gathered ("312 ideas") and how many are new.
- For "Spotlight", methods that run outside the timeline (a survey running beside the phases), under a Section label.
- For "Events", the project's dated events (`kind: 'event'`), under a Section label after Timeline and Spotlight.

## When not to use

- For a single phase row, or a phase that can be deleted from the rail: use **Rail phase** (the timeline takes no
  delete).
- For steps of a setup checklist: use **Setup step**.
- For a page's trail: use **Breadcrumbs**.

## Anatomy

1. **List**: one item per phase.
2. **Rail phase** per item: the dot, the name, the count chip, the coloured status word with dates and method, and
   "N new".
3. **Guide line**: through the dots, green after a done phase. Events have neither dot nor line.

## Behaviour

Each phase is a link to its screen, after the WAI-ARIA [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/); the timeline is a plain list of them in order.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves from phase to phase, in order. | `play: Keyboard` |

## Content

- Phase titles are the admin's ("Collect ideas", "Community vote").
- `dates` are written as the page writes dates ("19 Oct to 16 Nov"); `method` is the method's name as residents read it
  ("Voting", "Sharing").
- `count` is a number with its word ("312 ideas", "1,240 votes"), written in the page's language.
- The status words (Done, In progress, Upcoming) and "N new" come in through `labels`.

## Accessibility

**The timeline gives you:** a list of links in order, the phase on screen marked as the current page, status words in
text (colour is never the only sign) and a decorative dot and line.

**You still own:**
- A name for the rail around it (a navigation named "Phases" on the overview).
- Marking the phase on screen with `isCurrent`.
- The `labels` in the page's language.

## Related

- **Rail phase**: each row.
- **Rail header**: the rail's title and buttons above it.
- **Section label**: "Spotlight" over a second timeline.

## Provenance

- Built by AI agents from the designer's prototype (the rail's stepper); not in Figma.
- Reviewed by a person: not yet.
- Known limits: the colours of the done and live dots borrow the nearest tokens
  (docs/DECISIONS.md, "Fidelity review against Figma and the prototype").

## Changes

- 30 Oct 2026: `onDelete` puts Rail phase's delete on every phase but the current one (docs/DECISIONS.md, "Small fixes").
- 30 Oct 2026: events (`kind: 'event'`, `method` optional) for the Events section (docs/DECISIONS.md, "Project
  screens").
- 30 Oct 2026: this page written; a play function proves Tab.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: one rail, the timeline under Rail header, Spotlight only when something runs there (docs/DECISIONS.md,
  "Project overview").
- 29 Oct 2026: drawn with Rail phase's own state, chip, new count and guide line.

# Rail phase

## When to use

- For one phase in the project rail: the column on the left of a project's admin screens that lists its phases (the
  stages a project runs through, such as "Collect ideas", then "Vote on the shortlist"). The prototype calls the rail
  "Participation". Each row shows the phase's dot (upcoming, live or completed), its name, a count of what it gathered,
  its status word with its dates and participation method (Ideation, Voting, Survey…), and "N new" when it has inputs
  (ideas, votes, responses) nobody on the team has read yet.
- With a delete when admins may remove the phase from the project: every phase except the one open on screen (the one
  in the main area). The back office undoes it from a Toast.
- Stacked directly one after another (or one per list item): a guide line joins consecutive dots.

## When not to use

- For the phase list where no phase can be deleted: use **Phase timeline**. It looks the same, but a developer gives it
  the list of phases and it draws every row. When phases can be deleted, as in the back office's rail, the rows are
  Rail phases one by one.
- For a step of a setup checklist, with a done tick and no dates: use **Setup step**.
- For one idea or input in a list of many, with its own columns: use **List row**.

## Anatomy

1. **Dot**: grey (upcoming), light green (live: running now), green (completed). A guide line joins the dots of
   consecutive rows: green after a completed phase, grey otherwise.
2. **Name**: the phase's title, wrapping onto more lines when long; 56px stay free beside it for "N new".
3. **Count chip** (optional): what it gathered, on its own line ("312 ideas").
4. **Meta line**: the status word (green when live or completed, grey when upcoming) · dates · method.
5. **New** (optional): a red dot and "N new" at the top right (top left in right-to-left languages).
6. **Delete** (optional): an icon button at the row's end, shown while the row is pointed at or the button has focus,
   in "N new"'s place. Its tooltip says "Delete phase".

The open phase looks like the others (the prototype dropped its tinted card); only screen readers hear which one it
is. Pointing at a row gives it a grey background.

## Behaviour

The row is a link that opens the phase (WAI-ARIA [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/)); the
delete is a separate button after it. Tab reaches it even while it is hidden, and it shows as soon as it has focus.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the phase, then to its delete, which shows. | `e2e/build-tab.spec.ts` |
| Enter (on the phase) | Opens the phase. | `play: Keyboard` |
| Enter (on delete) | Deletes the phase at once, with no question first. | `play: Keyboard` |

## Content

- The title is written by the admin who sets the project up ("Collect ideas"); there is no length limit of the row's
  own, and long titles wrap.
- The status word matches the dot: "Upcoming" (grey), "In progress" (light green), "Done" (green). Use these three.
- The meta line is dates and the participation method's name, joined with " · ": "29 Jul to 30 Sep · Ideation". A
  phase with no dates yet shows its method only ("Upcoming · Information").
- The count chip is a number with its word, singular or plural ("1 idea", "312 ideas", "1,204 votes"), in the page's
  language. Show it on live and completed phases, also at 0; an upcoming phase has gathered nothing.
- "N new" is written for you from the number ("18 new") and hidden at 0.
- After a delete, a Toast with Undo names the phase: "{Phase title} deleted" ("Feedback survey deleted").
- The words the row says on its own, which a screen passes translated (`labels`): "N new", "Delete {title}" (the delete
  button's name for screen readers) and "Delete phase" (its tooltip).

## Accessibility

**The row gives you:** a link whose name screen readers hear as the title, the count, the status and "N new"; "current
page" on the phase open on screen; a delete button named for its phase ("Delete Collect ideas") with a tooltip; and a
dot screen readers skip.

**You still own** (the screen's designer and developer):
- The Undo after a delete (a **Toast**), since the button doesn't ask first.
- Leaving delete off the phase open on screen.
- The row's words in the page's language.

## Related

- **Phase timeline**: the same rows when no phase can be deleted.
- **Rail header**: the rail's title line, with buttons to hide the rail and add a phase.
- **Toast**: the Undo after a delete.
- **Section label**: "Timeline" above the phases, "Spotlight" and "Events" for the rail's next sections.

## Provenance

- Built by AI agents from Figma ("Rail phase", the upcoming row) and the designer's prototype (the live and completed
  dots, the chip, "N new" and the delete).
- Reviewed by a person: not yet.
- Known limits: the live and completed greens have no colour tokens of their own: they are mixed from chart greens
  (`--gv-chart-green`, `--gv-chart-agree`) until the designer names them. The status word's green is reported by the
  automated accessibility check as low contrast and left as drawn, the designer's call (docs/OPEN-DECISIONS.md). No
  story can show the delete without pointing at it.

## Changes

- 30 Oct 2026: the stories say what each shows; the page reworded after a fresh-eyes read.
- 30 Oct 2026: this page written; a play function proves Enter on the phase and on delete.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: a delete at the row's end when pointed at or focused, always reachable with Tab (docs/DECISIONS.md, "Built in the
  project package").
- 29 Oct 2026: phases can leave the rail from their row, undone from a Toast (docs/DECISIONS.md, "Phase").
- 29 Oct 2026: built from Figma and the prototype.

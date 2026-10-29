# Decisions where the sources disagree

Where Figma and the prototype disagree, or the prototype disagrees with itself, the agent picks the better option,
builds it, and logs it here: what disagreed → what we built → why. The project lead and the designer review this
list; change any line and the agent follows. Newest first within each section.

## Prototype review (29 Oct 2026)

- Single-choice pickers mark the chosen value with a checkbox in some places, a check in others → **a check mark** →
  a checkbox means "pick several"; React Aria's single-select draws a check.
- The detail drawer has a Save button although every change applies at once → **no Save button; changes apply at once
  with an Undo toast** → as everywhere else in the prototype.
- "Clear all filters" is red in the prototype's CSS, dark on screen → **plain (dark)** → red means destroying
  something; clearing filters destroys nothing.
- Filter submenus differ per method (ideation vs voting, proposals, common ground) → **all follow ideation**: counts as
  "48 ideas", an icon per option only where it adds meaning, avatars for assignees → one behaviour everywhere.
- Bulk "Official update" opens a popover in one place, a modal elsewhere → **a modal** → it is a long-text form.

## Fidelity review against Figma and the prototype (29 Oct 2026)

Where the prototype and Figma disagree on the look, the prototype wins; names and variants come from Figma.

**Colour and type**
- Bar row, legend row and AI summary text: Figma `text/body` (#333) vs the prototype's #43515d → **Figma's
  `text/body`** → no token for the prototype's value.
- Status colours on charts (Viewed, Rejected, Implemented) have no chart tokens → **blue-3, chart-disagree,
  chart-green**; the leader green is the token's #04884c, not the prototype's #08833a.
- "Reviewed" green: the prototype's green-500 has no token → **green-600** (a shade darker).
- Checkbox checked colour: the prototype's link blue (#4183C4) has no token → **Figma's `action/checked`**.
- Switch "on": Figma's slate-750 vs the prototype's near-black → **the prototype's near-black**.
- Rail phase greens (completed, live) have no tokens → **the nearest tokens, a colour mix for the light live dot**;
  upcoming phase names stay black (the prototype's green-grey has no token).
- Stat numbers (Stat tile, Stat row): Figma's Stat style says 32 line height, the prototype 28 → **28**.
- Chart axis labels: the prototype ≈10.6px, no token → **12px (the Small role)**.
- Shadows: the tokens are lighter than the prototype's dialog and switch-knob shadows → **the tokens**.
- Dropdown shadow, the Toast's light green and mint, the Coachmark's translucent white, the prototype's lighter grey:
  no tokens → **nearest tokens or colour mixes**. Candidates for new Figma tokens.

**Shape and size**
- Modal: Figma radius 14 with a thin border vs the prototype's radius 12, no border → **the prototype's**. Widths:
  Figma 420 and 866 vs the prototype 560, 760, 920 → **Figma's 420 and 866**.
- Card switch: 26×16 (Figma's Manage toggle and the prototype's card switch), not the form toggle's 36×20.
- Fields: the prototype's heights vary 32–40 → **36 everywhere**, to line up with the default Button and Select.
- Vote progress bar: Figma 112/108/158 by frame vs the prototype's fixed 96 → **96**.
- Icon-only buttons: **square, radius 8** (Figma and the prototype), no longer round.
- Icons: **1.75 stroke** everywhere (Figma and the prototype), Lucide's default is 2.
- Disabled: Figma's Button says 50% opacity, the prototype 45% → **45%**.
- Required marker on Embed URL: the prototype has the 6px gap, Figma none → **6px, everywhere**.

**Behaviour and states**
- Focus ring: the prototype's near-black with a white halo vs the system's brand colour → **the brand colour** (one
  token, high contrast on white and grey).
- Quiet button: the prototype has an older tertiary style and a newer one (blue text, no padding) → **the older
  tertiary style**; blue text is the Link's job.
- Link: **the blue text link**; the prototype's grey text button is a quiet Button.
- Two "pick one" looks: the joined, framed toggle group (prototype) and Figma's sliding Segmented control → **Segmented
  control everywhere**; the starter's toggle group stays as the base only.
- Chosen tab: **bold**, as in the prototype (the row shifts slightly).
- Skeleton: **a gentle pulse**; the prototype's is static.
- Menu: **no danger item**, as in the prototype; destructive actions go through a confirm dialog.
- Meter: the 70%/90% warning thresholds suit storage, not progress → **kept for Meter; progress uses ProgressBar**.
- The open phase in the rail has no highlight (the prototype's 15 Oct change) → **none; the breadcrumb and
  `aria-current` mark it**.
- Rich text toolbar buttons: selected and disabled looks are not drawn anywhere → **the builder's look, until Figma
  draws them**.
- Divider: Figma has no margin; five back-office pages rely on the browser's 8px → **kept for now**, dropped page by
  page.

**Built, not in Figma** (Figma could add them): Stat row selected state, the empty dashboard card, select-all and row
checkboxes on list rows, Checkbox quiet (dimmed select-all), Tooltip with a tail (step cards only).

**Not built yet:** a grey avatar variant for assignees and commenters; a language button slot in Title field; the
chosen-value teal on a dropdown card's pill; renaming the project from the breadcrumb.

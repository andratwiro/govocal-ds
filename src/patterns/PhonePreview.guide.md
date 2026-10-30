# Phone preview

## When to use

- To show what a resident sees, on a phone, beside the setup that changes it: the project page on the project
  overview, a phase's page on its Build tab, an email or an SMS while it is written (Messaging).
- On a `PhoneStage`, the grey stage that centres the phone, says what it shows in a caption ("What residents see while
  the phase is open") and offers the eye that opens the participant's view.
- With `action` for the one thing pressing the phone does: "Edit project page" on the project, "Preview ↗" on a phase.
- With its parts: `PhoneHeader` (the platform's logo and menu), `PhoneImage` (a picture's place), `PhoneCard` (a block
  on the grey phase page) and `PhoneCountdown` (the time left and the participation button).

## When not to use

- For a picture of a screen in documentation or an empty state: use **Illustration**.
- For a working form a resident fills in, use **Text field** and the other form parts on a page of their own: the
  phone is inert.
- For a preview of a record beside a list: use **Side panel**.

## Anatomy

1. **Stage** (`PhoneStage`): the grey ground, the eye at the top end, the caption at the bottom end.
2. **Device**: the light, rounded phone, 343 × 683, radius 22.
3. **Header** (optional): the platform's header pinned at the top.
4. **Screen**: white (a page or a message) or grey with white cards (a phase page), scrolling.
5. **Footer** (optional): the participation bar pinned at the bottom.
6. **Action** (optional): a smoked pill in the middle, shown on hover or keyboard focus while the screen dims.

## Behaviour

The screen is inert: what a resident would press does nothing here. The phone's own action is one button or link
that shows on hover and on keyboard focus, after the WAI-ARIA
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Behaviour from React Aria's Button and Link (and
the stage eye's Tooltip).

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves to the phone's action and shows it. | `e2e/build-tab.spec.ts` |
| Enter | Presses the action ("Edit project page"). | `play: Keyboard` |

## Content

- Name the phone for what it shows: `aria-label="What residents see of Community vote"`, "The email: Phase started".
- The caption says what moment it shows, in a sentence: "What residents see while the phase is open".
- The action says what pressing does: "Edit project page"; with `isExternal`, "Preview" and an ↗.
- The countdown is short and in the page's language ("2 weeks left", "Starts in 5 days"); it shows in capitals.
- A new phase with nothing built: `isEmpty`, which says "Nothing to preview yet" (or `emptyLabel`).
- Use invented, realistic content; never a real resident's words or name.

## Accessibility

**The phone gives you:** a named group around the screen, an action that keyboard users reach and see, an empty screen
that says so, and the stage eye with a tooltip.

**You still own:**
- A name that says what the phone shows.
- Remembering the screen is a picture: anything a reader must act on belongs outside it.
- The `labels` (empty line, logo, image, the eye) in the page's language.
- Headings inside the screen that read sensibly out of the page's outline.

## Related

- **Project header**: the bar above the overview whose setup the phone mirrors.
- **Panel section**: the setup sections beside the phone.
- **Skeleton**: placeholder blocks for a phase page still being built.
- **Banner**: notes inside a phase page, such as a locked phase.

## Provenance

- Built by agents from the designer's prototype (its light phone and preview pane); Figma draws a dark bezel, which
  was not followed.
- Reviewed by a person: not yet.
- Known limits: the screen is a hand-built likeness, not the front office itself; no Before · Open · Ended switch
  (docs/DECISIONS.md, "Building from the prototype review").

## Changes

- 30 Oct 2026: this page written; a play function proves Enter on the action.
- 29 Oct 2026: its words come in through `labels`.
- 29 Oct 2026: the prototype's light device, a grey screen with cards, a countdown bar, an empty screen and a hover and
  focus action; the eye and caption moved to Phone stage (docs/DECISIONS.md, "Built in the project package").
- 29 Oct 2026: built for the project overview.

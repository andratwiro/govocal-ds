# Coachmark

## When to use

- To point out one control the first time someone meets a screen, and say in a line what it does: the phase rail
  ("Follow the phases here"), the button residents use to add an idea, Publish on a draft project.
- Once per person: the prototype shows it once to a new project manager. Store that it was seen (Got it or Skip) and
  never show it again.
- One at a time, at most a short sequence of two or three, each pointing at what it explains.

## When not to use

- For help someone can open again whenever they need it: use **Help popover**.
- To name an icon on hover or focus: use **Tooltip**.
- For a message about the whole page or a state that needs action: use **Banner**.
- For a walkthrough with steps, forms or choices: use **Modal**.

## Anatomy

1. **Bubble**: the dark card, 266 wide.
2. **Tail**: a small rotated square on the side facing the control (`placement`, `right` by default).
3. **Title**: one line, in bold.
4. **×**: closes it (named "Dismiss"); calls `onSkip`, as Skip does.
5. **Body**: a sentence or two.
6. **Actions**: Skip (quiet) and Got it.

It sits 12 from the control it points at.

## Behaviour

The bubble is a dialog after the WAI-ARIA
[Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): when it opens, focus moves into it and stays
there until it closes. The dialog is named by its title. Got it calls `onDismiss`, Skip and the × call `onSkip`; the
page closes it in both (`isOpen`).

| Key | What it does | Tested by |
| --- | --- | --- |
| (on open) | Focus moves into the bubble. | `play: Keyboard` |
| Tab and Shift Tab | Move through ×, Skip and Got it, and wrap round inside the bubble. | `play: Keyboard` |
| Enter (on Got it) | Calls `onDismiss`; once the page closes it, focus goes back to the control. | `play: Keyboard` |
| Esc | Closes it (`onOpenChange(false)`). | `play: Keyboard` |
| Enter (on ×) | Calls `onSkip`, never `onDismiss`. | `play: Keyboard` |

## Content

- The title says what the control is for, as a person would put it: "Follow the phases here", "Residents start
  here", "Ready when you are". Sentence case, no full stop.
- The body is one or two sentences that say what happens: "Each phase shows its status and how many days are
  left." Name the thing on screen the way the screen names it.
- Skip, Got it and the ×'s name ("Dismiss") come through `labels`.

## Accessibility

**The coachmark gives you:** a dialog that takes focus when it opens and keeps it until it closes, named buttons, Esc
to close, and a tail that follows its placement in both directions.

**You still own:**
- A name for it: the bubble's dialog isn't named by its title (see Known limits), so screen readers announce a dialog
  with no name.
- Opening it only once, and never while a person is in the middle of a task.
- Moving focus somewhere sensible when it closes, if the control it points at isn't where focus was.
- Words in the page's language (`labels`).

## Related

- **Help popover**: help that comes back on demand.
- **Tooltip**: a control's name on hover and focus.
- **Banner**: a message about the page.

## Provenance

- **Built by:** AI agents, from the prototype (its `#pj-coach` bubble). Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** its dialog has no accessible name (the title isn't wired to it); the × calls both `onSkip` and
  `onDismiss`; nothing in the back office uses it yet; the bubble's translucent white is still an open call for the
  designer (docs/OPEN-DECISIONS.md).

## Changes

- 30 Oct 2026: the bubble is named by its title; the × calls `onSkip` only, no longer `onDismiss` ("Got it") too
  (docs/DECISIONS.md, "Small fixes").
- 30 Oct 2026: this page written; its doc comment now says what it is for; a play function proves the keyboard table.
- 30 Oct 2026: its 12 to the trigger is the one outer margin kept (docs/DECISIONS.md, "Compose without CSS").
- 29 Oct 2026: the white focus ring on the dark fill is a 2px inverse border (docs/DECISIONS.md, "Token names").
- 29 Oct 2026: padding snapped from the prototype's 15 / 17 / 13 to 16 / 16 / 12 (docs/DECISIONS.md, "Building from the
  prototype review").

# Help popover

## When to use

- To explain one thing on the page in a sentence or two, for whoever wants to know, without crowding the page: what
  a tool does on its card in Tools ("Public API Access"), how the Health score is worked out in the Community monitor.
- Behind the info icon of a **Stat tile** ("Participation rate"), which renders one for you.
- As a text button, "Learn more" (`triggerText`), where a word reads better than an icon: a locked tool's card, a
  tool page's link to its docs.

## When not to use

- To name an icon button or show a short hint on hover and focus: use **Tooltip**.
- To introduce a control once, the first time someone meets it: use **Coachmark**.
- For anything with a form, choices or more than a short paragraph: use **Modal**.
- For a message about the page's state ("This phase has ended"): use **Banner**.
- For hint text a field always needs: put it in the field's description (**Text field**).

## Anatomy

1. **Trigger**: a 28 ghost Icon button with the help icon (a circled question mark), or a quiet 32 Button with your words
   (`triggerText`).
2. **Popover**: under the trigger, up to 320 wide, with an arrow.
3. **Title**: the popover's heading, in strong text; it also names the dialog.
4. **Body**: a sentence or two in small text.

## Behaviour

Behaviour from React Aria's `DialogTrigger`, `Dialog` and `Heading`, through the system's Popover and Button.

The popover follows the WAI-ARIA [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): a press opens it, so it works by touch and
keyboard as well as with a mouse. Nothing opens on hover.

| Key | What it does | Checked by |
| --- | --- | --- |
| Tab | Moves focus to the help icon (or the "Learn more" button). | `play: Keyboard` |
| Enter or Space | Opens the popover and moves focus into it. | `play: Keyboard` |
| Esc | Closes the popover and puts focus back on the icon. | `play: Keyboard` |

`e2e/stat-tile.spec.ts` and `e2e/tools.spec.ts` check the same open and close on the pages that use it.

## Content

- The title is the name of what it explains, as the page writes it: "Public API Access", "Health score",
  "Participation rate". It is also the icon's name: "Help: Health score" (`labels.help`).
- The body says what the thing is or how it is worked out, in one or two plain sentences: "Each token lets one
  custom integration read the platform's data."
- No links or buttons inside: everything it says should be readable in place.
- A text trigger is short: "Learn more", or the name of the docs it opens.

## Accessibility

**The popover gives you:** a real button with a name ("Help: …"), a dialog named by its title, focus in on open and
back on close, Esc to close, and no hover-only content.

**You still own:**
- A title that makes the icon's name clear out of context, especially when several help icons share a page.
- Keeping the help short; a long explanation belongs on the page or in a Modal.
- Words in the page's language (`labels.help` and the title).

## Related

- **Tooltip**: a short name or hint on hover and focus.
- **Stat tile**: carries a Help popover behind its info icon.
- **Icon button**: the trigger it draws.
- **Coachmark**: one-time onboarding hints.

## Provenance

- **Built by:** agents, from the real admin's help tooltips on tool cards and the prototype. Not in Figma.
- **Reviewed by a person:** not yet.
- **Known limits:** it always opens below its trigger (`placement="bottom"` is fixed); the body is meant for text only.

## Changes

- 30 Oct 2026: this page written; a play function proves Tab, Enter, Space and Esc.
- 29 Oct 2026: its words moved to `labels` ("Help: …"), and Stat tile hands them on (docs/DECISIONS.md, "Words and
  locales").
- 29 Oct 2026: chosen over an info icon with a hover tooltip, and moved to Components/Overlays: a tooltip on an icon
  that takes no focus can't be reached by touch or keyboard (docs/DECISIONS.md, "Building from the prototype review").

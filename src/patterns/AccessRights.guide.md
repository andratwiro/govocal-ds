# Access rights

## When to use

- To set who can take one participant action in a phase (submitting inputs, reacting, attending an event): the
  modal each Participant action row opens in a phase's Build tab (`AccessRightsModal`, one modal for every action,
  with the action's question as its title: "Who can submit inputs?").
- When the action follows the platform's defaults until someone chooses to override them for this phase: the body
  shows but stays read-only until Override.
- With `whoItems` for an action that offers fewer choices (Attending an event can't be open to anyone).

## When not to use

- For the list of actions and who can take each: use **Participant action row**; it opens this.
- For a one-off pick among a few tiles anywhere else: use **Choice card** in a **Radio group**.
- For a platform-wide permission page (who manages a project, folder or space): list people in a **Data table**
  inside a **Panel**, as Users does.
- For a yes-or-no setting that applies at once: use **Switch**.

## Anatomy

1. **Head**: "Using platform defaults" with the defaults link and Override, or "Overriding platform defaults".
2. **Who can participate**: a Section label over three Choice cards (Anyone, Require sign-in, Administrators and
   managers), each with an icon and a line.
3. **Sign-in's settings** (with Require sign-in): two sections that open and close, Security requirements (a
   password switch) and Limit to groups (a group Select and Customize error message).
4. **Admin note** (with Administrators and managers): one line saying no other requirement applies.
5. **In the modal** (`AccessRightsModal`): the question as title, the body above, and a footer with Revert to
   platform defaults (while overriding) and Save changes.

The modal is Modal's wide size (866).

## Behaviour

The choices are a radio group of cards, after the WAI-ARIA
[Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), and sign-in's settings are disclosures,
after the [Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Read-only before Override:
everything can be reached and read, nothing changes. Override and Revert take away the button that was pressed, so
focus moves to the chosen card or back to Override instead of falling to the page. Behaviour from React Aria's
Button, Disclosure, DisclosurePanel, DisclosureGroup and Heading, and through the system's Radio group, Choice card,
Switch, Select, Modal and Alert dialog.

| Key | What it does | Checked by |
| --- | --- | --- |
| Enter (on an action's row) | Opens the modal for that action. | `e2e/build-tab.spec.ts` |
| Enter (on Override) | Sets the action for this phase; focus moves to the chosen card. | `e2e/build-tab.spec.ts` |
| Tab | Lands on the chosen card (one stop for the group), then on sign-in's section headings. | `play: Keyboard` |
| Right arrow, Left arrow | Picks the next or the previous card. | `play: Keyboard` |
| Enter, Space (on a section heading) | Closes or opens that section. | `play: Keyboard` |
| Esc | Closes the modal and puts focus back on the row that opened it. | `e2e/build-tab.spec.ts` |

Revert to platform defaults asks first in an Alert dialog; confirming puts focus on Override
(`e2e/build-tab.spec.ts`).

## Content

- The modal's title is the action as a question: "Who can submit inputs?", "Who can attend this event?".
- The choices' words and lines are fixed ("Anyone" / "No account needed"); a page in another language passes them
  through `labels`, as it does the head, the settings and the footer.
- The words a Participant action row shows for each choice come from `ACCESS_WHO_VALUE` ("Sign-in required"), an
  English table: a page in another language passes its own `value` to the row.
- Revert's confirm says what is lost: "The groups you set for it will be discarded and cannot be restored."

## Accessibility

**The part gives you:** a named radio group that is read-only (not disabled) before Override, so a screen reader can
still read every choice; headings that open sign-in's settings; focus that never drops to the page when Override or
Revert takes its button away; a confirm before discarding; Esc back to the row.

**You still own:**
- The modal's title as a full question, so the dialog is named for its action.
- Opening it from something focusable (the action's row), so focus has somewhere to go back to.
- Saving: `onSave` is yours, and so is closing the modal after it.
- The words in the page's language (`labels`, and the row's `value`).

## Related

- **Participant action row**: the row that opens this modal and shows the result.
- **Choice card**: the three tiles of who can participate.
- **Modal**: the dialog it sits in.
- **Alert dialog**: the confirm before reverting.
- **Section label**: the heading over the choices.

## Provenance

- Built by agents from the designer's prototype (the access modal); not in Figma.
- Reviewed by a person: not yet.
- Known limits: the password switch and the group Select keep their own state and report nothing to the page (no
  `onChange` for either); "Customize error message" only calls `onCustomizeError`, it has no editor of its own; the
  choice words for the row are an English table (`ACCESS_WHO_VALUE`).

## Changes

- 30 Oct 2026: this page written; a play function proves the cards' arrows and the sections' keys.
- 29 Oct 2026: its words come in through `labels`, English by default.
- 29 Oct 2026: read-only before Override uses `isReadOnly`, the body faded once, not `isDisabled`; Revert sits in the
  footer and asks first (docs/DECISIONS.md, "Built in the project package").
- 29 Oct 2026: built from the prototype: defaults or overridden, who can participate as Choice cards, sign-in's
  settings, the admin note, and its modal.

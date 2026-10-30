# Participant action row

## When to use

- To list what participants can do in a phase and who can do each: a phase's Participant actions card in its Build
  tab ("Submitting inputs", "Reacting to inputs", "Attending an event"), in a `ParticipantActionList`.
- With `onOpen` so the row opens Access rights for that action; `value` says who can take it ("Sign-in required"),
  grey while it is the platform's default (`isDefault`), dark once set for this phase.
- With `isLocked` for an action the phase can't turn off (Attending an event; voting in a voting phase).
- With `options` for settings that hang from the action while it is on: `ParticipantLimit` for Reacting's reactions per
  participant (Unlimited or Limited, and the maximum).
- Without `onOpen` for a plain switch row that has no access of its own (Disliking).

## When not to use

- For who can take an action, the choices themselves: use **Access rights** (the modal this row opens).
- For an email the platform sends: use **Notification row**.
- For a view participants can see: use **View option row**.
- For an on-or-off setting outside the Build tab's actions: use **Switch**.

## Anatomy

1. **Switch** (or a **check** when locked, named "Always on").
2. **Action**: its name; grey when off.
3. **Value**: who can take it, at the end, grey (default) or dark (set for this phase).
4. **Chevron**: while on with `onOpen`; the action, value and chevron are one button to Access rights.
5. **Options** (optional): under the row, in the label column, only while it is on.

Off, there is no value and no chevron: who can do something nobody can do isn't set.

## Behaviour

The switch follows the WAI-ARIA [Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/); the row is a button
to Access rights, after the [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/); the limit is a radio
group.

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves to the switch, then to the row's button while the action is on. | `play: Keyboard` |
| Space (on the switch) | Turns the action off or on; off, the row's button goes. | `play: Keyboard` |
| Enter (on the row) | Opens Access rights for the action. | `play: Keyboard`, `e2e/build-tab.spec.ts` |
| Left arrow, Right arrow (in the limit) | Picks Unlimited or Limited; Limited shows the maximum, Unlimited hides it. | `e2e/build-tab.spec.ts` |

## Content

- The action as a gerund, sentence case: "Submitting inputs", "Reacting to inputs", "Commenting", "Attending an event".
- The value is who can take it: "Anyone can participate", "Sign-in required", "Admins & managers only".
  `ACCESS_WHO_VALUE` holds these in English; a page in another language passes its own `value`.
- Default and set-for-this-phase look different (grey, dark) and should read different too; never rely on the
  colour alone.
- The row's button reads "Edit access for <action>" by default (`labels.edit`); the lock's name is "Always on".
- A closed card's pill names the first action on and counts the rest: "Submit +2".

## Accessibility

**The row gives you:** a switch named by the action, a button named "Edit access for <action>", a named check for a
locked action, a named group around the rows, no button for an action that is off, and options that appear only
while they apply.

**You still own:**
- Where focus goes when Access rights closes (back to the row: give the modal the row as its trigger).
- The value's words, so default and set-for-this-phase differ in words, not only in grey and dark.
- The words in the page's language (`labels`, `value`).

## Related

- **Access rights**: the modal the row opens.
- **Notification row**, **View option row**: the Build tab's other switch rows.
- **Switch**: the control at the start of the row.
- **Number field**: Limited's maximum.

## Provenance

- Built by AI agents from the designer's prototype (a phase's Participant actions card); not in Figma.
- Reviewed by a person: not yet.
- Known limits: `ACCESS_WHO_VALUE` is an English table (docs/DECISIONS.md, "Words and locales").

## Changes

- 30 Oct 2026: `ParticipantLimit` is controllable (`limit`, `max`, `onChange`; a cleared maximum never reports
  `NaN`), and speaks of reactions, the word the back office uses ("Number of reactions per participant", "Maximum
  reactions"; src/foundations/words.json).
- 30 Oct 2026: this page written; a play function proves the switch and the row's keys.
- 29 Oct 2026: its words come in through `labels`, English by default.
- 29 Oct 2026: default vs set-for-this-phase values: grey vs dark, and different words (docs/DECISIONS.md, "Built in
  the project package").
- 29 Oct 2026: built from the prototype: a switch or a locked check, the action, who can take it, a way to Access
  rights, settings that hang from it.

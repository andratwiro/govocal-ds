# Banner

## When to use

- To tell people something about the page or section they're on, before they act: a smart group fills itself (Users),
  a quarter is still collecting answers (Community monitor), a long SMS costs more credits (Messaging).
- **Info** (the default) for a fact worth knowing; **neutral** for a quieter note (a saved snapshot, a phase not
  started); **warning** for something that will go wrong or cost something ("Provide a title for all languages",
  changing a question's wording); **success** for a confirmation that stays until dismissed (an email sent); **AI**
  for an AI analysis to open.
- With a link to where the fix is ("Go to Settings"), a block action under the words (the screening banner's
  "Review"), or a dismiss × when people may close it.
- `density="compact"` for a one-row status strip: a phase's dates state on the Build tab, "Archived" on a project's
  overview.

## When not to use

- To confirm something just happened and goes away: use **Toast**.
- For a page or list with nothing in it yet: use **Empty state**.
- For a short hint about one control: use **Help popover** or **Tooltip**.
- For an error on one field: use the field's own error message (**Text field**, **Select**).
- For a choice people must make before going on: use **Alert dialog**.

## Anatomy

1. **Box**: a rounded box on the tone's tint, padded 16.
2. **Icon**: the tone's 16 icon (info, clock, triangle, check, sparkles); any other with `icon`, none with
   `icon={null}`.
3. **Title** (optional): a bold line before the message.
4. **Message**: one or two sentences.
5. **Link** (optional): right after the words (`linkPlacement="inline"`) or at the end of the row (the default).
6. **Actions** (optional): a block under the message, such as a Button.
7. **Dismiss ×** (with `onDismiss`): in the corner.

Compact: one row, the icon, a bold title and a lighter line, no box padding.

## Behaviour

The banner itself takes
no focus; its link follows the WAI-ARIA [Link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/) and its × the
[Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does | Tested by |
| --- | --- | --- |
| Tab | Moves focus to the banner's link, then to its ×. | `play: Keyboard` |
| Enter (on the link) | Follows the link. | `play: Keyboard` |
| Enter (on the ×) | Dismisses the banner. | `play: Keyboard` |

A banner with no link, actions or × is not interactive.

## Content

- Say what is true and what to do about it, in one or two sentences: "Participants cannot see them until you approve
  them."
- A title, when there is one, names the situation in a few words: "Screening is on", "Archived".
- A link says where it goes: "Go to Settings", "Open AI analysis"; never "Click here".
- Don't stack banners; one per section, the most important.
- Warning is for consequences, not for decoration; a fact is info.
- The ×'s name is "Dismiss"; pass `labels` in other languages.
- A banner that appears in answer to something people did (a failed save) takes `isLive`, so it is heard; one that is
  there when the page opens doesn't.

## Accessibility

**The banner gives you:** a note (`role="note"`) a screen reader reads in place, a live banner (`isLive`) as a status
announced when it appears, a compact strip as a status that is announced when it changes, a tone icon hidden from screen readers, a real link and a named ×.

**You still own:**
- Words that say the tone; the colour and icon never carry the meaning alone ("Warning:" is not needed, but the
  sentence must say the risk).
- Where focus goes after a dismiss.
- `isLive` on a banner that appears after the page loaded, if people must hear it (a banner without it is not
  announced).

## Related

- **Toast**: the confirmation that goes away on its own.
- **Empty state**: the message when there's nothing yet.
- **Help popover**: help for one control.
- **Map view**: holds a banner in a corner overlay.
- **Icon button**: the dismiss ×.

## Provenance

- Built by AI agents from Figma's Banner (Info, Info · link); the neutral, warning, success and AI tones, the title,
  actions, dismiss and the compact strip come from the prototype and the review (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: no danger or error tone.

## Changes

- 30 Oct 2026: `isLive` announces a banner that appears after the page loaded (a status whose words arrive once
  it is on screen); without it, a note as before (docs/DECISIONS.md, "Component page fixes").
- 30 Oct 2026: this page written; a play function proves the keyboard table.
- 29 Oct 2026: the ×'s name comes through `labels`.
- 29 Oct 2026: `type="info-link"` became `linkPlacement="inline"`; `action` became `actions`; `compact` became
  `density="compact"` (docs/DECISIONS.md, "Public API and prop names").
- 29 Oct 2026: neutral, warning, success and AI tones, icon, title, action, dismiss and the compact phase-status strip,
  one message box instead of a second "inline alert" (docs/DECISIONS.md, "Building from the prototype
  review").
- 29 Oct 2026: closer to Figma and the prototype: padding 16 all round.

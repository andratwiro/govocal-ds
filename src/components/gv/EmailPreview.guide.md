# Email preview

## When to use

- Beside an email's fields, to show it as the person who gets it will: Messaging's automated emails (an email opened
  from the list), a custom email's composer, a phase's notification emails on the Build tab's stage.
- To check an email at a phone's width before sending: the Desktop / Phone switch above it.

## When not to use

- **Notification row** for the email in a list of emails with its on-or-off switch; open it to see its preview.
- **Phone preview** for what residents see of a project or phase on the platform's own pages.
- **Rich text editor** to write the email's body; the preview only shows it.

## Anatomy

1. **Envelope**: To, From and Reply-to (each optional) and the Subject in bold, names in a 96px column.
2. **Device switch** (optional, `showDeviceSwitch`): a 30px Segmented control, Desktop / Phone, at the end.
3. **Stage**: the stage grey, radius 12, the email centred on it.
4. **Frame**: 600px wide on desktop (radius 8), 343px on a phone (Phone preview's width, radius 22).
5. **Logo**: the platform's mark, 32px tall, centred; a grey placeholder without one.
6. **Title** (optional), in Title (16px), then the **body** in Body.
7. **Button** (optional): a primary Button's look, inert.
8. **Footer**: the secondary fill, Small (12px) tertiary: Unsubscribe, Terms and conditions, Privacy policy, then an
   optional note.

## Behaviour

The device switch follows the WAI-ARIA APG radio group pattern
(https://www.w3.org/WAI/ARIA/apg/patterns/radio/); the email itself is inert: its button and links can't be reached
or pressed.

| Key | What it does | Tested by |
|---|---|---|
| Tab | Moves onto the chosen width | `play: Keyboard` |
| Right arrow | Moves to the other width | `play: Keyboard` |
| Space | Chooses the width under focus; the frame narrows or widens | `play: Keyboard` |

## Content

- The subject as residents get it, sentence case, no full stop.
- From is the sender as residents see it (the platform's name), never a person's address.
- The button's words say what happens next ("View the comment", "Take the survey").
- The footer's links and the switch's words come in through `labels`; pass the platform's own footer as `footer`.

## Accessibility

**The part gives you:** a region named by the subject ("Email preview: New comment on your input"), the envelope as
a description list, a heading for the title at the level you pick (`headingLevel`), the logo named, and a keyboard
switch.

**You still own:**
- The heading level that fits the page's outline (designer and developer).
- The email's own language when it differs from the page's (`lang` on a wrapper).
- Real email accessibility (the sent HTML) is the mail template's job, not this preview's.

## Related

- **Notification row**: the list of a phase's emails that opens one.
- **Phone preview**: the phone's width and radius the phone frame takes.
- **Segmented control**: the device switch.

## Changes

- 30 Oct 2026: built (envelope, logo, title, body, button, footer, desktop and phone widths), with this page; it
  replaces the Email preview gap in Messaging.

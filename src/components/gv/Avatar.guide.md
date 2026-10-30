# Avatar

## When to use

- To show who a person is, next to their name: the signed-in admin in the side nav, a person in Users, a quote's
  author in a report.
- To show who something is assigned to: a 16 avatar before each manager in an assignee Select or Menu (the Input
  manager, a phase's Manage tab, the Projects filter), and the dashed ring for "Unassigned".
- To show who is here: the people slot of a project's header ("you are here").
- As a group of overlapping faces before a count (`AvatarGroup`), such as "215 participants" under a phone preview's
  Participate button.

## When not to use

- For a count, a status or a label in a small round shape: use **Badge**.
- To say something is new or unread: use **New dot**.
- For a picture that illustrates a page or an empty state: use **Illustration**.
- For a picture that is the content (an idea's image, a project's cover): use a plain image inside a **Card**; an
  avatar is only ever a person.

## Anatomy

1. **Circle**: filled with the avatar colour; or a dashed ring with no fill when unassigned (`isUnassigned`).
2. **Initials**: one or two letters, centred. They also show while a photo loads, or if it fails.
3. **Photo** (optional, `src`): covers the circle.

Sizes: 28 (the default, Figma's), 24 and 16 (the prototype's smaller stacks: assignee options, comment avatars). In
`AvatarGroup` each face is 24 and sits 6 over the one before.

## Behaviour

Not interactive: an avatar takes no focus and no keys. A photo that can't load falls back to the initials, and a new
`src` gets its own try. To make a person pressable, put the avatar inside a **Link** or a button with the person's
name.

## Content

- Initials: one or two letters from the person's name ("S" for Sam, "JL" for Jo Lee), in capitals.
- Always show the name beside the avatar, or give the avatar an `aria-label` that says who it is and why it is there:
  "Assigned to Sam", "Sam is here". The initials alone mean nothing to a screen reader.
- "Unassigned" is the dashed ring with the word "Unassigned" beside it or as its `aria-label`.
- In `AvatarGroup`, the words after the faces say the count ("215 participants"); the faces are decoration.

## Accessibility

**The avatar gives you:** an image named by its `aria-label` when you give one, a decorative photo (`alt=""`) that never
repeats the name, and initials that stay readable when the photo fails. `AvatarGroup` hides its faces from assistive
tech, so only the count is read.

**You still own:**
- The person's name, beside the avatar or in its `aria-label`; an avatar with neither says nothing.
- Leaving out `aria-label` when the name is already next to it, so it isn't read twice.
- Real photos only with the person's consent; the stories use invented pictures.

## Related

- **Select**: the assignee picker whose options carry a 16 avatar.
- **Menu**: the assign action in a row's or a panel's menu, with avatars.
- **Side nav**: the signed-in person's button, with a 24 avatar.
- **Project header**: its people slot.
- **New dot**: the other small round mark, for "new".

## Provenance

- Built by agents from Figma's Avatar (28, filled); the photo, the 16 and 24 sizes, the unassigned ring and the group
  come from the prototype (Not in Figma).
- Reviewed by a person: not yet.
- Known limits: one colour for every person (a grey variant for assignees and commenters is not built yet,
  docs/DECISIONS.md); `AvatarGroup` takes initials only, no photos.

## Changes

- 30 Oct 2026: the Group story shows `AvatarGroup` (it stacked avatars by hand with negative margins).
- 30 Oct 2026: this page written.
- 29 Oct 2026: `src` puts a photo over the initials, which show while it loads or if it fails.
- 29 Oct 2026: the 16 avatar's initials snapped from 11 to 12px; assignees show as an avatar and a name, "Unassigned"
  with a dashed ring, instead of tooltip-only initials (docs/DECISIONS.md, "Built in the tables package").
- 29 Oct 2026: built from Figma and the prototype.

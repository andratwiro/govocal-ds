// The main sidebar's invented data: who is signed in, the counts, the notifications and the menus' links.
export const ME = {name: 'Alex Morgan', initials: 'AM', role: 'Administrator'};
/** Inputs that need feedback and are assigned to the signed-in admin (the real admin's Input manager count). */
export const INPUTS_NEEDING_FEEDBACK = 46;
/** Unread notifications; the list below shows the newest few of them. */
export const UNREAD_NOTIFICATIONS = 28;

export type SidebarNotification = {id: string; kind: 'comment' | 'inputs' | 'report' | 'phase' | 'assigned' | 'review';
  text: string; time: string; href: string; isUnread: boolean};
export const NOTIFICATIONS: SidebarNotification[] = [
  {id: 'n1', kind: 'comment', text: 'A resident commented on your input "More shade on Elm Walk"', time: '12 min ago', href: '#/inputs', isUnread: true},
  {id: 'n2', kind: 'inputs', text: '3 new inputs in Collect ideas', time: '1 h ago', href: '#/projects/green-corridors/phases/p2/manage', isUnread: true},
  {id: 'n3', kind: 'report', text: 'Your report for Green Corridors for Larkvale is ready', time: '3 h ago', href: '#/reporting', isUnread: true},
  {id: 'n4', kind: 'assigned', text: '"Benches by the bus stop" was assigned to you', time: 'Yesterday', href: '#/inputs', isUnread: true},
  {id: 'n5', kind: 'phase', text: 'Community vote has started in Green Corridors for Larkvale', time: '19 Oct', href: '#/projects/green-corridors', isUnread: false},
  {id: 'n6', kind: 'review', text: 'A project manager asked you to review Harbour Plan 2030', time: '17 Oct', href: '#/projects', isUnread: false}
];
/** Older, read notifications: what "Show older notifications" adds under the list (the real admin's "Load more"). */
export const OLDER_NOTIFICATIONS: SidebarNotification[] = [
  {id: 'n7', kind: 'comment', text: 'A resident replied to your official update on "Quieter streets near the school"', time: '14 Oct', href: '#/inputs', isUnread: false},
  {id: 'n8', kind: 'inputs', text: '12 new inputs in Share your ideas', time: '11 Oct', href: '#/inputs', isUnread: false},
  {id: 'n9', kind: 'phase', text: 'Share your ideas ended in Harbour Plan 2030', time: '8 Oct', href: '#/projects', isUnread: false},
  {id: 'n10', kind: 'report', text: 'Your report for Q3 platform progress is ready', time: '2 Oct', href: '#/reporting', isUnread: false}
];

export const LOCALES = [{id: 'en', label: 'English'}, {id: 'fr', label: 'Français'}, {id: 'nl', label: 'Nederlands'}];

// The real admin's Support menu: Go Vocal's own public help sites, and the tenant's customer portal (admins only).
export const SUPPORT_LINKS = [
  {id: 'kb', label: 'Knowledge base', href: 'https://support.govocal.com'},
  {id: 'changelog', label: 'Product changelog', href: 'https://support.govocal.com/en/articles/527549-changelog'},
  {id: 'community', label: 'Community platform', href: 'https://community.govocal.com'},
  {id: 'portal', label: 'Customer portal', href: '#/platform?customer-portal'}
] as const;

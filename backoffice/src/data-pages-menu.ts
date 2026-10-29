// Invented data for Pages & menu: what can sit in the platform's navigation bar.
export type MenuKind = 'home' | 'default' | 'page';
export type MenuEntry = {id: string; label: string; kind: MenuKind};

/** Everything that can be a navigation bar item: the platform's own pages, then the custom pages. */
export const MENU_ENTRIES: MenuEntry[] = [
  {id: 'home', label: 'Home', kind: 'home'},
  {id: 'projects', label: 'All projects', kind: 'default'},
  {id: 'input', label: 'All input', kind: 'default'},
  {id: 'events', label: 'Events', kind: 'default'},
  {id: 'proposals', label: 'Proposals', kind: 'default'},
  {id: 'about', label: 'About', kind: 'page'},
  {id: 'faq', label: 'FAQ', kind: 'page'},
  {id: 'accessibility', label: 'Accessibility statement', kind: 'page'},
  {id: 'your-input', label: 'How we use your input', kind: 'page'},
  {id: 'grants', label: 'Neighbourhood grants', kind: 'page'}
];

/** The navigation bar as it is now, in order. */
export const MENU_START = ['home', 'projects', 'input', 'events', 'about', 'faq'];

/** Custom pages: slug and when each was last edited. */
export const PAGE_META: Record<string, {slug: string; edited: string}> = {
  about: {slug: 'about', edited: 'Edited 12 Sep'},
  faq: {slug: 'faq', edited: 'Edited 3 Oct'},
  accessibility: {slug: 'accessibility-statement', edited: 'Edited 28 Jun'},
  'your-input': {slug: 'how-we-use-your-input', edited: 'Edited 14 Oct'},
  grants: {slug: 'neighbourhood-grants', edited: 'Draft, edited 21 Oct'}
};

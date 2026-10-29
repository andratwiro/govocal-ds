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

/** The navigation bar names in the platform's other languages (English is the label). */
export const NAV_NAMES: Record<string, Record<string, string>> = {
  home: {'nl-BE': 'Home', 'nl-NL': 'Home', 'fr-BE': 'Accueil'},
  projects: {'nl-BE': 'Alle projecten', 'nl-NL': 'Alle projecten', 'fr-BE': 'Tous les projets'},
  input: {'nl-BE': 'Alle bijdragen', 'nl-NL': 'Alle bijdragen', 'fr-BE': 'Toutes les contributions'},
  events: {'nl-BE': 'Evenementen', 'nl-NL': 'Evenementen', 'fr-BE': 'Événements'},
  proposals: {'nl-BE': 'Voorstellen', 'nl-NL': 'Voorstellen', 'fr-BE': 'Propositions'},
  about: {'nl-BE': 'Over ons', 'nl-NL': 'Over ons', 'fr-BE': 'À propos'},
  faq: {'nl-BE': 'Veelgestelde vragen', 'nl-NL': '', 'fr-BE': 'FAQ'}
};

export type PageSection = {id: string; title: string; description: string; on: boolean; locked?: boolean};

/** The homepage builder's sections, top to bottom, as the real admin's homepage widgets. */
export const HOME_SECTIONS: PageSection[] = [
  {id: 'banner', title: 'Homepage banner', description: 'The image and welcome message at the top.', on: true, locked: true},
  {id: 'projects', title: 'Projects', description: 'The projects and folders open to residents.', on: true},
  {id: 'events', title: 'Events', description: 'Upcoming events from every project.', on: true},
  {id: 'proposals', title: 'Proposals', description: 'Proposals residents can support.', on: false},
  {id: 'cards', title: 'Image & text cards', description: 'Two or three cards that point to other pages.', on: false},
  {id: 'text', title: 'Text', description: 'A free text block, for a message from the council.', on: false}
];

/** A custom page's sections, as the real admin's custom page content. */
export const CUSTOM_PAGE_SECTIONS: PageSection[] = [
  {id: 'banner', title: 'Banner', description: 'A header image with the page title.', on: true},
  {id: 'top', title: 'Top info section', description: 'Text, images and links above everything else.', on: true},
  {id: 'projects', title: 'Projects list', description: 'Projects linked to the page by area or tag.', on: false},
  {id: 'events', title: 'Events', description: 'Events of the linked projects.', on: false},
  {id: 'bottom', title: 'Bottom info section', description: 'Text under the projects and events.', on: false},
  {id: 'attachments', title: 'Attachments', description: 'Files residents can download.', on: false}
];

/** What each custom page says at the top, for its view. */
export const PAGE_INTRO: Record<string, string> = {
  about: 'This platform is where residents and the council shape projects together: ideas, votes, surveys and events.',
  faq: 'Answers to the questions residents ask most: signing up, taking part, and what happens to your input.',
  accessibility: 'We want everyone to be able to use this platform. Here is what we do, and how to tell us what does not work.',
  'your-input': 'What happens after you take part: who reads your input, when you hear back, and how decisions are made.',
  grants: 'Small grants for neighbourhood projects run by residents. Apply before the end of the year.'
};

/** The custom pages that exist at the start, in the order they were made. */
export const PAGES_START = MENU_ENTRIES.filter(e => e.kind === 'page').map(e => e.id);

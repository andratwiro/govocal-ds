// Invented platform settings for the Settings page. No real tenant.
export const LOCALES = [
  {id: 'en', code: 'EN', label: 'English'},
  {id: 'nl-BE', code: 'NL-BE', label: 'Nederlands (België)'},
  {id: 'nl-NL', code: 'NL-NL', label: 'Nederlands (Nederland)'},
  {id: 'fr-BE', code: 'FR-BE', label: 'Français (Belgique)'}
];

export const PLATFORM_NAME: Record<string, string> = {
  en: 'Larkvale participates',
  'nl-BE': 'Larkvale doet mee',
  'nl-NL': '',
  'fr-BE': 'Larkvale participe'
};

export const APPROVERS = ['Manager A', 'Manager B', 'Manager C'];

export const SETTINGS_LISTS = {
  tags: {title: 'Tags', note: 'Tags help residents find projects by theme.', items: ['Mobility', 'Green spaces', 'Housing', 'Culture', 'Safety']},
  areas: {title: 'Areas', note: 'Areas let residents follow what happens near them.', items: ['North bank', 'Old harbour', 'Market quarter', 'South hills']},
  statuses: {title: 'Statuses', note: 'Statuses tell participants what happened to their input.', items: ['Proposed', 'Under consideration', 'Accepted', 'Implemented', 'Not selected']},
  policies: {title: 'Policies', note: 'The pages every resident can read before they sign up.', items: ['Terms and conditions', 'Privacy policy', 'Accessibility statement', 'Cookie policy']}
};

/** A row in Tags, Areas or Statuses: its name, a description, and for statuses a colour and a category. */
export type SettingsItem = {id: string; name: string; description: string; color?: string; category?: string};

const rows = (names: string[], prefix: string): SettingsItem[] => names.map((name, i) => ({id: `${prefix}${i}`, name, description: ''}));

export const PLATFORM_TAGS = rows(SETTINGS_LISTS.tags.items, 'tag');
export const AREAS = rows(SETTINGS_LISTS.areas.items, 'area');

/** The categories a status belongs to, for the analysis of inputs. */
export const INPUT_STATUS_CATEGORIES = ['Viewed', 'Under Consideration', 'Approved', 'Implemented', 'Not Selected', 'Other'];
export const PROPOSAL_STATUS_CATEGORIES = ['Viewed', 'Under Consideration', 'Answered', 'Ineligible', 'Other'];

export const INPUT_STATUSES: SettingsItem[] = [
  {id: 'is0', name: 'Proposed', description: 'Waiting to be read.', color: '#687782', category: 'Viewed'},
  {id: 'is1', name: 'Under consideration', description: 'The team is looking into it.', color: '#3B6FB6', category: 'Under Consideration'},
  {id: 'is2', name: 'Accepted', description: 'Selected for the next steps.', color: '#1E7F54', category: 'Approved'},
  {id: 'is3', name: 'Implemented', description: 'Done.', color: '#0F5132', category: 'Implemented'},
  {id: 'is4', name: 'Not selected', description: 'Not taken forward, with the reason why.', color: '#B3261E', category: 'Not Selected'}
];

export const PROPOSAL_STATUSES: SettingsItem[] = [
  {id: 'ps0', name: 'Proposed', description: 'Collecting support.', color: '#687782', category: 'Viewed'},
  {id: 'ps1', name: 'Threshold reached', description: 'Enough support to be answered.', color: '#3B6FB6', category: 'Under Consideration'},
  {id: 'ps2', name: 'Expired', description: 'The time to collect support is over.', color: '#8A6D00', category: 'Other'},
  {id: 'ps3', name: 'Answered', description: 'Official feedback provided.', color: '#1E7F54', category: 'Answered'},
  {id: 'ps4', name: 'Ineligible', description: 'Proposal is ineligible.', color: '#B3261E', category: 'Ineligible'}
];

/** The two policies edited here, with the start of each text. */
export const POLICIES = [
  {id: 'terms', name: 'Terms and conditions',
    text: 'By using this platform you agree to take part respectfully. Your contributions are public; your personal details are not.'},
  {id: 'privacy', name: 'Privacy policy',
    text: 'We keep only what we need to run the platform: your email address, and the answers you choose to give.'}
];

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

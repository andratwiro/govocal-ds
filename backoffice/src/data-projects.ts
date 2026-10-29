// Projects list: folders, spaces and templates for the first clicks (invented data only).

export type Folder = {name: string; status: 'Published' | 'Draft'; managers: string[]};
export const FOLDERS: Folder[] = [
  {name: 'Neighbourhood services', status: 'Published', managers: ['Manager B']},
  {name: 'Mobility and transport', status: 'Draft', managers: []}
];

// Spaces group projects across folders (the real admin's newer view).
export const SPACES = [
  {name: 'City centre', projects: ['green-corridors', 'market-square', 'clean-air'], managers: ['Manager A']},
  {name: 'Schools and youth', projects: ['school-streets', 'youth-budget', 'playgrounds'], managers: ['Manager C']},
  {name: 'Waterfront', projects: ['harbour-plan'], managers: []}
];

// Projects whose publication waits for an admin's approval.
export const PENDING = new Set(['harbour-plan', 'clean-air']);

export const TEMPLATES = [
  {title: 'Spatial plan', summary: 'Collect contributions on a new spatial plan and let residents prioritise them.'},
  {title: 'Collect ideas on a map', summary: 'Let residents pin their ideas on a map.'},
  {title: 'Polling', summary: 'Take the pulse of public opinion on one topic.'},
  {title: 'Mobility plan', summary: 'Involve residents in drawing up a mobility plan.'},
  {title: 'Prioritisation of ideas', summary: 'Collect contributions and let residents prioritise them.'},
  {title: 'Scenario planning', summary: 'Let residents weigh up different scenarios.'},
  {title: 'Participatory budget', summary: 'Let residents share part of the budget across competing proposals.'},
  {title: 'Climate action plan', summary: 'Build a shared climate roadmap from collected and prioritised proposals.'},
  {title: 'Green spaces', summary: 'Decide together how to improve parks, squares and other green spaces.'}
];

// The Calendar view opens on this month (the invented platform's "today").
export const CALENDAR_START = {year: 2026, month: 9}; // October 2026 (months count from 0)

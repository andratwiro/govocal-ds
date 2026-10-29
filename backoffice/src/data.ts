export const METHODS = ['Information', 'Ideation', 'Survey', 'Voting', 'Proposals', 'Common ground',
  'Document annotation', 'Volunteering', 'Poll'] as const;
export type Method = typeof METHODS[number];
export type Phase = {id: string; title: string; method: Method; status: 'Draft' | 'Live'; dates: string};
export type Project = {id: string; title: string; status: 'Draft' | 'Live'; phases: Phase[];
  participants?: number; current?: string; timeLeft?: string; managers?: string[]; access?: string;
  start?: string; end?: string; folder?: string};

// Invented data only: never real tenants, people or places.
export const PROJECTS: Project[] = [
  {id: 'green-corridors', title: 'Green Corridors for Riverside', status: 'Live', phases: METHODS.map((method, i) => ({
    id: `p${i + 1}`, title: `${method} phase`, method, status: i < 4 ? 'Live' : 'Draft',
    dates: `${String(i * 2 + 1).padStart(2, '0')} Mar – ${String(i * 2 + 2).padStart(2, '0')} Mar 2027`}))},
  {id: 'harbour-plan', title: 'Harbour Plan 2030', status: 'Draft', phases: [
    {id: 'p1', title: 'Share ideas', method: 'Ideation', status: 'Draft', dates: '01 Apr – 30 Apr 2027'}]},
  {id: 'school-streets', title: 'Safer School Streets', status: 'Live', phases: [
    {id: 'p1', title: 'Vote on streets', method: 'Voting', status: 'Live', dates: '10 Feb – 10 Mar 2027'}]},
  ...([
    ['library-hours', 'Library opening hours', 'Survey', 'Live', 'Neighbourhood services'],
    ['market-square', 'Market Square redesign', 'Document annotation', 'Live', 'Neighbourhood services'],
    ['youth-budget', 'Youth budget 2027', 'Voting', 'Live', undefined],
    ['clean-air', 'Clean air week', 'Information', 'Draft', undefined],
    ['playgrounds', 'Which playground first?', 'Poll', 'Live', undefined]
  ] as const).map(([id, title, method, status, folder]) => ({id, title, status, folder,
    phases: [{id: 'p1', title: `${method} phase`, method, status, dates: '01 May – 31 May 2027'}]} as Project))
];

// Projects list columns, as in the real admin (invented values).
const LIST: Record<string, Partial<Project>> = {
  'green-corridors': {participants: 214, current: 'Ideation', timeLeft: '3 weeks left', managers: ['Ana P.', 'Sam K.'], access: 'Anyone', start: '01 Mar 2027', end: '18 Mar 2027'},
  'harbour-plan': {participants: 0, current: 'Not started', managers: [], access: 'Selected groups', start: '01 Apr 2027', end: '30 Apr 2027'},
  'school-streets': {participants: 131, current: 'Voting', timeLeft: '5 days left', managers: ['Lee M.'], access: 'Anyone', start: '10 Feb 2027', end: '10 Mar 2027'},
  'library-hours': {participants: 88, current: 'Survey', timeLeft: '2 weeks left', managers: ['Ana P.'], access: 'Anyone', start: '01 May 2027', end: '31 May 2027'},
  'market-square': {participants: 23, current: 'Document annotation', timeLeft: '4 weeks left', managers: ['Sam K.', 'Lee M.', 'Jo R.'], access: 'Anyone', start: '01 May 2027', end: '31 May 2027'},
  'youth-budget': {participants: 302, current: 'Ended', managers: ['Jo R.'], access: 'Selected groups', start: '01 Jan 2027', end: '15 Feb 2027'},
  'clean-air': {participants: 0, current: 'Information', managers: [], access: 'Admins only', start: '01 Jun 2027'},
  'playgrounds': {participants: 57, current: 'Poll', timeLeft: 'Less than a day left', managers: ['Ana P.'], access: 'Anyone', start: '20 Apr 2027', end: '30 Apr 2027'}
};
for (const p of PROJECTS) Object.assign(p, LIST[p.id]);
const TITLES = ['More trees on Elm Lane', 'Bike lane by the school', 'Benches in Park Row', 'Night buses on weekends',
  'A water fountain at the station', 'Wider pavements on Mill Road', 'Shade over the market stalls', 'Quiet hours in the library',
  'A crossing near the clinic', 'Compost bins per block', 'Murals on the underpass', 'Longer green light for walkers'];
const INPUT_PROJECTS = ['green-corridors', 'school-streets', 'harbour-plan', 'library-hours'];
export const ASSIGNEES = ['Unassigned', 'Ana P.', 'Sam K.', 'Lee M.'];
export const STATUSES = ['Proposed', 'Under consideration', 'Accepted', 'Implemented', 'Not selected'];
export const INPUTS = TITLES.map((title, i) => ({
  id: `i${i + 1}`, title, project: INPUT_PROJECTS[i % 4],
  author: ['Resident A', 'Resident B', 'Resident C'][i % 3], votes: (i * 7) % 40, status: STATUSES[i % 5],
  assignee: ASSIGNEES[i % 4], comments: (i * 3) % 11, likes: (i * 7) % 23, dislikes: (i * 5) % 9,
  published: ['1 hour ago', '2 hours ago'][i] ?? `${i} days ago`, needsFeedback: i % 3 !== 2
}));
export const USERS = Array.from({length: 10}, (_, i) => ({
  id: `u${i + 1}`, name: `Test user ${i + 1}`, email: `user${i + 1}@example.org`, role: i === 0 ? 'Admin' : 'Resident', joined: `0${(i % 9) + 1} Jan 2027`
}));

// Dashboard · Overview, after the real admin's sections (invented numbers).
export const DASHBOARD = {
  people: [
    {label: 'Registrations', value: 1284, last30: 46, series: [12, 18, 15, 22, 30, 26, 41, 46]},
    {label: 'Participants', value: 873, last30: 61, series: [20, 24, 31, 28, 35, 44, 52, 61]}
  ],
  participation: [
    {label: 'Inputs', value: 392, last30: 39, series: [4, 9, 14, 11, 20, 26, 31, 39]},
    {label: 'Comments', value: 1105, last30: 105, series: [30, 45, 52, 61, 70, 84, 96, 105]},
    {label: 'Reactions', value: 4060, last30: 406, series: [120, 160, 210, 240, 300, 330, 380, 406]}
  ],
  perProject: [
    {project: 'Green Corridors for Riverside', inputs: 214},
    {project: 'Safer School Streets', inputs: 131},
    {project: 'Harbour Plan 2030', inputs: 47}
  ],
  inputStatus: {feedbackGiven: 62, statusChanged: 148, officialUpdates: 95, avgResponseDays: 4},
  management: [
    {label: 'Emails sent', value: 36, note: '12 automated, 24 custom'},
    {label: 'Invitations', value: 58, note: '14 pending, 44 accepted'},
    {label: 'Events', value: 14, note: '3 upcoming, 11 completed'},
    {label: 'Admins and managers', value: 9, note: '6 active in the last 30 days'}
  ]
};

export const METHODS = ['Information', 'Ideation', 'Survey', 'Voting', 'Proposals', 'Common ground',
  'Document annotation', 'Volunteering', 'Poll'] as const;
export type Method = typeof METHODS[number];
export type Phase = {id: string; title: string; method: Method; status: 'Draft' | 'Live'; dates: string};
export type Project = {id: string; title: string; status: 'Draft' | 'Live'; phases: Phase[]};

// Invented data only: never real tenants, people or places.
export const PROJECTS: Project[] = [
  {id: 'green-corridors', title: 'Green Corridors for Riverside', status: 'Live', phases: METHODS.map((method, i) => ({
    id: `p${i + 1}`, title: `${method} phase`, method, status: i < 4 ? 'Live' : 'Draft',
    dates: `${String(i * 2 + 1).padStart(2, '0')} Mar – ${String(i * 2 + 2).padStart(2, '0')} Mar 2027`}))},
  {id: 'harbour-plan', title: 'Harbour Plan 2030', status: 'Draft', phases: [
    {id: 'p1', title: 'Share ideas', method: 'Ideation', status: 'Draft', dates: '01 Apr – 30 Apr 2027'}]},
  {id: 'school-streets', title: 'Safer School Streets', status: 'Live', phases: [
    {id: 'p1', title: 'Vote on streets', method: 'Voting', status: 'Live', dates: '10 Feb – 10 Mar 2027'}]}
];
export const INPUTS = Array.from({length: 12}, (_, i) => ({
  id: `i${i + 1}`, title: ['More trees on Elm Lane', 'Bike lane by the school', 'Benches in Park Row', 'Night buses on weekends'][i % 4],
  author: ['Resident A', 'Resident B', 'Resident C'][i % 3], votes: (i * 7) % 40, status: ['New', 'In review', 'Answered'][i % 3]
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

import {REGISTERED_USERS} from './data-users';
export const METHODS = ['Information', 'Ideation', 'Survey', 'Voting', 'Proposals', 'Common ground',
  'Document annotation', 'Volunteering', 'Poll'] as const;
export type Method = typeof METHODS[number];
// Done: a phase that has ended. `count` is what it gathered ("312 ideas"); `fresh` how many of those are new.
export type Phase = {id: string; title: string; method: Method; status: 'Draft' | 'Live' | 'Done'; dates: string;
  count?: string; fresh?: number};
export type Project = {id: string; title: string; status: 'Draft' | 'Live'; phases: Phase[];
  participants?: number; current?: string; timeLeft?: string; managers?: string[]; access?: string;
  start?: string; end?: string; folder?: string};

// Invented data only: never real tenants, people or places.
export const PROJECTS: Project[] = [
  {id: 'green-corridors', title: 'Green Corridors for Larkvale', status: 'Live', phases: [
    {id: 'p1', title: 'Project background', method: 'Information', status: 'Done', dates: '10 to 30 Aug', count: '1,890 visits'},
    {id: 'p2', title: 'Collect ideas', method: 'Ideation', status: 'Done', dates: '1 to 21 Sep', count: '312 ideas', fresh: 18},
    {id: 'p3', title: 'Shortlist proposals', method: 'Proposals', status: 'Done', dates: '22 Sep to 18 Oct', count: '48 proposals'},
    {id: 'p4', title: 'Community vote', method: 'Voting', status: 'Live', dates: '19 Oct to 16 Nov', count: '1,240 votes'},
    {id: 'p5', title: 'Feedback survey', method: 'Survey', status: 'Draft', dates: '17 Nov to 7 Dec'},
    {id: 'p6', title: 'Find common ground', method: 'Common ground', status: 'Draft', dates: '8 Dec to 11 Jan'},
    {id: 'p7', title: 'Recruit volunteers', method: 'Volunteering', status: 'Draft', dates: '12 Jan to 8 Feb'}
  ]},
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
  'green-corridors': {participants: 215, current: 'Voting', timeLeft: '3 weeks left', managers: ['Manager A', 'Manager B'], access: 'Anyone', start: '10 Aug 2026', end: '08 Feb 2027'},
  'harbour-plan': {participants: 0, current: 'Not started', managers: [], access: 'Selected groups', start: '01 Apr 2027', end: '30 Apr 2027'},
  'school-streets': {participants: 131, current: 'Voting', timeLeft: '5 days left', managers: ['Manager C'], access: 'Anyone', start: '10 Feb 2027', end: '10 Mar 2027'},
  'library-hours': {participants: 88, current: 'Survey', timeLeft: '2 weeks left', managers: ['Manager A'], access: 'Anyone', start: '01 May 2027', end: '31 May 2027'},
  'market-square': {participants: 23, current: 'Document annotation', timeLeft: '4 weeks left', managers: ['Manager B', 'Manager C', 'Manager D'], access: 'Anyone', start: '01 May 2027', end: '31 May 2027'},
  'youth-budget': {participants: 302, current: 'Ended', managers: ['Manager D'], access: 'Selected groups', start: '01 Jan 2027', end: '15 Feb 2027'},
  'clean-air': {participants: 0, current: 'Information', managers: [], access: 'Admins only', start: '01 Jun 2027'},
  'playgrounds': {participants: 57, current: 'Poll', timeLeft: 'Less than a day left', managers: ['Manager A'], access: 'Anyone', start: '20 Apr 2027', end: '30 Apr 2027'}
};
for (const p of PROJECTS) Object.assign(p, LIST[p.id]);
const TITLES = ['More trees on Elm Lane', 'Bike lane by the school', 'Benches in Park Row', 'Night buses on weekends',
  'A water fountain at the station', 'Wider pavements on Mill Road', 'Shade over the market stalls', 'Quiet hours in the library',
  'A crossing near the clinic', 'Compost bins per block', 'Murals on the underpass', 'Longer green light for walkers'];
const INPUT_PROJECTS = ['green-corridors', 'school-streets', 'harbour-plan', 'library-hours'];
export const ASSIGNEES = ['Unassigned', 'Manager A', 'Manager B', 'Manager C'];
export const ME = 'Manager A'; // the signed-in admin of this invented platform
export const STATUSES = ['Proposed', 'Under consideration', 'Accepted', 'Implemented', 'Not selected'];
export const INPUTS = TITLES.map((title, i) => ({
  id: `i${i + 1}`, title, project: INPUT_PROJECTS[i % 4],
  author: ['Resident A', 'Resident B', 'Resident C'][i % 3], votes: (i * 7) % 40, status: STATUSES[i % 5],
  assignee: ASSIGNEES[i % 4], comments: (i * 3) % 11, likes: (i * 7) % 23, dislikes: (i * 5) % 9,
  published: ['1 hour ago', '2 hours ago'][i] ?? `${i} days ago`, needsFeedback: i % 3 !== 2,
  // Phase screen · Manage: the phase an input came in through, and whether it carries a content warning.
  phase: INPUT_PROJECTS[i % 4] === 'green-corridors' ? 'p2' : 'p1', warning: i % 8 === 0, newComments: (i * 2) % 3
}));
/** Inputs that wait for feedback: the Input manager's switch badge and the Dashboard's "Waiting for feedback". */
export const INPUTS_AWAITING_FEEDBACK = INPUTS.filter(i => i.needsFeedback).length;
/** Of those, the ones assigned to the signed-in admin: the side nav's Input manager count (as the real admin's). */
export const MY_INPUTS_AWAITING_FEEDBACK = INPUTS.filter(i => i.needsFeedback && i.assignee === ME).length;
export const USERS = Array.from({length: 10}, (_, i) => ({
  id: `u${i + 1}`, name: `Test user ${i + 1}`, email: `user${i + 1}@example.org`, role: i === 0 ? 'Admin' : 'Resident', joined: `0${(i % 9) + 1} Jan 2027`
}));

// Dashboard · Overview, after the real admin's sections (invented numbers).
export const DASHBOARD = {
  people: [
    {label: 'Registrations', value: REGISTERED_USERS, last30: 46, series: [12, 18, 15, 22, 30, 26, 41, 46]},
    {label: 'Participants', value: 873, last30: 61, series: [20, 24, 31, 28, 35, 44, 52, 61]}
  ],
  participation: [
    {label: 'Inputs', value: 392, last30: 39, series: [4, 9, 14, 11, 20, 26, 31, 39]},
    {label: 'Comments', value: 1105, last30: 105, series: [30, 45, 52, 61, 70, 84, 96, 105]},
    {label: 'Reactions', value: 4060, last30: 406, series: [120, 160, 210, 240, 300, 330, 380, 406]}
  ],
  perProject: [
    {project: 'Green Corridors for Larkvale', inputs: 214},
    {project: 'Safer School Streets', inputs: 131},
    {project: 'Harbour Plan 2030', inputs: 47}
  ],
  inputStatus: {feedbackGiven: Math.round((1 - INPUTS_AWAITING_FEEDBACK / INPUTS.length) * 100), statusChanged: 148, officialUpdates: 95, avgResponseDays: 4},
  management: [
    {label: 'Emails sent', value: 36, note: '12 automated, 24 custom'},
    {label: 'Invitations', value: 58, note: '14 pending, 44 accepted'},
    {label: 'Events', value: 14, note: '3 upcoming, 11 completed'},
    {label: 'Admins and managers', value: 9, note: '6 active in the last 30 days'}
  ]
};

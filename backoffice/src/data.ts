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

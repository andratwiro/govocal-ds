import type {ChartColor} from 'govocal-ds';

// Invented figures for the Dashboard page only. The headline numbers live in data.ts (DASHBOARD).

/** One label per value of the DASHBOARD series: the last eight months. */
export const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const PER_TAG = [
  {tag: 'Green spaces', inputs: 128},
  {tag: 'Mobility', inputs: 97},
  {tag: 'Safety', inputs: 74},
  {tag: 'Housing', inputs: 41},
  {tag: 'Culture', inputs: 22}
];

/** Input status breakdown, as the prototype's Status breakdown card (bar colour per status). */
export const STATUS_BREAKDOWN: {label: string; count: number; color: ChartColor}[] = [
  {label: 'Proposed', count: 71, color: 'blue-2'},
  {label: 'Viewed', count: 118, color: 'blue-3'},
  {label: 'Under consideration', count: 59, color: 'blue-1'},
  {label: 'Accepted', count: 71, color: 'agree'},
  {label: 'Rejected', count: 59, color: 'disagree'},
  {label: 'Implemented', count: 14, color: 'green'}
];

export const EMAILS = {
  automated: {total: 12, series: [0, 1, 1, 2, 1, 2, 2, 3]},
  custom: {total: 24, series: [1, 2, 2, 3, 3, 4, 4, 5]}
};

export const INVITATIONS = {sent: 58, pending: 14, accepted: 44};
export const EVENTS = {added: 14, upcoming: 3, completed: 11};

export const ADOPTION = {
  admins: {total: 4, active30: 3, series: [2, 2, 3, 3, 2, 3, 3, 3]},
  managers: {total: 5, active30: 3, series: [1, 2, 2, 3, 3, 2, 4, 3]}
};

// ── The other dashboard tabs and the Overview's controls ──

export const DATE_PRESETS = ['All Time', 'Previous week', 'Last 30 days', 'Last 90 days', 'Last year', 'Custom'] as const;

export const METRICS = ['Inputs', 'Comments', 'Reactions', 'Participants'] as const;
export type Metric = typeof METRICS[number];
type Counts = Record<Metric, number>;

/** Every metric per project (keyed by the project's id in data.ts). Each column sums to the DASHBOARD totals. */
export const PROJECT_METRICS: Record<string, Counts> = {
  'green-corridors': {Inputs: 214, Comments: 603, Reactions: 2210, Participants: 488},
  'school-streets': {Inputs: 131, Comments: 377, Reactions: 1390, Participants: 291},
  'harbour-plan': {Inputs: 47, Comments: 125, Reactions: 460, Participants: 94}
};

/** Every metric per tag; Inputs matches PER_TAG. */
export const TAG_METRICS: Record<string, Counts> = {
  'Green spaces': {Inputs: 128, Comments: 352, Reactions: 1290, Participants: 281},
  'Mobility': {Inputs: 97, Comments: 274, Reactions: 1012, Participants: 214},
  'Safety': {Inputs: 74, Comments: 211, Reactions: 760, Participants: 160},
  'Housing': {Inputs: 41, Comments: 168, Reactions: 590, Participants: 133},
  'Culture': {Inputs: 22, Comments: 100, Reactions: 408, Participants: 85}
};

export type Share = {label: string; percent: number; color: ChartColor};

/** Users tab: who registered, from registration fields (shares of participants). */
export const USERS = {
  active: 612,
  gender: [
    {label: 'Woman', percent: 54, color: 'blue-2'}, {label: 'Man', percent: 42, color: 'blue-4'},
    {label: 'Another gender or not said', percent: 4, color: 'pass'}
  ] as Share[],
  age: [
    {label: 'Under 25', percent: 14, color: 'blue-1'}, {label: '25–34', percent: 23, color: 'blue-2'},
    {label: '35–44', percent: 21, color: 'blue-3'}, {label: '45–64', percent: 28, color: 'blue-4'},
    {label: '65+', percent: 14, color: 'blue-5'}
  ] as Share[],
  area: [
    {label: 'North district', count: 262}, {label: 'Central district', count: 241},
    {label: 'South district', count: 198}, {label: 'East district', count: 172}
  ],
  education: [
    {label: 'Secondary', percent: 31, color: 'olive'}, {label: 'Vocational', percent: 24, color: 'terracotta'},
    {label: 'Higher', percent: 38, color: 'green'}, {label: 'Not said', percent: 7, color: 'pass'}
  ] as Share[]
};

/** Visitors tab. */
export const VISITORS = {
  kpis: [
    {label: 'Visitors', value: '3,184', note: 'Last 30 days: 412'},
    {label: 'Visits', value: '5,902', note: 'Last 30 days: 763'},
    {label: 'Visit duration', value: '2:14', note: 'Last 30 days: 1:58'},
    {label: 'Pageviews per visit', value: '1.9', note: 'Last 30 days: 2.1'}
  ],
  visitors: [210, 260, 288, 301, 340, 372, 401, 412],
  visits: [380, 470, 512, 560, 640, 690, 744, 763],
  sources: [
    {label: 'Direct', count: 1420}, {label: 'Search engines', count: 1104}, {label: 'Social media', count: 812},
    {label: 'Other websites', count: 431}, {label: 'Email campaigns', count: 268}
  ],
  language: [
    {label: 'English', percent: 71, color: 'blue-2'}, {label: 'French', percent: 18, color: 'blue-4'},
    {label: 'Arabic', percent: 11, color: 'green'}
  ] as Share[],
  devices: [
    {label: 'Mobile', percent: 58, color: 'blue-2'}, {label: 'Desktop', percent: 36, color: 'blue-4'},
    {label: 'Tablet', percent: 6, color: 'olive'}
  ] as Share[]
};

/** Representativeness tab: participants against the reference population, per registration field. */
export const REPRESENTATION = {
  score: 82,
  withData: 74,
  fields: [
    {field: 'Gender', rows: [
      {label: 'Woman', users: 54, population: 51}, {label: 'Man', users: 42, population: 48},
      {label: 'Another gender', users: 4, population: 1}]},
    {field: 'Age', rows: [
      {label: 'Under 25', users: 14, population: 19}, {label: '25–34', users: 23, population: 17},
      {label: '35–44', users: 21, population: 16}, {label: '45–64', users: 28, population: 29},
      {label: '65+', users: 14, population: 19}]},
    {field: 'Area', rows: [
      {label: 'North district', users: 30, population: 26}, {label: 'Central district', users: 28, population: 24},
      {label: 'South district', users: 23, population: 27}, {label: 'East district', users: 19, population: 23}]}
  ]
};

export type FeedItem = {id: string; type: 'Idea' | 'Comment' | 'Proposal'; content: string; project: string; date: string; viewed: boolean};
/** Participation feed: what residents posted lately. */
export const PARTICIPATION_FEED: FeedItem[] = [
  {id: 'f1', type: 'Idea', content: 'Shade trees along the canal path', project: 'Green Corridors for Larkvale', date: '29 Oct 2026', viewed: false},
  {id: 'f2', type: 'Comment', content: 'A crossing guard at the north gate would help.', project: 'Safer School Streets', date: '29 Oct 2026', viewed: false},
  {id: 'f3', type: 'Proposal', content: 'Close the school lane to cars at 8:30', project: 'Safer School Streets', date: '28 Oct 2026', viewed: false},
  {id: 'f4', type: 'Comment', content: 'Benches every 200 metres, please.', project: 'Green Corridors for Larkvale', date: '28 Oct 2026', viewed: false},
  {id: 'f5', type: 'Idea', content: 'A pocket park on the old car park', project: 'Green Corridors for Larkvale', date: '27 Oct 2026', viewed: false},
  {id: 'f6', type: 'Idea', content: 'Water taps on the harbour walk', project: 'Harbour Plan 2030', date: '26 Oct 2026', viewed: false},
  {id: 'f7', type: 'Comment', content: 'Agree, the bridge needs lights.', project: 'Green Corridors for Larkvale', date: '24 Oct 2026', viewed: true},
  {id: 'f8', type: 'Idea', content: 'Bike racks by the library', project: 'Safer School Streets', date: '22 Oct 2026', viewed: true},
  {id: 'f9', type: 'Proposal', content: 'Weekend market on the quay', project: 'Harbour Plan 2030', date: '20 Oct 2026', viewed: true}
];

export const FEED_ACTIONS = ['Created', 'Modified', 'Deleted', 'Project approved'] as const;
export type ManagementEntry = {id: string; date: string; user: string; item: string; kind: 'Project' | 'Phase' | 'Folder' | 'Idea'; action: typeof FEED_ACTIONS[number]};
/** Management feed: what admins and managers changed. */
export const MANAGEMENT_FEED: ManagementEntry[] = [
  {id: 'm1', date: '29 Oct 2026', user: 'Manager A', item: 'Community vote', kind: 'Phase', action: 'Modified'},
  {id: 'm2', date: '28 Oct 2026', user: 'Admin B', item: 'Harbour Plan 2030', kind: 'Project', action: 'Created'},
  {id: 'm3', date: '27 Oct 2026', user: 'Manager A', item: 'Green Corridors for Larkvale', kind: 'Project', action: 'Modified'},
  {id: 'm4', date: '25 Oct 2026', user: 'Manager C', item: 'Safer School Streets', kind: 'Project', action: 'Project approved'},
  {id: 'm5', date: '24 Oct 2026', user: 'Admin B', item: 'Duplicate idea on lighting', kind: 'Idea', action: 'Deleted'},
  {id: 'm6', date: '22 Oct 2026', user: 'Manager C', item: 'Feedback survey', kind: 'Phase', action: 'Created'},
  {id: 'm7', date: '20 Oct 2026', user: 'Admin B', item: 'Neighbourhood plans', kind: 'Folder', action: 'Modified'},
  {id: 'm8', date: '18 Oct 2026', user: 'Manager A', item: 'Collect ideas', kind: 'Phase', action: 'Modified'}
];

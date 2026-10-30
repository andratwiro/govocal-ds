import {PICTURES} from './pictures';

// Invented projects from invented platforms in invented countries: nothing here names a real place.
export const METHODS = ['Ideation', 'Survey', 'Voting', 'Proposals', 'Information', 'Common ground', 'Volunteering', 'Document annotation'] as const;
export const COUNTRIES = ['Northmark', 'Southmere', 'Westerholm'] as const;
export const POPULATIONS = ['< 10,000', '10,000 - 30,000', '30,000 - 100,000', '100,000 - 250,000', '> 250,000'] as const;
export const TOPICS = ['Transport', 'Environment', 'Urban development', 'Community', 'Technology'] as const;
export const SORTS = ['Start date (newest first)', 'Start date (oldest first)', 'Participants (highest first)', 'Participants (lowest first)'] as const;

export type Method = typeof METHODS[number];
export type Country = typeof COUNTRIES[number];

export interface LibraryProject {
  id: string;
  title: string;
  platform: string;
  country: Country;
  population: typeof POPULATIONS[number];
  topic: typeof TOPICS[number];
  methods: Method[];
  participants: number;
  /** ISO start date, for sorting. */
  start: string;
  /** The project's image: one of the back office's invented pictures. */
  picture: string;
  /** What the project asked residents, in a sentence or two (the preview's body). */
  summary: string;
  /** Pinned by the Go Vocal team for a country, with a word on why. */
  highlight?: string;
}

export const LIBRARY: LibraryProject[] = [
  {id: 'p1', title: 'A greener larkvale promenade', platform: 'Town of Alderbrook', country: 'Northmark', population: '30,000 - 100,000',
    topic: 'Environment', methods: ['Ideation', 'Voting'], participants: 1840, start: '2026-03-02', picture: PICTURES.park, summary: 'Residents mapped where the promenade felt grey or unsafe, then voted on the ten ideas the town could fund this year.',
    highlight: 'Ideas on a map first, then a vote on the best ten: a clear two-step a resident can follow.'},
  {id: 'p2', title: 'Safe routes to school', platform: 'Kestrel Bay', country: 'Northmark', population: '10,000 - 30,000',
    topic: 'Transport', methods: ['Survey', 'Information'], participants: 620, start: '2025-11-14', picture: PICTURES.bikeLane, summary: 'Parents and pupils said how they get to school and where it feels risky; the town shared a plan of crossings back.',
    highlight: 'Short survey for parents, results shared back within a month.'},
  {id: 'p3', title: 'Neighbourhood budget 2026', platform: 'City of Fernquill', country: 'Southmere', population: '> 250,000',
    topic: 'Community', methods: ['Proposals', 'Voting'], participants: 9310, start: '2026-01-20', picture: PICTURES.mural, summary: 'Any resident could propose a project for their neighbourhood; feasible ones went to a city-wide vote on the budget.',
    highlight: 'Residents propose, a panel checks feasibility, everyone votes.'},
  {id: 'p4', title: 'Cycle lanes on the ring road', platform: 'Quillbrook', country: 'Southmere', population: '100,000 - 250,000',
    topic: 'Transport', methods: ['Ideation', 'Common ground'], participants: 2475, start: '2025-09-08', picture: PICTURES.bikeLane, summary: 'Residents shared ideas for the ring road, then reacted to statements to find what most people could agree on.'},
  {id: 'p5', title: 'Plant a tree in your street', platform: 'Ashby Vale', country: 'Westerholm', population: '< 10,000',
    topic: 'Environment', methods: ['Volunteering'], participants: 212, start: '2026-04-11', picture: PICTURES.streetTrees, summary: 'Residents signed up to plant and water a tree in their own street, with the town providing trees and tools.'},
  {id: 'p6', title: 'The new library, together', platform: 'Port Merrow', country: 'Westerholm', population: '30,000 - 100,000',
    topic: 'Community', methods: ['Survey', 'Ideation', 'Information'], participants: 1103, start: '2025-06-30', picture: PICTURES.library, summary: 'A survey on what the new library should offer, ideas for its spaces, and updates as the building went up.'},
  {id: 'p7', title: 'Draft climate plan: comment on it', platform: 'City of Fernquill', country: 'Southmere', population: '> 250,000',
    topic: 'Environment', methods: ['Document annotation'], participants: 764, start: '2026-02-05', picture: PICTURES.streetTrees, summary: 'The draft climate plan, paragraph by paragraph, open for residents to comment on before the council vote.'},
  {id: 'p8', title: 'Old mill site: what comes next?', platform: 'Town of Alderbrook', country: 'Northmark', population: '30,000 - 100,000',
    topic: 'Urban development', methods: ['Ideation', 'Survey', 'Voting'], participants: 3052, start: '2025-10-01', picture: PICTURES.lights, summary: 'What should replace the old mill? Ideas first, a survey on the shortlist, then a vote on the final three.'}
];

/** The phase a copied project starts with for each method. */
export const PHASE_TITLES: Record<Method, string> = {
  'Ideation': 'Share ideas',
  'Survey': 'Answer the survey',
  'Voting': 'Vote on the shortlist',
  'Proposals': 'Submit proposals',
  'Information': 'Learn about the plan',
  'Common ground': 'Find common ground',
  'Volunteering': 'Sign up to help',
  'Document annotation': 'Comment on the draft'
};

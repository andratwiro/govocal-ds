import {Bike, Building2, Leaf, Library, School, Trees, Vote, Waves, type LucideIcon} from 'lucide-react';

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
  /** The art standing in for the project's image. */
  art: LucideIcon;
  /** Pinned by the Go Vocal team for a country, with a word on why. */
  highlight?: string;
}

export const LIBRARY: LibraryProject[] = [
  {id: 'p1', title: 'A greener larkvale promenade', platform: 'Town of Alderbrook', country: 'Northmark', population: '30,000 - 100,000',
    topic: 'Environment', methods: ['Ideation', 'Voting'], participants: 1840, start: '2026-03-02', art: Waves,
    highlight: 'Ideas on a map first, then a vote on the best ten: a clear two-step a resident can follow.'},
  {id: 'p2', title: 'Safe routes to school', platform: 'Kestrel Bay', country: 'Northmark', population: '10,000 - 30,000',
    topic: 'Transport', methods: ['Survey', 'Information'], participants: 620, start: '2025-11-14', art: School,
    highlight: 'Short survey for parents, results shared back within a month.'},
  {id: 'p3', title: 'Neighbourhood budget 2026', platform: 'City of Fernquill', country: 'Southmere', population: '> 250,000',
    topic: 'Community', methods: ['Proposals', 'Voting'], participants: 9310, start: '2026-01-20', art: Vote,
    highlight: 'Residents propose, a panel checks feasibility, everyone votes.'},
  {id: 'p4', title: 'Cycle lanes on the ring road', platform: 'Quillbrook', country: 'Southmere', population: '100,000 - 250,000',
    topic: 'Transport', methods: ['Ideation', 'Common ground'], participants: 2475, start: '2025-09-08', art: Bike},
  {id: 'p5', title: 'Plant a tree in your street', platform: 'Ashby Vale', country: 'Westerholm', population: '< 10,000',
    topic: 'Environment', methods: ['Volunteering'], participants: 212, start: '2026-04-11', art: Trees},
  {id: 'p6', title: 'The new library, together', platform: 'Port Merrow', country: 'Westerholm', population: '30,000 - 100,000',
    topic: 'Community', methods: ['Survey', 'Ideation', 'Information'], participants: 1103, start: '2025-06-30', art: Library},
  {id: 'p7', title: 'Draft climate plan: comment on it', platform: 'City of Fernquill', country: 'Southmere', population: '> 250,000',
    topic: 'Environment', methods: ['Document annotation'], participants: 764, start: '2026-02-05', art: Leaf},
  {id: 'p8', title: 'Old mill site: what comes next?', platform: 'Town of Alderbrook', country: 'Northmark', population: '30,000 - 100,000',
    topic: 'Urban development', methods: ['Ideation', 'Survey', 'Voting'], participants: 3052, start: '2025-10-01', art: Building2}
];

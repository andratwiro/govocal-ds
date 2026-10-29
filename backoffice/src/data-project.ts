import type {TimelinePhase} from '../../src/patterns/PhaseTimeline';
import type {Phase, Project} from './data';

// Project overview (#/projects/:id), after the prototype's live project screen. Invented data only.

// The method as the rail names it: Information phases read as "Sharing".
const METHOD_WORD: Partial<Record<Phase['method'], string>> = {Information: 'Sharing'};
const STATE = {Done: 'done', Live: 'in-progress', Draft: 'upcoming'} as const;

/** A project's phases as the Participation rail shows them, each leading to its phase screen. */
export function timeline(project: Project, href: (p: Phase) => string, currentId?: string): TimelinePhase[] {
  return project.phases.map(p => ({
    id: p.id, title: p.title, state: STATE[p.status], dates: p.dates, method: METHOD_WORD[p.method] ?? p.method,
    count: p.count, fresh: p.fresh, href: href(p), current: p.id === currentId
  }));
}

export type Overview = {
  /** Participants so far, week by week. */
  weeks: number[];
  since: string;
  /** Methods running outside the timeline. */
  spotlight: TimelinePhase[];
  /** The resident's project page: intro, then more after the participation box. */
  intro: string;
  more: string[];
  ways: number;
};

export const OVERVIEWS: Record<string, Overview> = {
  'green-corridors': {
    weeks: [6, 11, 19, 27, 34, 48, 63, 77, 96, 118, 139, 160, 181, 197, 215],
    since: '10 Aug',
    spotlight: [{id: 's1', title: 'Resident satisfaction', state: 'in-progress', dates: '9 Oct to 18 Nov', method: 'Survey', count: '214 responses'}],
    intro: 'More trees, safer paths and quieter streets. Help us decide where the next green corridor goes and what it should feel like.',
    more: [
      'The ideas you shared in September became 48 proposals. Vote for the ones you want to see first: the most popular go to the council in December.',
      'After the vote, a short survey asks how the process felt, and volunteers can sign up to plant the first corridor in spring.'
    ],
    ways: 3
  }
};

export const NO_OVERVIEW: Overview = {weeks: [], since: '', spotlight: [], intro: 'This project has no description yet.', more: [], ways: 1};

// ── Phase screen · Manage (an Ideation phase one week after publishing) ─────────────────────────────────
// Invented ideas on invented streets. Each idea template appears on four different streets, so the list reads
// like a real phase (124 ideas) without repeating a sentence.

export const IDEA_STATUSES = ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'] as const;
export type IdeaStatus = typeof IDEA_STATUSES[number];
export const IDEA_TAGS = ['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing', 'Culture'] as const;
export const IDEA_ASSIGNEES = ['Unassigned', 'Manager A', 'Manager B', 'Manager C'] as const;
export const IDEA_SOURCES = ['Online', 'Imported'] as const;
export const IDEA_REPLIES = ['Awaiting reply', 'Replied'] as const;

export type Idea = {
  id: string; text: string; status: IdeaStatus; assignee: typeof IDEA_ASSIGNEES[number]; tags: string[];
  source: typeof IDEA_SOURCES[number]; replied: boolean; likes: number; comments: number;
  /** Posted in the last day; comments nobody on the team has read yet; why it was flagged. */
  isNew: boolean; newComments: number; warning?: string;
};

const PLACES = ['Wrenfield Avenue', 'Quillmoor Road', 'Tamsel Park', 'Brindle Street', 'Hollowbrook Square', 'Orchard Reach'];
const TEMPLATES: [string, string[]][] = [
  ['Build a protected cycle lane on {p} instead of the painted line that stops halfway.', ['Cycling', 'Safety']],
  ['Plant a row of trees along {p} so the pavement has shade in summer.', ['Environment', 'Public space']],
  ['Organise open-air cinema nights on {p} in summer, a good way for neighbours to meet.', ['Culture', 'Public space']],
  ['Install a shared cargo bike station near {p} for families and small shops.', ['Cycling', 'Transport']],
  ['Add a raised pedestrian crossing on {p}: cars come round the corner far too fast.', ['Safety', 'Transport']],
  ['Turn the car park behind {p} into a small green square with benches.', ['Public space', 'Environment']],
  ['Add charging points for e-bikes and e-scooters on {p}.', ['Cycling', 'Transport']],
  ['Set up a repair café near {p} where people can fix bikes, clothes and small appliances.', ['Environment', 'Culture']],
  ['Build rain gardens along {p} so the street stops flooding after every heavy storm.', ['Environment']],
  ['Give {p} a car-free Sunday once a month so children can play in the street.', ['Public space', 'Safety']],
  ['Widen the pavement on {p}: with prams, wheelchairs and terraces there is not enough room.', ['Public space', 'Safety']],
  ['Open a small book-swap box on {p}.', ['Culture']],
  ['Put secure bike parking at the entrance of {p} so bikes stop disappearing.', ['Cycling', 'Safety']],
  ['Convert the empty offices on {p} into affordable homes for young families.', ['Housing']],
  ['Light the footpath through {p} at night; many people avoid it after dark.', ['Safety', 'Public space']],
  ['Run a weekend bus between {p} and the station.', ['Transport']],
  ['Add a water fountain on {p} for walkers and runners.', ['Public space', 'Environment']],
  ['Paint a mural with local artists on the blank wall of {p}.', ['Culture', 'Public space']],
  ['Make {p} a 20 km/h zone near the school.', ['Safety', 'Transport']],
  ['Start a community garden on the empty plot at {p}.', ['Environment', 'Housing']],
  ['Connect the cycle path on {p} to the one along the river.', ['Cycling', 'Transport']],
  ['Fix the uneven cobblestones on {p}: people trip on them all the time.', ['Safety', 'Public space']],
  ['Hold a yearly neighbourhood festival on {p} with food from the communities living here.', ['Culture']],
  ['Add more benches and shade along {p} for older residents.', ['Public space']],
  ['Replace the hedges on {p} with wildflowers for bees.', ['Environment']],
  ['Build housing for older residents near the shops on {p}.', ['Housing']],
  ['Put a covered bike shelter at the tram stop on {p}.', ['Cycling', 'Transport']],
  ['Create a safe school route along {p} with crossing guards in the morning.', ['Safety', 'Transport']],
  ['Open the school playground on {p} to everyone at weekends.', ['Public space', 'Culture']],
  ['Plant fruit trees on {p} that anyone can pick from.', ['Environment', 'Public space']],
  ['Add a bike repair stand with a pump on {p}.', ['Cycling']]
];
const WARNINGS: Record<number, string> = {0: 'Possible personal data', 37: 'Reported by a resident', 71: 'Possible personal data', 102: 'Strong language'};

export const IDEAS: Idea[] = Array.from({length: 124}, (_, n) => {
  const t = n % TEMPLATES.length;
  const [text, tags] = TEMPLATES[t];
  const status = IDEA_STATUSES[(n * 5 + Math.floor(n / 7)) % IDEA_STATUSES.length];
  return {
    id: `idea-${n + 1}`,
    text: text.replace('{p}', PLACES[(t + Math.floor(n / TEMPLATES.length)) % PLACES.length]),
    status, tags,
    assignee: IDEA_ASSIGNEES[n % 5 < 2 ? 0 : (n % 5) - 1] ?? 'Unassigned',
    source: n % 9 === 4 ? 'Imported' : 'Online',
    replied: !(status === 'Proposed' || (status === 'Viewed' && n % 2 === 0)),
    likes: (n * 13) % 47, comments: (n * 7) % 19,
    isNew: n < 18, newComments: n % 4 === 1 ? (n % 3) + 1 : 0,
    warning: WARNINGS[n]
  };
});

/** A phase added from the rail's "Add a phase" form: upcoming, with no screen of its own yet. */
export type NewPhase = {id: string; title: string; method: Phase['method']; dates: string};
export const addedTimeline = (added: NewPhase[]): TimelinePhase[] =>
  added.map(p => ({id: p.id, title: p.title, state: 'upcoming', dates: p.dates, method: METHOD_WORD[p.method] ?? p.method}));

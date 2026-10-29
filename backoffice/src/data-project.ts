import type {TimelinePhase} from '../../src/patterns/PhaseTimeline';
import type {ThreadComment} from '../../src/patterns/CommentThread';
import type {PostedUpdate} from '../../src/patterns/OfficialUpdate';
import type {FileListItemData} from '../../src/components/gv/FileList';
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
  /** Who posted it and when, as the side panel shows them; its dislikes beside the likes. */
  author: string; date: string; dislikes: number;
  /** Waiting for approval: only in a phase that screens new ideas (SCREENING_PHASES). */
  screening?: boolean;
  /** The author added a picture (the page draws one of the invented illustrations). */
  hasPicture: boolean;
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
const AUTHORS = ['Resident A', 'Resident B', 'Resident C', 'Resident D', 'Resident E', 'Resident F'];
// Two of the newest ideas wait for approval in a phase that screens.
const SCREENING = new Set([7, 15]);
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
    warning: WARNINGS[n],
    author: AUTHORS[n % AUTHORS.length], date: `${21 - (n % 21)} September 2026`, dislikes: (n * 7) % 9,
    screening: SCREENING.has(n) || undefined,
    hasPicture: n % 3 === 0
  };
});

/** A phase added from the rail's "Add a phase" form: upcoming, with no screen of its own yet. */
export type NewPhase = {id: string; title: string; method: Phase['method']; dates: string};
export const addedTimeline = (added: NewPhase[]): TimelinePhase[] =>
  added.map(p => ({id: p.id, title: p.title, state: 'upcoming', dates: p.dates, method: METHOD_WORD[p.method] ?? p.method}));

// ── Phase screen · Manage side panel ─────────────────────────────────────────────────────────────────
/** Phases that screen new ideas ("projectId/phaseId"): a waiting idea opens on Approve / Reject. */
export const SCREENING_PHASES = new Set(['green-corridors/p2']);

/** The signed-in team member, as the thread shows them. */
export const TEAM = {author: 'Manager A', initials: 'A'};

const REMARKS = [
  'Could this also work for the other end of the street?',
  'I agree, this would make a real difference for families here.',
  'Not sure about this. The street is already crowded at weekends.',
  'This is the most useful one on the list.'
];

const daysAgo = (d: number) => (d === 1 ? 'Yesterday' : `${d} days ago`);

/** An idea's public comments (as many as its comment count, up to four shown here) and the team's notes. */
export function ideaComments(idea: Idea): ThreadComment[] {
  const n = Math.min(idea.comments, 4);
  return Array.from({length: n}, (_, k) => ({
    id: `${idea.id}-c${k + 1}`, author: AUTHORS[(k + 2) % AUTHORS.length], initials: AUTHORS[(k + 2) % AUTHORS.length].slice(-1),
    time: daysAgo(n - k), text: REMARKS[k % REMARKS.length], isNew: k >= n - idea.newComments,
    replies: k === 0 && idea.replied ? [{id: `${idea.id}-c1r1`, ...TEAM, time: daysAgo(Math.max(1, n - 1)),
      text: 'Good question: the team is looking into it.'}] : undefined
  }));
}
export const ideaInternal = (idea: Idea): ThreadComment[] => (idea.assignee === 'Unassigned' ? [] : [
  {id: `${idea.id}-i1`, author: 'Manager B', initials: 'B', time: 'Yesterday', text: 'Worth a site visit before we answer?'}
]);
/** The update the team posted on a replied idea. */
export const ideaUpdates = (idea: Idea): PostedUpdate[] => (idea.replied ? [{
  id: `${idea.id}-u1`, date: '22 September 2026',
  text: 'Thank you for this idea. The project team is looking into it and will post an update here.'
}] : []);

// ── Phase screen · Build: the phase's attachments ────────────────────────────────────────────────────
export const PHASE_FILES: FileListItemData[] = [
  {id: 'f1', name: 'consultation-summary.pdf', meta: 'PDF · 340 KB'},
  {id: 'f2', name: 'corridor-map.jpg', meta: 'JPG · 1.2 MB'}
];

// ── Project setup: Set area and Set topic tags (invented areas and topics) ───────────────────────────
export const AREAS = ['Wrenfield', 'Quillmoor', 'Tamsel Park', 'Brindle', 'Hollowbrook', 'Orchard Reach'];
export const TOPICS = ['Mobility', 'Public transit', 'Cycling and bike lanes', 'Roads and traffic', 'Parking', 'Climate', 'Energy',
  'Air quality', 'Green spaces', 'Water and rivers', 'Waste and recycling', 'Biodiversity'];

// ── Phase screen · Build: what residents see of the phase, on the phone ─────────────────────────────
/** The phase's call to action and a line about it, by method, as the phone shows them. */
export const PHONE_CALL: Partial<Record<Phase['method'], {button: string; line: string}>> = {
  Information: {button: 'Read the background', line: 'Why the corridors, where they could go, and what happens next.'},
  Ideation: {button: 'Submit your idea', line: 'Share where a green corridor should go and what it should feel like.'},
  Proposals: {button: 'Start a proposal', line: 'Turn an idea into a proposal: 300 supporters bring an official response.'},
  Voting: {button: 'Vote', line: 'Pick the proposals you want first. You have three votes.'},
  Survey: {button: 'Take the survey', line: 'Ten short questions on how the process felt.'},
  'Common ground': {button: 'React to statements', line: 'Agree, disagree or pass: see where the neighbourhood stands.'},
  Volunteering: {button: 'Volunteer', line: 'Sign up to plant the first corridor in spring.'}
};

// ── Phase screen · Insights (one week in) ────────────────────────────────────────────────────────────
export const INSIGHT_WEEKS = ['16 Aug', '23 Aug', '30 Aug', '06 Sep', '13 Sep', '20 Sep'];
/** An ideation (or proposals) phase: participants and visitors per week. */
export const PARTICIPATION_WEEKS = {participants: [4, 9, 21, 46, 30, 14], visitors: [18, 41, 77, 128, 96, 52]};
export const AI_SUMMARY = 'Most ideas ask for shade and safer crossings along the main streets, with frequent calls for protected cycle ' +
  'lanes that connect to the river path. Several residents worry about flooding after heavy storms and suggest rain gardens.';

/** A voting phase's options, ranked by votes (1,240 in all). */
export const VOTE_OPTIONS = [
  {title: 'Rain gardens along Brindle Street', votes: 362, newVotes: 14, offline: 22, comments: 18, newComments: 3},
  {title: 'Protected cycle lane on Wrenfield Avenue', votes: 287, newVotes: 9, offline: 12, comments: 24, newComments: 1},
  {title: 'Trees and benches on Quillmoor Road', votes: 214, newVotes: 6, offline: 0, comments: 9, newComments: 0},
  {title: 'A green square behind Tamsel Park', votes: 168, newVotes: 4, offline: 8, comments: 11, newComments: 2},
  {title: 'Night lighting through Hollowbrook Square', votes: 121, newVotes: 0, offline: 0, comments: 6, newComments: 0},
  {title: 'Wildflower verges on Orchard Reach', votes: 88, newVotes: 2, offline: 4, comments: 3, newComments: 0}
];
/** Votes cast, cumulative, day by day since the vote opened. */
export const VOTES_BY_DAY = [64, 151, 263, 372, 455, 540, 618, 702, 781, 853, 934, 1008, 1081, 1166, 1240];
export const VOTER_AGES = [
  {label: '18–24', percent: 12, color: 'blue-1'}, {label: '25–34', percent: 27, color: 'blue-2'},
  {label: '35–44', percent: 26, color: 'blue-3'}, {label: '45–54', percent: 19, color: 'blue-4'}, {label: '55+', percent: 16, color: 'blue-5'}
] as const;
export const VOTER_COMMUTES = [
  {label: 'Bicycle', percent: 38, color: 'green'}, {label: 'Public transport', percent: 29, color: 'blue-2'},
  {label: 'Walking', percent: 21, color: 'olive'}, {label: 'Car', percent: 12, color: 'terracotta'}
] as const;

/** A proposals phase's proposals (Manage), against the 300-vote threshold. */
export const PROPOSALS = [
  {title: 'Car-free Sundays on Brindle Street', votes: 412, status: 'Official response', comments: 31},
  {title: 'Rain gardens instead of kerbside parking', votes: 338, status: 'Threshold reached', comments: 22},
  {title: 'A cycle link from Wrenfield to the river', votes: 241, status: 'Gathering support', comments: 17},
  {title: 'Shade sails over the Tamsel Park playground', votes: 156, status: 'Gathering support', comments: 9},
  {title: 'A tool library at the Quillmoor community centre', votes: 74, status: 'Gathering support', comments: 4}
];

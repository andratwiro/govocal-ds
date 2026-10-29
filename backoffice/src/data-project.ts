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
  drafts: number;
  /** The resident's project page: intro, then more after the participation box. */
  intro: string;
  more: string[];
  ways: number;
};

export const OVERVIEWS: Record<string, Overview> = {
  'green-corridors': {
    weeks: [6, 11, 19, 27, 34, 48, 63, 77, 96, 118, 139, 160, 181, 197, 215],
    since: '6 May',
    spotlight: [{id: 's1', title: 'Resident satisfaction', state: 'in-progress', dates: '9 Oct to 18 Nov', method: 'Survey', count: '214 responses'}],
    drafts: 6,
    intro: 'More trees, safer paths and quieter streets. Help us decide where the next green corridor goes and what it should feel like.',
    more: [
      'The ideas you shared in September became 48 proposals. Vote for the ones you want to see first: the most popular go to the council in December.',
      'After the vote, a short survey asks how the process felt, and volunteers can sign up to plant the first corridor in spring.'
    ],
    ways: 3
  }
};

export const NO_OVERVIEW: Overview = {weeks: [], since: '', spotlight: [], drafts: 0, intro: 'This project has no description yet.', more: [], ways: 1};

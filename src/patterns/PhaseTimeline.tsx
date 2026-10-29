import {RailPhase} from '../components/gv/RailPhase';
import './PhaseTimeline.css';

export type TimelineState = 'done' | 'in-progress' | 'upcoming';

export interface TimelinePhase {
  id: string;
  /** The phase name, e.g. "Collect ideas". */
  title: string;
  state: TimelineState;
  /** "19 Oct to 16 Nov". */
  dates: string;
  /** The method's name as residents read it ("Voting", "Sharing"). */
  method: string;
  /** What the phase has gathered, shown as a pill after the name ("312 ideas"). */
  count?: string;
  /** How many of those nobody has looked at yet: a red "• 18 new" at the end of the row. */
  fresh?: number;
  href?: string;
  /** The phase being viewed. */
  current?: boolean;
}

export interface PhaseTimelineProps {
  phases: TimelinePhase[];
}

const WORD: Record<TimelineState, string> = {done: 'Done', 'in-progress': 'In progress', upcoming: 'Upcoming'};
const DOT = {done: 'completed', 'in-progress': 'live', upcoming: 'upcoming'} as const;

/**
 * The Participation rail's timeline (prototype `#proj-rail .pj-stepper`): Rail phase rows in a list. Rail phase
 * draws the guide line through the dots, the count chip, "N new" and the coloured state word. Not in Figma yet.
 */
export function PhaseTimeline({phases}: PhaseTimelineProps) {
  return (
    <ul className="gv-phase-timeline">
      {phases.map(p => (
        <li key={p.id}>
          <RailPhase status={DOT[p.state]} current={p.current} href={p.href} title={p.title}
            chip={p.count} newCount={p.fresh} state={WORD[p.state]} meta={`${p.dates} · ${p.method}`} />
        </li>
      ))}
    </ul>
  );
}

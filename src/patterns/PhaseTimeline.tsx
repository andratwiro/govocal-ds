import type {ReactNode} from 'react';
import {Pill} from '../components/gv/Pill';
import {NewDot} from '../components/gv/NewDot';
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
  /**
   * Join the phases' dots with a vertical line, as the project's timeline does. Off for lists that aren't a
   * sequence (Spotlight).
   *
   * @default true
   */
  connected?: boolean;
}

const WORD: Record<TimelineState, string> = {done: 'Done', 'in-progress': 'In progress', upcoming: 'Upcoming'};
const DOT = {done: 'completed', 'in-progress': 'live', upcoming: 'upcoming'} as const;

/**
 * The Participation rail's timeline (prototype `#proj-rail .pj-stepper`): Rail phase rows joined by a connector,
 * each with what it gathered, what is new, and its state, dates and method on the meta line. Not in Figma yet.
 */
export function PhaseTimeline({phases, connected = true}: PhaseTimelineProps) {
  return (
    <ul className="gv-phase-timeline" data-connected={connected || undefined}>
      {phases.map(p => (
        <li key={p.id} className="gv-phase-timeline__item" data-state={p.state}>
          <RailPhase status={DOT[p.state]} current={p.current} href={p.href}
            title={<Title {...p} />}
            meta={<><span className="gv-phase-timeline__state" data-state={p.state}>{WORD[p.state]}</span> · {p.dates} · {p.method}</>} />
        </li>
      ))}
    </ul>
  );
}

function Title({title, count, fresh}: TimelinePhase): ReactNode {
  return (
    <span className="gv-phase-timeline__title">
      <span className="gv-phase-timeline__name">{title}</span>
      {count && <Pill>{count}</Pill>}
      {!!fresh && (
        <span className="gv-phase-timeline__fresh">
          <span aria-hidden><NewDot /></span>{fresh} new
        </span>
      )}
    </span>
  );
}

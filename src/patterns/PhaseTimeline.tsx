import {RailPhase, railPhaseLabels, type RailPhaseLabels} from './RailPhase';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './PhaseTimeline.css';

/** The words Phase timeline says itself (docs/API.md rule 11): each status's word, with Rail phase's, which it hands
 * on. */
export interface PhaseTimelineLabels extends RailPhaseLabels {
  /** The status word of a phase that is over. */
  done: string;
  /** The status word of the phase running now. */
  inProgress: string;
  /** The status word of a phase that has not started. */
  upcoming: string;
}

/** Phase timeline's English words; a page passes its own over them with `labels`. */
export const phaseTimelineLabels: PhaseTimelineLabels = {
  ...railPhaseLabels,
  done: 'Done',
  inProgress: 'In progress',
  upcoming: 'Upcoming'
};

export type TimelineStatus = 'done' | 'in-progress' | 'upcoming';

export interface TimelinePhase {
  /** Tells this phase from the others in the list. */
  id: string;
  /** The phase name, e.g. "Collect ideas". */
  title: string;
  /** Where the phase is: it sets the dot's colour and the status word. */
  status: TimelineStatus;
  /** "19 Oct to 16 Nov". */
  dates: string;
  /** The method's name as residents read it ("Voting", "Sharing"). */
  method: string;
  /** What the phase has gathered, shown as a pill after the name ("312 ideas"). */
  count?: string;
  /** How many of those nobody has looked at yet: a red "• 18 new" at the end of the row. */
  fresh?: number;
  /** Where the row leads (a link). A plain row when omitted. */
  href?: string;
  /** The phase being viewed. */
  isCurrent?: boolean;
}

export interface PhaseTimelineProps extends PlacementProps {
  /** The phases, in order. */
  phases: TimelinePhase[];
  /** Its own words (each status's, "N new"), over `phaseTimelineLabels`. */
  labels?: Partial<PhaseTimelineLabels>;
}

const WORD = {done: 'done', 'in-progress': 'inProgress', upcoming: 'upcoming'} as const;
const DOT = {done: 'completed', 'in-progress': 'live', upcoming: 'upcoming'} as const;

/**
 * The Participation rail's timeline (prototype `#proj-rail .pj-stepper`): Rail phase rows in a list. Rail phase
 * draws the guide line through the dots, the count chip, "N new" and the coloured status word. Not in Figma yet.
 */
export function PhaseTimeline({phases, labels, className, style}: PhaseTimelineProps) {
  const l = mergeLabels(phaseTimelineLabels, labels);
  return (
    <ul className={clsx('gv-phase-timeline', className)} style={style}>
      {phases.map(p => (
        <li key={p.id}>
          <RailPhase status={DOT[p.status]} isCurrent={p.isCurrent} href={p.href} title={p.title}
            chip={p.count} newCount={p.fresh} statusLabel={l[WORD[p.status]]} meta={`${p.dates} · ${p.method}`} labels={l} />
        </li>
      ))}
    </ul>
  );
}

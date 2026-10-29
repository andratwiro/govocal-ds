'use client';
import type {ReactNode} from 'react';
import {Check, Square} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {VisuallyHidden} from './VisuallyHidden';
import './ChatProgress.css';

/** The words Chat progress says itself (docs/API.md rule 11). */
export interface ChatProgressLabels {
  /** The one row while the assistant works with no steps to show. */
  thinking: string;
  /** Read before a finished step, with its punctuation ("Done: Counting participants"); the row shows a tick. */
  done: string;
  /** The one row of a run stopped before it showed any steps. */
  stopped: string;
  /** Read before the step that was running when the work stopped, with its punctuation; the row shows a stop mark. */
  stoppedAt: string;
  /** The list's name. */
  steps: string;
}

/** Chat progress's English words; a page passes its own over them with `labels`. */
export const chatProgressLabels: ChatProgressLabels = {
  thinking: 'Thinking…',
  done: 'Done:',
  stopped: 'Stopped',
  stoppedAt: 'Stopped:',
  steps: 'Steps'
};

/** One step of a working trace. */
export interface ChatProgressStep {
  /** Tells the step apart from the others in the trace. */
  id: string;
  /** What it does, as it does it: "Counting identifiable participants". */
  label: ReactNode;
  /** `running` shows the spinner, `done` the tick. Steps not started yet aren't listed. @default 'running' */
  status?: 'running' | 'done';
}

export interface ChatProgressProps extends PlacementProps {
  /**
   * The trace, oldest first. Add a step when it starts (running) and mark it done when it ends: rows go from the
   * spinner to the tick one by one and stay. No steps: one "Thinking…" row.
   */
  steps?: ChatProgressStep[];
  /**
   * The whole run: `running` while it works, `done` once every step has ticked (the trace stays above the answer),
   * `stopped` when it was stopped (the running step gets a stop mark).
   *
   * @default 'running'
   */
  status?: 'running' | 'done' | 'stopped';
  /** Its own words, over `chatProgressLabels`. */
  labels?: Partial<ChatProgressLabels>;
}

/**
 * Chat progress: what the assistant is doing while you wait. With no steps, one row: a 12 teal spinner and
 * "Thinking…". With steps (a generate run), a trace whose rows go from the spinner to a tick one by one and stay
 * above the answer. Small secondary text, rows 6 apart. Put it in a `ChatThread` as the last item while the turn
 * runs; the thread's log announces each new step. Under reduced motion the spinner holds still. Not in Figma.
 *
 * ```tsx
 * <ChatProgress steps={[
 *   {id: 'read', label: 'Reading the 6 projects across 3 spaces', status: 'done'},
 *   {id: 'count', label: 'Counting identifiable participants'}
 * ]} />
 * ```
 */
export function ChatProgress({steps, status = 'running', labels, className, style}: ChatProgressProps) {
  const l = mergeLabels(chatProgressLabels, labels);
  const rows: ChatProgressStep[] = steps?.length ? steps
    : [{id: 'thinking', label: status === 'stopped' ? l.stopped : l.thinking, status: status === 'done' ? 'done' : 'running'}];
  return (
    <ul
      className={clsx('gv-chat-progress', className)}
      style={style}
      data-status={status}
      aria-label={l.steps}
      aria-busy={status === 'running' || undefined}>
      {rows.map(step => {
        const stepStatus = step.status ?? 'running';
        // A running step of a stopped run halted there; a done run has nothing running.
        const shown = stepStatus === 'done' || status === 'done' ? 'done' : status === 'stopped' ? 'stopped' : 'running';
        const isThinkingRow = !steps?.length;
        return (
          <li key={step.id} className="gv-chat-progress__row" data-status={shown}>
            <span className="gv-chat-progress__mark" aria-hidden>
              {shown === 'done' ? <Check /> : shown === 'stopped' ? <Square /> : <span className="gv-chat-progress__spinner" />}
            </span>
            {shown === 'done' && <VisuallyHidden>{l.done} </VisuallyHidden>}
            {shown === 'stopped' && !isThinkingRow && <VisuallyHidden>{l.stoppedAt} </VisuallyHidden>}
            <span className="gv-chat-progress__label">{step.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

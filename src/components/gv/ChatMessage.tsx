'use client';
import {useRef, useState, type ReactNode} from 'react';
import {CircleAlert, RotateCcw, Target, Undo2} from 'lucide-react';
import clsx from 'clsx';
import {Button} from '../Button';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {IconButton} from './IconButton';
import {VisuallyHidden} from './VisuallyHidden';
import './ChatMessage.css';

/** The words Chat message says itself (docs/API.md rule 11). */
export interface ChatMessageLabels {
  /** Who spoke, read before each message with its punctuation (the bubble and the plain text say it only to the
   * eye). */
  you: string;
  /** The hidden name before the assistant's words, read by a screen reader. */
  assistant: string;
  /** The change's two icon buttons, named and shown as their tooltips. */
  undo: string;
  /** The button that shows what the change did. */
  showChange: string;
  /** A failed turn's words when the message has none, and its button. */
  error: string;
  /** The button that sends a failed turn again. */
  retry: string;
  /** A stopped turn's words when the message has none. A page names what was left alone: "Stopped. The report
   * was not changed." */
  stopped: string;
  /** Read while the reply is still being written. */
  writing: string;
}

/** Chat message's English words; a page passes its own over them with `labels`. */
export const chatMessageLabels: ChatMessageLabels = {
  you: 'You:',
  assistant: 'Assistant:',
  undo: 'Undo this change',
  showChange: 'Show what changed',
  error: 'Something went wrong, and nothing was changed.',
  retry: 'Retry',
  stopped: 'Stopped. Nothing was changed.',
  writing: 'Writing…'
};

/**
 * Where a turn stands: `done` (the default), `streaming` (still being written: a caret after the words),
 * `undone` (its change was reversed: Undo turns off), `error` (it failed: Retry), `stopped` (it was stopped before
 * it changed anything).
 */
export type ChatMessageStatus = 'done' | 'streaming' | 'undone' | 'error' | 'stopped';

export interface ChatMessageProps extends PlacementProps {
  /** Who speaks. `you`: a grey bubble at the end edge that keeps line breaks. `assistant`: plain text, no bubble. */
  from: 'you' | 'assistant';
  /**
   * The words. Yours: plain text (line breaks kept). The assistant's: text or inline markup (`<strong>`, a few
   * `<p>`s, Item chips that reveal what they name). A `stopped` or `error` turn with no words says the label's.
   */
  children?: ReactNode;
  /** What the message is about: a quiet Item chip naming the block it asked about, drawn above your bubble. */
  context?: ReactNode;
  /**
   * The change it made, in a muted line under the words: "1 section changed. The version before is kept." Written
   * by the page, which knows what it changed and what it calls it. No line, no change.
   */
  change?: ReactNode;
  /** Where the turn stands. @default 'done' */
  status?: ChatMessageStatus;
  /** Shows "Undo this change", which calls this. Off once the turn is `undone`. */
  onUndo?: () => void;
  /** Shows "Show what changed", which calls this (the page scrolls to the change and flashes it). */
  onShowChange?: () => void;
  /** Shows Retry on an `error` turn, which calls this. */
  onRetry?: () => void;
  /** Buttons the reply asks you to choose between: a `ChatChoices`. */
  choices?: ReactNode;
  /** Its own words, over `chatMessageLabels`. */
  labels?: Partial<ChatMessageLabels>;
}

/**
 * Chat message: one turn of a conversation with the assistant. Yours is a grey bubble at the end edge, 84% wide at
 * most, keeping your line breaks, with the block you asked about named above it (`context`). The assistant's is
 * plain text with no bubble, then what it changed (`change`, a muted line) and two icon buttons: Undo this change
 * and Show what changed. A reply may ask you to choose (`choices`).
 *
 * States (`status`): streaming (a caret after the words, `aria-busy`), undone (Undo off), error (a danger mark and
 * Retry), stopped. Put messages in a `ChatThread`, oldest first; the thread's log announces each new one. A
 * screen reader hears who spoke first ("You", "Assistant"). Undo stays next to its change for the whole thread:
 * never a Toast, which is global and short-lived. Not in Figma.
 *
 * ```tsx
 * <ChatMessage from="you" context={<ItemChip variant="quiet" icon={<FileText aria-hidden />} label="Title page" />}>
 *   Write a subtitle that names the decision
 * </ChatMessage>
 * <ChatMessage from="assistant" change="Title page changed. The version before is kept."
 *   onUndo={undo} onShowChange={show}>I rewrote the subtitle so it says what the report is for.</ChatMessage>
 * ```
 */
export function ChatMessage({
  from, children, context, change, status = 'done', onUndo, onShowChange, onRetry, choices, labels, className, style
}: ChatMessageProps) {
  const l = mergeLabels(chatMessageLabels, labels);
  const isYou = from === 'you';
  const words = children ?? (status === 'stopped' ? l.stopped : status === 'error' ? l.error : null);
  const hasActions = !isYou && (onUndo || onShowChange || (status === 'error' && onRetry));
  return (
    <div
      className={clsx('gv-chat-message', className)}
      style={style}
      data-from={from}
      data-status={status}
      aria-busy={status === 'streaming' || undefined}>
      {isYou && context && <div className="gv-chat-message__context">{context}</div>}
      <div className="gv-chat-message__body">
        <VisuallyHidden>{isYou ? l.you : l.assistant} </VisuallyHidden>
        {status === 'error' && <CircleAlert aria-hidden className="gv-chat-message__alert" />}
        <div className="gv-chat-message__words">
          {words}
          {status === 'streaming' && (
            <>
              <span className="gv-chat-message__caret" aria-hidden />
              <VisuallyHidden>{l.writing}</VisuallyHidden>
            </>
          )}
        </div>
      </div>
      {!isYou && change && <p className="gv-chat-message__change">{change}</p>}
      {choices && <div className="gv-chat-message__choices">{choices}</div>}
      {hasActions && (
        <div className="gv-chat-message__actions">
          {status === 'error' && onRetry && (
            <Button variant="secondary" size={32} onPress={onRetry}><RotateCcw aria-hidden size={16} />{l.retry}</Button>
          )}
          {onUndo && (
            <TooltipTrigger>
              <IconButton aria-label={l.undo} onPress={onUndo} isDisabled={status === 'undone'}>
                <Undo2 aria-hidden />
              </IconButton>
              <Tooltip placement="bottom">{l.undo}</Tooltip>
            </TooltipTrigger>
          )}
          {onShowChange && (
            <TooltipTrigger>
              <IconButton aria-label={l.showChange} onPress={onShowChange}>
                <Target aria-hidden />
              </IconButton>
              <Tooltip placement="bottom">{l.showChange}</Tooltip>
            </TooltipTrigger>
          )}
        </div>
      )}
    </div>
  );
}

/** One button of a `ChatChoices`. */
export interface ChatChoice {
  /** Tells the choice apart; handed back when it is pressed. */
  id: string;
  /** The button's words. */
  label: string;
  /** A 16px Lucide icon before the label, `aria-hidden` (✦ on the choice the assistant would act on). */
  icon?: ReactNode;
  /** The lead choice is primary; the others secondary. @default 'secondary' */
  variant?: 'primary' | 'secondary';
}

export interface ChatChoicesProps extends PlacementProps {
  /** The buttons, in order: "Rebuild it" (primary), "Keep it". */
  items: ChatChoice[];
  /** The choice made (controlled). Once there is one, every button turns off. */
  value?: string | null;
  /** The choice already made, when the page doesn't control it (a thread read back from history). */
  defaultValue?: string | null;
  /** Called once, with the button picked. */
  onChange?: (id: string) => void;
  /** Names the group for assistive tech, e.g. what is being decided. @default the buttons' labels */
  'aria-label'?: string;
}

/**
 * Chat choices: the buttons a reply asks you to choose between ("Rebuild it" / "Keep it"), small, 8 apart, under the
 * reply's words. One pick: every button then turns off and stays on the page, the picked one marked, so the thread
 * keeps the record. Focus stays on the group (the pressed button goes off), so the keyboard never drops to the
 * page. Pass it as a Chat message's `choices`.
 */
export function ChatChoices({items, value, defaultValue = null, onChange, 'aria-label': ariaLabel, className, style}: ChatChoicesProps) {
  const [own, setOwn] = useState<string | null>(defaultValue);
  const picked = value !== undefined ? value : own;
  const ref = useRef<HTMLDivElement>(null);
  const pick = (id: string) => {
    if (picked != null) return;
    setOwn(id);
    onChange?.(id);
    // The button that had focus is about to turn off; keep focus here rather than letting it fall to the body.
    requestAnimationFrame(() => {
      const group = ref.current;
      if (group && (!document.activeElement || document.activeElement === document.body || group.contains(document.activeElement)))
        group.focus({preventScroll: true});
    });
  };
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel ?? items.map(i => i.label).join(', ')}
      tabIndex={picked != null ? -1 : undefined}
      className={clsx('gv-chat-choices', className)}
      style={style}>
      {items.map(item => (
        <Button key={item.id} variant={item.variant ?? 'secondary'} size={32} isDisabled={picked != null}
          aria-pressed={picked != null ? picked === item.id : undefined} onPress={() => pick(item.id)}>
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  );
}

'use client';
import {useCallback, useLayoutEffect, useRef, useState, type ReactNode} from 'react';
import {ArrowDown} from 'lucide-react';
import clsx from 'clsx';
import {Button} from '../Button';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './ChatThread.css';

/** The words Chat thread says itself (docs/API.md rule 11). */
export interface ChatThreadLabels {
  /** The log's name. */
  log: string;
  /** The button that shows while you are scrolled up from the newest message. */
  jumpToLatest: string;
}

/** Chat thread's English words; a page passes its own over them with `labels`. */
export const chatThreadLabels: ChatThreadLabels = {
  log: 'Conversation',
  jumpToLatest: 'Jump to latest'
};

export interface ChatThreadProps extends PlacementProps {
  /** The turns, oldest first: `ChatMessage`s, and a `ChatProgress` last while the assistant works. None: empty. */
  children?: ReactNode;
  /** What to ask, at the foot of the log above the composer: a `PromptSuggestions`. The page leaves it out while
   * the assistant works. */
  openings?: ReactNode;
  /** The composer, docked under the log: a `PromptComposer`. */
  composer?: ReactNode;
  /** The assistant can't be used (switched off): the log steps back to 45% and takes no presses. The openings
   * (a preview) and the composer say why. */
  isDisabled?: boolean;
  /** Its own words, over `chatThreadLabels`. */
  labels?: Partial<ChatThreadLabels>;
}

/** How near the bottom (px) still counts as "at the latest": a rounding error or a line's descent. */
const NEAR = 24;

/**
 * Chat thread: the conversation with the assistant, a log anchored at the bottom. The turns stack 12 apart; the
 * openings sit at the foot above the composer, pushed down when the thread is short; the composer docks under it.
 * While you read the latest turn, a new one (or a streaming one growing) keeps it in view; scrolled up, it stays
 * put and a "Jump to latest" button appears. A screen reader hears each new turn (`role="log"`). Fills its
 * container's height: give it one (an inline Side panel with no head, a grid row). Not in Figma.
 *
 * ```tsx
 * <ChatThread composer={<PromptComposer onSend={ask} />}
 *   openings={!working && <PromptSuggestions heading="What should it change?" items={prompts} onAction={pick} />}>
 *   {turns.map(t => <ChatMessage key={t.id} from={t.from}>{t.text}</ChatMessage>)}
 * </ChatThread>
 * ```
 */
export function ChatThread({children, openings, composer, isDisabled, labels, className, style}: ChatThreadProps) {
  const l = mergeLabels(chatThreadLabels, labels);
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const atLatest = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const focusInOpenings = useRef(false);
  const hasOpenings = Boolean(openings);

  // A pressed opening usually hides the openings (the assistant starts working): focus goes to the composer's field
  // rather than dropping to the page.
  useLayoutEffect(() => {
    if (hasOpenings || !focusInOpenings.current) return;
    focusInOpenings.current = false;
    if (!document.activeElement || document.activeElement === document.body)
      dock.current?.querySelector<HTMLElement>('textarea, input')?.focus();
  }, [hasOpenings]);

  const toLatest = useCallback((smooth = false) => {
    const el = scroller.current;
    if (!el) return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({top: el.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto'});
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    atLatest.current = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR;
    setShowJump(!atLatest.current);
  };

  // Switched off, the log takes no focus or presses (React 18 has no `inert` prop).
  useLayoutEffect(() => {
    log.current?.toggleAttribute('inert', Boolean(isDisabled));
  }, [isDisabled]);

  // A new turn, or one growing as it streams: keep the latest in view, unless you scrolled up to read.
  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    const follow = () => { if (atLatest.current) toLatest(); };
    follow();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(follow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [toLatest]);

  return (
    <div className={clsx('gv-chat-thread', className)} style={style} data-disabled={isDisabled || undefined}>
      <div className="gv-chat-thread__scroll" ref={scroller} onScroll={onScroll}>
        <div className="gv-chat-thread__content" ref={content}>
          <div className="gv-chat-thread__log" ref={log} role="log" aria-label={l.log}>
            {children}
          </div>
          {openings && (
            <div className="gv-chat-thread__openings"
              onFocus={() => { focusInOpenings.current = true; }}
              onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null) && e.relatedTarget) focusInOpenings.current = false; }}>
              {openings}
            </div>
          )}
        </div>
      </div>
      {showJump && (
        <div className="gv-chat-thread__jump">
          <Button variant="secondary" size={32} onPress={() => { atLatest.current = true; setShowJump(false); toLatest(true); }}>
            <ArrowDown aria-hidden size={16} />
            {l.jumpToLatest}
          </Button>
        </div>
      )}
      {composer && <div className="gv-chat-thread__composer" ref={dock}>{composer}</div>}
    </div>
  );
}

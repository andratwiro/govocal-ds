'use client';
import {useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode} from 'react';
import {clsx} from 'clsx';
import {Dialog} from 'react-aria-components/Dialog';
import {Toolbar} from 'react-aria-components/Toolbar';
import {useLocale} from 'react-aria-components';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {IconButton} from './IconButton';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import './SidePanel.css';

export interface SidePanelPosition {
  /** The open record's place in the list, from 1. */
  current: number;
  /** How many records the list holds (after its filters). */
  total: number;
}

export interface SidePanelProps {
  /** The context label at the top left: where the record comes from, e.g. the phase "Collect ideas". It names the
   * panel for assistive tech too, unless `aria-label` is given. */
  label: string;
  /** The panel's accessible name, when the context label isn't enough. */
  'aria-label'?: string;
  /** The record. Lay it out in `SidePanelSection`s; the panel puts a hairline between them. */
  children: ReactNode;
  /** A footer that stays put while the body scrolls. No footer when absent: changes apply at once (no Save). */
  footer?: ReactNode;
  /** The record pager ("‹ 3 of 124 ›"): the open record's place in the list. No pager when absent. */
  position?: SidePanelPosition;
  /** Called with the record to show when ‹ or › is pressed. ‹ is off on the first record, › on the last. */
  onPositionChange?: (current: number) => void;
  /** What a record is called, for the pager's button names ("Previous idea"). @default 'record' */
  itemName?: string;
  /**
   * Whether the panel shows (controlled). A floating panel is a dialog: closed until the page opens it. An inline one
   * is a column of the page: shown unless the page says otherwise. Pair it with `onOpenChange`.
   */
  isOpen?: boolean;
  /**
   * Whether the panel first shows, when the page doesn't control it: × and Esc then close it by themselves.
   *
   * @default isInline (false for a floating panel, true for an inline one)
   */
  defaultOpen?: boolean;
  /** Called with `false` by × and Esc. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Where focus goes when the panel closes. By default, back to what had it when the panel opened (the row that
   * opened it); return another element here, e.g. the row of the record the pager walked to.
   */
  returnFocus?: () => HTMLElement | null | undefined;
  /** Draw the panel in the page's flow (a column beside a list) instead of floating at the window's end edge. */
  isInline?: boolean;
  /**
   * The width preset: `default` is the drawn drawer (560), `narrow` a preview beside a list (440). Floating, the panel
   * is that wide (never wider than the window less 32); inline, it fills its column up to that width.
   *
   * @default 'default'
   */
  width?: 'default' | 'narrow';
  /** The close button's accessible name. @default 'Close' */
  closeLabel?: string;
  /** Places the panel (e.g. a grid area for an inline one); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Side panel: one record of a list beside the list, the prototype's Manage drawer (`#pj-idrawer`). A non-modal
 * dialog: it floats at the window's end edge, the list behind it stays usable (a row click shows that row here),
 * focus moves in when it opens, and Esc or × closes it and puts focus back on the row that opened it. Its head
 * carries the context label, the record pager and ×; its body scrolls; an optional footer stays put. Changes made
 * in it apply at once (with an Undo toast), so it has no Save. Not in Figma.
 *
 * Open or closed: a floating panel is closed until `isOpen` (or `defaultOpen`) says otherwise; an inline one shows.
 * Its width is a preset (`width`), never a class: `className` and `style` place it (a grid area, a margin), never
 * paint or size it.
 *
 * Lay the record out with `SidePanelRecordHead` (its words, author and date), `SidePanelActions` (counts and quick
 * actions) and `SidePanelSection`s.
 */
export function SidePanel({
  label,
  'aria-label': ariaLabel,
  children,
  footer,
  position,
  onPositionChange,
  itemName = 'record',
  isOpen: isOpenProp,
  defaultOpen,
  onOpenChange,
  returnFocus,
  isInline,
  width = 'default',
  closeLabel = 'Close',
  className,
  style
}: SidePanelProps) {
  const [openState, setOpenState] = useState(defaultOpen ?? Boolean(isInline));
  const isOpen = isOpenProp ?? openState;
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const focusInside = useRef(false);
  // The last open render's `returnFocus`: by the closing render the record is often gone (`open` is null).
  const returnRef = useRef(returnFocus);
  if (isOpen) returnRef.current = returnFocus;
  const {direction, locale} = useLocale();

  // Remember what had focus when the panel opened (before the dialog takes it), and give focus back on close
  // when it was inside the panel, or lost with it.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const active = document.activeElement;
    opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    // A pointer opens the panel on press, and the browser then focuses what was pressed (the row): once that
    // settles, that is the opener, and focus moves in.
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current, now = document.activeElement;
      if (!panel || panel.contains(now)) return;
      if (now instanceof HTMLElement && now !== document.body) opener.current = now;
      panel.querySelector<HTMLElement>('[role="dialog"]')?.focus({preventScroll: true});
    });
    return () => {
      cancelAnimationFrame(frame);
      const lost = !document.activeElement || document.activeElement === document.body;
      if (focusInside.current || lost) {
        // After the commit, not in it: React drops the events a focus fires during a commit, so a list getting focus
        // back (a Data table's row) wouldn't hear it, and its arrow keys would stop moving focus.
        queueMicrotask(() => {
          const now = document.activeElement;
          if (now && now !== document.body) return;
          const target = returnRef.current?.() ?? opener.current;
          if (target?.isConnected) target.focus();
        });
      }
      focusInside.current = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const close = () => {
    setOpenState(false);
    onOpenChange?.(false);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || e.defaultPrevented || e.nativeEvent.isComposing) return;
    // Esc in a field holding words keeps them (a half-written update isn't thrown away); the next Esc closes.
    const t = e.target;
    if ((t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) && t.value) {
      t.blur();
      (t.closest('[role="dialog"]') as HTMLElement | null)?.focus();
      return;
    }
    e.preventDefault();
    close();
  };

  // The pager: when a press reaches an end, that button turns off, so focus moves to the other one first.
  const go = (to: number) => {
    if (!position) return;
    const atStart = to <= 1, atEnd = to >= position.total;
    if (atStart) document.getElementById(`${id}-next`)?.focus();
    if (atEnd) document.getElementById(`${id}-prev`)?.focus();
    onPositionChange?.(to);
  };
  const number = new Intl.NumberFormat(locale);
  const [Back, Forward] = direction === 'rtl' ? [ChevronRight, ChevronLeft] : [ChevronLeft, ChevronRight];

  return (
    <div
      ref={panelRef}
      className={clsx('gv-side-panel', className)}
      style={style}
      data-inline={isInline || undefined}
      data-width={width}
      onKeyDown={onKeyDown}
      onFocus={() => { focusInside.current = true; }}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusInside.current = false;
      }}>
      <Dialog
        className="gv-side-panel__dialog"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : `${id}-label`}>
        <div className="gv-side-panel__head">
          <span id={`${id}-label`} className="gv-side-panel__label">{label}</span>
          {position && (
            <Toolbar aria-label="Pager" className="gv-side-panel__pager">
              <IconButton id={`${id}-prev`} aria-label={`Previous ${itemName}`} tone="strong"
                isDisabled={position.current <= 1} onPress={() => go(position.current - 1)}>
                <Back aria-hidden size={16} />
              </IconButton>
              <span className="gv-side-panel__position" aria-live="polite">
                {number.format(position.current)} of {number.format(position.total)}
              </span>
              <IconButton id={`${id}-next`} aria-label={`Next ${itemName}`} tone="strong"
                isDisabled={position.current >= position.total} onPress={() => go(position.current + 1)}>
                <Forward aria-hidden size={16} />
              </IconButton>
            </Toolbar>
          )}
          <IconButton aria-label={closeLabel} tone="strong" onPress={close}>
            <X aria-hidden size={16} />
          </IconButton>
        </div>
        <div className="gv-side-panel__body">{children}</div>
        {footer && <div className="gv-side-panel__footer">{footer}</div>}
      </Dialog>
    </div>
  );
}

export interface SidePanelSectionProps {
  /** A heading for the section, e.g. "Where people stand". */
  title?: string;
  /** The heading level of `title`. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  /** Places the section; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** A block of the panel's body. Sections stack 24 apart with a hairline between them. */
export function SidePanelSection({title, headingLevel = 3, children, className, style}: SidePanelSectionProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={clsx('gv-side-panel__section', className)} style={style}>
      {title && <Heading className="gv-side-panel__section-title">{title}</Heading>}
      {children}
    </div>
  );
}

export interface SidePanelRecordHeadProps {
  /** The record's words: text, or paragraphs (12 apart). Body, in the primary text colour. */
  children: ReactNode;
  /** The record's title, when it has one (an input's; an idea has none). Body strong, a heading above the words. */
  title?: ReactNode;
  /** The heading level of `title`: the panel's first heading. @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Who posted it: "Posted by <author>", the name in the primary text colour. */
  author?: ReactNode;
  /** What the author is, after the name, e.g. "Registered user". */
  authorRole?: ReactNode;
  /** When it was posted, formatted for the reader, e.g. "26 October 2026". 24 after the author. */
  date?: ReactNode;
  /** The words before the author. @default 'Posted by' */
  postedByLabel?: string;
  /** The row under the meta line: a `SidePanelActions` with the record's counts and quick actions. */
  actions?: ReactNode;
  /** Places the head; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The record at the top of the panel (the prototype's drawer head): its title if it has one, its words, then "Posted
 * by <author>" and the date, Small secondary, 16 below the words, then its `actions` row (a `SidePanelActions`: the
 * counts and quick actions). Put it first in the panel's first `SidePanelSection`.
 *
 * ```tsx
 * <SidePanelRecordHead title={input.title} author={input.author} authorRole="Registered user" date={input.published}
 *   actions={<SidePanelActions items={quick}><ReactionCounts likes={4} dislikes={0} /></SidePanelActions>}>
 *   {input.body}
 * </SidePanelRecordHead>
 * ```
 */
export function SidePanelRecordHead({
  children, title, headingLevel = 2, author, authorRole, date, postedByLabel = 'Posted by', actions, className, style
}: SidePanelRecordHeadProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={clsx('gv-side-panel__record', className)} style={style}>
      {title != null && <Heading className="gv-side-panel__record-title">{title}</Heading>}
      <div className="gv-side-panel__record-text">{children}</div>
      {(author != null || date != null) && (
        <p className="gv-side-panel__record-meta">
          {author != null && (
            <span>
              {postedByLabel} <span className="gv-side-panel__record-author">{author}</span>
              {authorRole != null && <> · {authorRole}</>}
            </span>
          )}
          {date != null && <span>{date}</span>}
        </p>
      )}
      {actions}
    </div>
  );
}

export interface SidePanelAction {
  id: string;
  /** The button's name and its tooltip, e.g. "View on the site". */
  label: string;
  /** A 16px Lucide icon, `aria-hidden`. */
  icon: ReactNode;
  onPress?: () => void;
}

export interface SidePanelActionsProps {
  /** The quick actions: square bordered icon buttons, each with its tooltip. */
  items: SidePanelAction[];
  /** What leads the row, e.g. the record's Reaction counts or its vote count. */
  children?: ReactNode;
  /** Places the row; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** The row under the record's words: its counts first, the quick actions (Edit, View on the site, Delete) at the
 * end, in a toolbar: Tab enters it once, the arrows move between the actions. */
export function SidePanelActions({items, children, className, style}: SidePanelActionsProps) {
  return (
    <div className={clsx('gv-side-panel__actions', className)} style={style}>
      <div className="gv-side-panel__actions-lead">{children}</div>
      <Toolbar aria-label="Quick actions" className="gv-side-panel__quick">
        {items.map(a => (
          <TooltipTrigger key={a.id}>
            <IconButton variant="bordered" tone="strong" aria-label={a.label} onPress={a.onPress}>{a.icon}</IconButton>
            <Tooltip placement="top">{a.label}</Tooltip>
          </TooltipTrigger>
        ))}
      </Toolbar>
    </div>
  );
}

export interface SidePanelDecisionProps {
  /** What waits for a decision, e.g. "Waiting for approval". */
  title: string;
  /** The decision's buttons, e.g. a secondary Reject and a primary Approve. */
  children: ReactNode;
  /** Places the strip; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** The decision strip at the top of the body (the prototype's screening strip): a title on the warning tint and its
 * buttons at the end, in a toolbar named by the title. It leaves once the decision is made (a toast follows). */
export function SidePanelDecision({title, children, className, style}: SidePanelDecisionProps) {
  const id = useId();
  // A decision usually takes its own buttons away (Approve, Reject). Focus would drop to the page, out of reach of
  // the panel's Esc: hand it to the panel's dialog instead. The cleanup runs before React removes the toolbar.
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => () => {
    const el = ref.current;
    if (el?.contains(document.activeElement))
      el.closest<HTMLElement>('[role="dialog"]')?.focus({preventScroll: true});
  }, []);
  return (
    <Toolbar ref={ref} aria-labelledby={id} className={clsx('gv-side-panel__decision', className)} style={style}>
      <span id={id} className="gv-side-panel__decision-title">{title}</span>
      <span className="gv-side-panel__decision-actions">{children}</span>
    </Toolbar>
  );
}

'use client';
import {useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode} from 'react';
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
  /** Controlled open state. @default true */
  isOpen?: boolean;
  /** Called with `false` by × and Esc. */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Where focus goes when the panel closes. By default, back to what had it when the panel opened (the row that
   * opened it); return another element here, e.g. the row of the record the pager walked to.
   */
  returnFocus?: () => HTMLElement | null | undefined;
  /** Draw the panel in the page's flow (a column beside a list) instead of floating at the window's end edge. */
  isInline?: boolean;
  /** The close button's accessible name. @default 'Close' */
  closeLabel?: string;
}

/**
 * Side panel: one record of a list beside the list, the prototype's Manage drawer (`#pj-idrawer`). A non-modal
 * dialog: it floats at the window's end edge, the list behind it stays usable (a row click shows that row here),
 * focus moves in when it opens, and Esc or × closes it and puts focus back on the row that opened it. Its head
 * carries the context label, the record pager and ×; its body scrolls; an optional footer stays put. Changes made
 * in it apply at once (with an Undo toast), so it has no Save. Not in Figma.
 */
export function SidePanel({
  label,
  'aria-label': ariaLabel,
  children,
  footer,
  position,
  onPositionChange,
  itemName = 'record',
  isOpen = true,
  onOpenChange,
  returnFocus,
  isInline,
  closeLabel = 'Close'
}: SidePanelProps) {
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

  const close = () => onOpenChange?.(false);
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
      className="gv-side-panel"
      data-inline={isInline || undefined}
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
  children: ReactNode;
}

/** A block of the panel's body. Sections stack 24 apart with a hairline between them. */
export function SidePanelSection({title, children}: SidePanelSectionProps) {
  return (
    <div className="gv-side-panel__section">
      {title && <h3 className="gv-side-panel__section-title">{title}</h3>}
      {children}
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
  actions: SidePanelAction[];
  /** What leads the row, e.g. the record's Reaction counts or its vote count. */
  children?: ReactNode;
}

/** The row under the record's words: its counts first, the quick actions (Edit, View on the site, Delete) at the
 * end, in a toolbar: Tab enters it once, the arrows move between the actions. */
export function SidePanelActions({actions, children}: SidePanelActionsProps) {
  return (
    <div className="gv-side-panel__actions">
      <div className="gv-side-panel__actions-lead">{children}</div>
      <Toolbar aria-label="Quick actions" className="gv-side-panel__quick">
        {actions.map(a => (
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
}

/** The decision strip at the top of the body (the prototype's screening strip): a title on the warning tint and its
 * buttons at the end, in a toolbar named by the title. It leaves once the decision is made (a toast follows). */
export function SidePanelDecision({title, children}: SidePanelDecisionProps) {
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
    <Toolbar ref={ref} aria-labelledby={id} className="gv-side-panel__decision">
      <span id={id} className="gv-side-panel__decision-title">{title}</span>
      <span className="gv-side-panel__decision-actions">{children}</span>
    </Toolbar>
  );
}

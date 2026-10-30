'use client';
import {
  OverlayArrow,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipTriggerComponentProps as TooltipTriggerProps
} from 'react-aria-components/Tooltip';
import {useCallback, useState} from 'react';
import './Tooltip.css';
import {keepClass} from './className';

export interface TooltipProps extends Omit<AriaTooltipProps, 'children'> {
  /** The tooltip's words. */
  children: React.ReactNode;
  /**
   * Draw the tail. The prototype's tooltips have none, except on the project's step cards, where the tail shows
   * which card the tooltip is about.
   */
  showArrow?: boolean;
}

/**
 * A wrapped tooltip still hugs its words, as the prototype's GVTooltip does: once the lines are balanced, the box
 * narrows to the longest line (CSS alone keeps it at the 320 maximum).
 */
function hug(el: HTMLElement | null) {
  if (!el) return;
  el.style.width = '';
  const style = getComputedStyle(el);
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  if (el.offsetWidth < parseFloat(style.maxWidth)) return; // one line: already hugging
  let longest = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) longest = Math.max(longest, rect.width);
  }
  if (longest > 0) el.style.width = `${Math.ceil(longest + padding)}px`;
}

/**
 * A short dark label that names a control or adds a hint while the pointer rests on it or it has keyboard focus: an
 * icon button's name, why an action is disabled. Put the control and the Tooltip in a `TooltipTrigger`. One line up
 * to 320 wide, then balanced lines; `showArrow` draws a tail. Never the only place words live: touch can't hover, so
 * help someone must read is a Help popover. Not in Figma yet.
 *
 * ```tsx
 * <TooltipTrigger>
 *   <IconButton aria-label="Export"><Download aria-hidden size={16} /></IconButton>
 *   <Tooltip>Export</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function Tooltip({children, showArrow, className, ...props}: TooltipProps) {
  const ref = useCallback((el: HTMLDivElement | null) => hug(el), []);
  return (
    <AriaTooltip
      {...props}
      ref={ref}
      className={keepClass(className, 'gv-base-tooltip', showArrow && 'react-aria-Tooltip--arrow')}>
      {showArrow && (
        <OverlayArrow className="react-aria-OverlayArrow gv-base-overlay-arrow">
          <svg width={12} height={6} viewBox="0 0 12 6">
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
      )}
      {children}
    </AriaTooltip>
  );
}

/**
 * Whether the person has pressed a key since the page loaded. Until then a focus is the page's own (a route or a
 * dialog focusing its first control), and React Aria, which has seen no input yet, treats it as keyboard focus and
 * would show that control's tooltip on load. A pointer press makes React Aria's focus a pointer one, which opens
 * nothing, so only keys count; a mouse move doesn't (Chromium sends one on load).
 */
let hasKey = false;
function seen() {
  hasKey = true;
  document.removeEventListener('keydown', seen, true);
}
if (typeof document !== 'undefined') document.addEventListener('keydown', seen, {capture: true, passive: true});

/** React Aria opens on focus inside the focus event and on hover from a timer, so the event in flight tells them apart. */
function openedByFocus() {
  const event = typeof window === 'undefined' ? undefined : window.event;
  return !!event && event.type.startsWith('focus');
}

/**
 * The prototype shows a tooltip 120 ms after the pointer arrives and hides it as soon as it leaves. It opens on
 * keyboard focus or hover only: never on a focus the page makes before any input (the side nav's "To platform" on
 * load).
 */
export function TooltipTrigger({delay = 120, closeDelay = 0, isOpen, defaultOpen = false, onOpenChange, ...props}: TooltipTriggerProps) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const change = (next: boolean) => {
    if (next && !hasKey && openedByFocus()) return;
    if (isOpen === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };
  return <AriaTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} isOpen={isOpen ?? ownOpen} onOpenChange={change} />;
}
export type {TooltipTriggerProps};

'use client';
import type {ReactNode} from 'react';
import {Illustration, type IllustrationName} from './Illustration';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './EmptyState.css';

export interface EmptyStateProps extends PlacementProps {
  /** What isn't there yet, in a few words: "No inputs yet", "Ideas will appear here". */
  title: ReactNode;
  /** When it will appear, or what to do about it. One or two sentences. */
  description?: ReactNode;
  /** A drawing from src/illustrations/ above the title. Decorative: the title says it. */
  illustration?: IllustrationName;
  /** A small icon instead of a drawing (an icon at 24 px), for the plainer back-office pages. Decorative. */
  icon?: ReactNode;
  /** The one next step, usually a Button. */
  action?: ReactNode;
  /**
   * `page`: a tab or page body (drawing 160 wide, Body strong title, text up to 360 wide).
   * `panel`: a side panel or a card (drawing 96 wide, UI strong title, text up to 240 wide).
   *
   * @default 'page'
   */
  size?: 'page' | 'panel';
  /** A dashed frame, where the empty thing is a list someone fills (the front office's input list). */
  isFramed?: boolean;
  /**
   * The title's heading level in the page's outline; `none` makes it a plain paragraph (a card that already has a
   * heading).
   *
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | 'none';
}

const ART_WIDTH = {page: 160, panel: 96} as const;

/**
 * What a place shows before it has anything: a drawing or an icon, a title, a line on when it fills up, and at most
 * one action. Not in Figma: drawn from the prototype's empty tabs, panels and lists.
 */
export function EmptyState({
  title,
  description,
  illustration,
  icon,
  action,
  size = 'page',
  isFramed,
  headingLevel = 3,
  className,
  style
}: EmptyStateProps) {
  const Title = headingLevel === 'none' ? 'p' : (`h${headingLevel}` as const);
  return (
    <div
      className={clsx('gv-empty-state', className)}
      style={style}
      data-size={size}
      data-framed={isFramed || undefined}>
      {illustration ? (
        <Illustration className="gv-empty-state__art" name={illustration} size={ART_WIDTH[size]} />
      ) : icon ? (
        <span className="gv-empty-state__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <Title className="gv-empty-state__title">{title}</Title>
      {description && <p className="gv-empty-state__text">{description}</p>}
      {action && <div className="gv-empty-state__action">{action}</div>}
    </div>
  );
}

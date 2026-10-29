'use client';
import {Children, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {MenuTrigger} from 'react-aria-components/Menu';
import {ProgressBar} from 'react-aria-components/ProgressBar';
import type {LinkProps} from 'react-aria-components/Link';
import {Link} from '../components/Link';
import {Menu} from '../components/Menu';
import {Popover} from '../components/Popover';
import {Check, ChevronRight} from 'lucide-react';
import './ActionRow.css';

export interface ActionRowProps {
  /** What the row does ("Message participants", "Add a report"). */
  children: ReactNode;
  /** A grey line under the label ("Reading the results of this phase"). */
  description?: ReactNode;
  /**
   * The action's own icon at the end of the row, in place of the chevron (the Insights panel's rows: a report, a
   * link, a sparkle, a download).
   */
  icon?: ReactNode;
  /** A short count or state before the chevron ("18 new", or a working row's "9s"). */
  badge?: ReactNode;
  /** Where it leads. */
  href?: LinkProps['href'];
  onPress?: () => void;
  /**
   * `working`: the row is its own progress (a ring, `aria-disabled`, nothing to press) while the action runs, e.g.
   * "Creating report". `done`: it finished; a check, and the row opens the result ("Report ready").
   *
   * @default 'idle'
   */
  state?: 'idle' | 'working' | 'done';
  /** `working`: how far along, 0–100; leave it out for a ring that turns. */
  progress?: number;
  /** Greyed and inert: an action that can't run yet. */
  isDisabled?: boolean;
  /**
   * Menu items (`MenuItem`s): the row opens a menu under it, as wide as the row, instead of leading somewhere
   * ("Share results with participants" → Go to Messaging, Add a text block…).
   */
  menu?: ReactNode;
  /** The menu's accessible name. Defaults to the label when it is a string. */
  menuLabel?: string;
}

/**
 * A next-action row (prototype `.pj-ba` in "Next actions", `.pjsec__h--nav` in the Insights panel's "Recommended
 * actions"): a bordered row with a label and a chevron, or the action's icon at the end. It can carry a description,
 * run in place (working → done), or open a menu. Not in Figma yet.
 */
export function ActionRow({
  children,
  description,
  icon,
  badge,
  href,
  onPress,
  state = 'idle',
  progress,
  isDisabled,
  menu,
  menuLabel
}: ActionRowProps) {
  const working = state === 'working';
  const done = state === 'done';
  const label = typeof children === 'string' ? children : undefined;

  const body = (
    <>
      {working && (
        <ProgressBar
          className="gv-action-row__lead gv-action-row__ring"
          aria-label={label ?? 'Working'}
          value={progress}
          isIndeterminate={progress == null}>
          {({percentage, isIndeterminate}) => (
            <svg viewBox="0 0 36 36" aria-hidden data-indeterminate={isIndeterminate || undefined}>
              <circle className="gv-action-row__ring-track" cx="18" cy="18" r="14" />
              <circle
                className="gv-action-row__ring-fill"
                cx="18"
                cy="18"
                r="14"
                pathLength={100}
                strokeDasharray="100 200"
                strokeDashoffset={100 - (isIndeterminate ? 25 : (percentage ?? 0))}
              />
            </svg>
          )}
        </ProgressBar>
      )}
      {done && (
        <span className="gv-action-row__lead gv-action-row__tick" aria-hidden>
          <Check size={16} />
        </span>
      )}
      <span className="gv-action-row__text">
        <span className="gv-action-row__label">{children}</span>
        {description != null && <span className="gv-action-row__description">{description}</span>}
      </span>
      {badge != null && <span className="gv-action-row__badge">{badge}</span>}
      {!working &&
        (icon != null && !done ? (
          <span className="gv-action-row__icon" aria-hidden>
            {icon}
          </span>
        ) : (
          <ChevronRight className="gv-action-row__chevron" aria-hidden size={16} />
        ))}
    </>
  );

  if (working) {
    // Nothing to press while it runs: a plain group that says it's busy, the ring reporting its progress.
    return (
      <div className="gv-action-row" data-state="working" role="group" aria-disabled="true" aria-busy="true">
        {body}
      </div>
    );
  }

  if (menu != null) {
    return (
      <MenuTrigger>
        <Button className="gv-action-row" data-state={state} isDisabled={isDisabled}>
          {body}
        </Button>
        <Popover hideArrow placement="bottom start" offset={6} className="gv-action-row__popover">
          <Menu aria-label={menuLabel ?? label}>{menu}</Menu>
        </Popover>
      </MenuTrigger>
    );
  }

  return (
    <Link className="gv-action-row" data-state={state} href={href} onPress={onPress} isDisabled={isDisabled}>
      {body}
    </Link>
  );
}

export interface ActionRowListProps {
  /** The rows (`ActionRow`s). */
  children?: ReactNode;
  /** What an empty list says. @default 'All caught up. Nothing left to suggest.' */
  emptyLabel?: ReactNode;
  /** Names the list ("Recommended actions") when no heading does. */
  'aria-label'?: string;
}

/** Action rows stacked 8 apart, as a list; with no rows it says so (the Insights panel's "All caught up."). */
export function ActionRowList({children, emptyLabel = 'All caught up. Nothing left to suggest.', 'aria-label': ariaLabel}: ActionRowListProps) {
  const rows = Children.toArray(children);
  if (!rows.length) return <p className="gv-action-row-empty">{emptyLabel}</p>;
  return (
    <ul className="gv-action-row-list" aria-label={ariaLabel}>
      {rows.map((row, i) => (
        <li key={i}>{row}</li>
      ))}
    </ul>
  );
}

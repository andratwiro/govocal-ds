'use client';
import {SquarePen, Trash2} from 'lucide-react';
import {IconButton} from '../components/gv/IconButton';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './VolunteeringRow.css';

export interface VolunteeringRowProps extends PlacementProps {
  /** The cause's title. */
  title: string;
  /** A short description of the cause (Manage). */
  description?: string;
  /** The thumbnail image: a 52 rounded square in Manage, 40 in Build. */
  image?: string;
  /** Number of volunteers signed up. */
  volunteerCount: number;
  /** Percentage of the volunteer goal reached, 0–100 (Manage). @default 0 */
  percent?: number;
  /**
   * Where the row sits. `manage`: the cause over its progress bar, the count at the end (Figma). `build`: the
   * phase's Causes card (Not in Figma, the prototype's): a smaller thumbnail, the title over how many signed up
   * ("No sign-ups yet"), Edit and Delete at the end.
   *
   * @default 'manage'
   */
  variant?: 'manage' | 'build';
  /** Build: the Edit button (named "Edit <title>"). */
  onEdit?: () => void;
  /** Build: the Delete button (named "Delete <title>"). */
  onDelete?: () => void;
  /**
   * Whether this is the last row in its list: drops the row divider.
   *
   * @default false
   */
  isLast?: boolean;
}

function Action({
  label,
  tip,
  onPress,
  children
}: {
  label: string;
  tip: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <TooltipTrigger>
      <IconButton aria-label={label} onPress={onPress}>
        {children}
      </IconButton>
      <Tooltip>{tip}</Tooltip>
    </TooltipTrigger>
  );
}

export function VolunteeringRow({
  title,
  description,
  image,
  volunteerCount,
  percent = 0,
  variant = 'manage',
  onEdit,
  onDelete,
  isLast = false,
  className,
  style
}: VolunteeringRowProps) {
  if (variant === 'build') {
    return (
      <div className={clsx('gv-cause-row', className)} style={style} data-variant="build" data-last={isLast || undefined}>
        <div className="gv-cause-row__thumb" aria-hidden="true">
          {image && <img src={image} alt="" />}
        </div>
        <div className="gv-cause-row__cause">
          <div className="gv-cause-row__title">{title}</div>
          <div className="gv-cause-row__signups">
            {volunteerCount ? `${volunteerCount} signed up` : 'No sign-ups yet'}
          </div>
        </div>
        <div className="gv-cause-row__actions">
          <Action label={`Edit ${title}`} tip="Edit" onPress={onEdit}>
            <SquarePen aria-hidden size={16} />
          </Action>
          <Action label={`Delete ${title}`} tip="Delete" onPress={onDelete}>
            <Trash2 aria-hidden size={16} />
          </Action>
        </div>
      </div>
    );
  }
  return (
    <div className={clsx('gv-cause-row', className)} style={style} data-last={isLast || undefined}>
      <div className="gv-cause-row__thumb" aria-hidden="true">
        {image && <img src={image} alt="" />}
      </div>
      <div className="gv-cause-row__cause">
        <div className="gv-cause-row__title">{title}</div>
        <div className="gv-cause-row__desc">{description}</div>
        <div className="gv-cause-row__bar">
          <div className="gv-cause-row__fill" style={{width: `${percent}%`}} />
        </div>
      </div>
      <div className="gv-cause-row__volunteers">
        <div className="gv-cause-row__count">{volunteerCount}</div>
        <div className="gv-cause-row__word">{volunteerCount === 1 ? 'volunteer' : 'volunteers'}</div>
      </div>
    </div>
  );
}

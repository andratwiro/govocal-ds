'use client';
import {ProgressBar} from 'react-aria-components/ProgressBar';
import {SquarePen, Trash2} from 'lucide-react';
import {IconButton} from '../components/gv/IconButton';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter, usePercentFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './VolunteeringRow.css';

/** The words Volunteering row says itself (docs/API.md rule 11). */
export interface VolunteeringRowLabels {
  /** Build: how many signed up, and the line while nobody has. */
  signedUp: CountLabel;
  /** The line under the title in Build while nobody has signed up. */
  noSignUps: string;
  /** Build: the Edit and Delete buttons' names, given the cause's title, and their tooltips. */
  edit: (title: string) => string;
  /** The Delete button's name, given the cause's title. */
  delete: (title: string) => string;
  /** The Edit button's tooltip. */
  editTip: string;
  /** The Delete button's tooltip. */
  deleteTip: string;
  /** Manage: the word under the count ("volunteers"); the count itself is drawn above it. */
  volunteers: CountLabel;
  /** Manage: the goal bar's name, given the cause's title. */
  goal: (title: string) => string;
  /** Manage: what the goal bar says, given the share reached as the locale writes it ("60%"). */
  goalReached: (percent: string) => string;
}

/** Volunteering row's English words; a page passes its own over them with `labels`. */
export const volunteeringRowLabels: VolunteeringRowLabels = {
  signedUp: (count, n) => `${n} signed up`,
  noSignUps: 'No sign-ups yet',
  edit: title => `Edit ${title}`,
  delete: title => `Delete ${title}`,
  editTip: 'Edit',
  deleteTip: 'Delete',
  volunteers: count => (count === 1 ? 'volunteer' : 'volunteers'),
  goal: title => `Volunteer goal for ${title}`,
  goalReached: percent => `${percent} of the goal`
};

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
  layout?: 'manage' | 'build';
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
  /** Its own words (the sign-ups line, Edit, Delete, "volunteers", the goal bar), over `volunteeringRowLabels`. */
  labels?: Partial<VolunteeringRowLabels>;
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

/** One volunteering cause in a list: its progress and volunteer count, or in Build its sign-ups with Edit and Delete. For ideas, use `ProposalsRow`. */
export function VolunteeringRow({
  title,
  description,
  image,
  volunteerCount,
  percent = 0,
  layout = 'manage',
  onEdit,
  onDelete,
  isLast = false,
  labels,
  className,
  style
}: VolunteeringRowProps) {
  const l = mergeLabels(volunteeringRowLabels, labels);
  const number = useNumberFormatter();
  const formatPercent = usePercentFormatter();
  if (layout === 'build') {
    return (
      <div className={clsx('gv-cause-row', className)} style={style} data-layout="build" data-last={isLast || undefined}>
        <div className="gv-cause-row__thumb" aria-hidden="true">
          {image && <img src={image} alt="" />}
        </div>
        <div className="gv-cause-row__cause">
          <div className="gv-cause-row__title">{title}</div>
          <div className="gv-cause-row__signups">
            {volunteerCount ? l.signedUp(volunteerCount, number.format(volunteerCount)) : l.noSignUps}
          </div>
        </div>
        <div className="gv-cause-row__actions">
          <Action label={l.edit(title)} tip={l.editTip} onPress={onEdit}>
            <SquarePen aria-hidden size={16} />
          </Action>
          <Action label={l.delete(title)} tip={l.deleteTip} onPress={onDelete}>
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
        <ProgressBar className="gv-cause-row__bar" value={percent} aria-label={l.goal(title)}
          valueLabel={l.goalReached(formatPercent(percent))}>
          <div className="gv-cause-row__fill" style={{width: `${Math.min(100, Math.max(0, percent))}%`}} />
        </ProgressBar>
      </div>
      <div className="gv-cause-row__volunteers">
        <div className="gv-cause-row__count">{number.format(volunteerCount)}</div>
        <div className="gv-cause-row__word">{l.volunteers(volunteerCount, number.format(volunteerCount))}</div>
      </div>
    </div>
  );
}

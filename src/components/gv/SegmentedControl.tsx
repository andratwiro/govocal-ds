'use client';
import {
  ToggleButtonGroup as RACToggleButtonGroup,
  SelectionIndicator,
  ToggleButton,
  type ToggleButtonProps,
  type ToggleButtonGroupProps
} from 'react-aria-components/ToggleButtonGroup';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import type {ReactNode} from 'react';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import {NewDot} from './NewDot';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './SegmentedControl.css';

/** The words a Segmented control item says itself (docs/API.md rule 11). */
export interface SegmentedControlItemLabels {
  /** What the New dot means to a screen reader. */
  unread: string;
}

/** A segment's English words; a page passes its own over them with `labels`. */
export const segmentedControlItemLabels: SegmentedControlItemLabels = {unread: 'Unread'};

export interface SegmentedControlProps extends Omit<ToggleButtonGroupProps, 'className' | 'style'>, PlacementProps {
  /**
   * The height. `36` is Figma's Segmented control (the Build / Manage / Insights tabs). `30` is the range switch in
   * a dashboard card's header (Figma Dashboard card · Votes over time "Range switch", prototype `.pj-dseg`): Small
   * type, on the stage grey.
   *
   * @default 36
   */
  size?: 36 | 30;
}

/**
 * Segmented control (Figma node 14:883; prototype `.pj-hseg`): React Aria's ToggleButtonGroup, ToggleButton and
 * SelectionIndicator, painted with gv- classes.
 */
export function SegmentedControl({size = 36, className, style, ...props}: SegmentedControlProps) {
  return <RACToggleButtonGroup {...props} className={clsx('gv-segmented-control', className)} style={style} data-size={size} />;
}

export interface SegmentedControlItemProps extends Omit<ToggleButtonProps, 'className' | 'style'>, PlacementProps {
  /** The label; an icon (`aria-hidden`, 16, or 14 in `small`) may come first ("List", "Map"). */
  children?: ReactNode;
  /** Shows the New dot in the segment's top-right corner (Figma `Segmented control item` State=Unread). */
  isUnread?: boolean;
  /**
   * A tip under the segment on hover and keyboard focus, read as its description: what the New dot stands for
   * ("18 new ideas", the phase tabs). Not in Figma.
   */
  tooltip?: ReactNode;
  /** Its own words (the New dot's meaning), over `segmentedControlItemLabels`. */
  labels?: Partial<SegmentedControlItemLabels>;
}

/** Segmented control item (Figma node 14:882): one segment of the control. */
export function SegmentedControlItem({children, isUnread, tooltip, labels, className, style, ...props}: SegmentedControlItemProps) {
  const segment = (
    <ToggleButton {...props} className={clsx('gv-segment', className)} style={style} data-unread={isUnread || undefined}>
      {composeRenderProps(children, resolvedChildren => (
        <>
          <SelectionIndicator className="gv-segment-indicator" data-selected />
          <span className="gv-segment-label">{resolvedChildren}</span>
          {isUnread && <NewDot aria-label={mergeLabels(segmentedControlItemLabels, labels).unread} />}
        </>
      ))}
    </ToggleButton>
  );
  if (tooltip == null) return segment;
  return (
    <TooltipTrigger>
      {segment}
      <Tooltip placement="bottom">{tooltip}</Tooltip>
    </TooltipTrigger>
  );
}

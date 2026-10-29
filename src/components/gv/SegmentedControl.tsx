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
import './SegmentedControl.css';

export interface SegmentedControlProps extends ToggleButtonGroupProps {
  /**
   * `default` is Figma's Segmented control (the Build / Manage / Insights tabs, 36 tall).
   * `small` is the range switch in a dashboard card's header (Figma Dashboard card · Votes over
   * time "Range switch", prototype `.pj-dseg`): 30 tall, Small type, on the stage grey.
   *
   * @default 'default'
   */
  size?: 'default' | 'small';
}

/**
 * Segmented control (Figma node 14:883; prototype `.pj-hseg`): React Aria's ToggleButtonGroup, ToggleButton and
 * SelectionIndicator, painted with gv- classes.
 */
export function SegmentedControl({size = 'default', ...props}: SegmentedControlProps) {
  return <RACToggleButtonGroup {...props} className="gv-segmented-control" data-size={size} />;
}

export interface SegmentedControlItemProps extends ToggleButtonProps {
  /** The label; an icon (`aria-hidden`, 16, or 14 in `small`) may come first ("List", "Map"). */
  children?: ReactNode;
  /** Shows the New dot in the segment's top-right corner (Figma `Segmented control item` State=Unread). */
  isUnread?: boolean;
  /**
   * A tip under the segment on hover and keyboard focus, read as its description: what the New dot stands for
   * ("18 new ideas", the phase tabs). Not in Figma.
   */
  tooltip?: ReactNode;
}

/** Segmented control item (Figma node 14:882): one segment of the control. */
export function SegmentedControlItem({children, isUnread, tooltip, ...props}: SegmentedControlItemProps) {
  const segment = (
    <ToggleButton {...props} className="gv-segment" data-unread={isUnread || undefined}>
      {composeRenderProps(children, resolvedChildren => (
        <>
          <SelectionIndicator className="gv-segment-indicator" data-selected />
          <span className="gv-segment-label">{resolvedChildren}</span>
          {isUnread && <NewDot aria-label="Unread" />}
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

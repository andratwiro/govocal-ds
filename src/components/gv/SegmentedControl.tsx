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
 * Segmented control (Figma node 14:883; prototype `.pj-hseg`).
 * Built on the starter's own primitives (ToggleButtonGroup + ToggleButton + SelectionIndicator,
 * the same ones `src/components/SegmentedControl.tsx` uses) rather than wrapping that file
 * directly: its hardcoded className/data-variant on the RAC elements leaves no way for a
 * consumer to repaint it with gv- classes.
 */
export function SegmentedControl({size = 'default', ...props}: SegmentedControlProps) {
  return <RACToggleButtonGroup {...props} className="gv-segmented-control" data-size={size} />;
}

export interface SegmentedControlItemProps extends ToggleButtonProps {
  children?: ReactNode;
  /** Shows the New dot in the segment's top-right corner (Figma `Segmented control item` State=Unread). */
  isUnread?: boolean;
}

/** Segmented control item (Figma node 14:882): one segment of the control. */
export function SegmentedControlItem({children, isUnread, ...props}: SegmentedControlItemProps) {
  return (
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
}

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
import './SegmentedControl.css';

export interface SegmentedControlProps extends ToggleButtonGroupProps {}

/**
 * Tali's Segmented control (Figma node 14:883; prototype `.pj-hseg`).
 * Built on the starter's own primitives (ToggleButtonGroup + ToggleButton + SelectionIndicator,
 * the same ones `src/components/SegmentedControl.tsx` uses) rather than wrapping that file
 * directly: its hardcoded className/data-variant on the RAC elements leaves no way for a
 * consumer to repaint it with gv- classes.
 */
export function SegmentedControl(props: SegmentedControlProps) {
  return <RACToggleButtonGroup {...props} className="gv-segmented-control" />;
}

export interface SegmentProps extends ToggleButtonProps {
  children?: ReactNode;
  /**
   * Shows a small unread dot before the label (Figma `Segment` State=Unread).
   * Swap later: this is a plain styled dot — G1's NewDot export is the real primitive once merged.
   */
  isUnread?: boolean;
}

/** Tali's Segment (Figma node 14:882). */
export function Segment({children, isUnread, ...props}: SegmentProps) {
  return (
    <ToggleButton {...props} className="gv-segment" data-unread={isUnread || undefined}>
      {composeRenderProps(children, resolvedChildren => (
        <>
          <SelectionIndicator className="gv-segment-indicator" data-selected />
          <span className="gv-segment-label">
            {isUnread && <span className="gv-segment-dot" aria-hidden="true" />}
            {resolvedChildren}
          </span>
        </>
      ))}
    </ToggleButton>
  );
}

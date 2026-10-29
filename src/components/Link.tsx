'use client';
import {Link as RACLink, type LinkProps as RACLinkProps} from 'react-aria-components/Link';
import './Link.css';
import {keepClass} from './className';

export interface LinkProps extends RACLinkProps {
  /**
   * The prototype's two tertiary sizes: `small` (12/16, in rows and cards) and `medium` (14/20, a section's action).
   * Left out, the link takes the size of the text around it.
   */
  size?: 'small' | 'medium';
}

/**
 * A text link to another page, a section or a file, in a sentence or as a row's or a section's small action. Blue
 * words ("Make default", "+ New phase"); React Aria's Link: `href` navigates, `isDisabled` greys it out. An action
 * that stays on the page is a quiet Button, not a Link. `className` and `style` place it (margin, alignment); they
 * never paint it.
 */
export function Link({size, ...props}: LinkProps) {
  return <RACLink {...props} className={keepClass(props.className)} data-size={size} />;
}

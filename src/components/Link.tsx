'use client';
import {Link as RACLink, type LinkProps as RACLinkProps} from 'react-aria-components/Link';
import './Link.css';

export interface LinkProps extends RACLinkProps {
  /**
   * The prototype's two tertiary sizes: `small` (12/16, in rows and cards) and `medium` (14/20, a section's action).
   * Left out, the link takes the size of the text around it.
   */
  size?: 'small' | 'medium';
}

export function Link({size, ...props}: LinkProps) {
  return <RACLink {...props} data-size={size} />;
}

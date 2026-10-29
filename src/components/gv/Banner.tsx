'use client';
import type {ReactNode} from 'react';
import {Link} from 'react-aria-components';
import {Info} from 'lucide-react';
import './Banner.css';

export interface BannerProps {
  /**
   * Figma "Type": Info (a paragraph, Body type) or Info · link (one UI line ending in a link).
   *
   * @default 'info'
   */
  type?: 'info' | 'info-link';
  /** The message. */
  children: ReactNode;
  /** Info · link: the link's words, e.g. "Go to project". */
  linkLabel?: string;
  linkHref?: string;
  onLinkPress?: () => void;
}

/** An info note on teal: icon + message (+ a link). */
export function Banner({type = 'info', children, linkLabel, linkHref, onLinkPress}: BannerProps) {
  return (
    <div className="gv-banner" data-type={type} role="note">
      <Info className="gv-banner__icon" aria-hidden size={16} />
      <p className="gv-banner__text">
        {children}
        {type === 'info-link' && linkLabel && (
          <>
            {' '}
            <Link className="gv-banner__link" href={linkHref} onPress={onLinkPress}>
              {linkLabel}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

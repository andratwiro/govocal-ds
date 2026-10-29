'use client';
import type {ReactNode} from 'react';
import {Link} from 'react-aria-components';
import {Info, Clock, TriangleAlert, CircleCheck, Sparkles, X} from 'lucide-react';
import {IconButton} from './IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Banner.css';

/** The tone's default icon; `icon={null}` hides it, any other node overrides it. */
const TONE_ICON = {
  info: Info,
  neutral: Clock,
  warning: TriangleAlert,
  success: CircleCheck,
  ai: Sparkles
} as const;

export type BannerTone = keyof typeof TONE_ICON;

export interface BannerProps extends PlacementProps {
  /**
   * @deprecated use `tone` (+ `linkLabel` for a trailing link); kept so existing calls with
   * `type="info-link"` still work.
   */
  type?: 'info' | 'info-link';
  /**
   * Figma "Type": info (teal, a paragraph) plus the review's neutral (phase not started/ended),
   * warning (screening, content warnings), success (confirmations) and AI tones.
   *
   * @default 'info'
   */
  tone?: BannerTone;
  /** A bold line above the message (e.g. "Screening is on"). */
  title?: string;
  /** The message. */
  children?: ReactNode;
  /** Overrides the tone's default icon; `null` hides it. */
  icon?: ReactNode | null;
  /** Info · link / AI: a link at the end of the message, e.g. "Go to project", "Open AI analysis". */
  linkLabel?: string;
  linkHref?: string;
  onLinkPress?: () => void;
  /** A block action under the message, e.g. a "Review" button (the screening banner). */
  action?: ReactNode;
  /** Shows a dismiss × in the corner and calls this when it's pressed. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /**
   * The phase status strip: one compact row (icon, bold title, lighter meta), not the padded
   * message card. `title` + `children` (the meta, e.g. "Starts in 4 days").
   */
  compact?: boolean;
}

/** A message box: icon + text, on a tone's tint (+ title, link, action, dismiss). */
export function Banner({
  type,
  tone,
  title,
  children,
  icon,
  linkLabel,
  linkHref,
  onLinkPress,
  action,
  onDismiss,
  dismissLabel = 'Dismiss',
  compact = false,
  className,
  style
}: BannerProps) {
  const resolvedTone: BannerTone = tone ?? 'info';
  const isLink = type === 'info-link';
  const ToneIcon = TONE_ICON[resolvedTone];

  if (compact) {
    return (
      <div className={clsx('gv-banner gv-banner--compact', className)} style={style} data-tone={resolvedTone} role="status">
        {icon !== null && <span className="gv-banner__icon">{icon ?? <ToneIcon aria-hidden size={16} strokeWidth={1.75} />}</span>}
        {title && <span className="gv-banner__strip-title">{title}</span>}
        {children && <span className="gv-banner__strip-meta">{children}</span>}
      </div>
    );
  }

  return (
    <div className={clsx('gv-banner', className)} style={style} data-tone={resolvedTone} role="note">
      {icon !== null && <span className="gv-banner__icon">{icon ?? <ToneIcon aria-hidden size={16} strokeWidth={1.75} />}</span>}
      <div className="gv-banner__content">
        <div className="gv-banner__row">
          <p className="gv-banner__text">
            {title && <strong className="gv-banner__title">{title}</strong>}
            {children}
            {isLink && linkLabel && (
              <>
                {' '}
                <Link className="gv-banner__link" href={linkHref} onPress={onLinkPress}>
                  {linkLabel}
                </Link>
              </>
            )}
          </p>
          {!isLink && linkLabel && (
            <Link className="gv-banner__link gv-banner__link--trailing" href={linkHref} onPress={onLinkPress}>
              {linkLabel}
            </Link>
          )}
        </div>
        {action && <div className="gv-banner__action">{action}</div>}
      </div>
      {onDismiss && (
        <span className="gv-banner__dismiss">
          <IconButton variant="ghost" tone="strong" size={24} aria-label={dismissLabel} onPress={onDismiss}>
            <X aria-hidden size={16} strokeWidth={1.75} />
          </IconButton>
        </span>
      )}
    </div>
  );
}

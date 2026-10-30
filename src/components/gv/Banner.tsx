'use client';
import {useEffect, useState, type ReactNode} from 'react';
import {Link} from 'react-aria-components';
import {Info, Clock, TriangleAlert, CircleCheck, Sparkles, X} from 'lucide-react';
import {IconButton} from './IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './Banner.css';

/** The words Banner says itself (docs/API.md rule 11). */
export interface BannerLabels {
  /** The dismiss ×'s name. */
  dismiss: string;
}

/** Banner's English words; a page passes its own over them with `labels`. */
export const bannerLabels: BannerLabels = {dismiss: 'Dismiss'};

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
  /** A link with the message, e.g. "Go to project", "Open AI analysis". */
  linkLabel?: string;
  /** Where the link goes, when it is an ordinary link. Pass this or `onLinkPress`. */
  linkHref?: string;
  /** Fires when the link is pressed, for a link that acts rather than navigates. */
  onLinkPress?: () => void;
  /**
   * Where the link sits: `inline`, right after the words (Figma's Info · link); `trailing`, at the end of the row (the
   * AI banner's "Open AI analysis").
   *
   * @default 'trailing'
   */
  linkPlacement?: 'inline' | 'trailing';
  /** A block action under the message, e.g. a "Review" button (the screening banner). */
  actions?: ReactNode;
  /** Shows a dismiss × in the corner and calls this when it's pressed. Its name is `labels.dismiss`. */
  onDismiss?: () => void;
  /** Its own words (the dismiss ×'s name), over `bannerLabels`. */
  labels?: Partial<BannerLabels>;
  /**
   * `compact`: the phase status strip, one row (icon, bold title, lighter meta), not the padded message card;
   * `title` + `children` (the meta, e.g. "Starts in 4 days").
   *
   * @default 'default'
   */
  density?: 'default' | 'compact';
  /**
   * Announces the banner when it appears after the page has loaded (a save that failed, screening that just turned
   * on): it is a status (`role="status"`) whose words arrive once it is on screen, so screen readers read them. Leave
   * it off for a banner that is there when the page opens: that one is a note, read in place. The compact strip is
   * always a status.
   *
   * @default false
   */
  isLive?: boolean;
}

/** A message box: icon + text, on a tone's tint (+ title, link, actions, dismiss). */
export function Banner({
  tone,
  title,
  children,
  icon,
  linkLabel,
  linkHref,
  onLinkPress,
  linkPlacement = 'trailing',
  actions,
  onDismiss,
  labels,
  density = 'default',
  isLive = false,
  className,
  style
}: BannerProps) {
  // A live region announces what changes inside it, not what it was born with: the words arrive after it mounts.
  const [isFilled, setFilled] = useState(!isLive);
  useEffect(() => {
    if (isLive) setFilled(true);
  }, [isLive]);
  const resolvedTone: BannerTone = tone ?? 'info';
  const isInline = linkPlacement === 'inline';
  const ToneIcon = TONE_ICON[resolvedTone];

  if (density === 'compact') {
    return (
      <div className={clsx('gv-banner gv-banner--compact', className)} style={style} data-tone={resolvedTone} role="status">
        {icon !== null && <span className="gv-banner__icon">{icon ?? <ToneIcon aria-hidden size={16} strokeWidth={1.75} />}</span>}
        {title && <span className="gv-banner__strip-title">{title}</span>}
        {children && <span className="gv-banner__strip-meta">{children}</span>}
      </div>
    );
  }

  return (
    <div className={clsx('gv-banner', className)} style={style} data-tone={resolvedTone} role={isLive ? 'status' : 'note'}>
      {isFilled && (
        <>
          {icon !== null && <span className="gv-banner__icon">{icon ?? <ToneIcon aria-hidden size={16} strokeWidth={1.75} />}</span>}
          <div className="gv-banner__content">
            <div className="gv-banner__row">
              <p className="gv-banner__text">
                {title && <strong className="gv-banner__title">{title}</strong>}
                {children}
                {isInline && linkLabel && (
                  <>
                    {' '}
                    <Link className="gv-banner__link" href={linkHref} onPress={onLinkPress}>
                      {linkLabel}
                    </Link>
                  </>
                )}
              </p>
              {!isInline && linkLabel && (
                <Link className="gv-banner__link gv-banner__link--trailing" href={linkHref} onPress={onLinkPress}>
                  {linkLabel}
                </Link>
              )}
            </div>
            {actions && <div className="gv-banner__action">{actions}</div>}
          </div>
          {onDismiss && (
            <span className="gv-banner__dismiss">
              <IconButton variant="ghost" emphasis="strong" size={24} aria-label={mergeLabels(bannerLabels, labels).dismiss} onPress={onDismiss}>
                <X aria-hidden size={16} strokeWidth={1.75} />
              </IconButton>
            </span>
          )}
        </>
      )}
    </div>
  );
}

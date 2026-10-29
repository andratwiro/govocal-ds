'use client';
import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {Link} from 'react-aria-components/Link';
import {ArrowUpRight, Eye, ImageIcon, Menu} from 'lucide-react';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import {IconButton} from '../components/gv/IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './PhonePreview.css';

export interface PhonePreviewAction {
  /** "Edit project page" on the project; "Preview" on a phase. */
  label: string;
  href?: string;
  onPress?: () => void;
  /** Opens the participant's view in another tab: an ↗ after the label. */
  isExternal?: boolean;
}

export interface PhonePreviewProps extends PlacementProps {
  /** Names the preview for assistive tech ("What residents see"). */
  'aria-label': string;
  /** The platform's header, pinned at the top of the screen. */
  header?: ReactNode;
  children?: ReactNode;
  /**
   * The screen's ground. `white`: a page (the project page, a message). `grey`: the front office's phase page, white
   * cards (`PhoneCard`) on the app grey.
   *
   * @default 'white'
   */
  surface?: 'white' | 'grey';
  /** The participation bar pinned at the bottom of the screen (`PhoneCountdown`). */
  footer?: ReactNode;
  /** Nothing to show yet (a new phase): the screen says so in place of its content. */
  isEmpty?: boolean;
  /** @default 'Nothing to preview yet' */
  emptyLabel?: string;
  /**
   * The phone's own action, shown on hover or keyboard focus as a smoked pill in the middle while the screen dims
   * ("Edit project page", "Preview ↗"). The phone lifts and takes a ring. None while it is empty.
   */
  action?: PhonePreviewAction;
}

/**
 * The front-office preview's phone (prototype `#phone`): a light, rounded device around a scrolling screen, centred on
 * the stage by the page (`PhoneStage`). The screen is what a resident sees and is inert. Not in Figma yet.
 */
export function PhonePreview({
  header,
  children,
  surface = 'white',
  footer,
  isEmpty = false,
  emptyLabel = 'Nothing to preview yet',
  action,
  'aria-label': label,
  className,
  style
}: PhonePreviewProps) {
  const showAction = action != null && !isEmpty;
  return (
    <div className={clsx('gv-phone', className)} style={style} role="group" aria-label={label} data-action={showAction || undefined}>
      <div className="gv-phone__screen" data-surface={isEmpty ? 'white' : surface}>
        {header}
        {isEmpty ? (
          <div className="gv-phone__empty">
            <p>{emptyLabel}</p>
          </div>
        ) : (
          <div className="gv-phone__content">{children}</div>
        )}
        {!isEmpty && footer}
      </div>
      {showAction &&
        (action.href != null ? (
          <Link
            className="gv-phone__action"
            href={action.href}
            onPress={action.onPress}
            target={action.isExternal ? '_blank' : undefined}
            rel={action.isExternal ? 'noreferrer' : undefined}>
            {action.label}
            {action.isExternal && <ArrowUpRight aria-hidden size={16} />}
          </Link>
        ) : (
          <Button className="gv-phone__action" onPress={action.onPress}>
            {action.label}
            {action.isExternal && <ArrowUpRight aria-hidden size={16} />}
          </Button>
        ))}
    </div>
  );
}

/** The platform header inside the phone: a logo placeholder and the menu icon (the preview is inert). */
export interface PhoneHeaderProps extends PlacementProps {logo?: string}

export function PhoneHeader({logo = 'Platform logo', className, style}: PhoneHeaderProps) {
  return (
    <div className={clsx('gv-phone-header', className)} style={style}>
      <span className="gv-phone-header__logo" role="img" aria-label={logo} />
      <Menu className="gv-phone-header__menu" aria-hidden size={18} />
    </div>
  );
}

/** A picture's place: grey, with an image icon, until a picture is set. */
export interface PhoneImageProps extends PlacementProps {'aria-label'?: string}

export function PhoneImage({'aria-label': label = 'Header image', className, style}: PhoneImageProps) {
  return (
    <span className={clsx('gv-phone-image', className)} style={style} role="img" aria-label={label}>
      <ImageIcon aria-hidden size={24} />
    </span>
  );
}

/** A white card on a `grey` screen: the phase page's blocks (description, attachments, the inputs). */
export interface PhoneCardProps extends PlacementProps {children: ReactNode}

export function PhoneCard({children, className, style}: PhoneCardProps) {
  return <div className={clsx('gv-phone-card', className)} style={style}>{children}</div>;
}

export interface PhoneCountdownProps extends PlacementProps {
  /** How long the phase has left, or until it starts ("2 weeks left", "Starts in 5 days"). Shown in capitals. */
  children: ReactNode;
  /** The participation button ("Submit your idea"); leave it out while participating isn't possible. */
  cta?: string;
}

/** The participation bar at the foot of a phase's screen: a dot and the time left, then the participation button. */
export function PhoneCountdown({children, cta, className, style}: PhoneCountdownProps) {
  return (
    <div className={clsx('gv-phone-countdown', className)} style={style}>
      <span className="gv-phone-countdown__when">
        <span className="gv-phone-countdown__dot" aria-hidden="true" />
        {children}
      </span>
      {cta != null && (
        <span className="gv-phone-countdown__cta">
          {cta}
        </span>
      )}
    </div>
  );
}

export interface PhoneStageProps extends PlacementProps {
  /** The phone (`PhonePreview`). */
  children: ReactNode;
  /** A grey pill in the stage's bottom corner that says what the phone shows ("What residents see while the phase is open"). */
  caption?: ReactNode;
  /** The eye in the stage's top corner: opens the participant's view in another tab. */
  onOpen?: () => void;
  /** @default 'Open in external URL' */
  openLabel?: string;
}

/** The grey stage the phone stands on (prototype `#view-project` preview pane): the phone centred, the eye, the caption. */
export function PhoneStage({children, caption, onOpen, openLabel = 'Open in external URL', className, style}: PhoneStageProps) {
  return (
    <div className={clsx('gv-phone-stage', className)} style={style}>
      {onOpen && (
        <span className="gv-phone-stage__open">
          <TooltipTrigger>
            <IconButton variant="bordered" aria-label={openLabel} onPress={onOpen}>
              <Eye aria-hidden />
            </IconButton>
            <Tooltip placement="bottom end">{openLabel}</Tooltip>
          </TooltipTrigger>
        </span>
      )}
      {children}
      {caption != null && <p className="gv-phone-stage__caption">{caption}</p>}
    </div>
  );
}

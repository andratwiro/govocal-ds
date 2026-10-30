'use client';
import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {Link} from 'react-aria-components/Link';
import {ArrowUpRight, Eye, ImageIcon, Menu} from 'lucide-react';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import {IconButton} from '../components/gv/IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './PhonePreview.css';

/** The words the phone preview's parts say themselves (docs/API.md rule 11): Phone preview's empty line, Phone
 * header's logo, Phone image's name and Phone stage's eye. One object, each part reading its own keys. */
export interface PhonePreviewLabels {
  /** What an empty screen says, when no `emptyLabel` is given. */
  empty: string;
  /** The logo placeholder's name, when no `logo` is given. */
  logo: string;
  /** A picture's place, when no `aria-label` is given. */
  image: string;
  /** The stage's eye: its name and tooltip. */
  open: string;
}

/** The phone preview's English words; a page passes its own over them with `labels`. */
export const phonePreviewLabels: PhonePreviewLabels = {
  empty: 'Nothing to preview yet',
  logo: 'Platform logo',
  image: 'Header image',
  open: 'Open in external URL'
};

export interface PhonePreviewAction {
  /** "Edit project page" on the project; "Preview" on a phase. */
  label: string;
  /** Where the action leads (a link). A button when omitted. */
  href?: string;
  /** Fires when the action is pressed. */
  onPress?: () => void;
  /** Opens the participant's view in another tab: an ↗ after the label. */
  isExternal?: boolean;
}

export interface PhonePreviewProps extends PlacementProps {
  /** Names the preview for assistive tech ("What residents see"). */
  'aria-label': string;
  /** The platform's header, pinned at the top of the screen. */
  header?: ReactNode;
  /** The screen's content, scrolling between `header` and `footer`. */
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
  /** What this empty screen says. @default `labels.empty` ("Nothing to preview yet") */
  emptyLabel?: string;
  /**
   * The phone's own action, shown on hover or keyboard focus as a smoked pill in the middle while the screen dims
   * ("Edit project page", "Preview ↗"). The phone lifts and takes a ring. None while it is empty.
   */
  action?: PhonePreviewAction;
  /** Its own words (the empty line), over `phonePreviewLabels`. */
  labels?: Partial<PhonePreviewLabels>;
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
  emptyLabel,
  action,
  'aria-label': label,
  labels,
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
            <p>{emptyLabel ?? mergeLabels(phonePreviewLabels, labels).empty}</p>
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

/** The platform header inside the phone: the platform's logo mark (or a placeholder) and the menu icon (inert). */
export interface PhoneHeaderProps extends PlacementProps {
  /** The logo's name, read for the mark or the placeholder. @default `labels.logo` ("Platform logo") */
  logo?: string;
  /**
   * The platform's logo mark: an `<img>` or an SVG, drawn 24 tall at the start (the prototype's phone header). Without
   * it, a grey placeholder holds its place.
   */
  mark?: ReactNode;
  /** Its own words, over `phonePreviewLabels`. */
  labels?: Partial<PhonePreviewLabels>;
}

export function PhoneHeader({logo, mark, labels, className, style}: PhoneHeaderProps) {
  const name = logo ?? mergeLabels(phonePreviewLabels, labels).logo;
  return (
    <div className={clsx('gv-phone-header', className)} style={style} data-mark={mark != null || undefined}>
      {mark != null ? (
        <span className="gv-phone-header__mark" role="img" aria-label={name}>
          {mark}
        </span>
      ) : (
        <span className="gv-phone-header__logo" role="img" aria-label={name} />
      )}
      <Menu className="gv-phone-header__menu" aria-hidden size={18} />
    </div>
  );
}

/** A picture's place: grey, with an image icon, until a picture is set. */
export interface PhoneImageProps extends PlacementProps {
  /** @default `labels.image` ("Header image") */
  'aria-label'?: string;
  /** Its own words, over `phonePreviewLabels`. */
  labels?: Partial<PhonePreviewLabels>;
}

export function PhoneImage({'aria-label': label, labels, className, style}: PhoneImageProps) {
  return (
    <span className={clsx('gv-phone-image', className)} style={style} role="img"
      aria-label={label ?? mergeLabels(phonePreviewLabels, labels).image}>
      <ImageIcon aria-hidden size={24} />
    </span>
  );
}

/** A white card on a `grey` screen: the phase page's blocks (description, attachments, the inputs). */
export interface PhoneCardProps extends PlacementProps {
  /** The card's content. */
  children: ReactNode;
}

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
  /**
   * The stage's toolbar in the bottom corner, before the caption: a Segmented control that switches what the phone
   * shows (Voting's Before · Open · Ended).
   */
  toolbar?: ReactNode;
  /** Its own words (the eye's name and tooltip), over `phonePreviewLabels`. */
  labels?: Partial<PhonePreviewLabels>;
}

/**
 * The grey stage the phone stands on (prototype `#view-project` preview pane): the phone centred, the eye at the top
 * end, and at the bottom end an optional toolbar and caption.
 */
export function PhoneStage({children, caption, onOpen, toolbar, labels, className, style}: PhoneStageProps) {
  const {open} = mergeLabels(phonePreviewLabels, labels);
  return (
    <div className={clsx('gv-phone-stage', className)} style={style}>
      {onOpen && (
        <span className="gv-phone-stage__open">
          <TooltipTrigger>
            <IconButton variant="bordered" aria-label={open} onPress={onOpen}>
              <Eye aria-hidden />
            </IconButton>
            <Tooltip placement="bottom end">{open}</Tooltip>
          </TooltipTrigger>
        </span>
      )}
      {children}
      {(toolbar != null || caption != null) && (
        <div className="gv-phone-stage__foot">
          {toolbar != null && <div className="gv-phone-stage__toolbar">{toolbar}</div>}
          {caption != null && <p className="gv-phone-stage__caption">{caption}</p>}
        </div>
      )}
    </div>
  );
}

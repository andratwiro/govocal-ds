'use client';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import {PreviewDeviceSwitch, usePreviewDevice, type PreviewDevice} from './previewDevice';
import './EmailPreview.css';

/** The words Email preview says itself (docs/API.md rule 11). */
export interface EmailPreviewLabels {
  /** The preview's name, given the subject, when no `aria-label` is given. */
  preview: (subject: string) => string;
  /** The envelope's field names. */
  to: string;
  /** The From field's name. */
  from: string;
  /** The Reply-to field's name. */
  replyTo: string;
  /** The Subject field's name. */
  subject: string;
  /** The logo placeholder's name, when no `logoLabel` is given. */
  logo: string;
  /** The device switch's name. */
  device: string;
  /** The device switch's segments. */
  desktop: string;
  /** The phone segment. */
  phone: string;
  /** The default footer's links, in order. */
  unsubscribe: string;
  /** The terms link. */
  terms: string;
  /** The privacy link. */
  privacy: string;
}

/** Email preview's English words; a page passes its own over them with `labels`. */
export const emailPreviewLabels: EmailPreviewLabels = {
  preview: subject => `Email preview: ${subject}`,
  to: 'To',
  from: 'From',
  replyTo: 'Reply-to',
  subject: 'Subject',
  logo: 'Platform logo',
  device: 'Preview width',
  desktop: 'Desktop',
  phone: 'Phone',
  unsubscribe: 'Unsubscribe',
  terms: 'Terms and conditions',
  privacy: 'Privacy policy'
};

export interface EmailPreviewProps extends PlacementProps {
  /** The subject line: in the envelope, in bold. */
  subject: string;
  /** Who gets it ("All registered users", "User who commented"). Leave it out to show no To line. */
  to?: ReactNode;
  /** The sender as residents see it ("Larkvale City Council"). Leave it out to show no From line. */
  from?: ReactNode;
  /** Where replies go. Leave it out to show no Reply-to line. */
  replyTo?: ReactNode;
  /** The platform's logo: an `<img>` or an SVG, drawn 32px tall, centred at the top. A grey placeholder without it. */
  logo?: ReactNode;
  /** The logo's name, read for the mark or the placeholder. @default `labels.logo` ("Platform logo") */
  logoLabel?: string;
  /** The heading under the logo ("New comment on your input"). */
  title?: ReactNode;
  /** The title's heading level, to fit the page's outline. @default 3 */
  headingLevel?: 2 | 3 | 4;
  /** The email's body: paragraphs, a list, a quote. */
  children?: ReactNode;
  /** The button's words ("View the comment"). Inert, as everything in the preview. Leave it out for no button. */
  buttonText?: string;
  /**
   * The grey footer, replacing the default: the Unsubscribe, Terms and conditions and Privacy policy links (inert).
   * Pass `null` for no links.
   */
  footer?: ReactNode;
  /** A line under the footer's links: why the person gets the email, who sends it. */
  footerNote?: ReactNode;
  /** The width shown (controlled): `desktop` (600px, an email's width) or `phone` (343px). */
  device?: PreviewDevice;
  /** The width it starts at, when `device` is not given. @default 'desktop' */
  defaultDevice?: PreviewDevice;
  /** Fires when the switch changes the width. */
  onDeviceChange?: (device: PreviewDevice) => void;
  /** Shows the Desktop / Phone switch above the email. @default true */
  showDeviceSwitch?: boolean;
  /** Names the preview for assistive tech. @default `labels.preview(subject)` ("Email preview: <subject>") */
  'aria-label'?: string;
  /** Its own words (the envelope's names, the switch, the footer's links), over `emailPreviewLabels`. */
  labels?: Partial<EmailPreviewLabels>;
}

/**
 * Email preview: an email as the person who gets it sees it, before it is sent. The envelope (To, From, Reply-to, the
 * subject in bold), then the email in a frame on the stage grey: the platform's logo, a heading, the body, a button and
 * the grey footer, at an email's desktop width or a phone's. Use it beside an email's fields (Messaging's automated
 * and custom emails, a phase's notification emails); the fields themselves are Text fields and a Rich text editor.
 *
 * - The email is inert: its button and links are pictures of what the person gets, never pressed.
 * - The Desktop / Phone switch is a Segmented control (`showDeviceSwitch`); `device` controls it from the page.
 * - Right to left, the envelope's names and the email's text start at the right.
 *
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <EmailPreview subject="New comment on your input" to="Input authors" from="Larkvale" logo={<Logo />}
 *   title="Someone commented on your input" buttonText="View the comment">
 *   <p>Resident B replied to “Shade on Elm Street”.</p>
 * </EmailPreview>
 * ```
 */
export function EmailPreview({
  subject,
  to,
  from,
  replyTo,
  logo,
  logoLabel,
  title,
  headingLevel = 3,
  children,
  buttonText,
  footer,
  footerNote,
  device,
  defaultDevice = 'desktop',
  onDeviceChange,
  showDeviceSwitch = true,
  'aria-label': ariaLabel,
  labels,
  className,
  style
}: EmailPreviewProps) {
  const l = mergeLabels(emailPreviewLabels, labels);
  const [current, setDevice] = usePreviewDevice(device, defaultDevice, onDeviceChange);
  const Heading = `h${headingLevel}` as const;
  const envelope: [string, ReactNode][] = [];
  if (to != null) envelope.push([l.to, to]);
  if (from != null) envelope.push([l.from, from]);
  if (replyTo != null) envelope.push([l.replyTo, replyTo]);
  const links = footer === undefined
    ? (
      <p className="gv-email-preview__links">
        <span>{l.unsubscribe}</span>
        <span>{l.terms}</span>
        <span>{l.privacy}</span>
      </p>
    )
    : footer;
  return (
    <section className={clsx('gv-email-preview', className)} style={style} aria-label={ariaLabel ?? l.preview(subject)}>
      <div className="gv-email-preview__top">
        <dl className="gv-email-preview__envelope">
          {envelope.map(([name, value]) => (
            <div key={name} className="gv-email-preview__field">
              <dt>{name}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className="gv-email-preview__field" data-subject>
            <dt>{l.subject}</dt>
            <dd>{subject}</dd>
          </div>
        </dl>
        {showDeviceSwitch && (
          <PreviewDeviceSwitch device={current} onChange={setDevice} label={l.device} desktop={l.desktop} phone={l.phone} />
        )}
      </div>
      <div className="gv-email-preview__stage">
        <div className="gv-email-preview__frame" data-device={current}>
          <div className="gv-email-preview__head">
            {logo != null ? (
              <span className="gv-email-preview__logo" role="img" aria-label={logoLabel ?? l.logo}>{logo}</span>
            ) : (
              <span className="gv-email-preview__logo" data-placeholder role="img" aria-label={logoLabel ?? l.logo} />
            )}
          </div>
          <div className="gv-email-preview__body">
            {title != null && <Heading className="gv-email-preview__title">{title}</Heading>}
            {children}
            {buttonText != null && <span className="gv-email-preview__button">{buttonText}</span>}
          </div>
          {(links != null || footerNote != null) && (
            <div className="gv-email-preview__foot">
              {links}
              {footerNote != null && <p className="gv-email-preview__note">{footerNote}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

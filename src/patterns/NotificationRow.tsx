'use client';
import {useState, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {ArrowLeft, ChevronRight, Clock, User} from 'lucide-react';
import {Switch} from '../components/Switch';
import {TextField} from '../components/TextField';
import {IconButton} from '../components/gv/IconButton';
import {RichTextEditor} from '../components/gv/RichTextEditor';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './NotificationRow.css';

/** On or off, controlled or not. */
function useOnOff(isSelected: boolean | undefined, defaultSelected: boolean, onChange?: (on: boolean) => void) {
  const [inner, setInner] = useState(defaultSelected);
  const on = isSelected ?? inner;
  return [
    on,
    (next: boolean) => {
      setInner(next);
      onChange?.(next);
    }
  ] as const;
}

interface OnOff {
  /** The email goes out (controlled). */
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
}

function Meta({who, when}: {who: ReactNode; when: ReactNode}) {
  return (
    <span className="gv-notification-row__meta">
      <span>
        <User aria-hidden size={14} />
        {who}
      </span>
      <span>
        <Clock aria-hidden size={14} />
        {when}
      </span>
    </span>
  );
}

export interface NotificationRowProps extends OnOff, PlacementProps {
  /** The email's name ("A reply on my comment"). */
  children: string;
  /** Who it goes to ("User who commented"). */
  who: ReactNode;
  /** What sends it ("User replies to comment"). */
  when: ReactNode;
  /** Opens the email's page (its fields; the email itself on the stage). Only while it is on: an email that is off isn't edited. */
  onOpen?: () => void;
}

/**
 * One email in a phase's Notifications card (prototype `.pjacc2.pjnf`): a switch, then the email's name with who it
 * goes to and what sends it, and a chevron to its page. Off, the name greys and the row opens nothing. Not in Figma.
 */
export function NotificationRow({children, who, when, onOpen, isSelected, defaultSelected = true, onChange, className, style}: NotificationRowProps) {
  const [on, setOn] = useOnOff(isSelected, defaultSelected, onChange);
  const label = (
    <>
      <span className="gv-notification-row__name">{children}</span>
      <Meta who={who} when={when} />
    </>
  );
  return (
    <div className={clsx('gv-notification-row', className)} style={style} data-off={!on || undefined}>
      <Switch aria-label={children} isSelected={on} onChange={setOn}>
        {null}
      </Switch>
      {on ? (
        <Button className="gv-notification-row__open" onPress={onOpen} aria-label={`Edit ${children}`}>
          <span className="gv-notification-row__text">{label}</span>
          <ChevronRight className="gv-notification-row__chevron" aria-hidden size={16} />
        </Button>
      ) : (
        <span className="gv-notification-row__text">{label}</span>
      )}
    </div>
  );
}

export interface NotificationRowListProps extends PlacementProps {
  /** One `NotificationRow` per email. */
  children: ReactNode;
  /** Names the group. @default 'Emails' */
  'aria-label'?: string;
}

/** The emails, one row each. (The app shell's bell list is `NotificationList`.) */
export function NotificationRowList({children, 'aria-label': ariaLabel = 'Emails', className, style}: NotificationRowListProps) {
  return (
    <div className={clsx('gv-notification-list', className)} style={style} role="group" aria-label={ariaLabel}>
      {children}
    </div>
  );
}

export interface NotificationEmailProps extends OnOff, PlacementProps {
  /** The email's name: the page's title. */
  name: string;
  who: ReactNode;
  when: ReactNode;
  /** The ← back to the phase's setup. */
  onBack?: () => void;
  /** @default 'Back to setup' */
  backLabel?: string;
  /** Where replies go. */
  replyTo?: string;
  subject?: string;
  /** Leave it out for an email that has no title. */
  title?: string;
  introduction?: string;
  /** Leave it out for an email that has no button. */
  buttonText?: string;
}

/**
 * An email's page, in the panel where the setup was (prototype `.pj-notifpage`): ← and its name, the switch "Send this
 * email" with who it goes to and what sends it, then its fields. The email itself shows on the stage beside it.
 */
export function NotificationEmail({
  name,
  who,
  when,
  onBack,
  backLabel = 'Back to setup',
  replyTo,
  subject,
  title,
  introduction = '',
  buttonText,
  isSelected,
  defaultSelected = true,
  onChange,
  className,
  style
}: NotificationEmailProps) {
  const [on, setOn] = useOnOff(isSelected, defaultSelected, onChange);
  const [intro, setIntro] = useState(introduction);
  return (
    <section className={clsx('gv-notification-email', className)} style={style} aria-label={name}>
      <div className="gv-notification-email__head">
        <IconButton aria-label={backLabel} onPress={onBack}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h2 className="gv-notification-email__title">{name}</h2>
      </div>
      <div className="gv-notification-row" data-off={!on || undefined}>
        <Switch aria-label="Send this email" isSelected={on} onChange={setOn}>
          {null}
        </Switch>
        <span className="gv-notification-row__text">
          <Meta who={who} when={when} />
        </span>
      </div>
      <div className="gv-notification-email__fields">
        <TextField label="Replies should go to" defaultValue={replyTo} type="email" />
        <hr className="gv-notification-email__rule" />
        <TextField label="Subject" defaultValue={subject} />
        {title != null && <TextField label="Title" defaultValue={title} />}
        <div className="gv-notification-email__field">
          <span className="gv-notification-email__label" aria-hidden="true">
            Introduction
          </span>
          <RichTextEditor aria-label="Introduction" placeholder="Add an introduction" value={intro} onChange={setIntro} />
        </div>
        {buttonText != null && <TextField label="Button text" defaultValue={buttonText} />}
      </div>
    </section>
  );
}

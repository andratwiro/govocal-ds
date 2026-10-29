'use client';
import {useState, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {ArrowLeft, ChevronRight, Clock, User} from 'lucide-react';
import {Switch} from '../components/Switch';
import {TextField} from '../components/TextField';
import {IconButton} from '../components/gv/IconButton';
import {RichTextEditor} from '../components/gv/RichTextEditor';
import {richTextToolbarLabels, type RichTextToolbarLabels} from '../components/gv/RichTextToolbar';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './NotificationRow.css';

/** The words Notification row says itself (docs/API.md rule 11). */
export interface NotificationRowLabels {
  /** The row's button name, given the email's name. */
  edit: (email: string) => string;
}

/** Notification row's English words; a page passes its own over them with `labels`. */
export const notificationRowLabels: NotificationRowLabels = {edit: email => `Edit ${email}`};

/** The words Notification row list says itself (docs/API.md rule 11). */
export interface NotificationRowListLabels {
  /** The group's name, when no `aria-label` is given. */
  emails: string;
}

/** Notification row list's English words; a page passes its own over them with `labels`. */
export const notificationRowListLabels: NotificationRowListLabels = {emails: 'Emails'};

/** The words Notification email says itself (docs/API.md rule 11), with the rich-text toolbar's, which it hands on. */
export interface NotificationEmailLabels extends RichTextToolbarLabels {
  /** The ←'s name: back to the phase's setup. */
  back: string;
  /** The switch's name. */
  send: string;
  /** The fields' labels. */
  replyTo: string;
  /** The Subject field's label. */
  subject: string;
  /** The Title field's label. */
  title: string;
  /** The Introduction field's label and the editor's name. */
  introduction: string;
  /** The Introduction editor's hint while empty. */
  introductionPlaceholder: string;
  /** The Button text field's label. */
  buttonText: string;
}

/** Notification email's English words; a page passes its own over them with `labels`. */
export const notificationEmailLabels: NotificationEmailLabels = {
  ...richTextToolbarLabels,
  back: 'Back to setup',
  send: 'Send this email',
  replyTo: 'Replies should go to',
  subject: 'Subject',
  title: 'Title',
  introduction: 'Introduction',
  introductionPlaceholder: 'Add an introduction',
  buttonText: 'Button text'
};

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
  /** Whether the email starts on, when `isSelected` is not given. @default true */
  defaultSelected?: boolean;
  /** Fires when the switch is turned on or off, with whether the email is now on. */
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
  /** Its own words (the button's name), over `notificationRowLabels`. */
  labels?: Partial<NotificationRowLabels>;
}

/**
 * One email in a phase's Notifications card (prototype `.pjacc2.pjnf`): a switch, then the email's name with who it
 * goes to and what sends it, and a chevron to its page. Off, the name greys and the row opens nothing. Not in Figma.
 */
export function NotificationRow({children, who, when, onOpen, isSelected, defaultSelected = true, onChange, labels, className, style}: NotificationRowProps) {
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
        <Button className="gv-notification-row__open" onPress={onOpen} aria-label={mergeLabels(notificationRowLabels, labels).edit(children)}>
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
  /** Names the group. @default `labels.emails` ("Emails") */
  'aria-label'?: string;
  /** Its own words, over `notificationRowListLabels`. */
  labels?: Partial<NotificationRowListLabels>;
}

/** The emails, one row each. (The app shell's bell list is `NotificationList`.) */
export function NotificationRowList({children, 'aria-label': ariaLabel, labels, className, style}: NotificationRowListProps) {
  return (
    <div className={clsx('gv-notification-row-list', className)} style={style} role="group"
      aria-label={ariaLabel ?? mergeLabels(notificationRowListLabels, labels).emails}>
      {children}
    </div>
  );
}

export interface NotificationEmailProps extends OnOff, PlacementProps {
  /** The email's name: the page's title. */
  name: string;
  /** Who it goes to ("User who commented"). */
  who: ReactNode;
  /** What sends it ("User replies to comment"). */
  when: ReactNode;
  /** The ← back to the phase's setup. */
  onBack?: () => void;
  /** Where replies go. */
  replyTo?: string;
  /** The Subject field's starting text. */
  subject?: string;
  /** Leave it out for an email that has no title. */
  title?: string;
  /** The Introduction's starting text. @default '' */
  introduction?: string;
  /** Leave it out for an email that has no button. */
  buttonText?: string;
  /** Its own words (the ←'s name, the switch's, the fields' labels, the toolbar's), over `notificationEmailLabels`.
   * Name the way back: `labels={{back: 'Back to Ideation setup'}}`. */
  labels?: Partial<NotificationEmailLabels>;
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
  replyTo,
  subject,
  title,
  introduction = '',
  buttonText,
  isSelected,
  defaultSelected = true,
  onChange,
  labels,
  className,
  style
}: NotificationEmailProps) {
  const l = mergeLabels(notificationEmailLabels, labels);
  const [on, setOn] = useOnOff(isSelected, defaultSelected, onChange);
  const [intro, setIntro] = useState(introduction);
  return (
    <section className={clsx('gv-notification-email', className)} style={style} aria-label={name}>
      <div className="gv-notification-email__head">
        <IconButton aria-label={l.back} onPress={onBack}>
          <ArrowLeft aria-hidden />
        </IconButton>
        <h2 className="gv-notification-email__title">{name}</h2>
      </div>
      <div className="gv-notification-row" data-off={!on || undefined}>
        <Switch aria-label={l.send} isSelected={on} onChange={setOn}>
          {null}
        </Switch>
        <span className="gv-notification-row__text">
          <Meta who={who} when={when} />
        </span>
      </div>
      <div className="gv-notification-email__fields">
        <TextField label={l.replyTo} defaultValue={replyTo} type="email" />
        <hr className="gv-notification-email__rule" />
        <TextField label={l.subject} defaultValue={subject} />
        {title != null && <TextField label={l.title} defaultValue={title} />}
        <div className="gv-notification-email__field">
          <span className="gv-notification-email__label" aria-hidden="true">
            {l.introduction}
          </span>
          <RichTextEditor aria-label={l.introduction} placeholder={l.introductionPlaceholder} labels={l} value={intro}
            onChange={setIntro} />
        </div>
        {buttonText != null && <TextField label={l.buttonText} defaultValue={buttonText} />}
      </div>
    </section>
  );
}

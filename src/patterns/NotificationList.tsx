'use client';
import type {ReactNode} from 'react';
import {Button} from '../components/Button';
import {Link} from 'react-aria-components/Link';
import {NewDot} from '../components/gv/NewDot';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './NotificationList.css';

/** The words Notification list says itself (docs/API.md rule 11). */
export interface NotificationListLabels {
  /** The title, when no `title` is given. */
  title: string;
  markAllRead: string;
  /** What an empty list says, when no `emptyLabel` is given. */
  empty: string;
  /** An unread row's dot. */
  unread: string;
}

/** Notification list's English words; a page passes its own over them with `labels`. */
export const notificationListLabels: NotificationListLabels = {
  title: 'Notifications',
  markAllRead: 'Mark all as read',
  empty: "You don't have any notifications yet",
  unread: 'Unread'
};

export interface NotificationItem {
  id: string;
  /** What happened ("Your report for Riverside Park is ready"). */
  text: ReactNode;
  /** When, as shown ("2 h ago"). */
  time: string;
  isUnread?: boolean;
  /** Where the notification leads. */
  href?: string;
  /** A small leading icon, e.g. `<MessageSquare aria-hidden size={16} />`. */
  icon?: ReactNode;
}

export interface NotificationListProps extends PlacementProps {
  /** @default `labels.title` ("Notifications") */
  title?: string;
  items: NotificationItem[];
  /** Shows "Mark all as read". It stays enabled once all are read, so focus never drops out of the panel. */
  onMarkAllRead?: () => void;
  /** @default `labels.empty` ("You don't have any notifications yet") */
  emptyLabel?: string;
  /** Its own words (the title, Mark all as read, the empty line, Unread), over `notificationListLabels`. */
  labels?: Partial<NotificationListLabels>;
}

/**
 * The notifications list the admin sidebar's bell opens (the real admin's notification menu):
 * a title with "Mark all as read", then one row per notification, newest first, unread ones
 * bolder and with a red dot. Put it in a Popover + Dialog. Not in Figma yet.
 */
export function NotificationList({title, items, onMarkAllRead, emptyLabel, labels, className, style}: NotificationListProps) {
  const l = mergeLabels(notificationListLabels, labels);
  return (
    <div className={clsx('gv-notification-list', className)} style={style}>
      <div className="gv-notification-list__head">
        <h2 className="gv-notification-list__title">{title ?? l.title}</h2>
        {onMarkAllRead && <Button variant="quiet" size={32} onPress={onMarkAllRead}>{l.markAllRead}</Button>}
      </div>
      {items.length === 0
        ? <p className="gv-notification-list__empty">{emptyLabel ?? l.empty}</p>
        : (
          <ul className="gv-notification-list__items">
            {items.map(item => (
              <li key={item.id} className="gv-notification-list__item" data-unread={item.isUnread || undefined}>
                {item.icon && <span className="gv-notification-list__icon" aria-hidden>{item.icon}</span>}
                <span className="gv-notification-list__body">
                  {item.href
                    ? <Link className="gv-notification-list__text" href={item.href}>{item.text}</Link>
                    : <span className="gv-notification-list__text">{item.text}</span>}
                  <span className="gv-notification-list__time">{item.time}</span>
                </span>
                {item.isUnread && <NewDot aria-label={l.unread} />}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

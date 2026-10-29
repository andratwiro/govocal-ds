'use client';
import type {ReactNode} from 'react';
import {Button} from '../components/Button';
import {Link} from '../components/Link';
import {NewDot} from '../components/gv/NewDot';
import './NotificationList.css';

export interface NotificationItem {
  id: string;
  /** What happened ("Your report for Riverside Park is ready"). */
  text: ReactNode;
  /** When, as shown ("2 h ago"). */
  time: string;
  unread?: boolean;
  /** Where the notification leads. */
  href?: string;
  /** A small leading icon, e.g. `<MessageSquare aria-hidden size={16} />`. */
  icon?: ReactNode;
}

export interface NotificationListProps {
  /** @default 'Notifications' */
  title?: string;
  items: NotificationItem[];
  /** Shows "Mark all as read". It stays enabled once all are read, so focus never drops out of the panel. */
  onMarkAllRead?: () => void;
  /** @default "You don't have any notifications yet" */
  emptyText?: string;
}

/**
 * The notifications list the admin sidebar's bell opens (the real admin's notification menu):
 * a title with "Mark all as read", then one row per notification, newest first, unread ones
 * bolder and with a red dot. Put it in a Popover + Dialog. Not in Figma yet.
 */
export function NotificationList({title = 'Notifications', items, onMarkAllRead, emptyText = "You don't have any notifications yet"}: NotificationListProps) {
  return (
    <div className="gv-notification-list">
      <div className="gv-notification-list__head">
        <h2 className="gv-notification-list__title">{title}</h2>
        {onMarkAllRead && <Button variant="quiet" size={32} onPress={onMarkAllRead}>Mark all as read</Button>}
      </div>
      {items.length === 0
        ? <p className="gv-notification-list__empty">{emptyText}</p>
        : (
          <ul className="gv-notification-list__items">
            {items.map(item => (
              <li key={item.id} className="gv-notification-list__item" data-unread={item.unread || undefined}>
                {item.icon && <span className="gv-notification-list__icon" aria-hidden>{item.icon}</span>}
                <span className="gv-notification-list__body">
                  {item.href
                    ? <Link className="gv-notification-list__text" href={item.href}>{item.text}</Link>
                    : <span className="gv-notification-list__text">{item.text}</span>}
                  <span className="gv-notification-list__time">{item.time}</span>
                </span>
                {item.unread && <NewDot aria-label="Unread" />}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}

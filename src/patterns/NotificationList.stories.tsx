import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {useState} from 'react';
import {FileChartColumn, Inbox, MessageSquare} from 'lucide-react';
import {NotificationList, type NotificationItem} from './NotificationList';

const meta: Meta<typeof NotificationList> = {
  title: 'Patterns/App shell/Notification list',
  component: NotificationList,
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryObj<typeof NotificationList>;

const ITEMS: NotificationItem[] = [
  {id: '1', text: 'A resident commented on your input', time: '12 min ago', isUnread: true, href: '#', icon: <MessageSquare aria-hidden size={16} />},
  {id: '2', text: '3 new inputs in Collect ideas', time: '1 h ago', isUnread: true, href: '#', icon: <Inbox aria-hidden size={16} />},
  {id: '3', text: 'Your report for Riverside Park is ready', time: 'Yesterday', href: '#', icon: <FileChartColumn aria-hidden size={16} />}
];

/** Unread rows are bolder and carry the red dot; "Mark all as read" clears them. */
export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(ITEMS);
    return <NotificationList items={items} onMarkAllRead={() => setItems(is => is.map(i => ({...i, isUnread: false})))} />;
  }
};

export const AllRead: Story = {name: 'All read', args: {items: ITEMS.map(i => ({...i, isUnread: false})), onMarkAllRead: () => {}}};

export const Empty: Story = {args: {items: []}};

/**
 * The keys the list takes: Tab reaches "Mark all as read", then each notification that leads somewhere; Enter on
 * "Mark all as read" clears every unread dot. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: () => {
    const [items, setItems] = useState(ITEMS);
    return <NotificationList items={items} onMarkAllRead={() => setItems(is => is.map(i => ({...i, isUnread: false})))} />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('img', {name: 'Unread'})).toHaveLength(2);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Mark all as read'})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', {name: 'A resident commented on your input'})).toHaveFocus();
    await userEvent.tab({shift: true});
    await userEvent.keyboard('{Enter}');
    await expect(canvas.queryAllByRole('img', {name: 'Unread'})).toHaveLength(0);
    await expect(canvas.getByRole('button', {name: 'Mark all as read'})).toHaveFocus();
  }
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';
import {StatCard} from './StatCard';

const WEEKS = [4, 9, 15, 22, 31, 44, 58, 79, 101, 126, 158, 190, 215];

const meta: Meta<typeof StatCard> = {
  title: 'Patterns/Project page/Stat card',
  component: StatCard,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof StatCard>;

/** "Collecting now": participants so far, weekly, and a chevron to the audience. */
export const Pressable: Story = {name: 'Default', args: {label: 'Participants', value: '215', series: WEEKS, caption: 'Weekly, since 6 May', onPress: () => {}}};

/** Display only: no chevron, not a button. */
export const Static: Story = {args: {label: 'Participants', value: '215', series: WEEKS, caption: 'Weekly, since 6 May'}};

/** Nothing gathered yet: the number alone, with a line that says when it fills. */
export const Empty: Story = {args: {label: 'Participants', value: '0', caption: 'Numbers appear here once participants take part'}};

/**
 * A card that opens a detail, by keyboard: Tab reaches it, Enter opens. A display-only card takes no tab stop. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: function Render() {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <StatCard label="Visitors" value="1,890" series={WEEKS} caption="Weekly, since 6 May" />
        <StatCard label="Participants" value="215" series={WEEKS} caption="Weekly, since 6 May" onPress={() => setOpened(true)} />
        <span role="status">{opened ? 'Audience opened' : 'Nothing opened'}</span>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: /Participants/})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Audience opened');
  }
};

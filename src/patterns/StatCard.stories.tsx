import type {Meta, StoryObj} from '@storybook/react-vite';
import {StatCard} from './StatCard';

const WEEKS = [4, 9, 15, 22, 31, 44, 58, 79, 101, 126, 158, 190, 215];

const meta: Meta<typeof StatCard> = {
  title: 'Patterns/Project page/Stat card',
  component: StatCard,
  tags: ['autodocs', 'not-in-figma'],
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

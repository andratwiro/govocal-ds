import type {Meta, StoryObj} from '@storybook/react-vite';
import {ActionRow} from './ActionRow';

const meta: Meta<typeof ActionRow> = {
  title: 'Patterns/Project page/Action row',
  component: ActionRow,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 264}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof ActionRow>;

export const Default: Story = {args: {children: 'Message participants', href: '#'}};

export const WithBadge: Story = {name: 'With badge', args: {children: 'Review new ideas', badge: '18 new', href: '#'}};

/** "Next actions": rows in a stack. */
export const NextActions: Story = {
  name: 'Next actions',
  render: () => (
    <div style={{display: 'grid', gap: 8}}>
      <ActionRow href="#messaging">Message participants</ActionRow>
      <ActionRow href="#reporting">Create report</ActionRow>
    </div>
  )
};

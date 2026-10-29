import {Avatar} from './Avatar';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-62'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Avatar>;

/** Figma's Avatar (28, filled); the 24 and 16 sizes and the unassigned ring are Not in Figma (the prototype's). */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Avatar initials="S" aria-label="Assigned to Sam" />
    <Avatar initials="JL" size={24} aria-label="Assigned to Jo Lee" />
    <Avatar initials="R" size={16} aria-label="Assigned to Riley Chen" />
    <Avatar unassigned aria-label="Unassigned" />
  </div>
);

export const Filled: Story = () => <Avatar initials="S" aria-label="Assigned to Sam" />;

/** Not in Figma: the prototype's unassigned ring. */
export const Unassigned: Story = () => <Avatar unassigned aria-label="Unassigned" />;

/** The header's people stack: each avatar 6 over the one before (prototype `.pj-avstack`). */
export const Stack: Story = () => (
  <div style={{display: 'flex'}}>
    <Avatar initials="S" aria-label="Sam" />
    <div style={{marginLeft: -6}}>
      <Avatar initials="JL" aria-label="Jo Lee" />
    </div>
    <div style={{marginLeft: -6}}>
      <Avatar unassigned aria-label="Unassigned" />
    </div>
  </div>
);

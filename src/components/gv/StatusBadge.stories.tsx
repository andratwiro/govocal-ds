import {StatusBadge} from './StatusBadge';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof StatusBadge> = {
  title: 'Components/Status & feedback/Status badge',
  component: StatusBadge,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-881'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof StatusBadge>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <StatusBadge state="draft">Draft</StatusBadge>
    <StatusBadge state="live">Live</StatusBadge>
  </div>
);

export const Draft: Story = () => <StatusBadge state="draft">Draft</StatusBadge>;

export const Live: Story = () => <StatusBadge state="live">Live</StatusBadge>;

import {Badge} from './Badge';
import {Lightbulb} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Badge> = {
  title: 'Components/Status & feedback/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-880'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Badge>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Badge icon={<Lightbulb aria-hidden size={14} />}>Idea</Badge>
    <Badge>6 questions</Badge>
  </div>
);

export const IconYes: Story = () => <Badge icon={<Lightbulb aria-hidden size={14} />}>Idea</Badge>;
IconYes.storyName = 'With icon';

export const IconNo: Story = () => <Badge>6 questions</Badge>;
IconNo.storyName = 'Without icon';

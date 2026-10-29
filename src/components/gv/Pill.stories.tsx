import {Pill} from './Pill';
import {Lightbulb} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Pill> = {
  title: 'Components/Pill',
  component: Pill,
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
type Story = StoryFn<typeof Pill>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Pill icon={<Lightbulb aria-hidden size={14} />}>Idea</Pill>
    <Pill>6 questions</Pill>
  </div>
);

export const IconYes: Story = () => <Pill icon={<Lightbulb aria-hidden size={14} />}>Idea</Pill>;

export const IconNo: Story = () => <Pill>6 questions</Pill>;

import {NewDot} from './NewDot';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof NewDot> = {
  title: 'Components/Status & feedback/New dot',
  component: NewDot,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-384'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof NewDot>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
    <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
      Green Corridors for Riverside <NewDot aria-label="New activity" />
    </span>
  </div>
);

export const Example: Story = () => <NewDot />;

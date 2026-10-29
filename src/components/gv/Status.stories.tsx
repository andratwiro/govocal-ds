import {Status} from './Status';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Status> = {
  title: 'Components/Status',
  component: Status,
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
type Story = StoryFn<typeof Status>;

export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Status state="draft">Draft</Status>
    <Status state="live">Live</Status>
  </div>
);

export const Draft: Story = () => <Status state="draft">Draft</Status>;

export const Live: Story = () => <Status state="live">Live</Status>;

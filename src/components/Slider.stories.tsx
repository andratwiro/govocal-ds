import {Slider} from './Slider';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Slider> = {
  component: Slider,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Slider>;

export const Example: Story = args => <Slider {...args} style={{width: 200}} />;

Example.args = {
  label: 'Range',
  defaultValue: [30, 60],
  thumbLabels: ['start', 'end']
};

export const AllStates: StoryFn<typeof Slider> = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 24, width: 260}}>
    <Slider label="Maximum likes per participant" defaultValue={5} minValue={1} maxValue={10} />
    <Slider
      label="Maximum likes per participant"
      defaultValue={3}
      minValue={1}
      maxValue={10}
      isDisabled
    />
  </div>
);

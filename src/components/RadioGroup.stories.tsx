import {RadioGroup, Radio} from './RadioGroup';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof RadioGroup>;

export const Example: Story = args => (
  <RadioGroup {...args}>
    <Radio value="soccer">Soccer</Radio>
    <Radio value="baseball">Baseball</Radio>
    <Radio value="basketball">Basketball</Radio>
  </RadioGroup>
);

Example.args = {
  label: 'Favorite sport'
};

export const AllStates: StoryFn<typeof RadioGroup> = () => (
  <div style={{display: 'flex', gap: 32}}>
    <RadioGroup label="Who can take part" defaultValue="anyone">
      <Radio value="anyone">Anyone</Radio>
      <Radio value="selection">Selected groups</Radio>
      <Radio value="admins">Admins and managers only</Radio>
    </RadioGroup>
    <RadioGroup label="Voting method" defaultValue="single" isDisabled>
      <Radio value="single">Single choice</Radio>
      <Radio value="multiple">Multiple choice</Radio>
    </RadioGroup>
  </div>
);

import {Switch} from './Switch';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Switch> = {
  component: Switch,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Switch>;

export const Example: Story = args => <Switch {...args}>Wi-Fi</Switch>;

export const AllStates: StoryFn<typeof Switch> = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
    <Switch>Allow anonymous participation</Switch>
    <Switch defaultSelected>Send a confirmation email</Switch>
    <Switch isDisabled>Maximum likes per participant</Switch>
    <Switch isDisabled defaultSelected>
      Reactions enabled
    </Switch>
  </div>
);

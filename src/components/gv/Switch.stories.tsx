import {expect, userEvent, within} from 'storybook/test';
import {useState} from 'react';
import {Switch} from '../Switch';
import {NumberField} from '../NumberField';
import {Badge} from './Badge';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Switch> = {
  title: 'Components/Forms/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=24-508'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Switch>;

/** Off, on, disabled: the form toggle (36×20), the prototype's near-black "on". */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Switch>Allow anonymous participation</Switch>
      <Switch defaultSelected>Send a confirmation email</Switch>
      <Switch isDisabled>Maximum likes per participant</Switch>
      <Switch isDisabled defaultSelected>
        Reactions enabled
      </Switch>
    </div>
  )
};

export const WithDescription: Story = {
  name: 'With description',
  render: () => (
    <div style={{width: 320}}>
      <Switch defaultSelected description="Participants can post without creating an account.">
        Allow anonymous participation
      </Switch>
    </div>
  )
};

/** Not in Figma: a switch that reveals fields once on (Event registration's spot limit). */
function RevealedExample() {
  const [isSelected, setIsSelected] = useState(true);
  return (
    <div style={{width: 320, display: 'flex', flexDirection: 'column', gap: 12}}>
      <Switch isSelected={isSelected} onChange={setIsSelected}>
        Limit the number of spots
      </Switch>
      {isSelected && <NumberField label="Number of spots" defaultValue={50} minValue={1} />}
    </div>
  );
}

export const WithRevealedFields: Story = {
  name: 'With revealed fields',
  render: () => <RevealedExample />
};

export const WithBadge: Story = {
  name: 'With badge',
  render: () => (
    <div style={{width: 320}}>
      <Switch defaultSelected description="Draft page sections before they're part of the project.">
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
          Content builder
          <Badge>New</Badge>
        </span>
      </Switch>
    </div>
  )
};

export const Disabled: Story = {
  render: () => <Switch isDisabled>Maximum likes per participant</Switch>
};

/** The keyboard, proved by this story's play function: Tab skips a disabled switch and lands on the next; Space turns
 * it on and off. */
export const Keyboard: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Switch isDisabled>Maximum likes per participant</Switch>
      <Switch>Allow anonymous participation</Switch>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', {name: 'Allow anonymous participation'});
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
  }
};

import {Checkbox} from './Checkbox';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-317'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/** Unchecked, checked, indeterminate and disabled (Figma draws only the box; the states are the prototype's), then Figma's quiet select-all. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Checkbox>Notify me of new ideas on "Green Corridors for Riverside"</Checkbox>
      <Checkbox defaultSelected>Notify me of new ideas on "Green Corridors for Riverside"</Checkbox>
      <Checkbox isIndeterminate>Select all proposals in this phase</Checkbox>
      <Checkbox isDisabled>Allow anonymous submissions</Checkbox>
      <Checkbox isDisabled defaultSelected>
        Allow anonymous submissions
      </Checkbox>
      <Checkbox isQuiet aria-label="Select all ideas" />
    </div>
  )
};

export const Default: Story = {
  render: () => <Checkbox>Subscribe to project updates</Checkbox>
};

export const Selected: Story = {
  render: () => <Checkbox defaultSelected>Subscribe to project updates</Checkbox>
};

export const Indeterminate: Story = {
  render: () => <Checkbox isIndeterminate>Select all proposals</Checkbox>
};

export const WithDescription: Story = {
  render: () => (
    <Checkbox description="You can change this later in project settings.">
      Allow participants to co-sponsor proposals
    </Checkbox>
  )
};

/** Figma's Checkbox as drawn: dimmed until hovered or checked, for a list header's select-all. */
export const Quiet: Story = {
  render: () => <Checkbox isQuiet aria-label="Select all ideas" />
};

export const Disabled: Story = {
  render: () => <Checkbox isDisabled>Enable the voting phase</Checkbox>
};

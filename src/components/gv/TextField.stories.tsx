import {TextField} from '../TextField';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof TextField> = {
  title: 'Components/Forms/Text field',
  component: TextField,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-224'
    }
  },
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter your full name'
  }
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {label: 'Name'}
};

/** The project slug: a fixed, un-editable prefix inside the field. */
export const WithPrefix: Story = {
  name: 'With prefix',
  args: {
    label: 'Project URL',
    prefix: 'internal.govocal.com/en/projects/',
    placeholder: 'green-corridors',
    defaultValue: 'green-corridors'
  }
};

/** A live "N/max" count under the field (Add a statement, Recipients). */
export const WithCounter: Story = {
  name: 'With counter',
  args: {
    label: 'Statement',
    maxLength: 140,
    showCounter: true,
    defaultValue: 'More cycle paths along the river.'
  }
};

export const ReadOnly: Story = {
  name: 'Read only',
  args: {label: 'Project URL', isReadOnly: true, defaultValue: 'green-corridors'}
};

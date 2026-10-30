import {RequiredMarker} from './RequiredMarker';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RequiredMarker> = {
  title: 'Components/Forms/Required marker',
  component: RequiredMarker,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-878'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryObj<typeof RequiredMarker>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 32}}>
      <RequiredMarker placement="card" />
      <RequiredMarker placement="field" />
    </div>
  )
};

export const Card: Story = {
  args: {placement: 'card'}
};

export const Field: Story = {
  args: {placement: 'field'}
};

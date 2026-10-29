import {TitleField} from './TitleField';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof TitleField> = {
  title: 'Components/Forms/Title field',
  component: TitleField,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-123'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof TitleField>;

/** Empty, required, filled, invalid. Figma draws the required one; the invalid state is Not in Figma. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 444}}>
      <TitleField />
      <TitleField isRequired />
      <TitleField defaultValue="Green Corridors for Riverside" isRequired />
      <TitleField isInvalid isRequired errorMessage="Give your project a title" />
    </div>
  )
};

export const Empty: Story = {
  args: {},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Required: Story = {
  args: {isRequired: true},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Filled: Story = {
  args: {defaultValue: 'Green Corridors for Riverside', isRequired: true},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

export const Invalid: Story = {
  args: {isInvalid: true, isRequired: true, errorMessage: 'Give your project a title'},
  decorators: [Story => <div style={{width: 444}}><Story /></div>]
};

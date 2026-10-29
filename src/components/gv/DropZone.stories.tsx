import {DropZone} from './DropZone';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof DropZone> = {
  title: 'Components/Forms/Drop zone',
  component: DropZone,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-490'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof DropZone>;

/** Figma's drop zone, then disabled (Not in Figma). */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 370}}>
      <DropZone />
      <DropZone isDisabled />
    </div>
  )
};

export const Default: Story = {
  decorators: [Story => <div style={{width: 370}}><Story /></div>]
};

export const Disabled: Story = {
  args: {isDisabled: true},
  decorators: [Story => <div style={{width: 370}}><Story /></div>]
};

export const CustomLabel: Story = {
  name: 'Custom label',
  args: {children: 'Drop your cover image here, or browse', acceptedFileTypes: ['image/*']},
  decorators: [Story => <div style={{width: 370}}><Story /></div>]
};

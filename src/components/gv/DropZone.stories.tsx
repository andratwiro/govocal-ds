import {Button} from '../Button';
import {expect, userEvent, within} from 'storybook/test';
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

/** The prototype's `.gv-dropzone` (Add a cause, Add input, Event image): one row, a hint line under
 * the label. */
export const Compact: Story = {
  args: {
    density: 'compact',
    children: 'Drag an image here, or browse',
    hint: 'PNG or JPG · max 5 MB',
    acceptedFileTypes: ['image/png', 'image/jpeg']
  },
  decorators: [Story => <div style={{width: 370}}><Story /></div>]
};

/** The keyboard, proved by this story's play function: Tab reaches the zone, which is one button; a disabled zone is
 * skipped. */
export const Keyboard: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 370}}>
      <DropZone />
      <DropZone isDisabled>Drop a cover image here</DropZone>
      <Button variant="secondary">Next</Button>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const zone = canvas.getByRole('button', {name: /Drop a file here or browse/});
    const disabled = canvas.getByRole('button', {name: /Drop a cover image here/});
    const next = canvas.getByRole('button', {name: 'Next'});
    let reached = false;
    for (let i = 0; i < 6 && document.activeElement !== next; i++) {
      await userEvent.tab();
      if (document.activeElement === zone) reached = true;
      await expect(disabled).not.toHaveFocus();
    }
    await expect(reached).toBe(true);
    await expect(next).toHaveFocus();
  }
};

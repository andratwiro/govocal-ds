import {IconButton} from './IconButton';
import {Settings, Trash2, ChevronDown, ChevronLeft, ChevronRight} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';

const meta: Meta<typeof IconButton> = {
  title: 'Components/Actions/Icon button',
  component: IconButton,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=13-269'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof IconButton>;

/** Figma's three Style × Tone variants (variant × emphasis), then (Not in Figma) the prototype's 24 size and disabled. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <IconButton variant="ghost" emphasis="default" aria-label="Settings for Green Corridors for Riverside">
      <Settings aria-hidden size={16} />
    </IconButton>
    <IconButton variant="ghost" emphasis="strong" aria-label="Collapse section">
      <ChevronDown aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" emphasis="strong" aria-label="Delete idea">
      <Trash2 aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" emphasis="strong" size={24} aria-label="Delete idea (small)">
      <Trash2 aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" emphasis="strong" isDisabled aria-label="Delete idea (disabled)">
      <Trash2 aria-hidden size={16} />
    </IconButton>
  </div>
);

export const GhostDefault: Story = () => (
  <IconButton variant="ghost" emphasis="default" aria-label="Settings">
    <Settings aria-hidden size={16} />
  </IconButton>
);
GhostDefault.storyName = 'Ghost · Default';

export const GhostStrong: Story = () => (
  <IconButton variant="ghost" emphasis="strong" aria-label="Collapse section">
    <ChevronDown aria-hidden size={16} />
  </IconButton>
);
GhostStrong.storyName = 'Ghost · Strong';

export const BorderedStrong: Story = () => (
  <IconButton variant="bordered" emphasis="strong" aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);
BorderedStrong.storyName = 'Bordered · Strong';

/** Not in Figma: the prototype's `.btn-icon--sm` for dense toolbars. */
export const Small: Story = () => (
  <IconButton variant="bordered" emphasis="strong" size={24} aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);

export const Disabled: Story = () => (
  <IconButton variant="bordered" emphasis="strong" isDisabled aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);

/** The keyboard, proved by this story's play function (the Interactions panel): Tab skips a disabled button and
 * reaches the next, by its name; Enter and Space press it. */
export const Keyboard: Story = () => {
  const [month, setMonth] = useState(0);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <IconButton variant="bordered" emphasis="strong" isDisabled aria-label="Previous month"><ChevronLeft aria-hidden size={16} /></IconButton>
      <IconButton variant="bordered" emphasis="strong" aria-label="Next month" onPress={() => setMonth(m => m + 1)}>
        <ChevronRight aria-hidden size={16} />
      </IconButton>
      <span role="status">{month === 0 ? 'This month' : `${month} ${month === 1 ? 'month' : 'months'} ahead`}</span>
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Next month'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('1 month ahead');
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('status')).toHaveTextContent('2 months ahead');
};

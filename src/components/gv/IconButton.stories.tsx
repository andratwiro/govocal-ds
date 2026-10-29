import {IconButton} from './IconButton';
import {Settings, Trash2, ChevronDown} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

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
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof IconButton>;

/** Figma's three Style × Tone variants, then (Not in Figma) the prototype's 24 size and disabled. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
    <IconButton variant="ghost" tone="default" aria-label="Settings for Green Corridors for Riverside">
      <Settings aria-hidden size={16} />
    </IconButton>
    <IconButton variant="ghost" tone="strong" aria-label="Collapse section">
      <ChevronDown aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" tone="strong" aria-label="Delete idea">
      <Trash2 aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" tone="strong" size={24} aria-label="Delete idea (small)">
      <Trash2 aria-hidden size={16} />
    </IconButton>
    <IconButton variant="bordered" tone="strong" isDisabled aria-label="Delete idea (disabled)">
      <Trash2 aria-hidden size={16} />
    </IconButton>
  </div>
);

export const GhostDefault: Story = () => (
  <IconButton variant="ghost" tone="default" aria-label="Settings">
    <Settings aria-hidden size={16} />
  </IconButton>
);
GhostDefault.storyName = 'Ghost · Default';

export const GhostStrong: Story = () => (
  <IconButton variant="ghost" tone="strong" aria-label="Collapse section">
    <ChevronDown aria-hidden size={16} />
  </IconButton>
);
GhostStrong.storyName = 'Ghost · Strong';

export const BorderedStrong: Story = () => (
  <IconButton variant="bordered" tone="strong" aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);
BorderedStrong.storyName = 'Bordered · Strong';

/** Not in Figma: the prototype's `.btn-icon--sm` for dense toolbars. */
export const Small: Story = () => (
  <IconButton variant="bordered" tone="strong" size={24} aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);

export const Disabled: Story = () => (
  <IconButton variant="bordered" tone="strong" isDisabled aria-label="Delete idea">
    <Trash2 aria-hidden size={16} />
  </IconButton>
);

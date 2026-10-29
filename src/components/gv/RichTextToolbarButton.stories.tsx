import {RichTextToolbarButton} from './RichTextToolbarButton';
import {Bold, Italic, List, Link, Image, SquarePlay} from 'lucide-react';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RichTextToolbarButton> = {
  title: 'Components/Forms/Rich text toolbar button',
  component: RichTextToolbarButton,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=13-270'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RichTextToolbarButton>;

/** Figma's one shape with each icon; then selected and disabled (Not in Figma: neither source has them). */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, background: 'var(--gv-surface-toolbar)', padding: 8}}>
      <RichTextToolbarButton aria-label="Bold">
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Bold" isSelected>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Italic">
        <Italic aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="List">
        <List aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Add link">
        <Link aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Add image">
        <Image aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Embed video">
        <SquarePlay aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
      <RichTextToolbarButton aria-label="Bold" isDisabled>
        <Bold aria-hidden size={14} strokeWidth={1.75} />
      </RichTextToolbarButton>
    </div>
  )
};

export const Default: Story = {
  args: {'aria-label': 'Bold', children: <Bold aria-hidden size={14} strokeWidth={1.75} />}
};

export const Selected: Story = {
  args: {'aria-label': 'Bold', isSelected: true, children: <Bold aria-hidden size={14} strokeWidth={1.75} />}
};

export const Disabled: Story = {
  args: {'aria-label': 'Bold', isDisabled: true, children: <Bold aria-hidden size={14} strokeWidth={1.75} />}
};

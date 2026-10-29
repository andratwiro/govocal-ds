import {EditorTool} from './EditorTool';
import {Bold, Italic, List, Link, Image, SquarePlay} from 'lucide-react';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof EditorTool> = {
  title: 'Components/Editor tool',
  component: EditorTool,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=13-270'
    }
  }
};

export default meta;
type Story = StoryObj<typeof EditorTool>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, background: 'var(--gv-surface-toolbar)', padding: 8}}>
      <EditorTool aria-label="Bold">
        <Bold aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Bold" isSelected>
        <Bold aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Italic">
        <Italic aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="List">
        <List aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Link">
        <Link aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Image">
        <Image aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Video">
        <SquarePlay aria-hidden size={16} />
      </EditorTool>
      <EditorTool aria-label="Bold" isDisabled>
        <Bold aria-hidden size={16} />
      </EditorTool>
    </div>
  )
};

export const Default: Story = {
  args: {'aria-label': 'Bold', children: <Bold aria-hidden size={16} />}
};

export const Selected: Story = {
  args: {'aria-label': 'Bold', isSelected: true, children: <Bold aria-hidden size={16} />}
};

export const Disabled: Story = {
  args: {'aria-label': 'Bold', isDisabled: true, children: <Bold aria-hidden size={16} />}
};

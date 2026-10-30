import type {Meta, StoryObj} from '@storybook/react-vite';
import {GripVertical} from 'lucide-react';
import {MissingPart} from './MissingPart';
import {Text} from './Text';
import {Stack} from './Stack';
import {Inline} from './Inline';

const meta: Meta<typeof MissingPart> = {
  title: 'Components/Status & feedback/Missing part',
  component: MissingPart,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof MissingPart>;

/** A block the system has no part for: the dashed frame, its name, then a plain stand-in built from what it has. */
export const Default: Story = {
  args: {name: 'Email preview'},
  render: args => (
    <div style={{maxWidth: 420}}>
      <MissingPart {...args}>
        <Stack gap="8">
          <Text elementType="p" kind="ui" isStrong color="primary">Your idea got a reply</Text>
          <Text elementType="p" kind="body">The project team answered your idea about the riverside path.</Text>
        </Stack>
      </MissingPart>
    </div>
  )
};

/** Something small in a row: a dashed outline and no label, named in a line near it. */
export const Inline_: Story = {
  name: 'Inline',
  args: {name: 'Drag-and-drop reordering', isInline: true},
  render: args => (
    <Stack gap="12">
      <Inline gap="8">
        <MissingPart {...args}><GripVertical aria-hidden size={16} /></MissingPart>
        <Text kind="ui">Homepage</Text>
      </Inline>
      <Text elementType="p" kind="small" color="meta">
        Dashed outline: the system has no component yet for drag-and-drop reordering.
      </Text>
    </Stack>
  )
};

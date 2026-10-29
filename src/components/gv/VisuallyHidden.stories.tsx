import type {Meta, StoryObj} from '@storybook/react-vite';
import {VisuallyHidden} from './VisuallyHidden';
import {Text} from './Text';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Components/Text/Visually hidden',
  component: VisuallyHidden,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

/** A heading only screen readers meet: it names the tab's content, so the page's headings go h1 → h2 → h3. Nothing
 * shows between the two lines. */
export const Default: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 'var(--gv-space-8)'}}>
      <Text kind="small" color="meta">Before the hidden heading</Text>
      <VisuallyHidden elementType="h2">Inputs</VisuallyHidden>
      <Text kind="small" color="meta">After it</Text>
    </div>
  )
};

/** `isFocusable`: a "Skip to content" link that shows while it holds keyboard focus. Tab into the frame to see it. */
export const Focusable: Story = {
  render: () => (
    <VisuallyHidden isFocusable>
      <a href="#content">Skip to content</a>
    </VisuallyHidden>
  )
};

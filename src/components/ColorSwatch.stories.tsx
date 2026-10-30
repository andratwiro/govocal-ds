import {ColorSwatch} from './ColorSwatch';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

const meta: Meta<typeof ColorSwatch> = {
  component: ColorSwatch,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ColorSwatch>;

export const Example: Story = args => <ColorSwatch {...args} />;

Example.args = {
  color: '#f00a'
};

/** `size`: 32 on its own (a colour field), 24 in a list, 16 inline in a table cell or beside a name. The play function
 * checks the sizes. */
export const Sizes: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <ColorSwatch color="#0a7ea4" size={32} aria-label="Size 32" />
    <ColorSwatch color="#0a7ea4" size={24} aria-label="Size 24" />
    <ColorSwatch color="#0a7ea4" size={16} aria-label="Size 16" />
  </div>
);
Sizes.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  for (const size of [32, 24, 16]) {
    const box = canvas.getByRole('img', {name: new RegExp(`Size ${size}$`)}).getBoundingClientRect();
    await expect(box.height).toBe(size);
    await expect(box.width).toBe(size);
  }
};

import {Skeleton} from './Skeleton';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'radio',
      options: ['line', 'block', 'circle']
    }
  }
};

export default meta;
type Story = StoryFn<typeof Skeleton>;

export const Line: Story = args => <Skeleton {...args} width={220} />;
Line.args = {shape: 'line'};

export const Block: Story = args => <Skeleton {...args} width={260} height={120} />;
Block.args = {shape: 'block'};

export const Circle: Story = args => <Skeleton {...args} />;
Circle.args = {shape: 'circle'};

export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 260}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <Skeleton shape="circle" />
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, flex: 1}}>
        <Skeleton shape="line" width="64%" height={18} />
        <Skeleton shape="line" width="44%" height={12} />
      </div>
    </div>
    <Skeleton shape="block" height={120} />
    <Skeleton shape="line" width="100%" />
    <Skeleton shape="line" width="72%" />
  </div>
);

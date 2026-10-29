import {Skeleton} from './Skeleton';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Status & feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {description: {component: 'Not in Figma: from the prototype (its loading placeholder).'}}
  },
  tags: ['autodocs', 'not-in-figma'],
  argTypes: {
    shape: {
      control: 'radio',
      options: ['line', 'block', 'pill', 'circle']
    }
  }
};

export default meta;
type Story = StoryFn<typeof Skeleton>;

/** The prototype's empty list on the phone: white rows (padding 14, radius 8) of a title, two lines and a chip. */
export const AllVariants: Story = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: 300,
      padding: 16,
      borderRadius: 'var(--gv-radius-12)',
      background: 'var(--gv-surface-stage)'
    }}>
    {[0, 1].map(i => (
      <div
        key={i}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 14,
          borderRadius: 'var(--gv-radius-8)',
          background: 'var(--gv-surface-panel)'
        }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Skeleton shape="circle" width={24} height={24} />
          <Skeleton shape="line" width="58%" height={14} />
        </div>
        <Skeleton shape="line" />
        <Skeleton shape="line" width="72%" />
        <Skeleton shape="pill" />
      </div>
    ))}
    <div style={{padding: 14, borderRadius: 'var(--gv-radius-8)', background: 'var(--gv-surface-panel)'}}>
      <Skeleton shape="block" height={96} />
    </div>
  </div>
);

export const Line: Story = args => <Skeleton {...args} width={220} />;
Line.args = {shape: 'line'};

export const Block: Story = args => <Skeleton {...args} width={260} height={120} />;
Block.args = {shape: 'block'};

export const Pill: Story = args => <Skeleton {...args} />;
Pill.args = {shape: 'pill'};

export const Circle: Story = args => <Skeleton {...args} />;
Circle.args = {shape: 'circle'};

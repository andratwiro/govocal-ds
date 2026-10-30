import {CompactButton} from './CompactButton';
import {Plus} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';

const meta: Meta<typeof CompactButton> = {
  title: 'Components/Actions/Compact button',
  component: CompactButton,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=33-478'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof CompactButton>;

/** Figma's Secondary, Primary and Primary · icon; then disabled (Figma has none, the prototype dims to .45). */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <CompactButton variant="secondary" onPress={() => {}}>
      Add
    </CompactButton>
    <CompactButton variant="primary" onPress={() => {}}>
      Import
    </CompactButton>
    <CompactButton variant="primary" icon={<Plus aria-hidden size={16} />} onPress={() => {}}>
      Add a report
    </CompactButton>
    <CompactButton variant="secondary" isDisabled>
      Add
    </CompactButton>
  </div>
);

export const Secondary: Story = () => (
  <CompactButton variant="secondary" onPress={() => {}}>
    Add
  </CompactButton>
);

export const Primary: Story = () => (
  <CompactButton variant="primary" onPress={() => {}}>
    Import
  </CompactButton>
);

export const PrimaryIcon: Story = () => (
  <CompactButton variant="primary" icon={<Plus aria-hidden size={16} />} onPress={() => {}}>
    Add a report
  </CompactButton>
);
PrimaryIcon.storyName = 'Primary · icon';

export const Disabled: Story = () => (
  <CompactButton variant="primary" isDisabled>
    Import
  </CompactButton>
);

/** The keyboard, proved by this story's play function (the Interactions panel): Tab skips a disabled button and
 * reaches the next; Enter and Space press it. */
export const Keyboard: Story = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
      <CompactButton isDisabled>Import</CompactButton>
      <CompactButton onPress={() => setCount(n => n + 1)}>Explore</CompactButton>
      <span role="status">{count === 0 ? 'Not pressed yet' : `Pressed ${count} ${count === 1 ? 'time' : 'times'}`}</span>
    </div>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
  await expect(canvas.getByRole('button', {name: 'Explore'})).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.getByRole('status')).toHaveTextContent('Pressed 1 time');
  await userEvent.keyboard(' ');
  await expect(canvas.getByRole('status')).toHaveTextContent('Pressed 2 times');
};

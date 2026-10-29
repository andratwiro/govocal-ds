import {CompactButton} from './CompactButton';
import {Plus} from 'lucide-react';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof CompactButton> = {
  title: 'Components/Button · compact',
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

export const Disabled: Story = () => (
  <CompactButton variant="primary" isDisabled>
    Import
  </CompactButton>
);

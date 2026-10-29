import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronUp, Info} from 'lucide-react';
import {Button} from '../components/Button';
import {AvatarStack, PhoneFrame, PhoneHeader, PhoneImage} from './PhonePreview';

const meta: Meta<typeof PhoneFrame> = {
  title: 'Patterns/Phone preview',
  component: PhoneFrame,
  tags: ['autodocs'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof PhoneFrame>;

/** A project page as a resident sees it on a phone. */
export const ProjectPage: Story = {
  render: () => (
    <PhoneFrame aria-label="What residents see" header={<PhoneHeader />}>
      <PhoneImage />
      <h2>Green Corridors for Riverside</h2>
      <p>More trees, safer paths and quieter streets: help decide where the next green corridor goes.</p>
      <Button>Participate · 3 ways <ChevronUp aria-hidden size={16} /></Button>
      <AvatarStack initials={['A', 'B', 'C']}>215 participants <Info aria-hidden size={14} /></AvatarStack>
    </PhoneFrame>
  )
};

/** An empty screen: only the platform header. */
export const Empty: Story = {
  render: () => <PhoneFrame aria-label="What residents see" header={<PhoneHeader />}><PhoneImage /></PhoneFrame>
};

export const Avatars: StoryObj<typeof AvatarStack> = {
  render: () => <AvatarStack initials={['A', 'B', 'C']}>215 participants</AvatarStack>
};

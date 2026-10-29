import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronUp, Info} from 'lucide-react';
import {Button} from '../components/Button';
import {AvatarGroup} from '../components/gv/Avatar';
import {PhonePreview, PhoneHeader, PhoneImage} from './PhonePreview';

const meta: Meta<typeof PhonePreview> = {
  title: 'Patterns/Project page/Phone preview',
  component: PhonePreview,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof PhonePreview>;

/** A project page as a resident sees it on a phone. */
export const ProjectPage: Story = {
  name: 'Default',
  render: () => (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />}>
      <PhoneImage />
      <h2>Green Corridors for Larkvale</h2>
      <p>More trees, safer paths and quieter streets: help decide where the next green corridor goes.</p>
      <Button>Participate · 3 ways <ChevronUp aria-hidden size={16} /></Button>
      <AvatarGroup initials={['A', 'B', 'C']}>215 participants <Info aria-hidden size={14} /></AvatarGroup>
    </PhonePreview>
  )
};

/** An empty screen: only the platform header. */
export const Empty: Story = {
  render: () => <PhonePreview aria-label="What residents see" header={<PhoneHeader />}><PhoneImage /></PhonePreview>
};

export const Avatars: StoryObj<typeof AvatarGroup> = {
  render: () => <AvatarGroup initials={['A', 'B', 'C']}>215 participants</AvatarGroup>
};

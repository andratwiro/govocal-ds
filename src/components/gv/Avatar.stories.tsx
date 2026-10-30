import {expect, within} from 'storybook/test';
import {Avatar, AvatarGroup} from './Avatar';
import {PORTRAITS} from '../../stories/images';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Data display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-62'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Avatar>;

/** Figma's Avatar (28, filled); the photo, the 24 and 16 sizes and the unassigned ring are Not in Figma (the
 * prototype's). */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    <Avatar initials="S" aria-label="Assigned to Sam" />
    <Avatar initials="RE" src={PORTRAITS[1]} aria-label="Resident E" />
    <Avatar initials="JL" size={24} aria-label="Assigned to Jo Lee" />
    <Avatar initials="R" size={16} aria-label="Assigned to Riley Chen" />
    <Avatar isUnassigned aria-label="Unassigned" />
  </div>
);

export const Filled: Story = () => <Avatar initials="S" aria-label="Assigned to Sam" />;

/** Not in Figma: the prototype's unassigned ring. */
export const Unassigned: Story = () => <Avatar isUnassigned aria-label="Unassigned" />;

/** Not in Figma: a photo (the prototype's Audience table). It covers the circle; the initials sit under it. */
export const Image: Story = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
    {PORTRAITS.map((src, i) => <Avatar key={src} initials={['RA', 'RE', 'MB', 'AC'][i]} src={src} aria-label={['Resident A', 'Resident E', 'Manager B', 'Admin C'][i]} />)}
    <Avatar initials="RA" src={PORTRAITS[0]} size={24} aria-label="Resident A" />
  </div>
);

/** A photo that can't load (a broken or removed file) falls back to the person's initials. */
export const ImageFails: Story = () => <Avatar initials="RD" src="missing-photo.jpg" aria-label="Resident D" />;
ImageFails.storyName = 'Image fails';

/** `AvatarGroup`: overlapping faces before a count, each 24 and 6 over the one before (the phone preview's "215
 * participants"). The faces are decoration, hidden from screen readers; the count says it. */
export const Group: Story = () => <AvatarGroup initials={['RA', 'RE', 'MB']}>215 participants</AvatarGroup>;
Group.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText('215 participants')).toBeVisible();
  await expect(canvas.queryAllByRole('img')).toHaveLength(0);
};

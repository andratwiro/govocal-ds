import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';
import {ChevronUp, Info, Lock} from 'lucide-react';
import {Button} from '../components/Button';
import {AvatarGroup} from '../components/gv/Avatar';
import {Banner} from '../components/gv/Banner';
import {Skeleton} from '../components/gv/Skeleton';
import {PhoneCard, PhoneCountdown, PhoneHeader, PhoneImage, PhonePreview, PhoneStage} from './PhonePreview';
import {PhonePhaseCard} from './PhonePhaseCard';
import {SegmentedControl, SegmentedControlItem} from '../components/gv/SegmentedControl';

/* Invented: a platform's logo mark (two peaks), drawn in the icon colour. */
const MARK = (
  <svg viewBox="0 0 32 16" width={32} height={16} fill="currentColor" aria-hidden="true">
    <path d="M0 16 9 4l5 6 4-5 7 11H0Z" />
  </svg>
);

const meta: Meta<typeof PhonePreview> = {
  title: 'Patterns/Project page/Phone preview',
  component: PhonePreview,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof PhonePreview>;

/* A phase page still being built: its blocks are skeletons until the project lead fills them. */
function SkeletonCard({tall = false}: {tall?: boolean}) {
  return (
    <PhoneCard>
      <Skeleton width="58%" height={14} />
      <Skeleton width="40%" height={10} />
      {tall && <Skeleton variant="block" height={96} />}
      <Skeleton width="100%" height={8} />
      <Skeleton width="72%" height={8} />
    </PhoneCard>
  );
}

const phase = (
  <>
    <SkeletonCard tall />
    <SkeletonCard />
    <SkeletonCard />
  </>
);

const row = {display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--gv-space-24)'} as const;

/** The project page, a phase open for ideas, one not started yet (locked), and a new phase with nothing built. */
export const AllVariants: Story = {
  render: () => (
    <div style={row}>
      <ProjectPageRender />
      <PhonePreview aria-label="What residents see" header={<PhoneHeader />} surface="grey" footer={<PhoneCountdown cta="Submit your idea">2 weeks left</PhoneCountdown>}>
        {phase}
      </PhonePreview>
      <LockedRender />
      <PhonePreview aria-label="What residents see" header={<PhoneHeader />} isEmpty />
    </div>
  )
};

function ProjectPageRender() {
  return (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />} action={{label: 'Edit project page', onPress: () => {}}}>
      <PhoneImage />
      <h2>Green Corridors for Larkvale</h2>
      <p>More trees, safer paths and quieter streets: help decide where the next green corridor goes.</p>
      <Button>Participate · 3 ways <ChevronUp aria-hidden size={16} /></Button>
      <AvatarGroup initials={['A', 'B', 'C']}>215 participants <Info aria-hidden size={14} /></AvatarGroup>
    </PhonePreview>
  );
}

/** A project page as a resident sees it on a phone. Hover it, or tab to it, for "Edit project page". */
export const ProjectPage = {name: 'Default', render: ProjectPageRender} satisfies Story;

/**
 * On the stage of a phase's Build tab: the eye top-right opens the participant's view in another tab ("Open in
 * external URL"), and the caption bottom-right says what the phone shows.
 */
export const WithCaption: Story = {
  name: 'With caption',
  parameters: {layout: 'fullscreen'},
  render: () => (
    <div style={{blockSize: 860, padding: 'var(--gv-space-16)'}}>
      <PhoneStage caption="What residents see while the phase is open" onOpen={() => {}}>
        <PhonePreview
          aria-label="What residents see"
          header={<PhoneHeader />}
          surface="grey"
          footer={<PhoneCountdown cta="Submit your idea">2 weeks left</PhoneCountdown>}
          action={{label: 'Preview', isExternal: true, onPress: () => {}}}>
          {phase}
        </PhonePreview>
      </PhoneStage>
    </div>
  )
};

/** A new phase, nothing built yet: the screen says so, and the phone offers no action. */
export const Empty: Story = {
  render: () => <PhonePreview aria-label="What residents see" header={<PhoneHeader />} isEmpty action={{label: 'Preview', isExternal: true}} />
};

function LockedRender() {
  return (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />} surface="grey" footer={<PhoneCountdown>Starts in 5 days</PhoneCountdown>}>
      <SkeletonCard tall />
      <Banner tone="info" icon={<Lock aria-hidden size={16} />}>
        Participating is only possible when this phase is active.
      </Banner>
    </PhonePreview>
  );
}

/** A phase that hasn't started: a lock note in place of the inputs, and the bar counts down with no button. */
export const Locked = {render: LockedRender} satisfies Story;

/** The participation bar: the time left in capitals and the phase's button. */
export const Countdown: Story = {
  render: () => (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />} surface="grey" footer={<PhoneCountdown cta="Submit your idea">2 weeks left</PhoneCountdown>}>
      {phase}
    </PhonePreview>
  )
};

/**
 * The phone is the way in: on hover or keyboard focus it lifts and takes a ring, the page dims and blurs, and a smoked
 * pill says what pressing does ("Preview ↗" on a phase; "Edit project page" on the project). Tab to it.
 */
export const HoverCTA: Story = {
  name: 'Hover CTA',
  render: () => (
    <PhonePreview
      aria-label="What residents see"
      header={<PhoneHeader />}
      surface="grey"
      footer={<PhoneCountdown cta="Submit your idea">2 weeks left</PhoneCountdown>}
      action={{label: 'Preview', isExternal: true, onPress: () => {}}}>
      {phase}
    </PhonePreview>
  )
};

export const Avatars: StoryObj<typeof AvatarGroup> = {
  render: () => <AvatarGroup initials={['A', 'B', 'C']}>215 participants</AvatarGroup>
};

/**
 * The phone's action by keyboard: Tab reaches it (it shows on focus), Enter presses it. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: function Render() {
    const [opened, setOpened] = useState(false);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
        <PhonePreview aria-label="What residents see" header={<PhoneHeader />}
          action={{label: 'Edit project page', onPress: () => setOpened(true)}}>
          <PhoneImage />
        </PhonePreview>
        <span role="status">{opened ? 'Edit project page opened' : 'Nothing opened'}</span>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Edit project page'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Edit project page opened');
  }
};

/** Not in Figma (the prototype's phone): the platform's logo mark in the header, in place of the placeholder. */
export const LogoHeader: Story = {
  name: 'Logo header',
  render: () => (
    <PhonePreview aria-label="What residents see" header={<PhoneHeader mark={MARK} logo="Larkvale" />} surface="grey">
      {phase}
    </PhonePreview>
  )
};

function VotingStage() {
  return (
    <div style={{blockSize: 860, padding: 'var(--gv-space-16)'}}>
      <PhoneStage onOpen={() => {}} caption="What residents see while the phase is open"
        toolbar={
          <SegmentedControl aria-label="Phase state" defaultSelectedKeys={['open']} disallowEmptySelection>
            <SegmentedControlItem id="before">Before</SegmentedControlItem>
            <SegmentedControlItem id="open">Open</SegmentedControlItem>
            <SegmentedControlItem id="ended">Ended</SegmentedControlItem>
          </SegmentedControl>
        }>
        <PhonePreview aria-label="What residents see" header={<PhoneHeader mark={MARK} logo="Larkvale" />} surface="grey"
          footer={<PhoneCountdown cta="Vote">2 weeks left</PhoneCountdown>}>
          <PhonePhaseCard number={4} title="Community vote" dates="19 Oct 2026 – 16 Nov 2026">
            <Skeleton width="100%" height={8} />
            <Skeleton width="72%" height={8} />
          </PhonePhaseCard>
          <SkeletonCard tall />
          <SkeletonCard />
        </PhonePreview>
      </PhoneStage>
    </div>
  );
}

/**
 * Not in Figma (the prototype's Voting stage): the eye at the top end; at the bottom end a toolbar that switches the
 * preview between Before, Open and Ended, then the caption. The phone opens with the Phone phase card and keeps the
 * countdown pinned at its foot while the page scrolls.
 */
export const StageToolbar: Story = {name: 'Stage toolbar', parameters: {layout: 'fullscreen'}, render: () => <VotingStage />};

/** The stage right to left: the eye and the toolbar at the left. */
export const RightToLeft: Story = {name: 'Right to left', parameters: {layout: 'fullscreen'}, globals: {direction: 'rtl'}, render: () => <VotingStage />};

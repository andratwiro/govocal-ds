import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronUp, Info, Lock} from 'lucide-react';
import {Button} from '../components/Button';
import {AvatarGroup} from '../components/gv/Avatar';
import {Banner} from '../components/gv/Banner';
import {Skeleton} from '../components/gv/Skeleton';
import {PhoneCard, PhoneCountdown, PhoneHeader, PhoneImage, PhonePreview, PhoneStage} from './PhonePreview';

const meta: Meta<typeof PhonePreview> = {
  title: 'Patterns/Project page/Phone preview',
  component: PhonePreview,
  tags: ['autodocs', 'not-in-figma'],
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

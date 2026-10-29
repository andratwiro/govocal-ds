import {RailPhase} from './RailPhase';
import {RailHeader} from './RailHeader';
import {RailSectionLabel} from './RailSectionLabel';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RailPhase> = {
  title: 'Components/Rail phase',
  component: RailPhase,
  tags: ['autodocs'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-300'
    }
  }
};

export default meta;
type Story = StoryObj<typeof RailPhase>;

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', width: 284}}>
      <RailPhase status="completed" title="Collect ideas" meta="12 Oct – 2 Nov · Ideation" href="#collect" />
      <RailPhase status="live" title="Vote on the shortlist" meta="Live · Voting" current href="#vote" />
      <RailPhase status="upcoming" title="Share what we heard" meta="Upcoming · Information" href="#share" />
    </div>
  )
};

export const Upcoming: Story = {
  args: {status: 'upcoming', title: 'Share what we heard', meta: 'Upcoming · Information', href: '#'}
};

export const Live: Story = {
  args: {status: 'live', title: 'Vote on the shortlist', meta: 'Live · Voting', current: true, href: '#'}
};

export const Completed: Story = {
  args: {status: 'completed', title: 'Collect ideas', meta: '12 Oct – 2 Nov · Ideation', href: '#'}
};

/** The rail composed: header, section label, and a run of phases, as it sits in the left column. */
export const Rail: StoryObj = {
  render: () => (
    <nav aria-label="Phases" style={{width: 284, display: 'flex', flexDirection: 'column', gap: 4}}>
      <RailHeader title="Green Corridors for Riverside" onAdd={() => {}} />
      <RailSectionLabel>Timeline</RailSectionLabel>
      <RailPhase status="completed" title="Collect ideas" meta="12 Oct – 2 Nov · Ideation" href="#collect" />
      <RailPhase status="live" title="Vote on the shortlist" meta="Live · Voting" current href="#vote" />
      <RailPhase status="upcoming" title="Share what we heard" meta="Upcoming · Information" href="#share" />
    </nav>
  )
};

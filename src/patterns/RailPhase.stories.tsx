import {RailPhase} from './RailPhase';
import {RailHeader} from './RailHeader';
import {SectionLabel} from '../components/gv/SectionLabel';
import {Divider} from '../components/gv/Divider';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof RailPhase> = {
  title: 'Patterns/Project rail/Rail phase',
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

/**
 * The three dots, one after another so the guide joins them. Figma draws only the upcoming row; the
 * completed and live colours, the data chip and "N new" are the prototype's (Not in Figma).
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', width: 284}}>
      <RailPhase
        status="completed"
        title="Collect ideas"
        chip="312 ideas"
        state="Done"
        meta="29 Jul to 30 Sep · Ideation"
        href="#collect"
      />
      <RailPhase
        status="live"
        title="Vote on the shortlist"
        chip="1,204 votes"
        state="In progress"
        meta="1 Oct to 30 Nov · Voting"
        newCount={18}
        current
        href="#vote"
      />
      <RailPhase
        status="upcoming"
        title="Share what we heard"
        state="Upcoming"
        meta="Information"
        href="#share"
      />
    </div>
  )
};

/** Figma's own row. */
export const Upcoming: Story = {
  args: {status: 'upcoming', title: 'Collect ideas', state: 'Upcoming', meta: 'Ideation', href: '#'}
};

export const Live: Story = {
  args: {
    status: 'live',
    title: 'Vote on the shortlist',
    chip: '1,204 votes',
    state: 'In progress',
    meta: '1 Oct to 30 Nov · Voting',
    current: true,
    href: '#'
  }
};

export const Completed: Story = {
  args: {
    status: 'completed',
    title: 'Collect ideas',
    chip: '312 ideas',
    state: 'Done',
    meta: '29 Jul to 30 Sep · Ideation',
    href: '#'
  }
};

/** A plain meta line, no state word: the line is all one colour. */
export const MetaOnly: Story = {
  name: 'Meta only',
  args: {status: 'upcoming', title: 'Share what we heard', meta: 'Upcoming · Information', href: '#'}
};

/**
 * The rail composed as the prototype's Participation panel: 264 of content, the phase rows reaching 10
 * past it on both sides, each phase in its own list item.
 */
export const Rail: StoryObj = {
  render: () => (
    <aside
      aria-label="Participation"
      style={{width: 264, padding: '25px 18px', background: 'var(--gv-surface-panel)'}}>
      <RailHeader title="Participation" onTogglePanel={() => {}} onAdd={() => {}} addLabel="Add a phase" />
      <nav aria-label="Phases" style={{marginTop: 16}}>
        <SectionLabel>Timeline</SectionLabel>
        <ul style={{listStyle: 'none', margin: '0 -10px', padding: '4px 0 0'}}>
          <li>
            <RailPhase
              status="completed"
              title="Collect ideas"
              chip="312 ideas"
              state="Done"
              meta="29 Jul to 30 Sep · Ideation"
              href="#collect"
            />
          </li>
          <li>
            <RailPhase
              status="live"
              title="Vote on the shortlist"
              chip="1,204 votes"
              state="In progress"
              meta="1 Oct to 30 Nov · Voting"
              newCount={18}
              current
              href="#vote"
            />
          </li>
          <li>
            <RailPhase
              status="upcoming"
              title="Share what we heard"
              state="Upcoming"
              meta="Information"
              href="#share"
            />
          </li>
        </ul>
      </nav>
      <div style={{margin: '12px 0 16px'}}>
        <Divider />
      </div>
      <SectionLabel>Spotlight</SectionLabel>
      <div style={{margin: '16px 0'}}>
        <Divider />
      </div>
      <SectionLabel>Events</SectionLabel>
    </aside>
  )
};

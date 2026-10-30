import {RailPhase} from './RailPhase';
import {RailHeader} from './RailHeader';
import {SectionLabel} from '../components/gv/SectionLabel';
import {Divider} from '../components/gv/Divider';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState} from 'react';

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
 * A project's phases in order, so the guide line joins their dots: completed, live (the one open on screen), then two
 * upcoming; the last can be deleted (point at it). Figma draws only the upcoming row; the completed and live colours,
 * the count chip and "N new" are the prototype's (Not in Figma).
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', width: 284}}>
      <RailPhase
        status="completed"
        title="Collect ideas"
        chip="312 ideas"
        statusLabel="Done"
        meta="29 Jul to 30 Sep · Ideation"
        href="#collect"
      />
      <RailPhase
        status="live"
        title="Vote on the shortlist"
        chip="1,204 votes"
        statusLabel="In progress"
        meta="1 Oct to 30 Nov · Voting"
        newCount={18}
        isCurrent
        href="#vote"
      />
      <RailPhase
        status="upcoming"
        title="Share what we heard"
        statusLabel="Upcoming"
        meta="Information"
        href="#share"
      />
      <RailPhase
        status="upcoming"
        title="Feedback survey"
        statusLabel="Upcoming"
        meta="Survey"
        href="#survey"
        onDelete={() => {}}
      />
    </div>
  )
};

/** A phase that hasn't started: grey dot, and here no dates, only its method. The only state Figma draws. */
export const Upcoming: Story = {
  args: {status: 'upcoming', title: 'Collect ideas', statusLabel: 'Upcoming', meta: 'Ideation', href: '#'}
};

/** The phase running now, open on screen: light green dot, what it has gathered so far, and 18 inputs nobody has read. */
export const Live: Story = {
  args: {
    status: 'live',
    title: 'Vote on the shortlist',
    chip: '1,204 votes',
    statusLabel: 'In progress',
    meta: '1 Oct to 30 Nov · Voting',
    newCount: 18,
    isCurrent: true,
    href: '#'
  }
};

/** A phase that has ended: green dot, what it gathered, its dates. */
export const Completed: Story = {
  args: {
    status: 'completed',
    title: 'Collect ideas',
    chip: '312 ideas',
    statusLabel: 'Done',
    meta: '29 Jul to 30 Sep · Ideation',
    href: '#'
  }
};

/**
 * A meta line given whole, with no separate status word: it never turns green. On an upcoming phase it looks the same
 * as Upcoming (whose word is grey anyway); on a live or completed phase only the status word would be green.
 */
export const MetaOnly: Story = {
  name: 'Meta only',
  args: {status: 'upcoming', title: 'Share what we heard', meta: 'Upcoming · Information', href: '#'}
};

/**
 * Not in Figma (the prototype's rail): point at the row, or Tab to its delete, and a delete button shows at its end,
 * with the tooltip "Delete phase"; it takes "N new"'s place while it shows. Nothing shows until you do.
 */
export const WithDelete: Story = {
  name: 'With delete',
  tags: ['not-in-figma'],
  decorators: [Story => <div style={{width: 284}}><Story /></div>],
  args: {status: 'upcoming', title: 'Collect ideas', statusLabel: 'Upcoming', meta: 'Ideation', href: '#', onDelete: () => {}}
};

/**
 * The whole rail, as on a project's screens: the column on the left with the project's phases (the prototype's
 * Participation panel). Its content is 264px wide; the phase rows reach 10px past it on both sides so their hover
 * colour has room. Point at a phase for its delete.
 */
export const Rail: StoryObj = {
  render: () => (
    <aside
      aria-label="Participation"
      style={{width: 264, padding: '25px 18px', background: 'var(--gv-surface-panel)'}}>
      <RailHeader title="Participation" onTogglePanel={() => {}} onAdd={() => {}} labels={{add: 'Add a phase'}} />
      <nav aria-label="Phases" style={{marginTop: 16}}>
        <SectionLabel>Timeline</SectionLabel>
        <ul style={{listStyle: 'none', margin: '0 -10px', padding: '4px 0 0'}}>
          <li>
            <RailPhase
              status="completed"
              title="Collect ideas"
              chip="312 ideas"
              statusLabel="Done"
              meta="29 Jul to 30 Sep · Ideation"
              href="#collect"
              onDelete={() => {}}
            />
          </li>
          <li>
            <RailPhase
              status="live"
              title="Vote on the shortlist"
              chip="1,204 votes"
              statusLabel="In progress"
              meta="1 Oct to 30 Nov · Voting"
              newCount={18}
              isCurrent
              href="#vote"
              onDelete={() => {}}
            />
          </li>
          <li>
            <RailPhase
              status="upcoming"
              title="Share what we heard"
              statusLabel="Upcoming"
              meta="Information"
              href="#share"
              onDelete={() => {}}
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

/** A phase by keyboard: Enter on the row opens the phase, Tab moves to its delete, Enter deletes. Try the keys here; an automated test presses them too (the Interactions panel). */
export const Keyboard: Story = {
  render: function Render() {
    const [said, setSaid] = useState('Not part of the row: what your keys do shows here');
    return (
      <div style={{width: 284, display: 'flex', flexDirection: 'column', gap: 16}}>
        <RailPhase status="upcoming" title="Collect ideas" statusLabel="Upcoming" meta="Ideation"
          onPress={() => setSaid('Collect ideas opened')} onDelete={() => setSaid('Collect ideas deleted')} />
        <span role="status">{said}</span>
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('link', {name: /^Collect ideas/})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Collect ideas opened');
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Delete Collect ideas'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Collect ideas deleted');
  }
};

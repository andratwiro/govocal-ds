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
        title="Collect ideas"
        statusLabel="Upcoming"
        meta="Ideation"
        href="#collect-new"
        onDelete={() => {}}
      />
    </div>
  )
};

/** Figma's own row. */
export const Upcoming: Story = {
  args: {status: 'upcoming', title: 'Collect ideas', statusLabel: 'Upcoming', meta: 'Ideation', href: '#'}
};

export const Live: Story = {
  args: {
    status: 'live',
    title: 'Vote on the shortlist',
    chip: '1,204 votes',
    statusLabel: 'In progress',
    meta: '1 Oct to 30 Nov · Voting',
    isCurrent: true,
    href: '#'
  }
};

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

/** A plain meta line, no state word: the line is all one colour. */
export const MetaOnly: Story = {
  name: 'Meta only',
  args: {status: 'upcoming', title: 'Share what we heard', meta: 'Upcoming · Information', href: '#'}
};

/**
 * Not in Figma (the prototype's rail): hover the row, or Tab to it, and a delete button shows at its end ("Delete
 * phase" on hover); it takes "N new"'s place while it shows.
 */
export const WithDelete: Story = {
  name: 'With delete',
  tags: ['not-in-figma'],
  decorators: [Story => <div style={{width: 284}}><Story /></div>],
  args: {status: 'upcoming', title: 'Collect ideas', statusLabel: 'Upcoming', meta: 'Ideation', href: '#', onDelete: () => {}}
};

/**
 * The rail composed as the prototype's Participation panel: 264 of content, the phase rows reaching 10
 * past it on both sides, each phase in its own list item; hover a phase for its delete.
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

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {PhaseTimeline, type TimelinePhase} from './PhaseTimeline';
import {SectionLabel} from '../components/gv/SectionLabel';

const PHASES: TimelinePhase[] = [
  {id: 'a', title: 'Project background', status: 'done', dates: '10 to 30 Aug', method: 'Sharing', count: '1,890 visits', href: '#a'},
  {id: 'b', title: 'Collect ideas', status: 'done', dates: '1 to 21 Sep', method: 'Ideation', count: '312 ideas', fresh: 18, href: '#b'},
  {id: 'c', title: 'Community vote', status: 'in-progress', dates: '19 Oct to 16 Nov', method: 'Voting', count: '1,240 votes', href: '#c'},
  {id: 'd', title: 'Feedback survey', status: 'upcoming', dates: '17 Nov to 7 Dec', method: 'Survey', href: '#d'}
];

const meta: Meta<typeof PhaseTimeline> = {
  title: 'Patterns/Project rail/Phase timeline',
  component: PhaseTimeline,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  decorators: [Story => <nav aria-label="Phases" style={{width: 284}}><Story /></nav>]
};
export default meta;
type Story = StoryObj<typeof PhaseTimeline>;

/** Done, in progress and upcoming phases joined by the spine; one carries new inputs. */
export const Timeline: Story = {name: 'Default', args: {phases: PHASES}};

/** The phase being viewed is marked as the current page for screen readers (`aria-current`); it draws no tint, as the
 * prototype dropped the open phase's card. */
export const Current: Story = {args: {phases: PHASES.map(p => ({...p, isCurrent: p.id === 'b'}))}};

/** Spotlight: methods outside the timeline, no spine. */
export const Spotlight: Story = {
  render: () => (
    <>
      <SectionLabel>Spotlight</SectionLabel>
      <PhaseTimeline phases={[{id: 's', title: 'Resident satisfaction', status: 'in-progress', dates: '9 Oct to 18 Nov', method: 'Survey', count: '214 responses', href: '#s'}]} />
    </>
  )
};

/** Every phase still to come: grey dots, grey spine. */
export const AllUpcoming: Story = {name: 'All upcoming', args: {phases: PHASES.map(p => ({...p, status: 'upcoming', count: undefined, fresh: undefined}))}};

/** Tab walks the phases in order, one link each; the phase being viewed says so. Try the keys here; an automated test presses them too (the Interactions panel). */
export const Keyboard: Story = {
  args: {phases: PHASES.map(p => ({...p, isCurrent: p.id === 'b'}))},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    for (const name of [/^Project background/, /^Collect ideas/, /^Community vote/, /^Feedback survey/]) {
      await userEvent.tab();
      await expect(canvas.getByRole('link', {name})).toHaveFocus();
    }
    await expect(canvas.getByRole('link', {name: /^Collect ideas/})).toHaveAttribute('aria-current', 'page');
  }
};
/** `onDelete`: each row shows a delete button on hover and focus (Rail phase's), but the phase being viewed, which
 * can't be deleted from its own screen. The play function deletes one. */
export const Deletable: Story = {
  render: function Render() {
    const [phases, setPhases] = useState(PHASES.map(p => ({...p, isCurrent: p.id === 'c'})));
    return <PhaseTimeline phases={phases} onDelete={p => setPhases(all => all.filter(x => x.id !== p.id))} />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {name: 'Delete Community vote'})).toBeNull();
    await userEvent.click(canvas.getByRole('button', {name: 'Delete Feedback survey'}));
    await waitFor(() => expect(canvas.queryByRole('link', {name: /Feedback survey/})).toBeNull());
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
  }
};

/* Invented: a project's events. */
const EVENTS: TimelinePhase[] = [
  {id: 'e1', kind: 'event', title: 'Walk along the river', status: 'done', dates: '10 Sep', href: '#e1'},
  {id: 'e2', kind: 'event', title: 'Parks budget workshop', status: 'upcoming', dates: '22 Oct', href: '#e2'}
];

/**
 * Not in Figma (the prototype's rail): the Events section, a timeline of events (`kind: 'event'`) under its Section
 * label, after Timeline and Spotlight. An event has no dot, no guide line and no count: its name, then "Done · 10 Sep".
 */
export const Events: Story = {
  tags: ['not-in-figma'],
  render: () => (
    <>
      <SectionLabel>Timeline</SectionLabel>
      <PhaseTimeline phases={PHASES} />
      <SectionLabel>Events</SectionLabel>
      <PhaseTimeline phases={EVENTS} />
    </>
  )
};

/** The timeline and its events, right to left: the dots and the guide line at the right. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: Events.render};

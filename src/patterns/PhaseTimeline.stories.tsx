import type {Meta, StoryObj} from '@storybook/react-vite';
import {PhaseTimeline, type TimelinePhase} from './PhaseTimeline';
import {RailSectionLabel} from '../components/gv/SectionLabel';

const PHASES: TimelinePhase[] = [
  {id: 'a', title: 'Project background', state: 'done', dates: '10 to 30 Aug', method: 'Sharing', count: '1,890 visits', href: '#a'},
  {id: 'b', title: 'Collect ideas', state: 'done', dates: '1 to 21 Sep', method: 'Ideation', count: '312 ideas', fresh: 18, href: '#b'},
  {id: 'c', title: 'Community vote', state: 'in-progress', dates: '19 Oct to 16 Nov', method: 'Voting', count: '1,240 votes', href: '#c'},
  {id: 'd', title: 'Feedback survey', state: 'upcoming', dates: '17 Nov to 7 Dec', method: 'Survey', href: '#d'}
];

const meta: Meta<typeof PhaseTimeline> = {
  title: 'Patterns/Project rail/Phase timeline',
  component: PhaseTimeline,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <nav aria-label="Phases" style={{width: 284}}><Story /></nav>]
};
export default meta;
type Story = StoryObj<typeof PhaseTimeline>;

/** Done, in progress and upcoming phases joined by the spine; one carries new inputs. */
export const Timeline: Story = {name: 'Default', args: {phases: PHASES}};

/** The phase being viewed is highlighted. */
export const Current: Story = {args: {phases: PHASES.map(p => ({...p, current: p.id === 'b'}))}};

/** Spotlight: methods outside the timeline, no spine. */
export const Spotlight: Story = {
  render: () => (
    <>
      <RailSectionLabel>Spotlight</RailSectionLabel>
      <PhaseTimeline phases={[{id: 's', title: 'Resident satisfaction', state: 'in-progress', dates: '9 Oct to 18 Nov', method: 'Survey', count: '214 responses', href: '#s'}]} />
    </>
  )
};

/** Every phase still to come: grey dots, grey spine. */
export const AllUpcoming: Story = {name: 'All upcoming', args: {phases: PHASES.map(p => ({...p, state: 'upcoming', count: undefined, fresh: undefined}))}};

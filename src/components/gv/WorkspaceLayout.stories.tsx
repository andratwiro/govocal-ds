import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {WorkspaceLayout} from './WorkspaceLayout';
import {Card} from './Card';
import {SectionLabel} from './SectionLabel';
import {Stack} from './Stack';
import {RailHeader} from '../../patterns/RailHeader';
import {PhaseTimeline} from '../../patterns/PhaseTimeline';
import {PhoneHeader, PhonePreview, PhoneStage} from '../../patterns/PhonePreview';

const meta: Meta<typeof WorkspaceLayout> = {
  title: 'Components/Layout & containers/Workspace layout',
  component: WorkspaceLayout,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'fullscreen'},
  decorators: [
    Story => (
      <div style={{display: 'grid', height: 760, padding: 'var(--gv-space-8)', background: 'var(--gv-surface-app)'}}>
        <Story />
      </div>
    )
  ]
};
export default meta;
type Story = StoryObj<typeof WorkspaceLayout>;

/* Invented: a project's phases. */
const PHASES = [
  {id: 'a', title: 'Project background', status: 'done', dates: '10 to 30 Aug', method: 'Sharing', count: '1,890 visits', href: '#a'},
  {id: 'b', title: 'Collect ideas', status: 'done', dates: '31 Aug to 27 Sep', method: 'Ideation', count: '312 ideas', fresh: 18, href: '#b'},
  {id: 'c', title: 'Shortlist proposals', status: 'in-progress', dates: '28 Sep to 18 Oct', method: 'Proposals', count: '48 proposals', href: '#c', isCurrent: true},
  {id: 'd', title: 'Feedback survey', status: 'upcoming', dates: '17 Nov to 7 Dec', method: 'Survey', href: '#d'}
] as const;

function Rail({onHide}: {onHide?: () => void}) {
  return (
    <Stack gap="16">
      <RailHeader title="Participation" onAdd={() => {}} onTogglePanel={onHide}
        labels={{add: 'Add a phase', togglePanel: 'Hide the participation rail'}} />
      <div>
        <SectionLabel>Timeline</SectionLabel>
        <PhaseTimeline phases={[...PHASES]} />
      </div>
    </Stack>
  );
}

const SETUP = (
  <Stack gap="8">
    <Card title="Dates" status="reviewed" pills={[{label: '28 Sep to 18 Oct 2026'}]} control="expand">The phase's dates.</Card>
    <Card title="What should an input be called?" status="to-review" pills={[{label: 'Proposal'}]} control="expand">Proposal</Card>
    <Card title="Collect demographic data" status="to-set" control="link" href="#" />
  </Stack>
);

const STAGE = (
  <PhoneStage caption="What residents see while the phase is open" onOpen={() => {}}>
    <PhonePreview aria-label="What residents see" header={<PhoneHeader />} surface="grey" />
  </PhoneStage>
);

function BuildRender() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <WorkspaceLayout rail={<Rail onHide={() => setCollapsed(true)} />} railLabel="Participation" isRailCollapsed={collapsed}
      onRailCollapsedChange={setCollapsed} column={SETUP} columnLabel="Proposals setup">
      {STAGE}
    </WorkspaceLayout>
  );
}

/**
 * A phase's Build tab: the rail, the setup column in the middle and the phone on its stage. The rail's own toggle
 * collapses it to a strip; the strip's button opens it again.
 */
export const Build: Story = {name: 'Default', render: BuildRender};

/** The rail collapsed to its 44 strip: the column and the stage take the width. */
export const RailCollapsed: Story = {
  name: 'Rail collapsed',
  args: {rail: <Rail />, railLabel: 'Participation', defaultRailCollapsed: true, column: SETUP, columnLabel: 'Proposals setup', children: STAGE}
};

/** Manage: the rail, the metrics column, and a list with its own panels on no fill (`main="plain"`). */
export const WithList: Story = {
  name: 'With a list',
  args: {
    rail: <Rail />,
    railLabel: 'Participation',
    column: (
      <Stack gap="8">
        <Card variant="filled" title="Waiting for a reply" summary="12" control="link" href="#" />
        <Card variant="filled" title="Unassigned" summary="5" control="link" href="#" />
      </Stack>
    ),
    columnLabel: 'Manage',
    main: 'plain',
    children: <Card variant="filled" title="48 proposals">The list goes here.</Card>
  }
};

/** No middle column: the overview's rail beside its stage. */
export const NoColumn: Story = {name: 'No column', args: {rail: <Rail />, railLabel: 'Participation', children: STAGE}};

/** Right to left: the rail at the right, the stage at the left. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: BuildRender};

/** The keyboard: the rail's toggle collapses it and focus lands on the strip's button; Enter opens the rail again. */
export const Keyboard: Story = {
  render: BuildRender,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Hide the participation rail'}));
    const show = canvas.getByRole('button', {name: 'Show panel'});
    show.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('complementary', {name: 'Participation'})).toBeVisible();
  }
};

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Text} from 'react-aria-components/Text';
import {Archive, CalendarClock, Link2, Rocket, UserPlus} from 'lucide-react';
import {MenuItem} from '../components/Menu';
import {Avatar, AvatarGroup} from '../components/gv/Avatar';
import {ProjectHeader, type ProjectHeaderMode} from './ProjectHeader';

const meta: Meta<typeof ProjectHeader> = {
  title: 'Patterns/Project page/Project header',
  component: ProjectHeader,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-876'}
  },
  args: {projectName: 'Green Corridors for Riverside', phaseName: 'Collect ideas'}
};
export default meta;
type Story = StoryObj<typeof ProjectHeader>;

/* The bar stories sit on the app grey, as the bar does on every project and phase screen. */
const onApp = (Story: () => React.ReactNode) => (
  <div style={{padding: 'var(--gv-space-16)', background: 'var(--gv-surface-app)'}}>
    <Story />
  </div>
);

const modes = (published: boolean): ProjectHeaderMode[] => [
  {id: 'build', label: 'Build'},
  {id: 'manage', label: 'Manage', isDisabled: !published},
  {id: 'insights', label: 'Insights', isDisabled: !published}
];

const me = <Avatar initials="S" aria-label="You are here" />;

const shareMenu = (
  <>
    <MenuItem id="invite" textValue="Invite collaborators"><UserPlus aria-hidden /><Text slot="label">Invite collaborators</Text></MenuItem>
    <MenuItem id="link" textValue="Copy preview link"><Link2 aria-hidden /><Text slot="label">Copy preview link</Text></MenuItem>
  </>
);

const publishMenu = (
  <>
    <MenuItem id="now" textValue="Publish now"><Rocket aria-hidden /><Text slot="label">Publish now</Text></MenuItem>
    <MenuItem id="schedule" textValue="Schedule publish"><CalendarClock aria-hidden /><Text slot="label">Schedule publish</Text></MenuItem>
  </>
);

const liveMenu = (
  <>
    <MenuItem id="access" textValue="Who can find and open it"><Link2 aria-hidden /><Text slot="label">Who can find and open it</Text></MenuItem>
    <MenuItem id="archive" textValue="Archive project"><Archive aria-hidden /><Text slot="label">Archive project</Text></MenuItem>
  </>
);

/** Figma's three Levels (the crumb frame), then the bar: a draft phase, a live one, the project with Share and Publish, and with unsaved changes. */
export const AllVariants: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--gv-space-16)'}}>
        <ProjectHeader {...args} level="project" />
        <ProjectHeader {...args} level="phase-draft" />
        <ProjectHeader {...args} level="phase-live" />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)', padding: 'var(--gv-space-16)', background: 'var(--gv-surface-app)'}}>
        <ProjectHeader {...args} level="phase-draft" modes={modes(false)} mode="build" people={me} onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} level="phase-live" phaseName="Vote on proposals" modes={modes(true)} mode="manage" people={<AvatarGroup initials={['S', 'M']} />} hasChanges onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} people={me} shareMenu={shareMenu} publishState="draft" publishMenu={publishMenu} onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} people={me} shareMenu={shareMenu} publishState="draft" publishMenu={publishMenu} hasChanges onSave={() => {}} onTogglePanel={() => {}} />
      </div>
    </div>
  )
};

/** Level=Project */
export const Project: Story = {
  args: {level: 'project'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-58'}}
};

/** Level=Phase · Draft */
export const PhaseDraft: Story = {
  name: 'Phase · Draft',
  args: {level: 'phase-draft'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-392'}}
};

/** Level=Phase · Live */
export const PhaseLive: Story = {
  name: 'Phase · Live',
  args: {level: 'phase-live', phaseName: 'Vote on proposals'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-473'}}
};

/**
 * A phase that isn't published yet: the crumbs end in its Draft badge, Manage and Insights wait for it to go live, and
 * Save stays off until something changes.
 */
export const Draft: Story = {
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase-draft', modes: modes(false), mode: 'build', people: me, onSave: () => {}, onTogglePanel: () => {}}
};

function ModeSwitch(args: React.ComponentProps<typeof ProjectHeader>) {
  const [mode, setMode] = useState('build');
  return <ProjectHeader {...args} mode={mode} onModeChange={setMode} />;
}

/** A live phase: Build · Manage · Insights in the middle of the bar (a survey has Build · Insights). Two people are in it. */
export const WithModeSwitch: Story = {
  name: 'With mode switch',
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {
    level: 'phase-live',
    phaseName: 'Vote on proposals',
    modes: modes(true),
    people: <AvatarGroup initials={['S', 'M']} />,
    onSave: () => {},
    onTogglePanel: () => {}
  },
  render: args => <ModeSwitch {...args} />
};

/** Unsaved changes in project setup: Share and Publish make way for one Save until it is saved (on a phase, Save turns on). */
export const WithChanges: Story = {
  name: 'With changes (Save)',
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {people: me, shareMenu, publishState: 'draft', publishMenu, hasChanges: true, onSave: () => {}, onTogglePanel: () => {}}
};

/** The project: Share ▾ and its state as a menu button: Publish ▾ while it is a draft, ● Live ▾ once published. */
export const ShareAndPublish: Story = {
  name: 'Share and Publish',
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {people: me, shareMenu, publishState: 'draft', publishMenu, onSave: () => {}, onTogglePanel: () => {}},
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <ProjectHeader {...args} />
      <ProjectHeader {...args} publishState="live" publishMenu={liveMenu} />
    </div>
  )
};

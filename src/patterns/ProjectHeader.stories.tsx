import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {Text} from 'react-aria-components/Text';
import {Archive, CalendarClock, Link2, Rocket, RotateCcw, UserPlus} from 'lucide-react';
import {MenuItem} from '../components/Menu';
import {Avatar, AvatarGroup} from '../components/gv/Avatar';
import {ProjectHeader, type ProjectHeaderMode} from './ProjectHeader';

const meta: Meta<typeof ProjectHeader> = {
  title: 'Patterns/Project page/Project header',
  component: ProjectHeader,
  tags: ['autodocs', 'status:candidate'],
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
    <MenuItem id="invite" textValue="Invite collaborators"><UserPlus aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Invite collaborators</Text></MenuItem>
    <MenuItem id="link" textValue="Copy preview link"><Link2 aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Copy preview link</Text></MenuItem>
  </>
);

const publishMenu = (
  <>
    <MenuItem id="now" textValue="Publish now"><Rocket aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Publish now</Text></MenuItem>
    <MenuItem id="schedule" textValue="Schedule publish"><CalendarClock aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Schedule publish</Text></MenuItem>
  </>
);

const liveMenu = (
  <>
    <MenuItem id="access" textValue="Who can find and open it"><Link2 aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Who can find and open it</Text></MenuItem>
    <MenuItem id="archive" textValue="Archive project"><Archive aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Archive project</Text></MenuItem>
  </>
);

/** Figma's three Levels (the crumb frame), then the bar: a draft phase, a live one, the project with Share and Publish, and with unsaved changes. */
export const AllVariants: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--gv-space-16)'}}>
        <ProjectHeader {...args} level="project" />
        <ProjectHeader {...args} level="phase" />
        <ProjectHeader {...args} level="phase" status="live" />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)', padding: 'var(--gv-space-16)', background: 'var(--gv-surface-app)'}}>
        <ProjectHeader {...args} level="phase" modes={modes(false)} mode="build" people={me} onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} level="phase" status="live" phaseName="Vote on proposals" modes={modes(true)} mode="manage" people={<AvatarGroup initials={['S', 'M']} />} hasChanges onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} people={me} shareMenu={shareMenu} status="draft" publishMenu={publishMenu} onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} people={me} shareMenu={shareMenu} status="draft" publishMenu={publishMenu} hasChanges onSave={() => {}} onTogglePanel={() => {}} />
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
  args: {level: 'phase'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-392'}}
};

/** Level=Phase · Live */
export const PhaseLive: Story = {
  name: 'Phase · Live',
  args: {level: 'phase', status: 'live', phaseName: 'Vote on proposals'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=5-473'}}
};

/**
 * A phase that isn't published yet: the crumbs end in its Draft badge, Manage and Insights wait for it to go live, and
 * Save stays off until something changes.
 */
export const Draft: Story = {
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase', modes: modes(false), mode: 'build', people: me, onSave: () => {}, onTogglePanel: () => {}}
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
    level: 'phase', status: 'live',
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
  args: {people: me, shareMenu, status: 'draft', publishMenu, hasChanges: true, onSave: () => {}, onTogglePanel: () => {}}
};

/** The project: Share ▾ and its state as a menu button: Publish ▾ while it is a draft, ● Live ▾ once published. */
export const ShareAndPublish: Story = {
  name: 'Share and Publish',
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {people: me, shareMenu, status: 'draft', publishMenu, onSave: () => {}, onTogglePanel: () => {}},
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <ProjectHeader {...args} />
      <ProjectHeader {...args} status="live" publishMenu={liveMenu} />
    </div>
  )
};

/**
 * The bar by keyboard: in a phase's mode switch the arrows move between modes and Enter picks one; on the project,
 * Enter on Share opens its menu and Esc closes it back to the button. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  decorators: [onApp],
  parameters: {layout: 'padded'},
  render: function Render(args) {
    const [mode, setMode] = useState('build');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
        <ProjectHeader {...args} level="phase" status="live" modes={modes(true)} mode={mode} onModeChange={setMode}
          onSave={() => {}} onTogglePanel={() => {}} />
        <ProjectHeader {...args} people={me} shareMenu={shareMenu} status="draft" publishMenu={publishMenu} onSave={() => {}} onTogglePanel={() => {}} />
      </div>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const build = canvas.getByRole('radio', {name: 'Build'});
    build.focus();
    await userEvent.keyboard('{ArrowRight}');
    const manage = canvas.getByRole('radio', {name: 'Manage'});
    await expect(manage).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(manage).toBeChecked());
    const share = canvas.getByRole('button', {name: 'Share'});
    share.focus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu', {name: 'Share'});
    await waitFor(() => expect(within(menu).getByRole('menuitem', {name: 'Invite collaborators'})).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(share).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Publish'})).toHaveFocus();
  }
};
const archivedMenu = (
  <MenuItem id="restore" textValue="Restore to draft"><RotateCcw aria-hidden /><Text className="react-aria-Text gv-base-text" slot="label">Restore to draft</Text></MenuItem>
);

/** An archived project: residents can still read it but no longer take part. The bar says Archived ▾, whose menu
 * restores it; a phase of it wears the Archived badge. The play function opens the menu. */
export const Archived: Story = {
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {people: me, shareMenu, status: 'archived', publishMenu: archivedMenu, onTogglePanel: () => {}},
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <ProjectHeader {...args} />
      <ProjectHeader level="phase" status="archived" projectName={args.projectName} phaseName={args.phaseName} />
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {name: /Publish/})).toBeNull();
    await userEvent.click(canvas.getByRole('button', {name: 'Archived'}));
    const restore = await screen.findByRole('menuitem', {name: 'Restore to draft'});
    await waitFor(() => expect(restore).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getAllByText('Archived')).toHaveLength(2);
  }
};

function SaveFlow(args: React.ComponentProps<typeof ProjectHeader>) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [back, setBack] = useState(false);
  return (
    <div style={{display: 'grid', gap: 'var(--gv-space-8)'}}>
      <ProjectHeader {...args} saveState={state}
        onSave={() => { setState('saving'); setTimeout(() => setState('saved'), 600); }}
        onBack={() => setBack(true)} />
      <span role="status" style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
        {back ? 'Back on the project' : state === 'saved' ? 'Saved' : ''}
      </span>
    </div>
  );
}

/**
 * Not in Figma (the prototype's phase bar): Save is on from the start; pressed, it saves (a busy button), then becomes
 * "Back to project", which leads back to the project's overview. `saveState` carries where it stands.
 */
export const SaveStates: Story = {
  name: 'Save, saving, back to project',
  tags: ['not-in-figma'],
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase', status: 'live', phaseName: 'Shortlist proposals', modes: modes(true), mode: 'build', people: me, onTogglePanel: () => {}},
  render: args => <SaveFlow {...args} />
};

/** Each step of the save, side by side: Save, saving (busy), Back to project. */
export const SaveStatesStill: Story = {
  name: 'Save states',
  tags: ['not-in-figma'],
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase', status: 'live', phaseName: 'Shortlist proposals', modes: modes(true), mode: 'build', people: me, onSave: () => {}, onBack: () => {}},
  render: args => (
    <div style={{display: 'grid', gap: 'var(--gv-space-16)'}}>
      <ProjectHeader {...args} saveState="idle" />
      <ProjectHeader {...args} saveState="saving" />
      <ProjectHeader {...args} saveState="saved" />
    </div>
  )
};

/**
 * Not in Figma: `modes` sets which tabs show and each one's unread dot. A survey phase has Build · Insights only; an
 * ideation phase with new inputs carries a dot on Manage. The status badge is the project's: an upcoming phase of a
 * live project reads Live.
 */
export const TabsAndUnread: Story = {
  name: 'Tabs and unread dot',
  tags: ['not-in-figma'],
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase', status: 'live', people: me, onSave: () => {}, onTogglePanel: () => {}},
  render: args => (
    <div style={{display: 'grid', gap: 'var(--gv-space-16)'}}>
      <ProjectHeader {...args} phaseName="Collect ideas" mode="build"
        modes={[{id: 'build', label: 'Build'}, {id: 'manage', label: 'Manage', hasUnread: true}, {id: 'insights', label: 'Insights'}]} />
      <ProjectHeader {...args} phaseName="Feedback survey" mode="build"
        modes={[{id: 'build', label: 'Build'}, {id: 'insights', label: 'Insights'}]} />
    </div>
  )
};

/** The phase bar right to left: the crumbs at the right, the actions at the left. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  decorators: [onApp],
  parameters: {layout: 'padded'},
  args: {level: 'phase', status: 'live', phaseName: 'Collect ideas', mode: 'build', people: me, onSave: () => {}, onTogglePanel: () => {},
    modes: [{id: 'build', label: 'Build'}, {id: 'manage', label: 'Manage', hasUnread: true}, {id: 'insights', label: 'Insights'}]}
};

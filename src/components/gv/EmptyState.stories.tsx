import type {CSSProperties, ReactNode} from 'react';
import {Bell, ClipboardList, Lightbulb, List, Lock, Map as MapIcon, Sparkles} from 'lucide-react';
import {EmptyState} from './EmptyState';
import {illustrationNames} from '../../illustrations/names';
import {Button} from '../Button';
import type {Meta, StoryObj} from '@storybook/react-vite';

// Not in Figma: every empty state the prototype shows, with its own words. The drawings are content
// (src/illustrations/, Foundations/Illustrations).
const meta: Meta<typeof EmptyState> = {
  title: 'Components/Status & feedback/Empty state',
  component: EmptyState,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma'],
  argTypes: {
    illustration: {control: 'select', options: [undefined, ...illustrationNames]},
    icon: {control: false},
    actions: {control: false}
  }
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const icon = (Icon: typeof List) => <Icon size={24} strokeWidth={1.75} />;

/** The places the prototype draws an empty state in: a white panel of a given size. */
const Panel = ({width, height, children, style}: {width: number; height?: number; children: ReactNode; style?: CSSProperties}) => (
  <div
    style={{
      width,
      height,
      display: 'grid',
      boxSizing: 'border-box',
      background: 'var(--gv-surface-panel)',
      border: '1px solid var(--gv-border-card)',
      borderRadius: 'var(--gv-radius-12)',
      ...style
    }}>
    {children}
  </div>
);

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 24, alignItems: 'start'}}>
      <Panel width={520} height={360}>
        <EmptyState
          illustration="empty-notebook"
          title="Ideas will appear here"
          description="Once the project is live, you can review and manage ideas here"
          actions={<Button variant="secondary">Go to project</Button>}
        />
      </Panel>
      <Panel width={280} height={260}>
        <EmptyState layout="panel" illustration="empty-notebook" title="No inputs yet" headingLevel="none" />
      </Panel>
      <Panel width={520} style={{padding: 16}}>
        <EmptyState
          isFramed
          icon={icon(Lightbulb)}
          title="No inputs yet"
          description="The first one appears here as soon as someone submits."
          headingLevel="none"
        />
      </Panel>
      <Panel width={280}>
        <EmptyState layout="panel" icon={icon(MapIcon)} title="Map" description="Show inputs on a map by location." />
      </Panel>
    </div>
  )
};

export const Default: Story = {
  args: {
    illustration: 'empty-notebook',
    title: 'Ideas will appear here',
    description: 'Once the project is live, you can review and manage ideas here'
  }
};

/** Manage tab of a phase before the project is live (prototype: the Manage tab, project not published). */
export const ManageTab: Story = {
  name: 'Manage tab',
  render: () => (
    <Panel width={720} height={420}>
      <EmptyState
        illustration="empty-notebook"
        title="Ideas will appear here"
        description="Once the project is live, you can review and manage ideas here"
      />
    </Panel>
  )
};

export const InsightsTab: Story = {
  name: 'Insights tab',
  render: () => (
    <Panel width={720} height={420}>
      <EmptyState
        illustration="empty-notebook"
        title="Insights will appear here"
        description="Once the project is live, insights will help you turn participation into clear results"
      />
    </Panel>
  )
};

/** The side panel next to the input list: drawing at 96, the title only. */
export const SidePanel: Story = {
  name: 'Side panel',
  render: () => (
    <div style={{display: 'flex', gap: 24}}>
      <Panel width={280} height={280}>
        <EmptyState layout="panel" illustration="empty-notebook" title="No inputs yet" headingLevel="none" />
      </Panel>
      <Panel width={280} height={280}>
        <EmptyState layout="panel" illustration="empty-notebook" title="No insights yet" headingLevel="none" />
      </Panel>
    </div>
  )
};

/** The phase's input list while nothing has come in (prototype: the mirror of the front office). */
export const InputList: Story = {
  name: 'Input list',
  render: () => (
    <Panel width={420} style={{padding: 16}}>
      <EmptyState
        isFramed
        icon={icon(Lightbulb)}
        title="No inputs yet"
        description="The first one appears here as soon as someone submits."
        headingLevel="none"
      />
    </Panel>
  )
};

/** The front office's input list while the project is a draft. */
export const FrontOfficeDraft: Story = {
  name: 'Front office · Not published',
  render: () => (
    <Panel width={360}>
      <EmptyState
        layout="panel"
        title="No inputs yet"
        description="Your project isn't published. Once it goes live, participants' inputs will appear here."
      />
    </Panel>
  )
};

/** The platform's phase pages before they have content: an icon, the page's name, what will be there. */
export const PlatformPages: Story = {
  name: 'Platform pages',
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 16}}>
      {[
        [List, 'Ideas', 'Submitted inputs appear here once the phase is live.'],
        [ClipboardList, 'Form', 'Configure the fields participants fill in when they submit an input.'],
        [MapIcon, 'Map', 'Show inputs on a map by location.'],
        [Sparkles, 'Insights', 'AI analysis and participation stats appear here.'],
        [Lock, 'Phase access and user data', 'Control who can participate and what data you collect.'],
        [Bell, 'Notifications', 'Automated emails sent during this phase.']
      ].map(([Icon, title, text]) => (
        <Panel key={title as string} width={280}>
          <EmptyState layout="panel" icon={icon(Icon as typeof List)} title={title as string} description={text as string} />
        </Panel>
      ))}
    </div>
  )
};

/** One line where a list or a card is empty: the title alone, no drawing. */
export const TextOnly: Story = {
  name: 'Text only',
  render: () => (
    <div style={{display: 'grid', gap: 16}}>
      {[
        'Nothing to preview yet',
        'No comments yet',
        'No participants yet',
        'All caught up. Nothing left to suggest.',
        'No statements yet. Add one in Build, or start from past inputs.',
        'No demographic data available for this phase.'
      ].map(t => (
        <Panel key={t} width={360}>
          <EmptyState layout="panel" title={t} headingLevel="none" />
        </Panel>
      ))}
    </div>
  )
};

/**
 * With its one next step. The prototype's first Manage tab had "Go to project" (where a project is published); it later
 * dropped the action there, so the tabs above have none.
 */
export const WithAction: Story = {
  name: 'With action',
  render: () => (
    <Panel width={520} height={380}>
      <EmptyState
        illustration="empty-notebook"
        title="Ideas will appear here"
        description="Once the project is live, you can review and manage ideas here"
        actions={<Button variant="secondary">Go to project</Button>}
      />
    </Panel>
  )
};

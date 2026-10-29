import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  CircleAlert,
  CircleHelp,
  Download,
  FileChartColumn,
  FileText,
  Flag,
  Folder,
  Gift,
  Lightbulb,
  Link,
  List,
  ListChecks,
  Plus,
  Sparkles,
  Upload
} from 'lucide-react';
import {CompactButton} from './CompactButton';
import {TextField} from '../TextField';
import {Card, CardRadio, CardRadioGroup, CardSwitch, type CardProps} from './Card';
import {Badge} from './Badge';
import {PICTURES} from './story-images';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});
const width = (w: number) => [(Story: () => JSX.Element) => <div style={{width: w}}><Story /></div>];

const meta: Meta<typeof Card> = {
  title: 'Components/Layout & containers/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: figma('14-879')
};
export default meta;
type Story = StoryObj<typeof Card>;

/* ── The 23 Figma types as Card props ─────────────────────────────────────────── */

const add: CardProps = {title: 'Attachments', iconActions: [{icon: Plus, label: 'Add an attachment'}]};
const empty: CardProps = {control: 'placeholder'};
const required: CardProps = {
  title: 'Dates', isRequired: true, control: 'expand',
  children: 'Collect ideas runs from 12 January to 28 February 2027.'
};
const reviewIconPill: CardProps = {
  title: 'What should an input be called?', status: 'to-review', pills: [{label: 'Idea', icon: Lightbulb}],
  control: 'expand', children: 'Participants see "Idea" on buttons, cards and emails in Green Corridors for Riverside.'
};
const reviewPill: CardProps = {
  title: 'Idea form', status: 'to-review', pills: [{label: '6 questions'}], control: 'expand',
  children: 'Title, description, location, images, attachments and one custom question.'
};
const toSet: CardProps = {title: 'Collect demographic data', status: 'to-set', control: 'open'};
const reviewPillSection: CardProps = {
  title: 'Available views', status: 'to-review', pills: [{label: 'List'}], control: 'expand',
  children: 'Participants can browse ideas as a list. Add a map to show where they are.'
};
const reviewPillDropdown: CardProps = {
  title: 'Sorting', status: 'to-review', control: 'menu', defaultValue: 'trending',
  menuItems: [
    {id: 'trending', label: 'Trending'}, {id: 'discussed', label: 'Most discussed'}, {id: 'random', label: 'Random'},
    {id: 'reactions', label: 'Most reactions'}, {id: 'recent', label: 'Most recent'}, {id: 'oldest', label: 'Oldest'}
  ]
};
const manageAdd: CardProps = {variant: 'filled', title: 'Add an idea', iconActions: [{icon: Plus, label: 'Add an idea'}]};
const manageNotSet: CardProps = {
  variant: 'filled', title: 'Import paper ideas', summary: 'Not set',
  iconActions: [{icon: Upload, label: 'Import paper ideas'}]
};
const statements: CardProps = {
  title: 'Statements',
  actions: (
    <>
      <CompactButton>Add</CompactButton>
      <CompactButton variant="primary">Import</CompactButton>
    </>
  )
};
const insightsAddReport: CardProps = {
  variant: 'filled', title: 'Add a report', iconActions: [{icon: FileChartColumn, label: 'Add a report'}]
};
const insightsShareResults: CardProps = {
  variant: 'filled', title: 'Share results with participants', iconActions: [{icon: Link, label: 'Share results'}]
};
const insightsAiSummary: CardProps = {
  variant: 'filled', title: 'Get an AI Sensemaking summary', iconActions: [{icon: Sparkles, label: 'Get an AI summary'}]
};
const manageExports: CardProps = {
  variant: 'filled', title: 'Exports', summary: 'Not set', iconActions: [{icon: Download, label: 'Download the ideas'}]
};
const embedUrl: CardProps = {
  title: 'Embed Konveio URL', isRequired: true,
  children: <TextField aria-label="Konveio URL" placeholder="https://" />
};
const report: CardProps = {
  title: 'Report',
  actions: (
    <>
      <CompactButton>Download</CompactButton>
      <CompactButton variant="primary" icon={<Plus aria-hidden />}>Add a report</CompactButton>
    </>
  )
};
const namingProposals: CardProps = {
  title: 'What should an input be called?', status: 'to-review', pills: [{label: 'Proposal', icon: FileText}],
  control: 'expand', children: 'Participants see "Proposal" on buttons, cards and emails.'
};
const manageToggle: CardProps = {
  variant: 'filled', title: 'Publish responses automatically', summary: 'Not set',
  actions: <CardSwitch aria-label="Publish responses automatically" />,
  children: 'Official replies are posted and emailed to the proposer when you approve them.'
};
const surveyPlacement: CardProps = {
  layout: 'stacked', title: 'Survey placement', status: 'to-review',
  children: (
    <CardRadioGroup aria-label="Survey placement" orientation="horizontal" defaultValue="timeline">
      <CardRadio value="timeline" description="Appears on the timeline">Timeline</CardRadio>
      <CardRadio value="spotlight" description="Runs on its own, outside the timeline">Spotlight</CardRadio>
    </CardRadioGroup>
  )
};
const surveyOptions: CardProps = {
  layout: 'stacked', title: 'Survey options', status: 'to-review',
  children: (
    <CardRadioGroup aria-label="Survey options" defaultValue="survey">
      <CardRadio value="survey" description="AI-powered insights and a wide range of question types">Survey</CardRadio>
      <CompactButton>Add questions</CompactButton>
      <CardRadio value="poll" description="Set up a short, multiple-choice questionnaire">Quick poll</CardRadio>
      <CardRadio value="external" description="Embed a third-party survey">External survey</CardRadio>
    </CardRadioGroup>
  )
};
const optionsToVoteOn: CardProps = {
  title: 'Options to vote on',
  iconActions: [{icon: Plus, label: 'Add an option'}, {icon: Upload, label: 'Import options'}],
  actions: <CompactButton variant="primary">Create form</CompactButton>
};
const votingMethod: CardProps = {
  layout: 'stacked', title: 'Voting method', status: 'to-set',
  children: (
    <CardRadioGroup aria-label="Voting method">
      <CardRadio value="single" description="Participants can approve any of the options">One vote per option</CardRadio>
      <CardRadio value="multiple" description="Participants get an amount of votes to distribute between options">
        Multiple votes per option
      </CardRadio>
      <CardRadio value="budget" description="Participants pick the options that fit within a total budget">
        Budget allocation
      </CardRadio>
    </CardRadioGroup>
  )
};

/* ── Not in Figma (the prototype) ─────────────────────────────────────────────── */

/* The input term menu: each term with its icon; the chosen one's pill carries it too. */
const menuIcons: CardProps = {
  title: 'What should an input be called?', status: 'reviewed', control: 'menu', defaultValue: 'idea',
  menuItems: [
    {id: 'idea', label: 'Idea', icon: Lightbulb}, {id: 'option', label: 'Option', icon: ListChecks},
    {id: 'project', label: 'Project', icon: Folder}, {id: 'question', label: 'Question', icon: CircleHelp},
    {id: 'issue', label: 'Issue', icon: CircleAlert}, {id: 'contribution', label: 'Contribution', icon: Gift},
    {id: 'proposal', label: 'Proposal', icon: FileText}, {id: 'initiative', label: 'Initiative', icon: Flag}
  ]
};
/* A volunteering phase's Causes card before anyone signs up: Download volunteers is greyed and says why. */
const disabledAction: CardProps = {
  title: 'Causes', pills: [{label: '1 cause'}],
  iconActions: [
    {icon: List, label: 'Reorder causes', tooltip: 'Reorder'},
    {icon: Plus, label: 'Add a cause', tooltip: 'Add a cause'},
    {icon: Download, label: 'Download volunteers', isDisabled: true, tooltip: 'Nobody has signed up yet'}
  ]
};

const all: [string, CardProps, number][] = [
  ['Add', add, 444], ['Empty', empty, 444], ['Required', required, 444],
  ['Review · icon pill', reviewIconPill, 444], ['Review · pill', reviewPill, 444], ['To set', toSet, 444],
  ['Review · pill section', reviewPillSection, 444], ['Review · pill dropdown', reviewPillDropdown, 444],
  ['Manage · add', manageAdd, 276], ['Manage · not set', manageNotSet, 276], ['Statements', statements, 444],
  ['Insights · Add a report', insightsAddReport, 268], ['Insights · Share results', insightsShareResults, 268],
  ['Insights · AI summary', insightsAiSummary, 268], ['Manage · Exports', manageExports, 276],
  ['Embed URL', embedUrl, 444], ['Report', report, 444], ['Naming · proposals', namingProposals, 444],
  ['Manage · Toggle', manageToggle, 276], ['Survey placement', surveyPlacement, 444],
  ['Survey options', surveyOptions, 444], ['Options to vote on', optionsToVoteOn, 444], ['Voting method', votingMethod, 444],
  ['Menu · icons', menuIcons, 444], ['Disabled action', disabledAction, 444]
];

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 24, width: 'min(1440px, 94vw)'}}>
      {all.map(([name, props, w]) => (
        <div key={name} style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <span style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-tertiary)'}}>{name}</span>
          <div
            style={{width: w, padding: props.variant === 'filled' ? 8 : 0,
              background: props.variant === 'filled' ? 'var(--gv-surface-tertiary)' : undefined}}>
            <Card {...props} />
          </div>
        </div>
      ))}
    </div>
  )
};

/** Manage and Insights cards sit on the grey stage. */
const stage = (w: number) => [
  (Story: () => JSX.Element) => (
    <div style={{width: w, padding: 16, background: 'var(--gv-surface-tertiary)'}}><Story /></div>
  )
];

export const Add: Story = {args: add, decorators: width(444), parameters: figma('4-217')};
export const Empty: Story = {args: empty, decorators: width(444), parameters: figma('4-346')};
export const Required: Story = {args: required, decorators: width(444), parameters: figma('5-154')};
export const ReviewIconPill: Story = {name: 'Review · icon pill', args: reviewIconPill, decorators: width(444), parameters: figma('5-177')};
export const ReviewPill: Story = {name: 'Review · pill', args: reviewPill, decorators: width(444), parameters: figma('5-198')};
export const ToSet: Story = {name: 'To set', args: toSet, decorators: width(444), parameters: figma('5-214')};
export const ReviewPillSection: Story = {name: 'Review · pill section', args: reviewPillSection, decorators: width(444), parameters: figma('5-234')};
/** The header drops a list; the chosen value is the pill (the prototype's Sorting card). */
export const ReviewPillDropdown: Story = {name: 'Review · pill dropdown', args: reviewPillDropdown, decorators: width(444), parameters: figma('5-254')};

export const ManageAdd: Story = {name: 'Manage · add', args: manageAdd, decorators: stage(276), parameters: figma('5-414')};
export const ManageNotSet: Story = {name: 'Manage · not set', args: manageNotSet, decorators: stage(276), parameters: figma('5-430')};
export const Statements: Story = {args: statements, decorators: width(444), parameters: figma('24-196')};
export const InsightsAddReport: Story = {name: 'Insights · Add a report', args: insightsAddReport, decorators: stage(268), parameters: figma('24-343')};
export const InsightsShareResults: Story = {name: 'Insights · Share results', args: insightsShareResults, decorators: stage(268), parameters: figma('24-353')};
export const InsightsAiSummary: Story = {name: 'Insights · AI summary', args: insightsAiSummary, decorators: stage(268), parameters: figma('24-363')};
export const ManageExports: Story = {name: 'Manage · Exports', args: manageExports, decorators: stage(276), parameters: figma('24-496')};
export const EmbedUrl: Story = {name: 'Embed URL', args: embedUrl, decorators: width(444), parameters: figma('24-508')};
export const Report: Story = {args: report, decorators: width(444), parameters: figma('25-423')};
export const NamingProposals: Story = {name: 'Naming · proposals', args: namingProposals, decorators: width(444), parameters: figma('25-454')};
export const ManageToggle: Story = {name: 'Manage · Toggle', args: manageToggle, decorators: stage(276), parameters: figma('25-598')};
export const SurveyPlacement: Story = {name: 'Survey placement', args: surveyPlacement, decorators: width(444), parameters: figma('25-632')};
export const SurveyOptions: Story = {name: 'Survey options', args: surveyOptions, decorators: width(444), parameters: figma('25-670')};
export const OptionsToVoteOn: Story = {name: 'Options to vote on', args: optionsToVoteOn, decorators: width(444), parameters: figma('26-445')};
export const VotingMethod: Story = {name: 'Voting method', args: votingMethod, decorators: width(444), parameters: figma('26-478')};

/** Not in Figma (the prototype, 22 Oct): once the admin has looked, the notice turns green. */
export const Reviewed: Story = {args: {...reviewPillDropdown, status: 'reviewed'}, decorators: width(444)};

/** Not in Figma (the prototype's input term menu): each value with its icon; the chosen one's pill carries it too. */
export const MenuIcons: Story = {name: 'Menu · icons', args: menuIcons, decorators: width(444), tags: ['not-in-figma']};

/**
 * Not in Figma (the prototype's Causes card): an action with nothing to do yet is greyed but stays focusable, and its
 * tooltip says why ("Nobody has signed up yet"). Every header action can carry a tooltip.
 */
export const DisabledAction: Story = {
  name: 'Disabled action',
  args: disabledAction,
  decorators: width(444),
  tags: ['not-in-figma']
};

/**
 * Not in Figma (the prototype's project card, the Inspiration hub and the template gallery): a picture on top, edge to
 * edge under the border, then the title. An `<img>` fills the width at 2:1.
 */
export const WithMedia: Story = {
  name: 'With media',
  tags: ['not-in-figma'],
  decorators: width(320),
  args: {
    layout: 'stacked',
    title: 'Green corridors for the riverside',
    media: <img src={PICTURES.park} alt="" />,
    children: (
      <span style={{display: 'flex', gap: 'var(--gv-space-6)'}}>
        <Badge>Ideation</Badge><Badge>Voting</Badge>
      </span>
    )
  }
};

/** Not in Figma: a row card on the grey stage (`variant="filled"`) with a picture on top. */
export const WithMediaFilled: Story = {
  name: 'With media · filled',
  tags: ['not-in-figma'],
  decorators: stage(320),
  args: {
    variant: 'filled',
    title: 'Library opening hours',
    summary: 'Survey',
    media: <img src={PICTURES.library} alt="" />,
    control: 'open'
  }
};

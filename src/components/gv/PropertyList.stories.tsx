import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Menu, MenuItem, MenuTrigger} from '../Menu';
import {Select, SelectItem} from '../Select';
import {TagPicker} from './TagPicker';
import {PropertyList, PropertyListItem} from './PropertyList';
import {SidePanel, SidePanelSection} from './SidePanel';

// Story helpers, shared with the Side panel's stories: the pill Select (22, the drawer's size), the Tag picker and Menu.
// Every change applies at once (the panel has no Save).

export const STATUSES = ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'];
export const ASSIGNEES = ['Unassigned', 'Manager A', 'Manager B', 'Manager C'];
export const TAGS = ['Culture', 'Cycling', 'Environment', 'Public space', 'Safety', 'Transport'];
export const PHASES = ['Shortlist proposals', 'Community vote', 'Find common ground'];

type Change = (value: string) => void;

/** Status: a single choice, applied at once. A status set by the platform (an idea in screening) shows first and
 * can't be picked back. */
export function DemoStatus({value, onChange}: {value: string; onChange: Change}) {
  const options = STATUSES.includes(value) ? STATUSES : [value, ...STATUSES];
  return (
    <Select aria-label="Status" variant="pill" size={22} value={value} onChange={k => onChange(String(k))}
      disabledKeys={STATUSES.includes(value) ? [] : [value]}>
      {options.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
    </Select>
  );
}

/** Assignee: a single choice, applied at once. */
export function DemoAssignee({value, onChange}: {value: string; onChange: Change}) {
  return (
    <Select aria-label="Assignee" variant="pill" size={22} isSearchable searchPlaceholder="Search people..."
      value={value} onChange={k => onChange(String(k))}>
      {ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
    </Select>
  );
}

/** Tags: removable tags, then "Add tag" opening the project's tags (searchable past five). */
export function DemoTags({value, onChange}: {value: string[]; onChange: (tags: string[]) => void}) {
  return <TagPicker aria-label="Tags" items={TAGS.map(t => ({id: t, label: t}))} value={value} onChange={onChange} />;
}

/** Phase: the phase's name, then "Copy to phase" opening the phases it can go to. */
export function DemoPhase({phase, onCopy}: {phase: string; onCopy?: Change}) {
  return (
    <>
      <span>{phase}</span>
      <MenuTrigger>
        <Button variant="quiet" size={32} hasMenu>Copy to phase</Button>
        <Menu aria-label="Copy to phase" onAction={k => onCopy?.(String(k))}>
          {PHASES.map(p => <MenuItem key={p} id={p}>{p}</MenuItem>)}
        </Menu>
      </MenuTrigger>
    </>
  );
}

/** The ideation panel's four properties, live. */
function IdeaProperties() {
  const [status, setStatus] = useState('Viewed');
  const [assignee, setAssignee] = useState('Unassigned');
  const [tags, setTags] = useState(['Culture']);
  return (
    <PropertyList aria-label="Idea details">
      <PropertyListItem label="Status"><DemoStatus value={status} onChange={setStatus} /></PropertyListItem>
      <PropertyListItem label="Assignee"><DemoAssignee value={assignee} onChange={setAssignee} /></PropertyListItem>
      <PropertyListItem label="Tags"><DemoTags value={tags} onChange={setTags} /></PropertyListItem>
      <PropertyListItem label="Phase"><DemoPhase phase="Collect ideas" /></PropertyListItem>
      <PropertyListItem label="Likes">48</PropertyListItem>
      <PropertyListItem label="Location" />
    </PropertyList>
  );
}

const meta: Meta<typeof PropertyList> = {
  title: 'Components/Data display/Property list',
  component: PropertyList,
  subcomponents: {PropertyListItem},
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  excludeStories: /^(Demo[A-Z]\w*|[A-Z_]+)$/,
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof PropertyList>;

/**
 * Every kind of value, as three side panels carry them, top to bottom. An idea: pickers to change Status and Assignee,
 * tags, a phase with an action, a number and an empty value. A proposal: plain text, because nobody picks its status
 * (the votes set it) and "Closed" is what Time left says once voting has ended. A statement: an assignee picker, a
 * number, and "–" for no value.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 32, width: 512}}>
      <IdeaProperties />
      <PropertyList aria-label="Proposal details">
        <PropertyListItem label="Status">Official response</PropertyListItem>
        <PropertyListItem label="Assignee"><DemoAssignee value="Manager B" onChange={() => {}} /></PropertyListItem>
        <PropertyListItem label="Time left">Closed</PropertyListItem>
      </PropertyList>
      <PropertyList aria-label="Statement details">
        <PropertyListItem label="Assignee"><DemoAssignee value="Unassigned" onChange={() => {}} /></PropertyListItem>
        <PropertyListItem label="Likes">2</PropertyListItem>
        <PropertyListItem label="Location" />
      </PropertyList>
    </div>
  )
};

/**
 * An idea's properties: Status and Assignee pickers, removable tags with "Add tag", the phase with "Copy to phase" (a
 * menu that copies the idea into another phase), a number and an empty value ("–", read as "Not set"). Each change
 * applies at once; the back office confirms it with an Undo toast, which this story leaves out.
 */
export const Default: Story = {
  render: () => <div style={{width: 512}}><IdeaProperties /></div>
};

/** Its place: a side panel's body, under the record's title. The side panel's own padding puts the labels 24px from its edge. */
export const InASidePanel: Story = {
  name: 'In a side panel',
  render: () => (
    <div style={{width: 560, height: 420}}>
      <SidePanel isInline label="Collect ideas" labels={{previous: 'Previous idea', next: 'Next idea'}} position={{current: 3, total: 124}}>
        <SidePanelSection>
          <p style={{margin: 0, font: 'var(--gv-type-body)'}}>
            Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet.
          </p>
        </SidePanelSection>
        <SidePanelSection><IdeaProperties /></SidePanelSection>
      </SidePanel>
    </div>
  )
};

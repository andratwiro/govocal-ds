import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import type {Key, Selection} from 'react-aria-components';
import {Plus} from 'lucide-react';
import {Button} from '../Button';
import {Menu, MenuItem, MenuTrigger} from '../Menu';
import {Select, SelectItem} from '../Select';
import {Tag, TagGroup} from '../TagGroup';
import {PropertyList, PropertyListItem} from './PropertyList';
import {SidePanel, SidePanelSection} from './SidePanel';

// Story helpers, shared with the Side panel's stories: today's Select, TagGroup and Menu. The pill Select and the Tag
// picker take their place once they land. Every change applies at once (the panel has no Save).

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
    <Select aria-label="Status" selectedKey={value} onSelectionChange={k => onChange(String(k))}
      disabledKeys={STATUSES.includes(value) ? [] : [value]}>
      {options.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
    </Select>
  );
}

/** Assignee: a single choice, applied at once. */
export function DemoAssignee({value, onChange}: {value: string; onChange: Change}) {
  return (
    <Select aria-label="Assignee" selectedKey={value} onSelectionChange={k => onChange(String(k))}>
      {ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
    </Select>
  );
}

/** Tags: removable tags, then "Add tag" opening a checklist of the project's tags. */
export function DemoTags({value, onChange}: {value: string[]; onChange: (tags: string[]) => void}) {
  return (
    <>
      {value.length > 0 && (
        <TagGroup aria-label="Tags" onRemove={(keys: Set<Key>) => onChange(value.filter(t => !keys.has(t)))}>
          {value.map(t => <Tag key={t} id={t}>{t}</Tag>)}
        </TagGroup>
      )}
      <MenuTrigger>
        <Button variant="quiet" size={32}><Plus aria-hidden size={16} />Add tag</Button>
        <Menu aria-label="Tags" selectionMode="multiple" selectedKeys={new Set(value)}
          onSelectionChange={(keys: Selection) => onChange(keys === 'all' ? TAGS : TAGS.filter(t => keys.has(t)))}>
          {TAGS.map(t => <MenuItem key={t} id={t}>{t}</MenuItem>)}
        </Menu>
      </MenuTrigger>
    </>
  );
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
  tags: ['autodocs', 'not-in-figma'],
  excludeStories: /^(Demo[A-Z]\w*|[A-Z_]+)$/,
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof PropertyList>;

/** Every kind of value, as the side panels of the four methods carry them: an idea (pickers, tags, a phase with an
 * action), a proposal (plain text: its status is set by the votes), a statement (a number, and "–" for no value). */
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

/** An idea's properties: Status and Assignee pickers, removable tags with "Add tag", the phase with "Copy to
 * phase", a number and an empty value ("–", read as "Not set"). Each change applies at once. */
export const Default: Story = {
  render: () => <div style={{width: 512}}><IdeaProperties /></div>
};

/** Its place: a side panel's body, under the record, the label column 24 from the panel's edge. */
export const InASidePanel: Story = {
  name: 'In a side panel',
  render: () => (
    <div style={{width: 560, height: 420}}>
      <SidePanel isInline label="Collect ideas" itemName="idea" position={{current: 3, total: 124}}>
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

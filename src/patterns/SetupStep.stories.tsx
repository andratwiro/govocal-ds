import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import type {Selection} from 'react-aria-components';
import {MapPin} from 'lucide-react';
import {Menu, MenuItem, SubmenuTrigger} from '../components/Menu';
import {OptionList} from '../components/gv/OptionList';
import {SetupStep} from './SetupStep';

const meta: Meta<typeof SetupStep> = {
  title: 'Patterns/Project page/Setup step',
  component: SetupStep,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-874'}
  },
  decorators: [Story => <div style={{width: 296}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SetupStep>;

const cardText = 'Shown wherever Green Corridors for Riverside is listed: homepage, folders, spaces and pages.';

// Invented: a platform's areas and topic tags.
const AREAS = ['Harbour', 'Old Town', 'Northgate', 'Riverside', 'Westside', 'Lakeshore'];
const TOPICS = ['Mobility', 'Public transit', 'Cycling & bike lanes', 'Roads & traffic', 'Parking', 'Climate', 'Energy',
  'Air quality', 'Green spaces', 'Water & rivers', 'Waste & recycling', 'Biodiversity'].map(t => ({id: t, label: t}));
const pin = <MapPin aria-hidden size={16} />;
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Set area: one of three choices; "Selected areas ›" opens a checklist of areas. The card says what is set. */
function SetArea({initial = []}: {initial?: string[]}) {
  const [mode, setMode] = useState<Selection>(new Set(initial.length ? ['selected'] : []));
  const [areas, setAreas] = useState<Selection>(new Set(initial));
  const picked = [...(mode === 'all' ? [] : mode)][0];
  const names = areas === 'all' ? AREAS : AREAS.filter(a => areas.has(a));
  const value = picked === 'none' ? 'No specific area' : picked === 'all' ? 'All areas'
    : picked === 'selected' && names.length ? (names.length === 1 ? names[0] : count(names.length, 'area', 'areas')) : undefined;
  return (
    <SetupStep kind="pick" pickerKind="menu" title="Set area" value={value} isDone={value != null} picker={
      <Menu aria-label="Area" selectionMode="single" selectedKeys={mode} onSelectionChange={setMode}>
        <MenuItem id="none" icon={pin} description="The project will not show when filtering by area.">No specific area</MenuItem>
        <MenuItem id="all" icon={pin} description="The project will show on every area filter.">All areas</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="selected" icon={pin} description={names.length ? `${count(names.length, 'area', 'areas')} selected`
            : 'The project will show on selected area filter(s).'}>Selected areas</MenuItem>
          <Menu aria-label="Areas" selectionMode="multiple" selectedKeys={areas}
            onSelectionChange={keys => { setAreas(keys); setMode(new Set(['selected'])); }}>
            {AREAS.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
          </Menu>
        </SubmenuTrigger>
      </Menu>
    } />
  );
}

/** Set topic tags: the Option list, searchable, with its footer. */
function SetTopicTags({initial = []}: {initial?: string[]}) {
  const [tags, setTags] = useState<string[]>(initial);
  return (
    <SetupStep kind="pick" title="Set topic tags" value={tags.length ? count(tags.length, 'tag', 'tags') : undefined}
      isDone={tags.length > 0} picker={
        <OptionList aria-label="Topic tags" items={TOPICS} value={tags} onChange={setTags} placeholder="Search tags..."
          labels={{search: () => 'Search tags'}} selectionLabel={n => (n ? `${count(n, 'tag', 'tags')} selected` : 'No tags selected')} />
      } />
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <SetupStep kind="open" title="Settings" />
      <SetupStep kind="expand" title="Set project card">{cardText}</SetupStep>
      <SetupStep kind="open" title="Edit project page" isDone />
      <SetupStep kind="expand" title="Set area" isDone defaultExpanded>
        Riverside North, Old Harbour
      </SetupStep>
      <SetArea initial={['Harbour']} />
      <SetTopicTags initial={['Green spaces', 'Climate']} />
    </div>
  )
};

/** Action=Open */
export const Open: Story = {
  args: {kind: 'open', title: 'Settings'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-19'}}
};

/** Action=Expand */
export const Expand: Story = {
  args: {kind: 'expand', title: 'Set project card', children: cardText},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-37'}}
};

/** Not in Figma (the prototype's PJP_CHK, 7 Oct): a done step, its dashed ring filled with a tick. */
export const Done: Story = {
  args: {kind: 'expand', title: 'Set area', isDone: true, defaultExpanded: true, children: 'Riverside North, Old Harbour'}
};

/** Not in Figma (the prototype's `.pjsum-pill--on`): a set step says what it is set to in a teal value badge before
 * the chevron, cut short before the title is. */
export const WithValue: Story = {
  name: 'With value',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <SetupStep kind="expand" title="Set area" value="Harbour" isDone>Harbour</SetupStep>
      <SetupStep kind="expand" title="Set topic tags" value="2 tags" isDone>Green spaces, Climate</SetupStep>
      <SetupStep kind="open" title="Plan participation" value="Riverside North, Old Harbour, Westside" isDone />
    </div>
  )
};

/** Not in Figma: Set area and Set topic tags open their picker under the card, as wide as it (Enter, Space or ↓ from
 * the card). Set area is a Menu (→ opens Selected areas' checklist); Set topic tags the Option list with its search and
 * Done. Esc closes the picker and gives focus back to the card; the value and the check follow what is picked. */
export const OpensAPicker: Story = {
  name: 'Opens a picker',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8, minHeight: 520}}>
      <SetArea />
      <SetTopicTags />
    </div>
  )
};

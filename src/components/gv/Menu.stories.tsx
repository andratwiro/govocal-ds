import {useState, type ReactNode} from 'react';
import type {Selection} from 'react-aria-components/Menu';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {Download, FileText, LayoutGrid, MapPin, Plus} from 'lucide-react';
import {Menu, MenuItem, MenuSection, MenuTrigger, Header, Separator, SubmenuTrigger} from '../Menu';
import {Button} from '../Button';
import {Badge} from './Badge';

const meta: Meta<typeof Menu> = {
  title: 'Components/Actions/Menu',
  component: Menu,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryFn<typeof Menu>;

// Invented data: a project's phases and areas.
const PHASES = ['Project background', 'Shortlist proposals', 'Community vote', 'Feedback survey', 'Find common ground'];
const AREAS = ['Harbour', 'Old Town', 'Northgate', 'Riverside', 'Westside', 'Lakeshore'];
const icon = (Icon: typeof Plus) => <Icon aria-hidden size={16} />;

/** A menu drawn open, without its trigger, in the popover's frame: for the overview only. */
function Frame({label, children}: {label: string; children: ReactNode}) {
  return (
    <figure style={{margin: 0, display: 'grid', gap: 8, alignContent: 'start'}}>
      <figcaption style={{font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{label}</figcaption>
      <div style={{width: 'fit-content', border: '1px solid var(--gv-border-control)', borderRadius: 12,
        background: 'var(--gv-surface-panel)', boxShadow: 'var(--gv-shadow-raised)'}}>{children}</div>
    </figure>
  );
}

const NewProject = () => (
  <Menu aria-label="New project">
    <MenuItem id="scratch" icon={icon(FileText)}>From scratch</MenuItem>
    <MenuItem id="template" icon={icon(LayoutGrid)}>Use a template</MenuItem>
  </Menu>
);

const DownloadInsights = () => (
  <Menu aria-label="Download insights">
    <MenuItem id="pdf">Download as PDF</MenuItem>
    <MenuItem id="word" badge={<Badge variant="outlined">Beta</Badge>}>Download as Word</MenuItem>
  </Menu>
);

const Export = () => (
  <Menu aria-label="Export">
    <MenuSection>
      <Header>Ideas</Header>
      <MenuItem id="ideas-pdf">Export ideas to PDF</MenuItem>
      <MenuItem id="ideas-xlsx">Export ideas to Excel</MenuItem>
    </MenuSection>
    <MenuSection>
      <Header>Project</Header>
      <MenuItem id="inputs">Export all project inputs to Excel</MenuItem>
      <MenuItem id="comments">Export all project comments to Excel</MenuItem>
    </MenuSection>
    <MenuSection>
      <Header>Votes</Header>
      <MenuItem id="by-option">Export votes by option to Excel</MenuItem>
      <MenuItem id="by-participant" isDisabled>Export votes by participant to Excel</MenuItem>
    </MenuSection>
  </Menu>
);

function CopyToPhase({initial = ['Community vote']}: {initial?: string[]}) {
  const [phases, setPhases] = useState<Selection>(new Set(initial));
  return (
    <Menu aria-label="Copy to phase">
      <MenuSection aria-label="Phases" selectionMode="multiple" selectedKeys={phases} onSelectionChange={setPhases}>
        {PHASES.map(p => <MenuItem key={p} id={p}>{p}</MenuItem>)}
      </MenuSection>
      <Separator />
      <MenuItem id="add" icon={icon(Plus)}>Add phase</MenuItem>
    </Menu>
  );
}

function Area() {
  const [mode, setMode] = useState<Selection>(new Set(['selected']));
  const [areas, setAreas] = useState<Selection>(new Set(['Harbour']));
  const n = areas === 'all' ? AREAS.length : areas.size;
  return (
    <Menu aria-label="Area" selectionMode="single" disallowEmptySelection selectedKeys={mode} onSelectionChange={setMode}>
      <MenuItem id="none" icon={icon(MapPin)} description="The project will not show when filtering by area.">No specific area</MenuItem>
      <MenuItem id="all" icon={icon(MapPin)} description="The project will show on every area filter.">All areas</MenuItem>
      <SubmenuTrigger>
        <MenuItem id="selected" icon={icon(MapPin)}
          description={n ? `${n} ${n === 1 ? 'area' : 'areas'} selected` : 'The project will show on selected area filter(s).'}>
          Selected areas
        </MenuItem>
        <Menu aria-label="Areas" selectionMode="multiple" selectedKeys={areas}
          onSelectionChange={keys => { setAreas(keys); setMode(new Set(['selected'])); }}>
          {AREAS.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
        </Menu>
      </SubmenuTrigger>
    </Menu>
  );
}

/** Every look, drawn open. Each story below has its trigger: open it with the mouse, or Enter / ↓ from the button. */
export const AllVariants: Story = () => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'start', maxWidth: 1040}}>
    <Frame label="With icons"><NewProject /></Frame>
    <Frame label="With badges"><DownloadInsights /></Frame>
    <Frame label="With sections"><Export /></Frame>
    <Frame label="Multiple with a footer action"><CopyToPhase /></Frame>
  </div>
);

/** The projects list's "New project ▾": a 16 icon before each item, in the strong icon grey. */
export const WithIcons: Story = () => (
  <MenuTrigger placement="bottom end">
    <Button hasMenu>New project</Button>
    <NewProject />
  </MenuTrigger>
);
WithIcons.storyName = 'With icons';

/** "Download as Word · Beta": an outlined Badge after the name, read with it. */
export const WithBadges: Story = () => (
  <MenuTrigger>
    <Button variant="secondary">{icon(Download)}Download insights</Button>
    <DownloadInsights />
  </MenuTrigger>
);
WithBadges.storyName = 'With badges';

/** Section labels (Small secondary) group the export formats; a disabled item stays in its place, greyed. */
export const WithSections: Story = () => (
  <MenuTrigger>
    <Button variant="secondary">{icon(Download)}Export</Button>
    <Export />
  </MenuTrigger>
);
WithSections.storyName = 'With sections';

/** Copy to phase: tick several phases (a box at the start; the menu stays open), then a divider and one action that
 * isn't a choice. The box shows on ticked rows and under the pointer. */
export const MultipleWithAFooterAction: Story = () => (
  <MenuTrigger>
    <Button variant="quiet" hasMenu>Copy to phase</Button>
    <CopyToPhase />
  </MenuTrigger>
);
MultipleWithAFooterAction.storyName = 'Multiple with a footer action';

/** The project's Area: one of three choices, each with a line saying what it does; the chosen one has a check at its
 * end. "Selected areas ›" opens a checklist of areas (→ or hover opens it, ← or Esc closes it); its line counts them. */
export const WithASubmenuChecklist: Story = () => (
  <MenuTrigger>
    <Button variant="secondary" hasMenu>{icon(MapPin)}Area</Button>
    <Area />
  </MenuTrigger>
);
WithASubmenuChecklist.storyName = 'With a submenu checklist';

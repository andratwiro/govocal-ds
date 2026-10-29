import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, ExternalLink, SquarePen, Trash2} from 'lucide-react';
import {Button} from '../Button';
import {ToastRegion, queue} from '../Toast';
import {DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow, DataTableText} from './DataTable';
import {PropertyList, PropertyListItem} from './PropertyList';
import {DemoAssignee, DemoPhase, DemoStatus, DemoTags} from './PropertyList.stories';
import {ReactionCounts} from './ReactionCounts';
import {SidePanel, SidePanelActions, SidePanelDecision, SidePanelRecordHead, SidePanelSection, type SidePanelAction} from './SidePanel';

// Invented ideas for the phase "Collect ideas": 124 of them, the texts taking turns.
const TEXTS = [
  'Improve the street lighting on the walk home, especially in winter when it gets dark early.',
  'Make the old harbour path a shortcut for bikes, and keep it apart from the walkers.',
  'Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet.',
  'Paint murals by local artists on the underpass, so the route to school feels safer.',
  'Add charging points for e-bikes and e-scooters on the ring road.',
  'Host a yearly neighbourhood festival that brings the different communities living here together.',
  'Plant wildflower strips instead of mown grass, to help bees and butterflies.',
  'Build more family-sized homes: families are moving out of the city because there is no room.',
  'Turn the empty lot next to the library into a community garden.',
  'Put public toilets and a drinking fountain in the park.',
  'Set up a repair café near the market instead of throwing small appliances away.',
  'Close the market street to cars on Saturday mornings.'
];
const AUTHORS = ['Noor A.', 'Pablo K.', 'Hana M.', 'Ilse D.', 'Teo B.', 'Yara S.'];
const STATUS_CYCLE = ['Proposed', 'Viewed', 'Viewed', 'Under consideration', 'Accepted', 'Proposed'];
const TAG_CYCLE = [['Safety'], ['Cycling'], ['Culture'], ['Culture', 'Safety'], ['Cycling', 'Transport'], ['Culture']];

export interface DemoIdea {
  n: number;
  text: string;
  author: string;
  date: string;
  likes: number;
  dislikes: number;
  status: string;
  assignee: string;
  tags: string[];
  /** Waiting for approval (the phase screens new ideas). */
  screening?: boolean;
}

export const IDEAS: DemoIdea[] = Array.from({length: 124}, (_, i) => ({
  n: i + 1,
  text: TEXTS[i % TEXTS.length],
  author: AUTHORS[i % AUTHORS.length],
  date: `${28 - (i % 20)} October 2026`,
  likes: (i * 37) % 140,
  dislikes: (i * 7) % 9,
  status: i === 7 ? 'Screening' : STATUS_CYCLE[i % STATUS_CYCLE.length],
  assignee: i % 3 === 0 ? 'Unassigned' : `Manager ${'ABC'[i % 3]}`,
  tags: TAG_CYCLE[i % TAG_CYCLE.length],
  screening: i === 7
}));

const QUICK: SidePanelAction[] = [
  {id: 'edit', label: 'Edit', icon: <SquarePen aria-hidden size={16} />},
  {id: 'view', label: 'View on the site', icon: <ExternalLink aria-hidden size={16} />},
  {id: 'delete', label: 'Delete', icon: <Trash2 aria-hidden size={16} />}
];

type Patch = (n: number, patch: Partial<DemoIdea>, toast: string) => void;

/** One idea in the panel: the screening strip when it waits for approval, the idea, its counts and quick actions,
 * then its properties. Every change applies at once, with an Undo toast. */
function IdeaBody({idea, patch}: {idea: DemoIdea; patch: Patch}) {
  return (
    <>
      <SidePanelSection>
        {idea.screening && (
          <SidePanelDecision title="Waiting for approval">
            <Button variant="secondary" onPress={() => patch(idea.n, {screening: false, status: 'Rejected'}, 'Idea rejected')}>
              Reject
            </Button>
            <Button onPress={() => patch(idea.n, {screening: false, status: 'Proposed'}, 'Idea approved and published')}>
              Approve
            </Button>
          </SidePanelDecision>
        )}
        <SidePanelRecordHead author={idea.author} date={idea.date} actions={(
          <SidePanelActions items={QUICK}><ReactionCounts likes={idea.likes} dislikes={idea.dislikes} /></SidePanelActions>
        )}>
          {idea.text}
        </SidePanelRecordHead>
      </SidePanelSection>
      <SidePanelSection>
        <PropertyList aria-label="Idea details">
          <PropertyListItem label="Status">
            <DemoStatus value={idea.status} onChange={v => patch(idea.n, {status: v}, `Status changed to ${v}`)} />
          </PropertyListItem>
          <PropertyListItem label="Assignee">
            <DemoAssignee value={idea.assignee} onChange={v => patch(idea.n, {assignee: v}, v === 'Unassigned' ? 'Idea unassigned' : `Assigned to ${v}`)} />
          </PropertyListItem>
          <PropertyListItem label="Tags">
            <DemoTags value={idea.tags} onChange={v => patch(idea.n, {tags: v}, 'Tags changed')} />
          </PropertyListItem>
          <PropertyListItem label="Phase">
            <DemoPhase phase="Collect ideas" onCopy={p => queue.add({title: `Copied to ${p}`}, {timeout: 5000})} />
          </PropertyListItem>
        </PropertyList>
      </SidePanelSection>
    </>
  );
}

/** The ideas, live: a change applies at once and its toast can undo it. */
function useIdeas(initial = IDEAS) {
  const [ideas, setIdeas] = useState(initial);
  const patch: Patch = (n, change, title) => {
    const before = ideas[n - 1];
    const undo = Object.fromEntries(Object.keys(change).map(k => [k, before[k as keyof DemoIdea]]));
    setIdeas(list => list.map(i => (i.n === n ? {...i, ...change} : i)));
    queue.add({title, action: 'Undo', onAction: () => setIdeas(list => list.map(i => (i.n === n ? {...i, ...undo} : i)))},
      {timeout: 6000});
  };
  return [ideas, patch] as const;
}

const ROWS = 10;
const rowOf = (n: number) => document.querySelector<HTMLElement>(`[role="row"][data-key="${n}"]`);

/** The Manage tab: the first page of ideas, and the side panel over its end edge. A row click (or Enter) shows that
 * idea in the panel; the pager walks the list; Esc or × closes it and puts focus back on the row. */
function Manage({start = 3, footer, width}: {start?: number | null; footer?: boolean; width?: 'default' | 'narrow'}) {
  const [ideas, patch] = useIdeas();
  const [open, setOpen] = useState<number | null>(start);
  const idea = open ? ideas[open - 1] : null;
  return (
    <div style={{minHeight: '100vh', boxSizing: 'border-box', padding: 24, background: 'var(--gv-surface-app)'}}>
      <section style={{width: 720, padding: '16px 24px', borderRadius: 12, background: 'var(--gv-surface-panel)'}}>
        <h2 style={{margin: '0 0 8px', font: 'var(--gv-type-title)', color: 'var(--gv-text-primary)'}}>124 ideas</h2>
        <DataTable aria-label="Ideas" onRowAction={key => setOpen(Number(key))} openKey={open}>
          <DataTableHeader>
            <DataTableColumn id="idea" isRowHeader>Idea</DataTableColumn>
            <DataTableColumn id="status">Status</DataTableColumn>
            <DataTableColumn id="likes" align="number">Likes</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {ideas.slice(0, ROWS).map(i => (
              <DataTableRow key={i.n} id={i.n} textValue={i.text}>
                <DataTableCell><DataTableText lines={2}>{i.text}</DataTableText></DataTableCell>
                <DataTableCell isMuted>{i.status}</DataTableCell>
                <DataTableCell align="number">{i.likes}</DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </section>
      <SidePanel
        label="Collect ideas"
        itemName="idea"
        width={width}
        isOpen={idea !== null}
        onOpenChange={o => !o && setOpen(null)}
        position={idea ? {current: idea.n, total: ideas.length} : undefined}
        onPositionChange={setOpen}
        returnFocus={() => (open ? rowOf(open) : null)}
        footer={footer && (
          <>
            <span role="status" style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginInlineEnd: 'auto',
              font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>
              <Check aria-hidden size={16} /> Changes are saved as you make them
            </span>
            <Button variant="secondary" onPress={() => setOpen(null)}>Done</Button>
          </>
        )}>
        {idea && (footer ? <LongBody idea={idea} patch={patch} /> : <IdeaBody idea={idea} patch={patch} />)}
      </SidePanel>
      <ToastRegion />
    </div>
  );
}

const LONG = [
  'The bike lane along the ring road shares the road with buses and lorries, and at the school gates it simply ' +
    'stops. Parents tell us they drive their children the last kilometre because the lane feels unsafe.',
  'We propose a protected lane from the station to the sports park: a kerb between bikes and cars, raised crossings ' +
    'at the four side streets, and bike parking at both ends.',
  'At the school gates the lane would run behind the bus stop, so buses no longer cut across it. Drop-off spaces ' +
    'move to the side street, which already has a crossing guard in the mornings.',
  'The trees along the road stay: the lane takes the strip of parking on the north side instead. The council\'s own ' +
    'count from last spring found that strip half empty on weekdays.',
  'Building it in two stages keeps the road open: the station half over the summer holidays, the sports park half ' +
    'the year after. A temporary lane with planters could test the layout first.',
  'Over 300 neighbours have backed this proposal, and the parents\' association of both schools on the route ' +
    'supports it. We are happy to help plan the test lane.'
];

/** A long idea: the body scrolls under the head while the footer stays put. */
function LongBody({idea, patch}: {idea: DemoIdea; patch: Patch}) {
  return (
    <>
      <SidePanelSection>
        <SidePanelRecordHead author={idea.author} date={idea.date} actions={(
          <SidePanelActions items={QUICK}><ReactionCounts likes={idea.likes} dislikes={idea.dislikes} /></SidePanelActions>
        )}>
          {LONG.map((p, i) => <p key={i}>{p}</p>)}
        </SidePanelRecordHead>
      </SidePanelSection>
      <SidePanelSection>
        <PropertyList aria-label="Idea details">
          <PropertyListItem label="Status">
            <DemoStatus value={idea.status} onChange={v => patch(idea.n, {status: v}, `Status changed to ${v}`)} />
          </PropertyListItem>
          <PropertyListItem label="Assignee">
            <DemoAssignee value={idea.assignee} onChange={v => patch(idea.n, {assignee: v}, `Assigned to ${v}`)} />
          </PropertyListItem>
          <PropertyListItem label="Tags">
            <DemoTags value={idea.tags} onChange={v => patch(idea.n, {tags: v}, 'Tags changed')} />
          </PropertyListItem>
          <PropertyListItem label="Phase"><DemoPhase phase="Collect ideas" /></PropertyListItem>
          <PropertyListItem label="Location">Ring road, between the station and the sports park</PropertyListItem>
          <PropertyListItem label="Budget" />
        </PropertyList>
      </SidePanelSection>
    </>
  );
}

/** A panel drawn in place (the docs page shows three side by side). */
function Inline({n}: {n: number}) {
  const [ideas, patch] = useIdeas();
  const [at, setAt] = useState(n);
  const idea = ideas[at - 1];
  return (
    <div style={{height: 640}}>
      <SidePanel isInline label="Collect ideas" itemName="idea" position={{current: at, total: ideas.length}}
        onPositionChange={setAt}>
        <IdeaBody idea={idea} patch={patch} />
      </SidePanel>
    </div>
  );
}

const meta: Meta<typeof SidePanel> = {
  title: 'Components/Overlays/Side panel',
  component: SidePanel,
  subcomponents: {SidePanelRecordHead, SidePanelActions, SidePanelSection, SidePanelDecision},
  tags: ['autodocs', 'not-in-figma'],
  excludeStories: /^(Demo[A-Z]\w*|[A-Z_]+)$/,
  parameters: {
    layout: 'fullscreen',
    // Each floating panel gets its own frame on the docs page.
    docs: {story: {inline: false, iframeHeight: 760}}
  }
};
export default meta;
type Story = StoryObj<typeof SidePanel>;

/** The panel's states side by side, drawn in place: the third idea of 124, the first (‹ off), and one waiting for
 * approval. */
export const AllVariants: Story = {
  parameters: {layout: 'padded', docs: {story: {inline: true}}},
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, minWidth: 1200}}>
      <Inline n={3} />
      <Inline n={1} />
      <Inline n={8} />
    </div>
  )
};

/** The ideation Manage tab with the third of 124 ideas open: the context label, the pager, ×; the idea, its
 * reactions and quick actions (each with its tooltip); its properties, which apply at once with an Undo toast. The
 * list stays usable: click another row and the panel shows it. */
export const Default: Story = {render: () => <Manage />};

/** The first idea: ‹ is off. Walking back here with ‹ moves focus to › before ‹ turns off. */
export const FirstRecord: Story = {name: 'First record', render: () => <Manage start={1} />};

/** The last idea of 124: › is off. Walking here with › moves focus to ‹ before › turns off. */
export const LastRecord: Story = {name: 'Last record', render: () => <Manage start={124} />};

/** A long idea: the body scrolls between the head and a footer that stays put. The footer says changes are kept as
 * they're made (the panel has no Save) and Done closes the panel. */
export const LongBodyWithFooter: Story = {name: 'Long body with footer', render: () => <Manage footer />};

/** Screening on: an idea waiting for approval opens on the decision strip, Reject and Approve. Deciding removes the
 * strip and a toast (with Undo) says what happened. */
export const Screening: Story = {render: () => <Manage start={8} />};

/** Closed: the list alone. A row click opens the panel and focus moves into it. */
export const Closed: Story = {render: () => <Manage start={null} />};

/** `width="narrow"`: 440 instead of 560, for a preview that leaves more of the list in view. */
export const Narrow: Story = {render: () => <Manage width="narrow" />};

/** Right to left (Arabic): the panel floats at the left edge, the pager's arrows point the other way. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: () => <Manage />};

/** The record head: an idea (its words, "Posted by" and the date) and an input, which has a title and says what its
 * author is. Both end on their `actions` row: counts and quick actions. */
export const RecordHead: Story = {
  name: 'Record head',
  parameters: {layout: 'padded', docs: {story: {inline: true}}},
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, minWidth: 900}}>
      <div style={{height: 300}}>
        <SidePanel isInline label="Collect ideas" itemName="idea">
          <SidePanelSection>
            <SidePanelRecordHead author={IDEAS[2].author} date={IDEAS[2].date} actions={(
              <SidePanelActions items={QUICK}><ReactionCounts likes={IDEAS[2].likes} dislikes={IDEAS[2].dislikes} /></SidePanelActions>
            )}>
              {IDEAS[2].text}
            </SidePanelRecordHead>
          </SidePanelSection>
        </SidePanel>
      </div>
      <div style={{height: 300}}>
        <SidePanel isInline label="Riverside park" itemName="input">
          <SidePanelSection>
            <SidePanelRecordHead title="Shade over the playground" author="Resident F" authorRole="Registered user"
              date="24 October 2026"
              actions={<SidePanelActions items={QUICK}><ReactionCounts likes={41} dislikes={2} comments={6} /></SidePanelActions>}>
              The playground has no shade at all. In July the slide is too hot to touch by eleven in the morning.
            </SidePanelRecordHead>
          </SidePanelSection>
        </SidePanel>
      </div>
    </div>
  )
};

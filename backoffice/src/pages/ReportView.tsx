import {Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode} from 'react';
import {useLocation, useParams} from 'react-router';
import {ArrowDown, ArrowUp, Bold, CalendarDays, ChartBar, ChartColumn, ChartLine, Clock, Copy, Download, FileText,
  Hash, Heading, Italic, Languages, Lightbulb, List, ListOrdered, Map as MapIcon, Minus, MoveVertical, Plus, Quote,
  SeparatorHorizontal, Send, Sparkles, Trash2, Type, X, ZoomIn, ZoomOut, Folder, LayoutGrid, FileType} from 'lucide-react';
import {Avatar, Badge, Banner, BarRow, Button, type ChartColor, ChartLegend, type ChartLegendItem, ChoiceCard,
  DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow, Divider, EmptyState,
  IconButton, LineChart, Menu, MenuItem, MenuTrigger, Modal, Panel, PropertyList, PropertyListItem, queue, RadioGroup,
  RichTextToolbarButton, SegmentedControl, SegmentedControlItem, Select, SelectItem, SidePanel, SidePanelSection,
  Skeleton, StatTile, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Text, TextArea, TextField, ToastRegion, Tooltip,
  TooltipTrigger} from 'govocal-ds';
import {Disclosure, DisclosureGroup, DisclosureHeader, DisclosurePanel, GridList, GridListHeader, GridListItem,
  GridListSection, Toolbar, Tree, TreeItem, TreeItemContent} from 'govocal-ds/base';
import {REPORTS} from '../data-reporting';
import {HISTORY, INSIGHTS, LANGUAGES, LIBRARY, REPORT, SNAPSHOT, SOURCES, SUGGESTIONS, TEMPLATE, type Block,
  type BlockKind, type Figure, type FigureWords, type HistoryEntry, type Lang, type SourceNode} from '../data-report';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

/*
 * The report view (the prototype's single report, rebuilt from the system). Three columns: the outline (Panel + Tree)
 * or the widget library (Panel + GridList), the report's pages, and an inline Side panel holding the assistant, the
 * selected block's settings, or the version history. The parts the system lacks are Gaps, named as the proposals
 * name them: Page stage, Block frame, Figure, Quote, Map, Chat, Activity feed, Sortable list.
 */

const GAPS = ['Page stage', 'Block frame', 'Figure', 'Quote', 'Map', 'Chat', 'Activity feed', 'Sortable list'];
const n = (v: number) => v.toLocaleString('en');
const toast = (title: string, description?: string, undo?: () => void) =>
  queue.add({title, description, ...(undo ? {action: 'Undo', onAction: undo} : {})}, {timeout: 6000});

const KIND: Record<BlockKind, {label: string; icon: typeof Type}> = {
  title: {label: 'Title page', icon: FileText},
  contents: {label: 'Contents', icon: ListOrdered},
  section: {label: 'Section', icon: Heading},
  text: {label: 'Text', icon: Type},
  space: {label: 'White space', icon: MoveVertical},
  divider: {label: 'Divider', icon: Minus},
  break: {label: 'Page break', icon: SeparatorHorizontal},
  numbers: {label: 'By the numbers', icon: Hash},
  bars: {label: 'Bar chart', icon: ChartBar},
  compare: {label: 'Comparison', icon: ChartColumn},
  line: {label: 'Line chart', icon: ChartLine},
  insight: {label: 'Insight from analysis', icon: Lightbulb},
  quotes: {label: 'Quotes', icon: Quote},
  map: {label: 'Map', icon: MapIcon},
  events: {label: 'Events', icon: CalendarDays}
};
/** Pinned blocks open the report: they keep their place (no move, no duplicate). */
const PINNED: BlockKind[] = ['title', 'contents'];
/** Blocks whose settings have a Data tab: what they count, how, and from where. */
const DATA_KINDS: BlockKind[] = ['numbers', 'bars', 'compare', 'line', 'insight', 'quotes', 'map', 'events'];
const STRUCTURE: BlockKind[] = ['space', 'divider', 'break'];
const ZOOMS = [50, 67, 75, 83, 90, 100, 110, 125];
const LANG_NAME = (l: Lang) => LANGUAGES.find(x => x.id === l)!.label;

/** The blocks cut into pages: a page break ends its page. */
function paginate(blocks: Block[]) {
  const pages: Block[][] = [[]];
  for (const b of blocks) {
    pages[pages.length - 1].push(b);
    if (b.kind === 'break') pages.push([]);
  }
  if (pages.length > 1 && !pages[pages.length - 1].length) pages.pop();
  const pageOf = new Map<string, number>();
  pages.forEach((p, i) => p.forEach(b => pageOf.set(b.id, i + 1)));
  return {pages: blocks.length ? pages : [], pageOf};
}

/** The section numbers, in reading order ("01", "02"). */
function sectionNumbers(blocks: Block[]) {
  const nums = new Map<string, string>();
  blocks.filter(b => b.kind === 'section').forEach((b, i) => nums.set(b.id, String(i + 1).padStart(2, '0')));
  return nums;
}

/** The outline: what comes before the first section stands alone; each section holds the blocks up to the next. */
function outlineOf(blocks: Block[]) {
  const top: {block: Block; children: Block[]}[] = [];
  for (const b of blocks) {
    const last = top[top.length - 1];
    if (b.kind !== 'section' && last?.block.kind === 'section') last.children.push(b);
    else top.push({block: b, children: []});
  }
  return top;
}

let made = 0;
const newId = (kind: string) => `${kind}-new-${++made}`;

/** A block for the library to add: a structure block with its defaults, a data block from the report's own data. */
function newBlock(kind: BlockKind): Block {
  const id = newId(kind);
  switch (kind) {
    case 'section': return {id, kind, name: 'New section', num: '', heading: 'New section', body: 'Write what this section shows.'};
    case 'text': return {id, kind, name: 'Text', body: 'New text. Write it in the settings.'};
    case 'space': return {id, kind, name: 'White space', size: 'small'};
    case 'divider': return {id, kind, name: 'Divider'};
    case 'break': return {id, kind, name: 'Page break'};
    default: {
      const from = TEMPLATE.find(b => b.kind === kind)!;
      return structuredClone({...from, id});
    }
  }
}

// ── Figure (proposed: Components/Charts/Figure) ─────────────────────────────────────────────────────────────────

/** What the editing language shows for one of a figure's words: its own, else the English. */
const words = (f: Figure, lang: Lang, k: keyof FigureWords) => (lang === 'en' ? f[k] : f.fr?.[k] || f[k]);

/** The stand-in for Figure: finding, measure, body, legend, then one foot (truncation, note, "Source: …"). */
function FigureStandIn({figure, lang, legend, truncation, showFinding = true, showSource = true, children}: {
  figure: Figure; lang: Lang; legend?: ReactNode; truncation?: string; showFinding?: boolean; showSource?: boolean; children: ReactNode;
}) {
  const note = words(figure, lang, 'note');
  return (
    <Gap name="Figure">
      <figure className="bo-report-figure">
        {showFinding && <h4 className="bo-report-finding">{words(figure, lang, 'finding')}</h4>}
        <p className="bo-note">{words(figure, lang, 'measure')}</p>
        <div className="bo-report-figure-body">{children}</div>
        {legend}
        <figcaption className="bo-report-foot">
          {truncation && <span className="bo-note">{truncation}</span>}
          {note && <span className="bo-note">{note}</span>}
          {showSource && <span className="bo-note">Source: {figure.source}</span>}
        </figcaption>
      </figure>
    </Gap>
  );
}

// ── Blocks ──────────────────────────────────────────────────────────────────────────────────────────────────────

const SHOWN = {top3: 3, top5: 5, all: Infinity};
/** Bars: one row per value, the rows the finding names in the accent and the rest grey (one rule, one token). */
function Bars({block, lang}: {block: Extract<Block, {kind: 'bars'}>; lang: Lang}) {
  const rows = block.rows.slice(0, SHOWN[block.show]);
  const max = Math.max(...block.rows.map(r => r.value ?? 0));
  const cut = rows.length < block.rows.length ? `Showing top ${rows.length} of ${block.rows.length}` : undefined;
  return (
    <FigureStandIn figure={block.figure} lang={lang} truncation={cut}>
      <div className="bo-report-bars">
        {rows.map(r => r.value === undefined
          ? <BarRow key={r.label} label={<>{r.label} <span className="bo-note">{r.missing}</span></>} />
          : <BarRow key={r.label} label={r.label} percent={(r.value / max) * 100} value={block.showValues ? n(r.value) : ''}
              barColor={r.named ? '--gv-chart-bar' : '--gv-chart-pass'} />)}
      </div>
    </FigureStandIn>
  );
}

function Comparison({block, lang}: {block: Extract<Block, {kind: 'compare'}>; lang: Lang}) {
  const max = Math.max(...block.groups.flatMap(g => g.rows.map(r => r.percent)));
  return (
    <FigureStandIn figure={block.figure} lang={lang}>
      <div className="bo-report-groups">
        {block.groups.map((g, i) => (
          <Fragment key={g.finding}>
            {i > 0 && <Divider />}
            <div className="bo-report-bars">
              <p>{g.finding}</p>
              {g.rows.map(r => (
                <BarRow key={r.label} label={r.label} percent={(r.percent / max) * 100}
                  value={block.showCounts ? `${r.percent}% · ${r.count}` : `${r.percent}%`}
                  barColor={r.named ? '--gv-chart-bar' : '--gv-chart-pass'} />
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    </FigureStandIn>
  );
}

function Quotes({block, lang}: {block: Extract<Block, {kind: 'quotes'}>; lang: Lang}) {
  return (
    <FigureStandIn figure={block.figure} lang={lang}>
      <div className="bo-report-quotes" data-layout={block.layout}>
        {block.quotes.map(q => (
          <Gap key={q.author} name="Quote">
            <blockquote className="bo-report-quote">
              <Badge variant="outlined">{q.tag}</Badge>
              <p>“{q.words}”</p>
              <footer className="bo-report-person">
                {block.showFaces && <Avatar initials={q.initials} size={28} />}
                <span className="bo-report-person-text"><span>{q.author}</span><span className="bo-note">{q.meta}</span></span>
              </footer>
            </blockquote>
          </Gap>
        ))}
      </div>
    </FigureStandIn>
  );
}

const SHADES = {rate: 'Participation', heat: 'Summer heat', none: 'None'};
const TAGS = [
  {id: 'none', label: 'No tag'}, {id: 'heat', label: 'Heat and shade'}, {id: 'school', label: 'Routes to school'},
  {id: 'parking', label: 'Parking and deliveries'}, {id: 'watering', label: 'Watering and care'}, {id: 'nature', label: 'Biodiversity'}
];

function MapBlock({block, lang}: {block: Extract<Block, {kind: 'map'}>; lang: Lang}) {
  const steps = block.shade === 'heat' ? ['1 coolest', '2', '3', '4', '5 hottest'] : ['Under 5', '5 to 8', '8 to 10', '10 to 12', '12 or more'];
  const layers: ChartLegendItem[] = [];
  if (block.layers.ideas) layers.push({label: 'Ideas · 386', color: 'line-primary'});
  if (block.layers.votes) layers.push({label: 'Cycle lane votes · 5 routes', color: 'line-secondary'});
  if (block.layers.events) layers.push({label: 'Upcoming events · 4', color: 'green'});
  const tag = TAGS.find(t => t.id === block.tag)!;
  return (
    <FigureStandIn figure={block.figure} lang={lang} legend={
      <div className="bo-report-legends">
        {block.shade !== 'none' && (
          <div className="bo-report-legend"><span className="bo-note">Districts: {SHADES[block.shade]}</span>
            <ChartLegend align="start" variant="square" items={steps.map((s, i) => ({label: s, color: `blue-${i + 1}` as ChartColor}))} /></div>
        )}
        {layers.length > 0 && (
          <div className="bo-report-legend"><span className="bo-note">On top</span><ChartLegend align="start" items={layers} /></div>
        )}
      </div>
    }>
      <Gap name="Map">
        <div className="bo-report-map">
          <p className="bo-note">
            8 districts{block.shade !== 'none' ? `, shaded by ${SHADES[block.shade].toLowerCase()}` : ''}
            {block.layers.ideas ? `; 386 idea pins${tag.id !== 'none' ? `, those tagged ${tag.label.toLowerCase()} highlighted` : ''}` : ''}
            {block.streets ? '; over the street map' : ''}.
          </p>
        </div>
      </Gap>
    </FigureStandIn>
  );
}

function Numbers({block}: {block: Extract<Block, {kind: 'numbers'}>}) {
  return (
    <div className="bo-report-numbers" data-layout={block.layout}>
      {block.items.map(i => <StatTile key={i.label} label={i.label} value={i.value} note={i.note} />)}
    </div>
  );
}

function Formatted({body, format}: {body: string; format?: {bold?: boolean; italic?: boolean; list?: boolean}}) {
  const wrap = (t: string) => {
    let el: ReactNode = t;
    if (format?.italic) el = <em>{el}</em>;
    if (format?.bold) el = <strong>{el}</strong>;
    return el;
  };
  if (format?.list) {
    const items = body.split(/(?<=\.)\s+/).filter(Boolean);
    return <ul className="bo-report-bullets">{items.map(t => <li key={t}>{wrap(t)}</li>)}</ul>;
  }
  return <p>{wrap(body)}</p>;
}

type Format = {bold?: boolean; italic?: boolean; list?: boolean};
const formatOf = (b: Block): Format => ((b as {format?: Format}).format ?? {});

function BlockBody({block, lang, nums, pageOf, blocks, reportTitle}: {
  block: Block; lang: Lang; nums: Map<string, string>; pageOf: Map<string, number>; blocks: Block[]; reportTitle: string;
}) {
  switch (block.kind) {
    case 'title':
      return (
        <div className="bo-report-title-page">
          <p className="bo-note">{block.kicker}</p>
          <div className="bo-report-title-words">
            <h2 className="bo-report-title">{block.title || reportTitle}</h2>
            <p>{block.subtitle}</p>
          </div>
          <PropertyList aria-label="About this report">
            {block.facts.map(f => <PropertyListItem key={f.label} label={f.label}>{f.value}</PropertyListItem>)}
          </PropertyList>
        </div>
      );
    case 'contents':
      return (
        <div className="bo-report-contents">
          <h3 className="bo-report-heading">Contents</h3>
          <ol className="bo-report-toc">
            {outlineOf(blocks).filter(o => o.block.kind === 'section').map(({block: s, children}) => (
              <li key={s.id}>
                <span className="bo-report-toc-row">
                  <span className="bo-note">{nums.get(s.id)}</span><span>{(s as Extract<Block, {kind: 'section'}>).heading}</span>
                  <span className="bo-note">{pageOf.get(s.id)}</span>
                </span>
                {block.showSub && children.filter(c => c.kind === 'text' && c.heading).map(c => (
                  <span key={c.id} className="bo-report-toc-row" data-sub>
                    <span /><span className="bo-note">{(c as Extract<Block, {kind: 'text'}>).heading}</span>
                    <span className="bo-note">{pageOf.get(c.id)}</span>
                  </span>
                ))}
              </li>
            ))}
          </ol>
        </div>
      );
    case 'section': {
      const heading = lang === 'fr' && block.fr?.heading ? block.fr.heading : block.heading;
      const body = lang === 'fr' && block.fr?.body ? block.fr.body : block.body;
      return (
        <div className="bo-report-text">
          <p className="bo-note">{nums.get(block.id)}</p>
          <h3 className="bo-report-heading">{heading}</h3>
          {block.bullets?.length
            ? <ul className="bo-report-bullets">{block.bullets.map(t => <li key={t}>{t}</li>)}</ul>
            : body && <Formatted body={body} format={formatOf(block)} />}
        </div>
      );
    }
    case 'text': {
      const heading = lang === 'fr' && block.fr?.heading ? block.fr.heading : block.heading;
      const body = lang === 'fr' && block.fr?.body ? block.fr.body : block.body;
      return (
        <div className="bo-report-text">
          {heading && <h4 className="bo-report-subheading">{heading}</h4>}
          <Formatted body={body} format={formatOf(block)} />
        </div>
      );
    }
    case 'space': return <div className="bo-report-space" data-size={block.size} />;
    case 'divider': return <Divider />;
    case 'break':
      return <div className="bo-report-break"><Divider /><span className="bo-note">Page break</span><Divider /></div>;
    case 'numbers': return <Numbers block={block} />;
    case 'bars': return <Bars block={block} lang={lang} />;
    case 'compare': return <Comparison block={block} lang={lang} />;
    case 'line':
      return (
        <FigureStandIn figure={block.figure} lang={lang}>
          <LineChart xAxis={block.labels} showLegend height={160}
            series={[{label: 'Observed', values: block.observed, color: 'line-primary'},
              ...(block.showEstimate ? [{label: 'Estimated at close', values: block.estimate, color: 'line-secondary' as const}] : [])]} />
        </FigureStandIn>
      );
    case 'insight': {
      const ins = INSIGHTS.find(i => i.id === block.insight) ?? INSIGHTS[0];
      return (
        <FigureStandIn figure={{...block.figure, finding: ins.question}} lang="en" showFinding={block.showQuestion} showSource={block.showOrigin}>
          <div className="bo-report-text">
            <p>{ins.lead}</p>
            {ins.points.length > 0 && <ul className="bo-report-bullets">{ins.points.map(p => <li key={p}>{p}</li>)}</ul>}
          </div>
        </FigureStandIn>
      );
    }
    case 'quotes': return <Quotes block={block} lang={lang} />;
    case 'map': return <MapBlock block={block} lang={lang} />;
    case 'events':
      return (
        <FigureStandIn figure={block.figure} lang={lang}>
          <DataTable aria-label={block.figure.measure}>
            <DataTableHeader showSelectAll={false}>
              <DataTableColumn>When</DataTableColumn>
              <DataTableColumn isRowHeader>Event</DataTableColumn>
              <DataTableColumn>Project</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>
              {block.events.map(e => (
                <DataTableRow key={e.title} id={e.title} textValue={e.title}>
                  <DataTableCell isMuted>{block.showEnd ? `${e.when} to ${e.ends}` : e.when}</DataTableCell>
                  <DataTableCell>{e.title}</DataTableCell>
                  <DataTableCell isMuted>{e.project}</DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </FigureStandIn>
      );
  }
}

// ── Block frame (proposed: Components/Layout & containers/Block frame) ───────────────────────────────────────

interface BlockActions {
  canUp: boolean;
  canDown: boolean;
  onMove: (d: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFormat: (f: Format) => void;
}

function Tool({label, action, isDisabled, onPress, children}: {
  label: string; action: string; isDisabled?: boolean; onPress: () => void; children: ReactNode;
}) {
  return (
    <TooltipTrigger>
      <IconButton aria-label={label} size={24} data-action={action} isDisabled={isDisabled} onPress={onPress}>{children}</IconButton>
      <Tooltip placement="top">{label}</Tooltip>
    </TooltipTrigger>
  );
}

/** One toolbar for every block: move, duplicate, delete; text adds formatting; pinned blocks only delete. */
function BlockToolbar({block, actions}: {block: Block; actions: BlockActions}) {
  const pinned = PINNED.includes(block.kind);
  const format = formatOf(block);
  const isText = block.kind === 'text' || (block.kind === 'section' && !block.bullets?.length);
  return (
    <Toolbar aria-label={`${block.name}: block tools`} className="bo-report-tools">
      {isText && (
        <>
          <RichTextToolbarButton aria-label="Bold" isSelected={!!format.bold} onChange={v => actions.onFormat({...format, bold: v})}>
            <Bold aria-hidden size={14} strokeWidth={1.75} />
          </RichTextToolbarButton>
          <RichTextToolbarButton aria-label="Italic" isSelected={!!format.italic} onChange={v => actions.onFormat({...format, italic: v})}>
            <Italic aria-hidden size={14} strokeWidth={1.75} />
          </RichTextToolbarButton>
          <RichTextToolbarButton aria-label="List" isSelected={!!format.list} onChange={v => actions.onFormat({...format, list: v})}>
            <List aria-hidden size={14} strokeWidth={1.75} />
          </RichTextToolbarButton>
        </>
      )}
      {!pinned && (
        <>
          <Tool label="Move up" action="up" isDisabled={!actions.canUp} onPress={() => actions.onMove(-1)}><ArrowUp aria-hidden size={16} /></Tool>
          <Tool label="Move down" action="down" isDisabled={!actions.canDown} onPress={() => actions.onMove(1)}><ArrowDown aria-hidden size={16} /></Tool>
          <Tool label="Duplicate" action="duplicate" onPress={actions.onDuplicate}><Copy aria-hidden size={16} /></Tool>
        </>
      )}
      <Tool label="Delete" action="delete" onPress={actions.onDelete}><Trash2 aria-hidden size={16} /></Tool>
    </Toolbar>
  );
}

function BlockFrame({block, isSelected, onSelect, onDeselect, actions, children}: {
  block: Block; isSelected: boolean; onSelect: () => void; onDeselect: () => void; actions: BlockActions; children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); }
  };
  // Esc from anywhere in the block (React Aria's controls keep their keys to themselves, so listen on the way down).
  const onKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isSelected) { e.preventDefault(); e.stopPropagation(); onDeselect(); e.currentTarget.focus(); }
  };
  return (
    <div id={`block-${block.id}`} data-block={block.id} className="bo-report-block" role="group" tabIndex={0}
      aria-label={`${KIND[block.kind].label}: ${block.name}`} aria-current={isSelected || undefined}
      data-selected={isSelected || undefined} data-kind={block.kind}
      onClickCapture={() => !isSelected && onSelect()} onKeyDown={onKeyDown} onKeyDownCapture={onKeyDownCapture}>
      {isSelected ? (
        <Gap name="Block frame">
          <div className="bo-report-chrome">
            <Badge variant="value">{block.name}</Badge>
            <BlockToolbar block={block} actions={actions} />
          </div>
          {children}
        </Gap>
      ) : children}
    </div>
  );
}

// ── Outline and library (left column) ───────────────────────────────────────────────────────────────────────────

function OutlineRow({block, num, page}: {block: Block; num?: string; page?: number}) {
  const Icon = KIND[block.kind].icon;
  return (
    <TreeItemContent>
      <span className="bo-report-row">
        {num ? <span className="bo-note">{num}</span> : <Icon aria-hidden size={16} />}
        <span className="bo-report-row-name">{block.name}</span>
        {page !== undefined && <span className="bo-note">{page}</span>}
      </span>
    </TreeItemContent>
  );
}

function Outline({blocks, nums, pageOf, selected, onSelect, onAdd}: {
  blocks: Block[]; nums: Map<string, string>; pageOf: Map<string, number>; selected: string | null;
  onSelect: (id: string | null) => void; onAdd: () => void;
}) {
  const outline = outlineOf(blocks);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const expanded = outline.filter(o => o.children.length && !collapsed.has(o.block.id)).map(o => o.block.id);
  const parent = outline.find(o => o.children.some(c => c.id === selected));
  const shown = parent && collapsed.has(parent.block.id) ? [...expanded, parent.block.id] : expanded;
  return (
    <Panel title="Report outline" className="bo-report-column bo-report-outline"
      actions={(
        <TooltipTrigger>
          <IconButton aria-label="Add widget" onPress={onAdd}><Plus aria-hidden size={16} /></IconButton>
          <Tooltip placement="bottom">Add widget</Tooltip>
        </TooltipTrigger>
      )}>
      {blocks.length ? (
        <Tree aria-label="Report outline" selectionMode="single" selectionBehavior="replace" selectedKeys={selected ? [selected] : []}
          onSelectionChange={k => onSelect(k === 'all' || !k.size ? null : String([...k][0]))}
          expandedKeys={shown} onExpandedChange={k => setCollapsed(new Set(outline.filter(o => o.children.length && !k.has(o.block.id)).map(o => o.block.id)))}>
          {outline.map(({block, children}) => (
            <TreeItem key={block.id} id={block.id} textValue={block.name}>
              <OutlineRow block={block} num={nums.get(block.id)} page={block.kind === 'section' ? pageOf.get(block.id) : undefined} />
              {children.map(c => (
                <TreeItem key={c.id} id={c.id} textValue={c.name}><OutlineRow block={c} /></TreeItem>
              ))}
            </TreeItem>
          ))}
        </Tree>
      ) : (
        <div className="bo-report-stack">
          <p className="bo-note">No widgets in this report yet.</p>
          <Button variant="secondary" size={32} onPress={onAdd}><Plus aria-hidden size={16} />Add widget</Button>
        </div>
      )}
    </Panel>
  );
}

function Library({onAdd, onClose}: {onAdd: (kind: BlockKind) => void; onClose: () => void}) {
  const ref = useRef<HTMLDivElement>(null);
  // Focus the first widget once the list has drawn its items (React Aria builds the collection first).
  useEffect(() => {
    const frame = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('.react-aria-GridListItem')?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div ref={ref} className="bo-report-column" onKeyDownCapture={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); } }}>
      <Panel title="Add widget" className="bo-report-outline"
        actions={(
          <TooltipTrigger>
            <IconButton aria-label="Back to the report outline" onPress={onClose}><X aria-hidden size={16} /></IconButton>
            <Tooltip placement="bottom">Back to the report outline</Tooltip>
          </TooltipTrigger>
        )}>
        <GridList aria-label="Widgets" layout="grid" className="bo-report-library"
          onAction={k => onAdd(String(k).split(':')[1] as BlockKind)}>
          {LIBRARY.map(g => (
            <GridListSection key={g.group}>
              <GridListHeader>{g.group}</GridListHeader>
              {g.items.map(it => {
                const Icon = KIND[it.kind].icon;
                return (
                  <GridListItem key={it.kind} id={`${g.group}:${it.kind}`} textValue={it.label}>
                    <span className="bo-report-widget">
                      <Icon aria-hidden size={16} />
                      <span className="bo-report-widget-text"><span>{it.label}</span><Text slot="description" className="bo-note">{it.description}</Text></span>
                    </span>
                  </GridListItem>
                );
              })}
            </GridListSection>
          ))}
        </GridList>
      </Panel>
    </div>
  );
}

// ── Right column: assistant, settings, history ──────────────────────────────────────────────────────────────────

interface Message {from: 'you' | 'assistant'; text: string; meta?: string}

function Assistant({messages, suggestions, onAsk}: {messages: Message[]; suggestions: string[]; onAsk: (text: string) => void}) {
  const [draft, setDraft] = useState('');
  const send = () => { if (draft.trim()) { onAsk(draft.trim()); setDraft(''); } };
  return (
    <Gap name="Chat">
      <div className="bo-report-chat">
        <ol className="bo-report-messages" aria-label="Conversation" aria-live="polite">
          {messages.map((m, i) => (
            <li key={i} className="bo-report-message" data-from={m.from}>
              {m.from === 'you' ? <Badge>{m.text}</Badge> : <p>{m.text}</p>}
              {m.meta && <span className="bo-note">{m.meta}</span>}
            </li>
          ))}
        </ol>
        <SidePanelSection title="What should it change?">
          <div className="bo-report-suggestions">
            {suggestions.map(s => (
              <Button key={s} variant="quiet" size={32} onPress={() => onAsk(s)}><Sparkles aria-hidden size={16} />{s}</Button>
            ))}
          </div>
        </SidePanelSection>
        <form className="bo-report-composer" onSubmit={e => { e.preventDefault(); send(); }}>
          <TextArea aria-label="Ask the assistant" placeholder="Ask the assistant…" value={draft} onChange={setDraft} />
          <IconButton aria-label="Send" variant="bordered" emphasis="strong" type="submit" isDisabled={!draft.trim()}><Send aria-hidden size={16} /></IconButton>
        </form>
      </div>
    </Gap>
  );
}

function HistoryFeed({entries, onRestore}: {entries: HistoryEntry[]; onRestore: (e: HistoryEntry) => void}) {
  const days = [...new Set(entries.map(e => e.day))];
  return (
    <Gap name="Activity feed">
      {days.map(d => (
        <SidePanelSection key={d} title={d}>
          <ol className="bo-report-feed">
            {entries.filter(e => e.day === d).map(e => (
              <li key={e.id} className="bo-report-entry">
                <Avatar initials={e.initials} size={28} />
                <div className="bo-report-entry-body">
                  <p><strong>{e.who}</strong> {e.what}</p>
                  <span className="bo-note">{e.when}{e.current ? ' · Showing now' : ''}</span>
                  {e.prompt && <blockquote className="bo-report-prompt"><p>“{e.prompt}”</p></blockquote>}
                  {e.blocks && <span className="bo-report-chips">{e.blocks.map(b => <Badge key={b} variant="outlined">{b}</Badge>)}</span>}
                  {e.detail && <span className="bo-note">{e.detail}</span>}
                  {!e.current && <Button variant="quiet" size={32} onPress={() => onRestore(e)}>Restore this version</Button>}
                </div>
              </li>
            ))}
          </ol>
        </SidePanelSection>
      ))}
    </Gap>
  );
}

const missingIn = (lang: Lang, has: boolean) => (lang !== 'en' && !has ? `Missing in ${LANG_NAME(lang)}: readers see the English.` : undefined);

/** A figure's words in the editing language; a field the language lacks says so and shows the English as a hint. */
function FigureFields({block, lang, onChange}: {block: Block & {figure: Figure}; lang: Lang; onChange: (f: Figure) => void}) {
  const f = block.figure;
  const value = (k: keyof FigureWords) => (lang === 'en' ? f[k] : f.fr?.[k] ?? '');
  const set = (k: keyof FigureWords, v: string) => onChange(lang === 'en' ? {...f, [k]: v} : {...f, fr: {...f.fr, [k]: v}});
  const field = (k: keyof FigureWords, label: string, long?: boolean) => {
    const props = {label, value: value(k), onChange: (v: string) => set(k, v), placeholder: lang === 'en' ? undefined : f[k],
      description: missingIn(lang, !!f.fr?.[k])};
    return long ? <TextArea key={k} {...props} /> : <TextField key={k} {...props} />;
  };
  return (
    <>
      {block.kind !== 'insight' && field('finding', 'Finding', true)}
      {field('measure', 'What it measures')}
      {block.kind !== 'insight' && field('note', 'Note under the chart', true)}
    </>
  );
}

function Pick<K extends string>({label, value, options, onChange}: {label: string; value: K; options: Record<K, string>; onChange: (v: K) => void}) {
  return (
    <div className="bo-report-field">
      <span className="bo-report-label" aria-hidden>{label}</span>
      <SegmentedControl aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={[value]}
        onSelectionChange={k => k.size && onChange([...k][0] as K)}>
        {(Object.keys(options) as K[]).map(k => <SegmentedControlItem key={k} id={k}>{options[k]}</SegmentedControlItem>)}
      </SegmentedControl>
    </div>
  );
}

function Settings({block, lang, patch}: {block: Block; lang: Lang; patch: (p: Partial<Block>) => void}) {
  const figure = 'figure' in block && block.figure
    ? <FigureFields block={block as Block & {figure: Figure}} lang={lang} onChange={figure => patch({figure} as Partial<Block>)} /> : null;
  const written = <p className="bo-note">Written by the assistant from platform data on 2 October 2026. The bars named in the finding are highlighted; the rest stay grey.</p>;
  switch (block.kind) {
    case 'title':
      return (
        <SidePanelSection>
          <TextField label="Title" value={block.title} onChange={title => patch({title})} description={missingIn(lang, false)} />
          <TextArea label="Subtitle" value={block.subtitle} onChange={subtitle => patch({subtitle})} description={missingIn(lang, false)} />
          <TextField label="Line at the top" value={block.kicker} onChange={kicker => patch({kicker})} />
        </SidePanelSection>
      );
    case 'contents':
      return (
        <SidePanelSection>
          <p className="bo-note">The contents follow the sections: their numbers and pages update as the report changes.</p>
          <Switch isSelected={block.showSub} onChange={showSub => patch({showSub})}>List the text headings under each section</Switch>
        </SidePanelSection>
      );
    case 'section':
    case 'text': {
      const fr = block.fr ?? {};
      const words = lang === 'en' ? {heading: block.heading ?? '', body: block.body} : {heading: fr.heading ?? '', body: fr.body ?? ''};
      const set = (k: 'heading' | 'body', v: string) => patch(lang === 'en' ? {[k]: v} : {fr: {...fr, [k]: v}} as Partial<Block>);
      return (
        <SidePanelSection>
          <p className="bo-note">Edit the words here; the block’s toolbar on the page sets bold, italic and a list.</p>
          <TextField label={block.kind === 'section' ? 'Section heading' : 'Heading (optional)'} value={words.heading}
            onChange={v => set('heading', v)} placeholder={lang === 'en' ? undefined : block.heading}
            description={block.heading ? missingIn(lang, !!fr.heading) : undefined} />
          {block.kind === 'section' && block.bullets?.length ? (
            <TextArea label="Points, one per line" value={block.bullets.join('\n')}
              onChange={v => patch({bullets: v.split('\n')} as Partial<Block>)} description={missingIn(lang, false)} />
          ) : (
            <TextArea label="Text" value={words.body} onChange={v => set('body', v)}
              placeholder={lang === 'en' ? undefined : block.body} description={missingIn(lang, !!fr.body)} />
          )}
        </SidePanelSection>
      );
    }
    case 'space':
      return (
        <SidePanelSection>
          <Pick label="Height" value={block.size} options={{small: 'Small', medium: 'Medium', large: 'Large'}} onChange={size => patch({size})} />
        </SidePanelSection>
      );
    case 'divider':
    case 'break':
      return (
        <SidePanelSection>
          <p className="bo-note">{block.kind === 'break'
            ? 'A page break starts a new page here. It has nothing to set: move or delete it from its toolbar.'
            : 'A divider draws a line between parts of a page. It has nothing to set: move or delete it from its toolbar.'}</p>
        </SidePanelSection>
      );
    case 'numbers':
      return (
        <>
          <SidePanelSection title="Layout">
            <RadioGroup aria-label="Layout" value={block.layout} onChange={v => patch({layout: v as typeof block.layout})}>
              <ChoiceCard value="row" description="The numbers side by side">Row</ChoiceCard>
              <ChoiceCard value="lead" description="The first number leads, the rest stack beside it">Lead</ChoiceCard>
              <ChoiceCard value="grid" description="Two by two">Grid</ChoiceCard>
            </RadioGroup>
          </SidePanelSection>
          <SidePanelSection title={`Numbers · ${block.items.length} of 4`}>
            <Gap name="Sortable list">
              <DisclosureGroup>
                {block.items.map((it, i) => {
                  const set = (k: 'label' | 'value' | 'note', v: string) =>
                    patch({items: block.items.map((x, j) => (j === i ? {...x, [k]: v} : x))});
                  return (
                    <Disclosure key={i} id={String(i)}>
                      <DisclosureHeader>{`${it.value} · ${it.label}`}</DisclosureHeader>
                      <DisclosurePanel>
                        <div className="bo-report-fields">
                          <TextField label="Number" value={it.value} onChange={v => set('value', v)} />
                          <TextField label="What it counts" value={it.label} onChange={v => set('label', v)} description={missingIn(lang, false)} />
                          <TextField label="Line under it" value={it.note} onChange={v => set('note', v)} description={missingIn(lang, false)} />
                        </div>
                      </DisclosurePanel>
                    </Disclosure>
                  );
                })}
              </DisclosureGroup>
            </Gap>
          </SidePanelSection>
        </>
      );
    case 'bars':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Switch isSelected={block.showValues} onChange={showValues => patch({showValues})}>Show the value on each bar</Switch>
            {block.rows.length > 3 && (
              <Pick label="Rows to show" value={block.show} onChange={show => patch({show})}
                options={{top3: 'Top 3', top5: 'Top 5', all: `All ${block.rows.length}`}} />
            )}
          </SidePanelSection>
          <SidePanelSection>{written}</SidePanelSection>
        </>
      );
    case 'compare':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Switch isSelected={block.showCounts} onChange={showCounts => patch({showCounts})}>Show the counts beside each share</Switch>
          </SidePanelSection>
          <SidePanelSection>{written}</SidePanelSection>
        </>
      );
    case 'line':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Switch isSelected={block.showEstimate} onChange={showEstimate => patch({showEstimate})}>Show the estimate to the close</Switch>
          </SidePanelSection>
        </>
      );
    case 'insight':
      return (
        <>
          <SidePanelSection>
            <Select label="Project" defaultSelectedKey="tree-planting">
              <SelectItem id="tree-planting">Tree planting by street</SelectItem>
              <SelectItem id="parks-budget">Parks budget</SelectItem>
            </Select>
            <Select label="Phase" defaultSelectedKey="ideas">
              <SelectItem id="ideas">Share your ideas</SelectItem>
              <SelectItem id="survey">Final proposal feedback</SelectItem>
            </Select>
          </SidePanelSection>
          <SidePanelSection title={`Insight · ${INSIGHTS.length} saved in the analysis`}>
            <RadioGroup aria-label="Insight" value={block.insight} onChange={insight => patch({insight})}>
              {INSIGHTS.map(i => (
                <ChoiceCard key={i.id} value={i.id} description={`${i.kind} · Covers ${i.covers}`}>{i.question}</ChoiceCard>
              ))}
            </RadioGroup>
          </SidePanelSection>
          <SidePanelSection>
            <Switch isSelected={block.showQuestion} onChange={showQuestion => patch({showQuestion})}>Show the question as a heading</Switch>
            <Switch isSelected={block.showOrigin} onChange={showOrigin => patch({showOrigin})}>Show where it comes from</Switch>
          </SidePanelSection>
        </>
      );
    case 'quotes':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Pick label="Look" value={block.layout} options={{card: 'Cards', plain: 'Plain'}} onChange={layout => patch({layout})} />
            <Switch isSelected={block.showFaces} onChange={showFaces => patch({showFaces})}>Show each person’s avatar</Switch>
          </SidePanelSection>
        </>
      );
    case 'map':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Pick label="Shade the districts by" value={block.shade} options={SHADES} onChange={shade => patch({shade})} />
            <div className="bo-report-field">
              <span className="bo-report-label" aria-hidden>On top</span>
              <Switch isSelected={block.layers.ideas} onChange={ideas => patch({layers: {...block.layers, ideas}})}>Ideas from Tree planting</Switch>
              <Switch isSelected={block.layers.votes} onChange={votes => patch({layers: {...block.layers, votes}})}>Cycle lane votes</Switch>
              <Switch isSelected={block.layers.events} onChange={events => patch({layers: {...block.layers, events}})}>Upcoming events</Switch>
            </div>
            <Select label="Highlight ideas tagged" selectedKey={block.tag} onSelectionChange={k => patch({tag: String(k)})} items={TAGS}>
              {t => <SelectItem id={t.id}>{t.label}</SelectItem>}
            </Select>
            <Switch isSelected={block.streets} onChange={streets => patch({streets})}
              description="The PDF prints the layers that are on, framed as the map is on the page.">Street map underneath</Switch>
          </SidePanelSection>
        </>
      );
    case 'events':
      return (
        <>
          <SidePanelSection>{figure}</SidePanelSection>
          <SidePanelSection>
            <Select label="Folder" defaultSelectedKey="green">
              <SelectItem id="green">{REPORT.folder}</SelectItem>
            </Select>
            <Switch isSelected={block.showEnd} onChange={showEnd => patch({showEnd})}>Show when each event ends</Switch>
          </SidePanelSection>
        </>
      );
  }
}

/** The spaces, folders and projects a figure draws on, as one tree; a project opens its source preview. */
function sourceTree(ids: string[]): SourceNode[] {
  const keep = (node: SourceNode): SourceNode | null => {
    if (node.kind === 'project') return ids.includes(node.id) ? node : null;
    const children = (node.children ?? []).map(keep).filter((c): c is SourceNode => !!c);
    return children.length ? {...node, children} : null;
  };
  return SOURCES.map(keep).filter((c): c is SourceNode => !!c);
}
const SOURCE_ICON = {space: LayoutGrid, folder: Folder, project: FileType};

function DataTab({block, onSource, onRefresh}: {block: Block; onSource: (s: SourceNode) => void; onRefresh: () => void}) {
  const data = 'figure' in block && block.figure ? block.figure : (block as {included: string; calculated: string; sources: string[]});
  const tree = sourceTree(data.sources);
  const all = (nodes: SourceNode[]): SourceNode[] => nodes.flatMap(x => [x, ...all(x.children ?? [])]);
  const renderNode = (s: SourceNode): ReactNode => {
    const Icon = SOURCE_ICON[s.kind];
    return (
      <TreeItem key={s.id} id={s.id} textValue={s.name}>
        <TreeItemContent>
          <span className="bo-report-row">
            <Icon aria-hidden size={16} />
            <span className="bo-report-row-name">{s.name}</span>
            {s.kind !== 'project' && <span className="bo-note">{all(s.children ?? []).filter(c => c.kind === 'project').length}</span>}
          </span>
        </TreeItemContent>
        {s.children?.map(renderNode)}
      </TreeItem>
    );
  };
  return (
    <>
      <SidePanelSection title="What’s included"><p>{data.included}</p></SidePanelSection>
      <SidePanelSection title="How it’s calculated"><p>{data.calculated}</p></SidePanelSection>
      <SidePanelSection title={`Sources · ${data.sources.length} ${data.sources.length === 1 ? 'project' : 'projects'}`}>
        <Tree aria-label="Sources" defaultExpandedKeys={all(tree).filter(s => s.kind !== 'project').map(s => s.id)}
          onAction={k => { const s = all(tree).find(x => x.id === k); if (s?.kind === 'project') onSource(s); }}>
          {tree.map(renderNode)}
        </Tree>
      </SidePanelSection>
      <SidePanelSection>
        <PropertyList aria-label="Snapshot">
          <PropertyListItem label="Retrieved">{SNAPSHOT}</PropertyListItem>
          <PropertyListItem label="Kept as">A saved snapshot</PropertyListItem>
        </PropertyList>
        <Banner tone="neutral">The numbers are a saved snapshot. The source screens may include changes made since this widget was made.</Banner>
        <Button variant="secondary" size={32} onPress={onRefresh}>Refresh the data</Button>
      </SidePanelSection>
    </>
  );
}

// ── The view ────────────────────────────────────────────────────────────────────────────────────────────────────

type Right = 'auto' | 'history';
interface Created {title: string; template: 'blank' | 'template' | 'ai'}

export function ReportView() {
  const {reportId} = useParams();
  const created = (useLocation().state ?? null) as Created | null;
  const report = REPORTS.find(r => r.id === reportId);
  const title = report?.title ?? (reportId === 'new' ? created?.title ?? 'Untitled report' : null);
  if (!title) {
    return (
      <Page title="Report not found" crumbs={[{key: 'reporting', label: 'Reporting', href: '#/reporting'}]}>
        <p className="bo-note">This report does not exist.</p>
      </Page>
    );
  }
  return <ReportEditor key={reportId} title={title} blank={reportId === 'new' && created?.template !== 'template'}
    generate={reportId === 'new' && created?.template === 'ai'} />;
}

function ReportEditor({title, blank, generate}: {title: string; blank: boolean; generate: boolean}) {
  const [blocks, setBlocks] = useState<Block[]>(() => (blank ? [] : TEMPLATE.map(b => (b.kind === 'title' ? {...b, title} : b))));
  const [selected, setSelected] = useState<string | null>(null);
  const [right, setRight] = useState<Right>('auto');
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [library, setLibrary] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState(false);
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState(`Saved ${REPORT.savedAt} by you`);
  const [history, setHistory] = useState(HISTORY);
  const [status, setStatus] = useState<'ready' | 'generating'>('ready');
  const [askGenerate, setAskGenerate] = useState(generate);
  const [source, setSource] = useState<SourceNode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const stage = useRef<HTMLDivElement>(null);

  const {pages, pageOf} = useMemo(() => paginate(blocks), [blocks]);
  const nums = useMemo(() => sectionNumbers(blocks), [blocks]);
  const block = blocks.find(b => b.id === selected) ?? null;
  const touched = () => setSaved('Saved just now by you');

  // A selection made anywhere shows its block on the page and its row in the outline.
  useEffect(() => {
    if (!selected) return;
    document.getElementById(`block-${selected}`)?.scrollIntoView({block: 'nearest'});
    document.querySelector(`.bo-report-outline [data-key="${selected}"]`)?.scrollIntoView({block: 'nearest'});
  }, [selected]);

  // The page bar's "Page 3 of 12": the last sheet whose top is in the upper third of the stage.
  const onScroll = () => {
    const root = stage.current;
    if (!root) return;
    const line = root.getBoundingClientRect().top + root.clientHeight / 3;
    const sheets = [...root.querySelectorAll('.bo-report-sheet')];
    const i = sheets.filter(s => s.getBoundingClientRect().top <= line).length;
    setPage(Math.max(1, i));
  };

  const select = (id: string | null) => {
    setSelected(id);
    if (id) setRight('auto');
  };
  const focusBlock = (id: string, action?: string) => requestAnimationFrame(() => {
    const el = document.getElementById(`block-${id}`);
    const btn = action ? el?.querySelector<HTMLElement>(`[data-action="${action}"]:not([disabled])`) : null;
    (btn ?? el?.querySelector<HTMLElement>('[data-action]:not([disabled])') ?? el)?.focus();
  });

  const patch = (id: string, p: Partial<Block>) => {
    setBlocks(bs => bs.map(b => (b.id === id ? ({...b, ...p} as Block) : b)));
    touched();
  };
  const insert = (b: Block, at: number) => setBlocks(bs => [...bs.slice(0, at), b, ...bs.slice(at)]);
  const remove = (id: string) => {
    const at = blocks.findIndex(b => b.id === id);
    const gone = blocks[at];
    const next = blocks[at + 1] ?? blocks[at - 1];
    setBlocks(bs => bs.filter(b => b.id !== id));
    setSelected(null);
    touched();
    if (next) focusBlock(next.id);
    toast(`${gone.name} deleted`, undefined, () => { insert(gone, at); setSelected(gone.id); focusBlock(gone.id); });
  };
  const move = (id: string, d: -1 | 1) => {
    const at = blocks.findIndex(b => b.id === id);
    const to = at + d;
    if (to < 0 || to >= blocks.length || PINNED.includes(blocks[to].kind)) return;
    setBlocks(bs => { const c = [...bs]; [c[at], c[to]] = [c[to], c[at]]; return c; });
    touched();
    focusBlock(id, d === -1 ? 'up' : 'down');
  };
  const duplicate = (id: string) => {
    const at = blocks.findIndex(b => b.id === id);
    const copy = {...structuredClone(blocks[at]), id: newId(blocks[at].kind)} as Block;
    insert(copy, at + 1);
    setSelected(copy.id);
    touched();
    focusBlock(copy.id, 'duplicate');
    toast(`${copy.name} duplicated`, 'The copy is right under it.', () => { setBlocks(bs => bs.filter(b => b.id !== copy.id)); setSelected(id); });
  };
  const add = (kind: BlockKind) => {
    const b = newBlock(kind);
    const at = selected ? blocks.findIndex(x => x.id === selected) + 1 : blocks.length;
    insert(b, at);
    setLibrary(false);
    select(b.id);
    touched();
    focusBlock(b.id);
    toast(`${KIND[kind].label} added`, undefined, () => { setBlocks(bs => bs.filter(x => x.id !== b.id)); setSelected(null); });
  };

  const runGenerate = () => {
    setAskGenerate(false);
    setStatus('generating');
    window.setTimeout(() => {
      setBlocks(TEMPLATE.map(b => (b.kind === 'title' ? {...b, title} : b)));
      setStatus('ready');
      touched();
      toast('Report generated', 'The assistant wrote a first version. Check every figure before sharing.');
    }, 1500);
  };

  const ask = (text: string) => {
    if (/^generate/i.test(text) || !blocks.length) { setAskGenerate(true); return; }
    const you: Message = {from: 'you', text};
    const summary = blocks.find(b => b.kind === 'section' && (b.bullets?.length ?? 0) > 3) as Extract<Block, {kind: 'section'}> | undefined;
    const reach = blocks.find(b => b.kind === 'section' && b.heading === 'Reach');
    if (/summary shorter/i.test(text) && summary) {
      const before = summary.bullets!;
      patch(summary.id, {bullets: before.slice(0, 3)} as Partial<Block>);
      setMessages(m => [...m, you, {from: 'assistant', text: `I cut the executive summary from ${before.length} points to 3, keeping the findings with the strongest evidence.`, meta: '1 section changed. The version before is kept.'}]);
      setHistory(h => [{id: `h-${Date.now()}`, day: 'Today', who: 'Assistant', initials: 'AI', what: 'changed the report', when: 'Today, just now · asked by you', prompt: text, blocks: [summary.name]}, ...h.map(e => ({...e, current: false}))]);
      toast('The assistant changed 1 section', undefined, () => patch(summary.id, {bullets: before} as Partial<Block>));
      return;
    }
    if (/remove the reach/i.test(text) && reach) {
      const at = blocks.indexOf(reach);
      const end = blocks.findIndex((b, i) => i > at && b.kind === 'section');
      const cut = blocks.slice(at, end < 0 ? blocks.length : end);
      setBlocks(bs => bs.filter(b => !cut.includes(b)));
      touched();
      setMessages(m => [...m, you, {from: 'assistant', text: `I removed the Reach section and its ${cut.length - 1} widgets. The contents and page numbers follow.`, meta: `${cut.length} widgets removed. The version before is kept.`}]);
      toast('The assistant removed 1 section', undefined, () => setBlocks(bs => [...bs.slice(0, at), ...cut, ...bs.slice(at)]));
      return;
    }
    setMessages(m => [...m, you, {from: 'assistant', text: 'Who took part is in section 05: 3,600 identifiable participants, with recorded rates highest in North Quarter. Two districts are suppressed or have no data, and the report says why.', meta: 'Nothing changed.'}]);
  };

  const closePanel = () => {
    if (right === 'history') { setRight('auto'); return; }
    if (block) { const id = block.id; setSelected(null); focusBlock(id); return; }
    setAssistantOpen(false);
  };

  const panelLabel = right === 'history' ? 'Version history' : block ? block.name : 'Assistant';
  const showRight = right === 'history' || !!block || assistantOpen;
  const actionsFor = (b: Block): BlockActions => {
    const at = blocks.indexOf(b);
    const free = (i: number) => i >= 0 && i < blocks.length && !PINNED.includes(blocks[i].kind);
    return {
      canUp: free(at - 1), canDown: free(at + 1),
      onMove: d => move(b.id, d), onDuplicate: () => duplicate(b.id), onDelete: () => remove(b.id),
      onFormat: format => patch(b.id, {format} as Partial<Block>)
    };
  };

  return (
    <Page title={title} crumbs={[{key: 'reporting', label: 'Reporting', href: '#/reporting'}]}
      actions={(
        <div className="bo-report-actions">
          <Button variant="quiet" size={32} aria-pressed={right === 'history'} onPress={() => setRight(r => (r === 'history' ? 'auto' : 'history'))}>
            <Clock aria-hidden size={16} />{saved}
          </Button>
          {!showRight && <Button variant="quiet" size={32} onPress={() => setAssistantOpen(true)}><Sparkles aria-hidden size={16} />Assistant</Button>}
          <Select aria-label="Editing language" variant="pill" size={28} icon={<Languages size={16} />} selectedKey={lang}
            onSelectionChange={k => setLang(k as Lang)} items={LANGUAGES}>
            {l => <SelectItem id={l.id}>{l.label}</SelectItem>}
          </Select>
          <MenuTrigger placement="bottom end">
            <Button variant="secondary" size={32} hasMenu><Download aria-hidden size={16} />Download</Button>
            <Menu aria-label="Download" onAction={k => toast(k === 'pdf' ? 'Preparing the PDF' : 'Preparing the Word file',
              `${title}.${k === 'pdf' ? 'pdf' : 'docx'} downloads when it is ready.`)}>
              <MenuItem id="pdf" icon={<FileText size={16} />}>PDF</MenuItem>
              <MenuItem id="word" icon={<Type size={16} />} badge={<Badge variant="outlined">Beta</Badge>}>Word</MenuItem>
            </Menu>
          </MenuTrigger>
        </div>
      )}>
      <GapLegend names={GAPS} />
      <div className="bo-report" data-right={showRight || undefined}>
        {library
          ? <Library onAdd={add} onClose={() => { setLibrary(false); requestAnimationFrame(() => document.querySelector<HTMLElement>('.bo-report-outline [aria-label="Add widget"]')?.focus()); }} />
          : <Outline blocks={blocks} nums={nums} pageOf={pageOf} selected={selected} onSelect={select} onAdd={() => setLibrary(true)} />}

        <section className="bo-report-canvas" aria-label="Report pages">
          <Gap name="Page stage">
            <Toolbar aria-label="Zoom and pages" className="bo-report-pagebar">
              <TooltipTrigger>
                <IconButton aria-label="Zoom out" isDisabled={zoom === ZOOMS[0]} onPress={() => { setFit(false); setZoom(ZOOMS[Math.max(0, ZOOMS.indexOf(zoom) - 1)]); }}><ZoomOut aria-hidden size={16} /></IconButton>
                <Tooltip placement="bottom">Zoom out</Tooltip>
              </TooltipTrigger>
              <span className="bo-note" aria-live="polite">{fit ? 'Fit' : `${zoom}%`}</span>
              <TooltipTrigger>
                <IconButton aria-label="Zoom in" isDisabled={zoom === ZOOMS[ZOOMS.length - 1]} onPress={() => { setFit(false); setZoom(ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + 1)]); }}><ZoomIn aria-hidden size={16} /></IconButton>
                <Tooltip placement="bottom">Zoom in</Tooltip>
              </TooltipTrigger>
              <Button variant="quiet" size={32} aria-pressed={fit} onPress={() => setFit(f => !f)}>Fit</Button>
              <span className="bo-note">{pages.length ? `Page ${Math.min(page, pages.length)} of ${pages.length}` : 'No pages'}</span>
            </Toolbar>
            <div ref={stage} className="bo-report-stage" onScroll={onScroll}>
              <div className="bo-report-sheets" data-zoom={fit ? undefined : zoom} data-fit={fit || undefined}>
                {status === 'generating' ? (
                  <article className="bo-report-sheet" aria-label="Generating the report" aria-busy>
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="70%" height={32} />
                    <Skeleton width="100%" />
                    <Skeleton width="90%" />
                    <Skeleton width="100%" height={160} variant="block" />
                    <Skeleton width="60%" />
                  </article>
                ) : pages.length ? pages.map((p, i) => (
                  <article key={i} className="bo-report-sheet" aria-label={`Page ${i + 1}`}>
                    <div className="bo-report-sheet-body">
                      {p.map(b => (
                        <BlockFrame key={b.id} block={b} isSelected={selected === b.id} onSelect={() => select(b.id)}
                          onDeselect={() => setSelected(null)} actions={actionsFor(b)}>
                          <BlockBody block={b} lang={lang} nums={nums} pageOf={pageOf} blocks={blocks} reportTitle={title} />
                        </BlockFrame>
                      ))}
                    </div>
                    {i > 0 && <p className="bo-note bo-report-sheet-foot"><span>{title}</span><span>{i + 1}</span></p>}
                  </article>
                )) : (
                  <article className="bo-report-sheet" aria-label="Page 1">
                    <EmptyState title="No widgets in this report yet" icon={<Plus size={24} />} headingLevel={2}
                      description="Choose a widget from the library, or ask the assistant to generate a first version."
                      actions={<Button variant="primary" size={32} onPress={() => setLibrary(true)}><Plus aria-hidden size={16} />Add widget</Button>} />
                  </article>
                )}
              </div>
            </div>
          </Gap>
        </section>

        {showRight && (
          <div className="bo-report-column bo-report-side">
            <SidePanel isInline isOpen label={panelLabel} onOpenChange={closePanel}
              labels={{close: right === 'history' ? 'Close the version history' : block ? 'Close the widget settings' : 'Close the assistant'}}
              footer={right === 'auto' && block ? (
                <div className="bo-report-panel-foot">
                  {!STRUCTURE.includes(block.kind) && (
                    <Button variant="quiet" size={32} onPress={() => { setSelected(null); setAssistantOpen(true); }}><Sparkles aria-hidden size={16} />Ask the assistant</Button>
                  )}
                  <Button variant="quiet" size={32} tone="danger" onPress={() => remove(block.id)}><Trash2 aria-hidden size={16} />Delete</Button>
                </div>
              ) : undefined}>
              {right === 'history' ? (
                <HistoryFeed entries={history} onRestore={e => toast('Version restored', `The report is back as it was ${e.when.split(' · ')[0].toLowerCase()}.`, () => {})} />
              ) : block ? (
                DATA_KINDS.includes(block.kind) ? (
                  <Tabs key={block.id}>
                    <TabList aria-label="Widget settings">
                      <Tab id="settings">Settings</Tab>
                      <Tab id="data">Data</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel id="settings"><Settings block={block} lang={lang} patch={p => patch(block.id, p)} /></TabPanel>
                      <TabPanel id="data">
                        <DataTab block={block} onSource={setSource}
                          onRefresh={() => toast('Data refreshed', `${block.name} now shows today’s numbers.`, () => {})} />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                ) : <Settings key={block.id} block={block} lang={lang} patch={p => patch(block.id, p)} />
              ) : (
                <Assistant messages={messages} onAsk={ask}
                  suggestions={blocks.length ? SUGGESTIONS : ['Generate a report from the folder']} />
              )}
            </SidePanel>
          </div>
        )}
      </div>

      <Modal title="Generate the report" isOpen={askGenerate} onOpenChange={setAskGenerate}
        footer={<>
          <Button variant="secondary" size={32} slot="close">Cancel</Button>
          <Button variant="primary" size={32} onPress={runGenerate}><Sparkles aria-hidden size={16} />Generate</Button>
        </>}>
        <div className="bo-report-stack">
          <p>The assistant writes a first version from the <strong>6 projects across 3 spaces</strong> in {REPORT.folder}: a summary, the numbers, the charts and what happens next. You can change everything afterwards.</p>
          <p className="bo-note">It takes a few minutes. You can leave this page while it runs.</p>
        </div>
      </Modal>

      <Modal title={source?.name ?? 'Source'} isOpen={!!source} onOpenChange={o => !o && setSource(null)}
        footer={<Button variant="secondary" size={32} slot="close">Close</Button>}>
        {source && (
          <div className="bo-report-stack">
            <PropertyList aria-label={`About ${source.name}`}>
              <PropertyListItem label="Project">{source.name}</PropertyListItem>
              <PropertyListItem label="Scope">{source.scope}</PropertyListItem>
              <PropertyListItem label="Snapshot">Saved {SNAPSHOT}</PropertyListItem>
              <PropertyListItem label="Coverage">{source.coverage}</PropertyListItem>
              <PropertyListItem label="Counted">Submitted surveys, ideas and votes linked to participant accounts</PropertyListItem>
            </PropertyList>
            <p className="bo-note">The project’s own screens hold the records and their export.</p>
          </div>
        )}
      </Modal>
      <ToastRegion />
    </Page>
  );
}

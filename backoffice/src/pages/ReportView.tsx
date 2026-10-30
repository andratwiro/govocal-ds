import {Fragment, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import {useLocation, useParams, useSearchParams} from 'react-router';
import {ArrowDown, ArrowUp, CalendarDays, ChartBar, ChartColumn, ChartLine, ChevronDown, ChevronUp, Clock, Download,
  FileText, Globe, Hash, Heading, Languages, Lightbulb, ListOrdered, Map as MapIcon, Minus, MoveVertical, Plus, Quote as QuoteIcon,
  SeparatorHorizontal, Sparkles, Trash2, Type, X, Folder, LayoutGrid, FileType} from 'lucide-react';
import {ActivityFeed, type ActivityEntry, AssistantPanel, Avatar, Badge, Banner, BarRow, BlockFrame, BlockInsertLine,
  Button, type ChartColor, ChartLegend, type ChartLegendItem, ChatMessage, ChatProgress, type ChatProgressStep, ChoiceCard,
  DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow, Divider, EmptyState, Figure,
  Grid, IconButton, Inline, ItemChip, LineChart, Menu, MenuItem, MenuTrigger, Modal, MultilingualTextField, PageStage,
  PageStageSheet, Panel, PropertyList, PropertyListItem, Quote, RadioGroup, type RichTextBlockType, RichTextEditor,
  RichTextToolbar, SegmentedControl, SegmentedControlItem, Select, SelectItem, SidePanel, SidePanelSection, Skeleton,
  SortableList, Stack, StatTile, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, Text, TextArea, TextField, toast,
  Tooltip, TooltipTrigger, useNumberFormatter, ZoomBar} from 'govocal-ds';
import {GridList, GridListHeader, GridListItem, GridListSection, Tree, TreeItem, TreeItemContent} from 'govocal-ds/base';
import {REPORTS} from '../data-reporting';
import {HISTORY, INSIGHTS, LANGUAGES, LIBRARY, REPORT, SNAPSHOT, SOURCES, SUGGESTIONS, TEMPLATE, type Block,
  type BlockKind, type Figure as FigureData, type FigureWords, type HistoryEntry, type Lang, type SourceNode} from '../data-report';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

/*
 * The report view (the prototype's single report, rebuilt from the system). Three columns: the outline (Panel + Tree)
 * or the widget library (Panel + GridList), the report's pages on a Page stage, and the end column: the Assistant
 * panel at rest, or an inline Side panel with the selected block's settings or the version history (Activity feed).
 * The one part the system still lacks is a Gap: Map.
 */

const GAPS = ['Map'];

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
  quotes: {label: 'Quotes', icon: QuoteIcon},
  map: {label: 'Map', icon: MapIcon},
  events: {label: 'Events', icon: CalendarDays}
};
const kindIcon = (kind: BlockKind) => { const Icon = KIND[kind].icon; return <Icon aria-hidden />; };
/** Pinned blocks open the report: they keep their place (no move, no duplicate). */
const PINNED: BlockKind[] = ['title', 'contents'];
/** Blocks whose settings have a Data tab: what they count, how, and from where. */
const DATA_KINDS: BlockKind[] = ['numbers', 'bars', 'compare', 'line', 'insight', 'quotes', 'map', 'events'];
const STRUCTURE: BlockKind[] = ['space', 'divider', 'break'];
const LANG_NAME = (l: Lang) => LANGUAGES.find(x => x.id === l)!.label;
/** What the assistant could do, shown while it is switched off (the Assistant panel's "Off" story). */
const PREVIEW = [
  {id: 'ask', icon: <Type aria-hidden />, label: 'Change it by asking',
    description: '“Make the summary shorter”, “Turn what happens next into decisions”.'},
  {id: 'translate', icon: <Globe aria-hidden />, label: 'Translate the whole report',
    description: 'French for every page in one go, ready to check.'},
  {id: 'charts', icon: <MapIcon aria-hidden />, label: 'Charts the widgets don’t have',
    description: 'A map by area, how people feel per project, before and after.'}
];
const BLOCK_PROMPTS = ['Make it shorter', 'Explain it in plain words'];
const GENERATE_STEPS = ['Reading the 6 projects across 3 spaces', 'Counting identifiable participants', 'Writing 8 sections'];

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
    case 'text': return {id, kind, name: 'Text', body: 'New text. Type it on the page.'};
    case 'space': return {id, kind, name: 'White space', size: 'small'};
    case 'divider': return {id, kind, name: 'Divider'};
    case 'break': return {id, kind, name: 'Page break'};
    default: {
      const from = TEMPLATE.find(b => b.kind === kind)!;
      return structuredClone({...from, id});
    }
  }
}

// ── Blocks ──────────────────────────────────────────────────────────────────────────────────────────────────────

/** What the editing language shows for one of a figure's words: its own, else the English. */
const words = (f: FigureData, lang: Lang, k: keyof FigureWords) => (lang === 'en' ? f[k] : f.fr?.[k] || f[k]);

/** A Figure from a block's figure words: finding, measure, body, legend, then one foot. */
function BlockFigure({figure, lang, legend, truncation, showFinding = true, showSource = true, children}: {
  figure: FigureData; lang: Lang; legend?: ReactNode; truncation?: string; showFinding?: boolean; showSource?: boolean; children: ReactNode;
}) {
  return (
    <Figure headingLevel={4} finding={showFinding ? words(figure, lang, 'finding') : undefined}
      aria-label={words(figure, lang, 'measure')} measure={words(figure, lang, 'measure')} legend={legend}
      truncation={truncation} note={words(figure, lang, 'note') || undefined} source={showSource ? figure.source : undefined}>
      {children}
    </Figure>
  );
}

const SHOWN = {top3: 3, top5: 5, all: Infinity};
/** Bars: one row per value, the rows the finding names in the accent and the rest grey (one rule, one token). */
function Bars({block, lang}: {block: Extract<Block, {kind: 'bars'}>; lang: Lang}) {
  const {format: n} = useNumberFormatter();
  const rows = block.rows.slice(0, SHOWN[block.show]);
  const max = Math.max(...block.rows.map(r => r.value ?? 0));
  const cut = rows.length < block.rows.length ? `Showing top ${rows.length} of ${block.rows.length}` : undefined;
  return (
    <BlockFigure figure={block.figure} lang={lang} truncation={cut}>
      <Stack gap="2">
        {rows.map(r => r.value === undefined
          ? <BarRow key={r.label} label={<>{r.label} <Text kind="small" color="meta">{r.missing}</Text></>} />
          : <BarRow key={r.label} label={r.label} percent={(r.value / max) * 100} value={block.showValues ? n(r.value) : ''}
              barColor={r.named ? '--gv-chart-bar' : '--gv-chart-pass'} />)}
      </Stack>
    </BlockFigure>
  );
}

function Comparison({block, lang}: {block: Extract<Block, {kind: 'compare'}>; lang: Lang}) {
  const max = Math.max(...block.groups.flatMap(g => g.rows.map(r => r.percent)));
  return (
    <BlockFigure figure={block.figure} lang={lang}>
      <Stack gap="12">
        {block.groups.map((g, i) => (
          <Fragment key={g.finding}>
            {i > 0 && <Divider />}
            <Stack gap="2">
              <Text elementType="p" kind="ui">{g.finding}</Text>
              {g.rows.map(r => (
                <BarRow key={r.label} label={r.label} percent={(r.percent / max) * 100}
                  value={block.showCounts ? `${r.percent}% · ${r.count}` : `${r.percent}%`}
                  barColor={r.named ? '--gv-chart-bar' : '--gv-chart-pass'} />
              ))}
            </Stack>
          </Fragment>
        ))}
      </Stack>
    </BlockFigure>
  );
}

/** Quotes as cards side by side, or plain, one under another. */
function Quotes({block, lang}: {block: Extract<Block, {kind: 'quotes'}>; lang: Lang}) {
  const isPlain = block.layout === 'plain';
  return (
    <BlockFigure figure={block.figure} lang={lang}>
      <Grid columns={isPlain ? 1 : Math.min(3, block.quotes.length)} gap="10">
        {block.quotes.map(q => (
          <Quote key={q.author} variant={block.layout} tag={q.tag} words={q.words} author={q.author} meta={q.meta}
            avatar={block.showFaces ? <Avatar initials={q.initials} size={28} /> : undefined} />
        ))}
      </Grid>
    </BlockFigure>
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
    <BlockFigure figure={block.figure} lang={lang} legend={
      <Stack gap="8">
        {block.shade !== 'none' && (
          <Inline gap="12"><Text kind="small" color="meta">Districts: {SHADES[block.shade]}</Text>
            <ChartLegend align="start" variant="square" items={steps.map((s, i) => ({label: s, color: `blue-${i + 1}` as ChartColor}))} /></Inline>
        )}
        {layers.length > 0 && (
          <Inline gap="12"><Text kind="small" color="meta">On top</Text><ChartLegend align="start" items={layers} /></Inline>
        )}
      </Stack>
    }>
      <Gap name="Map">
        <div className="bo-report-map">
          <Text elementType="p" kind="small" color="meta">
            8 districts{block.shade !== 'none' ? `, shaded by ${SHADES[block.shade].toLowerCase()}` : ''}
            {block.layers.ideas ? `; 386 idea pins${tag.id !== 'none' ? `, those tagged ${tag.label.toLowerCase()} highlighted` : ''}` : ''}
            {block.streets ? '; over the street map' : ''}.
          </Text>
        </div>
      </Gap>
    </BlockFigure>
  );
}

/** Key figures as printed: plain Stat tiles split by hairlines; the lead layout makes the first large and highlighted. */
function Numbers({block}: {block: Extract<Block, {kind: 'numbers'}>}) {
  const tile = (i: typeof block.items[number], lead = false) => (
    <StatTile key={i.id} variant="plain" size={lead ? 'large' : 'default'} isHighlighted={lead} label={i.label}
      value={i.value} note={i.note} />
  );
  const split = (items: typeof block.items, vertical: boolean) => items.map((i, k) => (
    <Fragment key={i.id}>{k > 0 && <Divider orientation={vertical ? 'vertical' : 'horizontal'} />}{tile(i)}</Fragment>
  ));
  if (block.layout === 'lead' && block.items.length > 1) {
    return (
      <Grid columns="minmax(0, 1fr) auto minmax(0, 1fr)" gap="24">
        {tile(block.items[0], true)}
        <Divider orientation="vertical" />
        <Stack gap="16">{split(block.items.slice(1), false)}</Stack>
      </Grid>
    );
  }
  if (block.layout === 'grid') return <Grid columns={2} gap="24">{block.items.map(i => tile(i))}</Grid>;
  return <Inline gap="24" alignItems="stretch" wrap="nowrap">{split(block.items, true)}</Inline>;
}

type Format = {bold?: boolean; italic?: boolean; list?: boolean};
const formatOf = (b: Block): Format => ((b as {format?: Format}).format ?? {});

function Formatted({body, format}: {body: string; format?: Format}) {
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
  return <Text elementType="p" kind="document-body">{wrap(body)}</Text>;
}

/** One line of the contents: the section's number, its heading, its page, on the text's baseline. */
function TocRow({num, page, children}: {num?: string; page?: number; children: ReactNode}) {
  return (
    <Grid columns="var(--gv-space-32) minmax(0, 1fr) auto" gap="8" className="bo-report-toc-row">
      {num ? <Text kind="small" color="meta">{num}</Text> : <span />}{children}
      <Text kind="small" color="meta">{page}</Text>
    </Grid>
  );
}

type TextBlock = Extract<Block, {kind: 'section' | 'text'}>;
const isTextBlock = (b: Block): b is TextBlock => b.kind === 'text' || b.kind === 'section';
/** A text block's type in the format bar: a section, a text with a heading (sub-section), or plain text. */
const blockTypeOf = (b: TextBlock): RichTextBlockType => (b.kind === 'section' ? 'section' : b.heading ? 'subsection' : 'text');

/** A text block's words in the editing language, and how to write them back. */
function textWords(block: TextBlock, lang: Lang) {
  const fr = block.fr ?? {};
  const isFr = lang === 'fr';
  return {
    heading: isFr ? fr.heading ?? '' : block.heading ?? '',
    body: isFr ? fr.body ?? '' : block.body,
    shownHeading: isFr && fr.heading ? fr.heading : block.heading,
    shownBody: isFr && fr.body ? fr.body : block.body,
    patch: (k: 'heading' | 'body', v: string): Partial<Block> => (isFr ? {fr: {...fr, [k]: v}} : {[k]: v}) as Partial<Block>
  };
}

/** A selected text block, typed on the page: its heading and words in Rich text editors, in the document's type. */
function TextEditing({block, lang, num, patch}: {block: TextBlock; lang: Lang; num?: string; patch: (p: Partial<Block>) => void}) {
  const w = textWords(block, lang);
  const hint = (en?: string) => (lang === 'en' ? undefined : en);
  const bullets = block.kind === 'section' && block.bullets?.length ? block.bullets : null;
  return (
    <Stack gap="8">
      {block.kind === 'section' && <Text kind="body" color="secondary">{num}</Text>}
      {(block.kind === 'section' || block.heading != null) && (
        <Text elementType="div" kind={block.kind === 'section' ? 'document-heading' : 'document-body'} isStrong={block.kind === 'text'} color="primary">
          <RichTextEditor variant="inline" aria-label={block.kind === 'section' ? 'Section heading' : 'Heading'}
            value={w.heading} onChange={v => patch(w.patch('heading', v))} placeholder={hint(block.heading) ?? 'Heading'} />
        </Text>
      )}
      <Text elementType="div" kind="document-body">
        {bullets ? (
          <RichTextEditor variant="inline" aria-label="Points, one per line" value={bullets.join('\n')}
            onChange={v => patch({bullets: v.split('\n')} as Partial<Block>)} />
        ) : (
          <RichTextEditor variant="inline" aria-label={block.kind === 'section' ? 'Section text' : 'Text'} value={w.body}
            onChange={v => patch(w.patch('body', v))} placeholder={hint(block.body) ?? 'Type here, or ask the assistant to write this part'} />
        )}
      </Text>
    </Stack>
  );
}

function BlockBody({block, lang, nums, pageOf, blocks, reportTitle, isEditing, patch}: {
  block: Block; lang: Lang; nums: Map<string, string>; pageOf: Map<string, number>; blocks: Block[]; reportTitle: string;
  isEditing: boolean; patch: (p: Partial<Block>) => void;
}) {
  if (isEditing && isTextBlock(block)) return <TextEditing block={block} lang={lang} num={nums.get(block.id)} patch={patch} />;
  switch (block.kind) {
    case 'title':
      return (
        <Grid rows="auto 1fr auto" gap="48" className="bo-report-title-page">
          <Text elementType="p" kind="small" color="meta">{block.kicker}</Text>
          <Stack gap="16" justifyContent="center">
            <Text elementType="h2" kind="document-display" color="primary">{block.title || reportTitle}</Text>
            <Text elementType="p" kind="document-lead" color="secondary">{block.subtitle}</Text>
          </Stack>
          <PropertyList aria-label="About this report">
            {block.facts.map(f => <PropertyListItem key={f.label} label={f.label}>{f.value}</PropertyListItem>)}
          </PropertyList>
        </Grid>
      );
    case 'contents':
      return (
        <Stack gap="16">
          <Text elementType="h3" kind="document-heading" color="primary">Contents</Text>
          <Stack elementType="ol" gap="12">
            {outlineOf(blocks).filter(o => o.block.kind === 'section').map(({block: s, children}) => (
              <Stack elementType="li" key={s.id} gap="4">
                <TocRow num={nums.get(s.id)} page={pageOf.get(s.id)}>
                  <span>{(s as Extract<Block, {kind: 'section'}>).heading}</span>
                </TocRow>
                {block.showSub && children.filter(c => c.kind === 'text' && c.heading).map(c => (
                  <TocRow key={c.id} page={pageOf.get(c.id)}>
                    <Text kind="small" color="meta">{(c as Extract<Block, {kind: 'text'}>).heading}</Text>
                  </TocRow>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>
      );
    case 'section': {
      const w = textWords(block, lang);
      return (
        <Stack gap="8">
          <Text elementType="p" kind="body" color="secondary">{nums.get(block.id)}</Text>
          <Text elementType="h3" kind="document-heading" color="primary">{w.shownHeading}</Text>
          {block.bullets?.length
            ? <ul className="bo-report-bullets">{block.bullets.map(t => <li key={t}><Text kind="document-body">{t}</Text></li>)}</ul>
            : w.shownBody && <Formatted body={w.shownBody} format={formatOf(block)} />}
        </Stack>
      );
    }
    case 'text': {
      const w = textWords(block, lang);
      return (
        <Stack gap="8">
          {w.shownHeading && <Text elementType="h4" kind="document-body" isStrong color="primary">{w.shownHeading}</Text>}
          <Formatted body={w.shownBody} format={formatOf(block)} />
        </Stack>
      );
    }
    case 'space': return <div className="bo-report-space" data-size={block.size} />;
    case 'divider': return <Divider />;
    case 'break':
      return <Grid columns="minmax(0, 1fr) auto minmax(0, 1fr)" alignItems="center" gap="8"><Divider /><Text kind="small" color="meta">Page break</Text><Divider /></Grid>;
    case 'numbers': return <Numbers block={block} />;
    case 'bars': return <Bars block={block} lang={lang} />;
    case 'compare': return <Comparison block={block} lang={lang} />;
    case 'line':
      return (
        <BlockFigure figure={block.figure} lang={lang}>
          <LineChart xAxis={block.labels} showLegend height={160}
            series={[{label: 'Observed', values: block.observed, color: 'line-primary'},
              ...(block.showEstimate ? [{label: 'Estimated at close', values: block.estimate, color: 'line-secondary' as const}] : [])]} />
        </BlockFigure>
      );
    case 'insight': {
      const ins = INSIGHTS.find(i => i.id === block.insight) ?? INSIGHTS[0];
      return (
        <BlockFigure figure={{...block.figure, finding: ins.question}} lang="en" showFinding={block.showQuestion} showSource={block.showOrigin}>
          <Stack gap="8">
            <Text elementType="p" kind="document-body">{ins.lead}</Text>
            {ins.points.length > 0 && <ul className="bo-report-bullets">{ins.points.map(p => <li key={p}><Text kind="document-body">{p}</Text></li>)}</ul>}
          </Stack>
        </BlockFigure>
      );
    }
    case 'quotes': return <Quotes block={block} lang={lang} />;
    case 'map': return <MapBlock block={block} lang={lang} />;
    case 'events':
      return (
        <BlockFigure figure={block.figure} lang={lang}>
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
        </BlockFigure>
      );
  }
}

// ── The block's tools ───────────────────────────────────────────────────────────────────────────────────────────

/** One 24 icon button with its tooltip, as Block frame draws its own. */
function Tool({label, isDisabled, onPress, children}: {label: string; isDisabled?: boolean; onPress: () => void; children: ReactNode}) {
  return (
    <TooltipTrigger>
      <IconButton aria-label={label} size={24} isDisabled={isDisabled} onPress={onPress}>{children}</IconButton>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

/** A text block's floating format bar: block type, bold, italic, list; then ask, move and delete. */
function TextToolbar({block, canUp, canDown, onMove, onAsk, onDelete, onType, onFormat}: {
  block: TextBlock; canUp: boolean; canDown: boolean; onMove: (d: -1 | 1) => void; onAsk?: () => void; onDelete: () => void;
  onType: (t: RichTextBlockType) => void; onFormat: (f: Format) => void;
}) {
  const format = formatOf(block);
  return (
    <RichTextToolbar variant="floating" labels={{toolbar: `${block.name}: block tools`}}
      blockType={blockTypeOf(block)} onBlockTypeChange={onType}
      isBold={!!format.bold} onBoldChange={bold => onFormat({...format, bold})}
      isItalic={!!format.italic} onItalicChange={italic => onFormat({...format, italic})}
      isList={!!format.list} onListChange={list => onFormat({...format, list})}
      actions={<>
        {onAsk && <Tool label="Ask the assistant" onPress={onAsk}><Sparkles aria-hidden /></Tool>}
        <Tool label="Move up" isDisabled={!canUp} onPress={() => onMove(-1)}><ArrowUp aria-hidden /></Tool>
        <Tool label="Move down" isDisabled={!canDown} onPress={() => onMove(1)}><ArrowDown aria-hidden /></Tool>
        <Tool label="Delete" onPress={onDelete}><Trash2 aria-hidden /></Tool>
      </>} />
  );
}

// ── Outline and library (left column) ───────────────────────────────────────────────────────────────────────────

function OutlineRow({block, num, page}: {block: Block; num?: string; page?: number}) {
  const Icon = KIND[block.kind].icon;
  return (
    <TreeItemContent trailing={page}>
      <Inline elementType="span" gap="8" wrap="nowrap" className="bo-report-row">
        {num ? <Text kind="small" color="meta">{num}</Text> : <Icon aria-hidden size={16} />}
        <span className="bo-report-row-name">{block.name}</span>
      </Inline>
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
    <Panel title="Report outline" className="bo-report-outline" isFlush
      actions={(
        <TooltipTrigger>
          <IconButton aria-label="Add widget" onPress={onAdd}><Plus aria-hidden size={16} /></IconButton>
          <Tooltip placement="bottom">Add widget</Tooltip>
        </TooltipTrigger>
      )}>
      <div className="bo-report-scroll">
        {blocks.length ? (
          <Tree aria-label="Report outline" isFlush className="bo-report-tree" selectionMode="single" selectionBehavior="replace" selectedKeys={selected ? [selected] : []}
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
          <Stack gap="12" alignItems="start" padding="20">
            <Text elementType="p" kind="small" color="meta">No widgets in this report yet.</Text>
            <Button variant="secondary" size={32} onPress={onAdd}><Plus aria-hidden size={16} />Add widget</Button>
          </Stack>
        )}
      </div>
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
      <Panel title="Add widget" className="bo-report-outline" isFlush
        actions={(
          <TooltipTrigger>
            <IconButton aria-label="Back to the report outline" onPress={onClose}><X aria-hidden size={16} /></IconButton>
            <Tooltip placement="bottom">Back to the report outline</Tooltip>
          </TooltipTrigger>
        )}>
        <Stack padding="20" className="bo-report-scroll">
          <GridList aria-label="Widgets" layout="grid" className="bo-report-library"
            onAction={k => onAdd(String(k).split(':')[1] as BlockKind)}>
            {LIBRARY.map(g => (
              <GridListSection key={g.group}>
                <GridListHeader>{g.group}</GridListHeader>
                {g.items.map(it => {
                  const Icon = KIND[it.kind].icon;
                  return (
                    <GridListItem key={it.kind} id={`${g.group}:${it.kind}`} textValue={it.label}>
                      <div className="bo-report-widget">
                        <Stack gap="4" alignItems="start">
                          <Icon aria-hidden size={16} />
                          <Stack gap="2"><span>{it.label}</span><Text slot="description" kind="small" color="meta">{it.description}</Text></Stack>
                        </Stack>
                      </div>
                    </GridListItem>
                  );
                })}
              </GridListSection>
            ))}
          </GridList>
        </Stack>
      </Panel>
    </div>
  );
}

// ── End column: settings, history ───────────────────────────────────────────────────────────────────────────────

/** A Side panel section whose parts stand 12 apart, under its heading. */
function Section({title, children}: {title?: string; children: ReactNode}) {
  return <SidePanelSection title={title}><Stack gap="12">{children}</Stack></SidePanelSection>;
}

/** The version history as Activity feed entries: an assistant's count is its summary, anyone else's a note. */
function historyItems(entries: HistoryEntry[], blocks: Block[]): ActivityEntry[] {
  return entries.map(e => {
    const isAssistant = e.who === 'Assistant';
    return {
      id: e.id, day: e.day, actor: e.who, action: e.what, time: e.when, isCurrent: e.current, isAssistant,
      avatar: <Avatar initials={e.initials} size={28} />, prompt: e.prompt,
      summary: isAssistant ? e.detail : undefined, note: isAssistant ? undefined : e.detail,
      changes: e.blocks?.map(name => {
        const b = blocks.find(x => x.name === name);
        return {id: name, label: name, icon: kindIcon(b?.kind ?? 'text'), status: b ? undefined : 'removed' as const};
      })
    };
  });
}

const REPORT_LOCALES = LANGUAGES.map(l => l.id);
const missingIn = (lang: Lang, has: boolean) => (lang !== 'en' && !has ? `Missing in ${LANG_NAME(lang)}: readers see the English.` : undefined);

/** A figure's words in the editing language; a field the language lacks says so and shows the English as a hint. */
function FigureFields({block, lang, onChange}: {block: Block & {figure: FigureData}; lang: Lang; onChange: (f: FigureData) => void}) {
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
    <Stack gap="8" alignItems="start">
      <span aria-hidden>{label}</span>
      <SegmentedControl aria-label={label} selectionMode="single" disallowEmptySelection selectedKeys={[value]}
        onSelectionChange={k => k.size && onChange([...k][0] as K)}>
        {(Object.keys(options) as K[]).map(k => <SegmentedControlItem key={k} id={k}>{options[k]}</SegmentedControlItem>)}
      </SegmentedControl>
    </Stack>
  );
}

/** The key figures in their order (drag or keyboard), and the one opened with its chevron, in fields under the list. */
function NumbersEditor({block, lang, patch}: {block: Extract<Block, {kind: 'numbers'}>; lang: Lang; patch: (p: Partial<Block>) => void}) {
  const [open, setOpen] = useState<string | null>(null);
  const item = block.items.find(i => i.id === open);
  const set = (k: 'label' | 'value' | 'note', v: string) => patch({items: block.items.map(x => (x.id === open ? {...x, [k]: v} : x))});
  return (
    <Stack gap="16">
      <SortableList aria-label="Numbers" items={block.items} onReorder={items => patch({items})} itemLabel={i => `${i.value} ${i.label}`}>
        {i => (
          <>
            <Text kind="ui" isStrong color="primary">{i.value}</Text>
            <Text kind="ui" color="secondary">{i.label}</Text>
            <IconButton aria-label={`Edit ${i.label}`} aria-expanded={open === i.id} size={24} className="bo-push-end"
              onPress={() => setOpen(o => (o === i.id ? null : i.id))}>
              {open === i.id ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
            </IconButton>
          </>
        )}
      </SortableList>
      {item && (
        <Stack gap="12">
          <TextField label="Number" value={item.value} onChange={v => set('value', v)} />
          <TextField label="What it counts" value={item.label} onChange={v => set('label', v)} description={missingIn(lang, false)} />
          <TextField label="Line under it" value={item.note} onChange={v => set('note', v)} description={missingIn(lang, false)} />
        </Stack>
      )}
    </Stack>
  );
}

/** The key figures' layouts, named for screen readers and drawn in the thumbnail. */
const LAYOUTS = {row: 'Row: the numbers side by side', lead: 'Lead: the first number leads, the rest stack beside it', grid: 'Grid: two by two'};
const LAYOUT_BOXES: Record<keyof typeof LAYOUTS, [number, number, number, number][]> = {
  row: [[4, 12, 11, 16], [19, 12, 11, 16], [34, 12, 11, 16], [49, 12, 11, 16]],
  lead: [[4, 4, 30, 32], [38, 4, 22, 8], [38, 16, 22, 8], [38, 28, 22, 8]],
  grid: [[4, 4, 26, 14], [34, 4, 26, 14], [4, 22, 26, 14], [34, 22, 26, 14]]
};
const LayoutThumb = ({layout}: {layout: keyof typeof LAYOUTS}) => (
  <svg viewBox="0 0 64 40" aria-hidden>
    {LAYOUT_BOXES[layout].map(([x, y, w, h]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={2} fill="currentColor" />)}
  </svg>
);

function Settings({block, lang, patch}: {block: Block; lang: Lang; patch: (p: Partial<Block>) => void}) {
  const figure = 'figure' in block && block.figure
    ? <FigureFields block={block as Block & {figure: FigureData}} lang={lang} onChange={figure => patch({figure} as Partial<Block>)} /> : null;
  const written = <Text elementType="p" kind="small" color="meta">Written by the assistant from platform data on 2 October 2026. The bars named in the finding are highlighted; the rest stay grey.</Text>;
  switch (block.kind) {
    case 'title':
      return (
        <Section>
          <TextField label="Title" value={block.title} onChange={title => patch({title})} description={missingIn(lang, false)} />
          <TextArea label="Subtitle" value={block.subtitle} onChange={subtitle => patch({subtitle})} description={missingIn(lang, false)} />
          <TextField label="Line at the top" value={block.kicker} onChange={kicker => patch({kicker})} />
        </Section>
      );
    case 'contents':
      return (
        <Section>
          <Text elementType="p" kind="small" color="meta">The contents follow the sections: their numbers and pages update as the report changes.</Text>
          <Switch isSelected={block.showSub} onChange={showSub => patch({showSub})}>List the text headings under each section</Switch>
        </Section>
      );
    case 'section':
    case 'text': {
      const fr = block.fr ?? {};
      return (
        <Section>
          <Text elementType="p" kind="small" color="meta">Type the words on the page; the format bar above the block sets its type, bold, italic and a list.</Text>
          {/* The heading in every report language; the page's editing-language Select picks the one shown. */}
          <MultilingualTextField label={block.kind === 'section' ? 'Section heading' : 'Heading (optional)'}
            locales={REPORT_LOCALES} locale={lang} showLocaleSwitcher={false}
            value={{en: block.heading ?? '', fr: fr.heading ?? ''}}
            onChange={(v, l) => patch((l === 'en' ? {heading: v[l] ?? ''} : {fr: {...fr, heading: v[l] ?? ''}}) as Partial<Block>)}
            placeholder={lang === 'en' ? undefined : block.heading}
            description={block.heading ? missingIn(lang, !!fr.heading) : undefined} />
          {lang !== 'en' && <Text elementType="p" kind="small" color="meta">{missingIn(lang, !!fr.body) ?? `The words on the page are in ${LANG_NAME(lang)}.`}</Text>}
        </Section>
      );
    }
    case 'space':
      return (
        <Section>
          <Pick label="Height" value={block.size} options={{small: 'Small', medium: 'Medium', large: 'Large'}} onChange={size => patch({size})} />
        </Section>
      );
    case 'divider':
    case 'break':
      return (
        <Section>
          <Text elementType="p" kind="small" color="meta">{block.kind === 'break'
            ? 'A page break starts a new page here. It has nothing to set: move or delete it from its toolbar.'
            : 'A divider draws a line between parts of a page. It has nothing to set: move or delete it from its toolbar.'}</Text>
        </Section>
      );
    case 'numbers':
      return (
        <>
          <Section title="Layout">
            <RadioGroup aria-label="Layout" value={block.layout} orientation="horizontal" onChange={v => patch({layout: v as typeof block.layout})}>
              {(Object.keys(LAYOUTS) as (keyof typeof LAYOUTS)[]).map(k => (
                <ChoiceCard key={k} value={k} layout="thumbnail" media={<LayoutThumb layout={k} />}>{LAYOUTS[k]}</ChoiceCard>
              ))}
            </RadioGroup>
          </Section>
          <Section title={`Numbers · ${block.items.length} of 4`}>
            <NumbersEditor block={block} lang={lang} patch={patch} />
          </Section>
        </>
      );
    case 'bars':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Switch isSelected={block.showValues} onChange={showValues => patch({showValues})}>Show the value on each bar</Switch>
            {block.rows.length > 3 && (
              <Pick label="Rows to show" value={block.show} onChange={show => patch({show})}
                options={{top3: 'Top 3', top5: 'Top 5', all: `All ${block.rows.length}`}} />
            )}
          </Section>
          <Section>{written}</Section>
        </>
      );
    case 'compare':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Switch isSelected={block.showCounts} onChange={showCounts => patch({showCounts})}>Show the counts beside each share</Switch>
          </Section>
          <Section>{written}</Section>
        </>
      );
    case 'line':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Switch isSelected={block.showEstimate} onChange={showEstimate => patch({showEstimate})}>Show the estimate to the close</Switch>
          </Section>
        </>
      );
    case 'insight':
      return (
        <>
          <Section>
            <Select label="Project" defaultSelectedKey="tree-planting">
              <SelectItem id="tree-planting">Tree planting by street</SelectItem>
              <SelectItem id="parks-budget">Parks budget</SelectItem>
            </Select>
            <Select label="Phase" defaultSelectedKey="ideas">
              <SelectItem id="ideas">Share your ideas</SelectItem>
              <SelectItem id="survey">Final proposal feedback</SelectItem>
            </Select>
          </Section>
          <Section title={`Insight · ${INSIGHTS.length} saved in the analysis`}>
            <RadioGroup aria-label="Insight" value={block.insight} onChange={insight => patch({insight})}>
              {INSIGHTS.map(i => (
                <ChoiceCard key={i.id} value={i.id} description={`${i.kind} · Covers ${i.covers}`}>{i.question}</ChoiceCard>
              ))}
            </RadioGroup>
          </Section>
          <Section>
            <Switch isSelected={block.showQuestion} onChange={showQuestion => patch({showQuestion})}>Show the question as a heading</Switch>
            <Switch isSelected={block.showOrigin} onChange={showOrigin => patch({showOrigin})}>Show where it comes from</Switch>
          </Section>
        </>
      );
    case 'quotes':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Pick label="Look" value={block.layout} options={{card: 'Cards', plain: 'Plain'}} onChange={layout => patch({layout})} />
            <Switch isSelected={block.showFaces} onChange={showFaces => patch({showFaces})}>Show each person’s avatar</Switch>
          </Section>
        </>
      );
    case 'map':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Pick label="Shade the districts by" value={block.shade} options={SHADES} onChange={shade => patch({shade})} />
            <Stack gap="8" alignItems="start">
              <span aria-hidden>On top</span>
              <Switch isSelected={block.layers.ideas} onChange={ideas => patch({layers: {...block.layers, ideas}})}>Ideas from Tree planting</Switch>
              <Switch isSelected={block.layers.votes} onChange={votes => patch({layers: {...block.layers, votes}})}>Cycle lane votes</Switch>
              <Switch isSelected={block.layers.events} onChange={events => patch({layers: {...block.layers, events}})}>Upcoming events</Switch>
            </Stack>
            <Select label="Highlight ideas tagged" selectedKey={block.tag} onSelectionChange={k => patch({tag: String(k)})} items={TAGS}>
              {t => <SelectItem id={t.id}>{t.label}</SelectItem>}
            </Select>
            <Switch isSelected={block.streets} onChange={streets => patch({streets})}
              description="The PDF prints the layers that are on, framed as the map is on the page.">Street map underneath</Switch>
          </Section>
        </>
      );
    case 'events':
      return (
        <>
          <Section>{figure}</Section>
          <Section>
            <Select label="Folder" defaultSelectedKey="green">
              <SelectItem id="green">{REPORT.folder}</SelectItem>
            </Select>
            <Switch isSelected={block.showEnd} onChange={showEnd => patch({showEnd})}>Show when each event ends</Switch>
          </Section>
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
        <TreeItemContent trailing={s.kind !== 'project' ? all(s.children ?? []).filter(c => c.kind === 'project').length : undefined}>
          <Inline elementType="span" gap="8" wrap="nowrap" className="bo-report-row">
            <Icon aria-hidden size={16} />
            <span className="bo-report-row-name">{s.name}</span>
          </Inline>
        </TreeItemContent>
        {s.children?.map(renderNode)}
      </TreeItem>
    );
  };
  return (
    <>
      <Section title="What’s included"><Text elementType="p" kind="ui">{data.included}</Text></Section>
      <Section title="How it’s calculated"><Text elementType="p" kind="ui">{data.calculated}</Text></Section>
      <Section title={`Sources · ${data.sources.length} ${data.sources.length === 1 ? 'project' : 'projects'}`}>
        <Tree aria-label="Sources" className="bo-report-tree" defaultExpandedKeys={all(tree).filter(s => s.kind !== 'project').map(s => s.id)}
          onAction={k => { const s = all(tree).find(x => x.id === k); if (s?.kind === 'project') onSource(s); }}>
          {tree.map(renderNode)}
        </Tree>
      </Section>
      <Section>
        <PropertyList aria-label="Snapshot">
          <PropertyListItem label="Retrieved">{SNAPSHOT}</PropertyListItem>
          <PropertyListItem label="Kept as">A saved snapshot</PropertyListItem>
        </PropertyList>
        <Banner tone="neutral">The numbers are a saved snapshot. The source screens may include changes made since this widget was made.</Banner>
        <Button variant="secondary" size={32} onPress={onRefresh}>Refresh the data</Button>
      </Section>
    </>
  );
}

// ── The view ────────────────────────────────────────────────────────────────────────────────────────────────────

type Right = 'auto' | 'history';
interface Created {title: string; template: 'blank' | 'template' | 'ai'}
/** One turn of the conversation; an assistant's change carries its own Undo and the block it shows. */
interface Message {
  id: number;
  from: 'you' | 'assistant';
  text?: string;
  /** The block the question was about (its name and kind), for the chip above your bubble. */
  about?: {label: string; kind: BlockKind};
  change?: string;
  status?: 'done' | 'undone' | 'stopped';
  undo?: () => void;
  /** The block "Show what changed" scrolls to. */
  show?: string;
}

export function ReportView() {
  const {reportId} = useParams();
  const created = (useLocation().state ?? null) as Created | null;
  const report = REPORTS.find(r => r.id === reportId);
  const title = report?.title ?? (reportId === 'new' ? created?.title ?? 'Untitled report' : null);
  if (!title) {
    return (
      <Page title="Report not found" crumbs={[{key: 'reporting', label: 'Reporting', href: '#/reporting'}]}>
        <Text elementType="p" kind="small" color="meta">This report does not exist.</Text>
      </Page>
    );
  }
  return <ReportEditor key={reportId} title={title} blank={reportId === 'new' && created?.template !== 'template'}
    generate={reportId === 'new' && created?.template === 'ai'} />;
}

let said = 0;

function ReportEditor({title, blank, generate}: {title: string; blank: boolean; generate: boolean}) {
  // `?assistant=off`: the platform without the assistant (the Assistant panel's off state, and no ✦ on the blocks).
  const assistantOn = useSearchParams()[0].get('assistant') !== 'off';
  const [blocks, setBlocks] = useState<Block[]>(() => (blank ? [] : TEMPLATE.map(b => (b.kind === 'title' ? {...b, title} : b))));
  const [selected, setSelected] = useState<string | null>(null);
  const [right, setRight] = useState<Right>('auto');
  const [library, setLibrary] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [zoom, setZoom] = useState(83);
  const [fitZoom, setFitZoom] = useState<number>();
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState(`Saved ${REPORT.savedAt} by you`);
  const [history, setHistory] = useState(HISTORY);
  const [status, setStatus] = useState<'ready' | 'generating'>('ready');
  const [steps, setSteps] = useState<ChatProgressStep[]>([]);
  const [askGenerate, setAskGenerate] = useState(generate);
  const [source, setSource] = useState<SourceNode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replying, setReplying] = useState(false);
  const [scopeId, setScopeId] = useState<string | null>(null);
  const [aiMade, setAiMade] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  const {pages, pageOf} = useMemo(() => paginate(blocks), [blocks]);
  const nums = useMemo(() => sectionNumbers(blocks), [blocks]);
  const block = blocks.find(b => b.id === selected) ?? null;
  const scope = blocks.find(b => b.id === scopeId) ?? null;
  const touched = () => setSaved('Saved just now by you');
  const say = (m: Omit<Message, 'id'>) => { const id = ++said; setMessages(ms => [...ms, {...m, id}]); return id; };
  const isWorking = status === 'generating' || replying;

  // A selection made anywhere shows its block on the page and its row in the outline.
  useEffect(() => {
    if (!selected) return;
    document.getElementById(`block-${selected}`)?.scrollIntoView({block: 'nearest'});
    document.querySelector(`.bo-report-outline [data-key="${selected}"]`)?.scrollIntoView({block: 'nearest'});
  }, [selected]);

  // A settings panel that opens takes focus in its first frame (Side panel's rule); a block picked on the page or in the
  // outline keeps focus there, so Tab goes on to its toolbar and the outline's arrow keys keep walking.
  const afterPanel = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
  // The last thing focused outside the end column: where focus goes back to.
  const lastOutside = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !e.target.closest('.bo-report-side')) lastOutside.current = e.target;
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);
  const select = (id: string | null) => {
    setSelected(id);
    if (!id) return;
    setRight('auto');
    afterPanel(() => {
      if (!document.querySelector('.bo-report-side')?.contains(document.activeElement)) return;
      const back = lastOutside.current;
      (back?.isConnected ? back : document.getElementById(`block-${id}`))?.focus();
    });
  };
  const TOOL = {up: 'Move up', down: 'Move down', duplicate: 'Duplicate'};
  const focusBlock = (id: string, action?: keyof typeof TOOL) => afterPanel(() => {
    const el = document.getElementById(`block-${id}`);
    const tools = el?.querySelector('[role="toolbar"]');
    const btn = action ? tools?.querySelector<HTMLElement>(`button[aria-label="${TOOL[action]}"]:not([disabled])`) : null;
    (btn ?? tools?.querySelector<HTMLElement>('button:not([disabled])') ?? el)?.focus();
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
    toast(`${gone.name} deleted`, undefined, {action: 'Undo', onAction: () => { insert(gone, at); setSelected(gone.id); focusBlock(gone.id); }});
  };
  const free = (i: number) => i >= 0 && i < blocks.length && !PINNED.includes(blocks[i].kind);
  const move = (id: string, d: -1 | 1) => {
    const at = blocks.findIndex(b => b.id === id);
    const to = at + d;
    if (!free(to)) return;
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
    toast(`${copy.name} duplicated`, 'The copy is right under it.', {action: 'Undo', onAction: () => { setBlocks(bs => bs.filter(b => b.id !== copy.id)); setSelected(id); }});
  };
  /** A text block's type from its format bar: a section, a sub-section (a text with a heading), or plain text. */
  const retype = (b: TextBlock, type: RichTextBlockType) => {
    const {id, name, body, fr, format} = b;
    const heading = b.heading || name;
    const next: Block = type === 'section'
      ? {id, kind: 'section', name, num: '', heading, body, fr, format}
      : {id, kind: 'text', name, heading: type === 'subsection' ? heading : undefined, body, fr, format};
    setBlocks(bs => bs.map(x => (x.id === id ? next : x)));
    touched();
  };
  const openLibrary = (at: number | null) => { setInsertAt(at); setLibrary(true); };
  const closeLibrary = () => {
    setLibrary(false);
    setInsertAt(null);
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.bo-report-outline [aria-label="Add widget"]')?.focus());
  };
  const add = (kind: BlockKind) => {
    const b = newBlock(kind);
    const at = insertAt ?? (selected ? blocks.findIndex(x => x.id === selected) + 1 : blocks.length);
    insert(b, at);
    setLibrary(false);
    setInsertAt(null);
    select(b.id);
    touched();
    focusBlock(b.id);
    toast(`${KIND[kind].label} added`, undefined, {action: 'Undo', onAction: () => { setBlocks(bs => bs.filter(x => x.id !== b.id)); setSelected(null); }});
  };

  // The assistant: a generate run ticks its steps off; a reply thinks a moment, then changes the report or answers.
  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStatus('ready');
    setReplying(false);
    say({from: 'assistant', status: 'stopped'});
  };
  const runGenerate = () => {
    setAskGenerate(false);
    setStatus('generating');
    say({from: 'you', text: 'Generate a report from the folder'});
    setSteps(GENERATE_STEPS.map((label, i) => ({id: String(i), label, status: i === 0 ? 'running' : undefined})));
    GENERATE_STEPS.forEach((_, i) => later(() => setSteps(s => s.map((x, j) => ({...x, status: j <= i ? 'done' : j === i + 1 ? 'running' : undefined}))), 500 * (i + 1)));
    later(() => {
      const fresh = TEMPLATE.map(b => (b.kind === 'title' ? {...b, title} : b));
      setBlocks(fresh);
      setStatus('ready');
      touched();
      say({from: 'assistant', text: 'I wrote a first version: a summary, the numbers, the charts and what happens next. Check every figure before sharing.',
        change: `${fresh.length} widgets added. You can change everything.`});
      toast('Report generated', 'The assistant wrote a first version. Check every figure before sharing.');
    }, 500 * GENERATE_STEPS.length + 100);
  };

  const ask = (text: string) => {
    if (/^generate/i.test(text) || !blocks.length) { setAskGenerate(true); return; }
    const about = scope ? {label: scope.name, kind: scope.kind} : undefined;
    say({from: 'you', text, about});
    setReplying(true);
    later(() => { setReplying(false); answer(text, about?.label); }, 900);
  };
  const answer = (text: string, about?: string) => {
    const summary = blocks.find(b => b.kind === 'section' && (b.bullets?.length ?? 0) > 3) as Extract<Block, {kind: 'section'}> | undefined;
    const reach = blocks.find(b => b.kind === 'section' && b.heading === 'Reach');
    // The reply's id, for its own Undo to mark it undone (set as the reply is said, read when Undo is pressed).
    let id = 0;
    const undone = () => setMessages(ms => ms.map(m => (m.id === id ? {...m, status: 'undone'} : m)));
    if (/summary shorter/i.test(text) && summary) {
      const before = summary.bullets!;
      patch(summary.id, {bullets: before.slice(0, 3)} as Partial<Block>);
      setAiMade(s => new Set(s).add(summary.id));
      id = say({from: 'assistant', text: `I cut the executive summary from ${before.length} points to 3, keeping the findings with the strongest evidence.`,
        change: '1 section changed. The version before is kept.', show: summary.id,
        undo: () => { patch(summary.id, {bullets: before} as Partial<Block>); undone(); }});
      setHistory(h => [{id: `h-${Date.now()}`, day: 'Today', who: 'Assistant', initials: 'AI', what: 'changed the report', when: 'Today, just now · asked by you', prompt: text, blocks: [summary.name], current: true}, ...h.map(e => ({...e, current: false}))]);
      return;
    }
    if (/remove the reach/i.test(text) && reach) {
      const at = blocks.indexOf(reach);
      const end = blocks.findIndex((b, i) => i > at && b.kind === 'section');
      const cut = blocks.slice(at, end < 0 ? blocks.length : end);
      setBlocks(bs => bs.filter(b => !cut.includes(b)));
      touched();
      id = say({from: 'assistant', text: `I removed the Reach section and its ${cut.length - 1} widgets. The contents and page numbers follow.`,
        change: `${cut.length} widgets removed. The version before is kept.`,
        undo: () => { setBlocks(bs => [...bs.slice(0, at), ...cut, ...bs.slice(at)]); undone(); }});
      return;
    }
    say({from: 'assistant', text: about
      ? `I can’t change ${about} from here yet. Type the change on the page, or ask about the whole report. I did not change the report.`
      : 'Who took part is in section 05: 3,600 identifiable participants, with recorded rates highest in North Quarter. Two districts are suppressed or have no data, and the report says why. I did not change the report.'});
  };
  const showChange = (id: string) => {
    if (!blocks.some(b => b.id === id)) { toast('That widget is no longer in the report'); return; }
    document.getElementById(`block-${id}`)?.scrollIntoView({block: 'center'});
    setFlash(id);
    later(() => setFlash(f => (f === id ? null : f)), 1200);
  };
  const askAbout = (b: Block) => {
    setScopeId(b.id);
    setSelected(null);
    setRight('auto');
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.bo-report-side textarea')?.focus());
  };

  const closePanel = () => {
    if (right === 'history') { setRight('auto'); return; }
    if (block) { const id = block.id; setSelected(null); focusBlock(id); }
  };

  const panel = right === 'history' ? (
    <SidePanel isInline isOpen label="Version history" icon={<Clock aria-hidden />} headingLevel={2} onOpenChange={closePanel}
      labels={{close: 'Close the version history'}}>
      <ActivityFeed items={historyItems(history, blocks)}
        onRestore={id => { const e = history.find(x => x.id === id)!; toast('Version restored', `The report is back as it was ${e.when.split(' · ')[0].toLowerCase()}.`, {action: 'Undo', onAction: () => {}}); }} />
    </SidePanel>
  ) : block ? (
    <SidePanel isInline isOpen label={block.name} icon={kindIcon(block.kind)} headingLevel={2} onOpenChange={closePanel}
      labels={{close: 'Close the widget settings'}}
      footer={(
        <Inline justifyContent="space-between" gap="8" wrap="nowrap" className="bo-report-panel-foot">
          {!STRUCTURE.includes(block.kind) && (assistantOn ? (
            <Button variant="quiet" size={32} onPress={() => askAbout(block)}><Sparkles aria-hidden size={16} />Ask the assistant</Button>
          ) : (
            <TooltipTrigger>
              <Button variant="quiet" size={32} isDisabled><Sparkles aria-hidden size={16} />Ask the assistant</Button>
              <Tooltip>The assistant is not switched on for this platform</Tooltip>
            </TooltipTrigger>
          ))}
          <Button variant="quiet" size={32} tone="danger" onPress={() => remove(block.id)}><Trash2 aria-hidden size={16} />Delete</Button>
        </Inline>
      )}>
      {DATA_KINDS.includes(block.kind) ? (
        <Tabs key={block.id}>
          <TabList aria-label="Widget settings">
            <Tab id="settings">Settings</Tab>
            <Tab id="data">Data</Tab>
          </TabList>
          <TabPanels>
            <TabPanel id="settings" className="bo-report-tab"><Settings block={block} lang={lang} patch={p => patch(block.id, p)} /></TabPanel>
            <TabPanel id="data" className="bo-report-tab">
              <DataTab block={block} onSource={setSource}
                onRefresh={() => toast('Data refreshed', `${block.name} now shows today’s numbers.`, {action: 'Undo', onAction: () => {}})} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : <Settings key={block.id} block={block} lang={lang} patch={p => patch(block.id, p)} />}
    </SidePanel>
  ) : (
    <AssistantPanel onSend={ask} isWorking={isWorking} onStop={stop} isEmpty={!blocks.length} onGenerate={() => setAskGenerate(true)}
      suggestions={(scope ? BLOCK_PROMPTS : SUGGESTIONS).map(s => ({id: s, label: s}))} onSuggestion={ask}
      scope={scope ? {label: scope.name, icon: kindIcon(scope.kind)} : undefined} onClearScope={() => setScopeId(null)}
      isEnabled={assistantOn} previewItems={PREVIEW}
      onAskAccountManager={() => toast('Request sent', 'Your account manager will be in touch about the assistant.')}>
      {messages.map(m => (
        <ChatMessage key={m.id} from={m.from} change={m.change} status={m.status}
          context={m.about && <ItemChip variant="quiet" icon={kindIcon(m.about.kind)} label={m.about.label} />}
          labels={{stopped: 'Stopped. The report was not changed.'}}
          onUndo={m.undo} onShowChange={m.show ? () => showChange(m.show!) : undefined}>
          {m.text}
        </ChatMessage>
      ))}
      {isWorking && <ChatProgress steps={status === 'generating' ? steps : undefined} />}
    </AssistantPanel>
  );

  const frame = (b: Block, at: number) => {
    const isSelected = selected === b.id;
    const pinned = PINNED.includes(b.kind);
    return (
      <BlockFrame id={`block-${b.id}`} label={b.name} icon={kindIcon(b.kind)} aria-label={`${KIND[b.kind].label}: ${b.name}`}
        isSelected={isSelected} onSelect={() => select(b.id)} onDeselect={() => setSelected(null)} isPinned={pinned}
        isAiMade={aiMade.has(b.id)} isHighlighted={flash === b.id}
        onMoveUp={() => move(b.id, -1)} onMoveDown={() => move(b.id, 1)} canMoveUp={free(at - 1)} canMoveDown={free(at + 1)}
        onDuplicate={() => duplicate(b.id)} onDelete={() => remove(b.id)}
        toolbar={isTextBlock(b) && !(b.kind === 'section' && b.bullets?.length) ? (
          <TextToolbar block={b} canUp={free(at - 1)} canDown={free(at + 1)} onMove={d => move(b.id, d)}
            onAsk={assistantOn ? () => askAbout(b) : undefined} onDelete={() => remove(b.id)} onType={t => retype(b, t)}
            onFormat={format => patch(b.id, {format} as Partial<Block>)} />
        ) : undefined}>
        <BlockBody block={b} lang={lang} nums={nums} pageOf={pageOf} blocks={blocks} reportTitle={title} isEditing={isSelected}
          patch={p => patch(b.id, p)} />
      </BlockFrame>
    );
  };

  return (
    <Page title={title} crumbs={[{key: 'reporting', label: 'Reporting', href: '#/reporting'}]}
      actions={(
        <Inline gap="8">
          <Button variant="quiet" size={32} aria-pressed={right === 'history'} onPress={() => setRight(r => (r === 'history' ? 'auto' : 'history'))}>
            <Clock aria-hidden size={16} />{saved}
          </Button>
          <Select aria-label="Editing language" variant="pill" size={28} icon={<Languages size={16} />} selectedKey={lang}
            onSelectionChange={k => setLang(k as Lang)} items={LANGUAGES}>
            {l => <SelectItem id={l.id}>{l.label}</SelectItem>}
          </Select>
          <MenuTrigger placement="bottom end">
            <Button variant="secondary" size={32} hasMenu><Download aria-hidden size={16} />Download</Button>
            <Menu aria-label="Download" onAction={k => toast(k === 'pdf' ? 'Preparing the PDF' : 'Preparing the Word file', `${title}.${k === 'pdf' ? 'pdf' : 'docx'} downloads when it is ready.`)}>
              <MenuItem id="pdf" icon={<FileText size={16} />}>PDF</MenuItem>
              <MenuItem id="word" icon={<Type size={16} />} badge={<Badge variant="outlined">Beta</Badge>}>Word</MenuItem>
            </Menu>
          </MenuTrigger>
        </Inline>
      )}>
      <GapLegend names={GAPS} />
      <div className="bo-report">
        {library
          ? <Library onAdd={add} onClose={closeLibrary} />
          : <Outline blocks={blocks} nums={nums} pageOf={pageOf} selected={selected} onSelect={select} onAdd={() => openLibrary(null)} />}

        <PageStage aria-label="Report pages" className="bo-report-canvas" zoom={zoom} onFitZoomChange={setFitZoom} onPageChange={setPage}
          zoomBar={<ZoomBar zoom={zoom} onZoomChange={setZoom} fitZoom={fitZoom} page={pages.length ? Math.min(page, pages.length) : undefined} pageCount={pages.length || undefined}
            isDisabled={status === 'generating'} />}>
          {status === 'generating' ? (
            <PageStageSheet isBusy aria-label="Generating the report">
              <Stack gap="12">
                <Skeleton width="40%" height={16} />
                <Skeleton width="70%" height={32} />
                <Skeleton width="100%" />
                <Skeleton width="90%" />
                <Skeleton width="100%" height={160} variant="block" />
                <Skeleton width="60%" />
              </Stack>
            </PageStageSheet>
          ) : pages.length ? pages.map((p, i) => (
            <PageStageSheet key={i} pageNumber={i + 1} isCover={i === 0} footer={title}>
              <Stack gap="16">
                {p.map(b => {
                  const at = blocks.indexOf(b);
                  return (
                    <Fragment key={b.id}>
                      {frame(b, at)}
                      <BlockInsertLine onInsert={() => openLibrary(at + 1)} isTarget={library && insertAt === at + 1} />
                    </Fragment>
                  );
                })}
              </Stack>
            </PageStageSheet>
          )) : (
            <PageStageSheet pageNumber={1}>
              <EmptyState title="No widgets in this report yet" icon={<Plus aria-hidden size={24} />} headingLevel={2}
                description="Choose a widget from the library, or ask the assistant to generate a first version."
                actions={<Button variant="primary" size={32} onPress={() => openLibrary(null)}><Plus aria-hidden size={16} />Add widget</Button>} />
            </PageStageSheet>
          )}
        </PageStage>

        <div className="bo-report-column bo-report-side">{panel}</div>
      </div>

      <Modal title="Generate the report" isOpen={askGenerate} onOpenChange={setAskGenerate}
        footer={<>
          <Button variant="secondary" size={32} slot="close">Cancel</Button>
          <Button variant="primary" size={32} onPress={runGenerate}><Sparkles aria-hidden size={16} />Generate</Button>
        </>}>
        <Stack gap="12" alignItems="start">
          <Text elementType="p" kind="ui">The assistant writes a first version from the <strong>6 projects across 3 spaces</strong> in {REPORT.folder}: a summary, the numbers, the charts and what happens next. You can change everything afterwards.</Text>
          <Text elementType="p" kind="small" color="meta">It takes a few minutes. You can leave this page while it runs.</Text>
        </Stack>
      </Modal>

      <Modal title={source?.name ?? 'Source'} isOpen={!!source} onOpenChange={o => !o && setSource(null)}
        footer={<Button variant="secondary" size={32} slot="close">Close</Button>}>
        {source && (
          <Stack gap="12" alignItems="start">
            <PropertyList aria-label={`About ${source.name}`}>
              <PropertyListItem label="Project">{source.name}</PropertyListItem>
              <PropertyListItem label="Scope">{source.scope}</PropertyListItem>
              <PropertyListItem label="Snapshot">Saved {SNAPSHOT}</PropertyListItem>
              <PropertyListItem label="Coverage">{source.coverage}</PropertyListItem>
              <PropertyListItem label="Counted">Submitted surveys, ideas and votes linked to participant accounts</PropertyListItem>
            </PropertyList>
            <Text elementType="p" kind="small" color="meta">The project’s own screens hold the records and their export.</Text>
          </Stack>
        )}
      </Modal>
    </Page>
  );
}

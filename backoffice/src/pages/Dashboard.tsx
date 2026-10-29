import {useMemo, useState, type ReactNode} from 'react';
import {useNavigate, useParams} from 'react-router';
import {ArrowRight, CalendarDays, Download, Eye, FolderOpen, Zap} from 'lucide-react';
import {Badge, Banner, BarRow, Button, ChartLegend, DashboardBars, DashboardCard, type DashboardCardKind,
  DashboardDemographic, DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableEmpty, DataTableHeader,
  DataTableRow, DataTableStack, DataTableText, DateRangeField, EmptyState, FilterChips, type FilterFacet, FilterMenu,
  type FilterValue, IconButton, LineChart, Link, Menu, MenuItem, MenuTrigger, Pagination, Panel, queue, SearchField,
  SegmentedControl, SegmentedControlItem, Select, SelectionBar, SelectItem, Sparkline, StatRow, StatTile, StatusBadge,
  Tab, TableToolbar, TableToolbarHeading, TabList, TabPanel, TabPanels, Tabs, ToastRegion} from 'govocal-ds';
import {Meter} from 'govocal-ds/base';
import {DASHBOARD, PROJECTS} from '../data';
import {MONTHS, PER_TAG, STATUS_BREAKDOWN, EMAILS, INVITATIONS, EVENTS, ADOPTION, DATE_PRESETS, METRICS, PROJECT_METRICS,
  TAG_METRICS, USERS, VISITORS, REPRESENTATION, PARTICIPATION_FEED, MANAGEMENT_FEED, FEED_ACTIONS,
  type Metric} from '../data-dashboard';
import {SectionHeading} from '../SectionHeading';
import {Page} from './Page';

/** The real admin's tabs, each its own route (#/dashboard/<slug>), as the real admin's /admin/dashboard/<tab>. */
const SECTIONS = [
  {slug: 'overview', label: 'Overview'},
  {slug: 'users', label: 'Users'},
  {slug: 'visitors', label: 'Visitors'},
  {slug: 'representativeness', label: 'Representativeness'},
  {slug: 'participation-feed', label: 'Participation feed'},
  {slug: 'management-feed', label: 'Management feed'}
];
const ALL = 'all';
const PAGE_SIZE = 10;
const n = (v: number) => v.toLocaleString('en');
const pct = (part: number, whole: number) => Math.round((part / whole) * 100);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const itemsWord = (k: number) => `${k} ${k === 1 ? 'item' : 'items'}`;
const changesWord = (k: number) => `${k} ${k === 1 ? 'change' : 'changes'}`;

type Headline = {label: string; value: number; last30: number; series: number[]};

/** The real admin's stat card, in the prototype's look: a Stat tile with its trend under the number. */
function HeadlineTile({label, value, last30, series, note}: Headline & {note?: string}) {
  return (
    <StatTile label={label} value={n(value)} note={note ?? `Last 30 days: +${n(last30)}`}>
      <Sparkline label={`${label} per month`} labels={MONTHS} values={series} height={34} showGrid={false} />
    </StatTile>
  );
}

/** Every dashboard card's download icon: a menu of formats, then a toast saying the file is on its way. */
function DownloadMenu({title}: {title: string}) {
  const start = (format: string) => queue.add(
    {title: 'Download started', description: `${slugify(title)}.${format.toLowerCase()}`},
    {timeout: 5000}
  );
  return (
    <MenuTrigger>
      <IconButton aria-label={`Download ${title.toLowerCase()} data`}><Download aria-hidden size={16} /></IconButton>
      <Menu aria-label={`Download ${title.toLowerCase()} as`} onAction={k => start(String(k))}>
        <MenuItem id="CSV">CSV</MenuItem>
        <MenuItem id="XLSX">XLSX</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

/** The real admin's dashboard card (title, download, body) as the gv Dashboard card: its legend and foot slots too. */
function DashCard({title, type, control, legend, footer, children}: {
  title: string; type?: DashboardCardKind; control?: ReactNode; legend?: ReactNode; footer?: ReactNode; children: ReactNode;
}) {
  const action = <span className="bo-dashboard-card-actions">{control}<DownloadMenu title={title} /></span>;
  return (
    <DashboardCard kind={type} title={title} actions={action} legend={legend} footer={footer}>
      <div className="bo-dashboard-body">{children}</div>
    </DashboardCard>
  );
}

/** Three figures side by side (Events, Invitations, Emails, Internal adoption): static Stat rows. */
function StatTrio({items}: {items: [string, string][]}) {
  return (
    <div className="bo-dashboard-stats">
      {items.map(([label, value]) => <StatRow key={label} isStatic label={label} value={value} />)}
    </div>
  );
}

type FilterState = {project: string; setProject: (p: string) => void; preset: string; setPreset: (p: string) => void};

/** The filter row: the project and the date preset as Select pill and quiet (docs/DECISIONS.md), the dates as the
 * gv Date range field, the resolution as a Segmented control at the end. */
function Filters({project, setProject, preset, setPreset}: FilterState) {
  return (
    <div className="bo-dashboard-filters">
      <Select variant="pill" aria-label="Project" prefix="Project:" isSearchable selectedKey={project}
        onSelectionChange={k => k != null && setProject(String(k))}>
        <SelectItem id={ALL} icon={<FolderOpen aria-hidden size={16} />}>All projects</SelectItem>
        {PROJECTS.map(p => <SelectItem key={p.id} id={p.id} icon={<FolderOpen aria-hidden size={16} />}>{p.title}</SelectItem>)}
      </Select>
      <Select variant="quiet" aria-label="Date preset" icon={<CalendarDays aria-hidden size={16} />} selectedKey={preset}
        onSelectionChange={k => k != null && setPreset(String(k))}>
        {DATE_PRESETS.map(p => <SelectItem key={p} id={p}>{p}</SelectItem>)}
      </Select>
      {preset === 'Custom' && <DateRangeField />}
      <span className="bo-push" />
      <SegmentedControl aria-label="Resolution" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['months']}>
        <SegmentedControlItem id="days">Days</SegmentedControlItem>
        <SegmentedControlItem id="weeks">Weeks</SegmentedControlItem>
        <SegmentedControlItem id="months">Months</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

/** A headline narrowed to one project: its share of the platform total, the trend scaled the same way. */
function narrow(h: Headline, project: string): Headline {
  const counts = PROJECT_METRICS[project];
  if (!counts || !(h.label in counts)) return h;
  const value = counts[h.label as Metric];
  const share = value / h.value;
  return {...h, value, last30: Math.round(h.last30 * share), series: h.series.map(v => Math.round(v * share))};
}

function Section({id, title, children}: {id: string; title: string; children: ReactNode}) {
  return (
    <section aria-labelledby={`bo-dashboard-${id}`} className="bo-dashboard-section">
      <h2 id={`bo-dashboard-${id}`} className="bo-section-title">{title}</h2>
      {children}
    </section>
  );
}

function People({project}: {project: string}) {
  const [reg, rawPart] = DASHBOARD.people;
  const part = narrow(rawPart, project);
  return (
    <Section id="people" title="People">
      <div className="bo-dashboard-kpis">
        <HeadlineTile {...reg} note={project === ALL ? undefined : 'Platform-wide'} />
        <HeadlineTile {...part} />
      </div>
      <DashCard title="Registrations and participants" type="participation-over-time">
        <LineChart labels={MONTHS} showLegend series={[{label: part.label, values: part.series}, {label: reg.label, values: reg.series}]} />
      </DashCard>
    </Section>
  );
}

/** A card's metric picker: the quiet Select, as the toolbar sorts (docs/DECISIONS.md). */
function MetricSelect({value, onChange}: {value: Metric; onChange: (m: Metric) => void}) {
  return (
    <Select variant="quiet" aria-label="Metric" selectedKey={value} onSelectionChange={k => k != null && onChange(k as Metric)}>
      {METRICS.map(m => <SelectItem key={m} id={m}>{m}</SelectItem>)}
    </Select>
  );
}

function Participation({project}: {project: string}) {
  const headlines = DASHBOARD.participation.map(h => narrow(h, project));
  const [inputs, comments] = headlines;
  const [projectMetric, setProjectMetric] = useState<Metric>('Inputs');
  const [tagMetric, setTagMetric] = useState<Metric>('Inputs');
  const projects = PROJECTS.filter(p => PROJECT_METRICS[p.id] && (project === ALL || p.id === project))
    .map(p => ({label: p.title, value: PROJECT_METRICS[p.id][projectMetric]}));
  const projectMax = Math.max(...projects.map(p => p.value));
  const tags = PER_TAG.map(t => ({label: t.tag, value: TAG_METRICS[t.tag][tagMetric]}));
  const tagMax = Math.max(...tags.map(t => t.value));
  return (
    <Section id="participation" title="Projects and participation">
      <div className="bo-dashboard-kpis">{headlines.map(d => <HeadlineTile key={d.label} {...d} />)}</div>
      <div className="bo-dashboard-cards">
        <DashCard title="Participation over time" type="participation-over-time">
          <LineChart labels={MONTHS} showLegend series={[{label: inputs.label, values: inputs.series}, {label: comments.label, values: comments.series}]} />
        </DashCard>
        <div className="bo-dashboard-stack">
          <DashCard title="Participation per project" control={<MetricSelect value={projectMetric} onChange={setProjectMetric} />}>
            {projects.map(p => <BarRow key={p.label} label={p.label} percent={pct(p.value, projectMax)} value={n(p.value)} />)}
          </DashCard>
          <DashCard title="Participation per tag" control={<MetricSelect value={tagMetric} onChange={setTagMetric} />}>
            {tags.map(t => <BarRow key={t.label} label={t.label} percent={pct(t.value, tagMax)} value={n(t.value)} />)}
          </DashCard>
        </div>
      </div>
    </Section>
  );
}

function Management() {
  const s = DASHBOARD.inputStatus;
  const total = STATUS_BREAKDOWN.reduce((a, b) => a + b.count, 0);
  const adoptionTotal = ADOPTION.admins.total + ADOPTION.managers.total;
  return (
    <Section id="management" title="Management">
      <div className="bo-dashboard-cards">
        <div className="bo-dashboard-stack">
          <DashCard title="Input status" type="status-breakdown" footer={(
            <Link href="#/inputs" className="bo-dashboard-more">Go to Input Manager <ArrowRight aria-hidden size={16} /></Link>
          )}>
            <Meter label="Feedback given" value={s.feedbackGiven} />
            <DashboardBars items={STATUS_BREAKDOWN.map(b => ({label: b.label, percent: (b.count / total) * 100, count: b.count, color: b.color}))} />
            <StatTrio items={[['Status changed', n(s.statusChanged)], ['Official updates', n(s.officialUpdates)],
              ['Avg. response', `${s.avgResponseDays} days`]]} />
            <StatRow label="Waiting for feedback" value={n(total - s.statusChanged)} isNew href="#/inputs" />
          </DashCard>
          <DashCard title="Events">
            <StatTrio items={[['Total events added', n(EVENTS.added)], ['Upcoming', n(EVENTS.upcoming)], ['Completed', n(EVENTS.completed)]]} />
          </DashCard>
        </div>
        <div className="bo-dashboard-stack">
          <DashCard title="Emails">
            <StatTrio items={[['Total emails sent', n(EMAILS.automated.total + EMAILS.custom.total)],
              ['Automated emails', n(EMAILS.automated.total)], ['Custom emails', n(EMAILS.custom.total)]]} />
            <LineChart labels={MONTHS} showLegend series={[{label: 'Automated emails', values: EMAILS.automated.series}, {label: 'Custom emails', values: EMAILS.custom.series}]} />
          </DashCard>
          <DashCard title="Invitations">
            <StatTrio items={[['Total invites sent', n(INVITATIONS.sent)], ['Pending', n(INVITATIONS.pending)], ['Accepted', n(INVITATIONS.accepted)]]} />
          </DashCard>
          {/* Was two Legend rows carrying figures: now the same Stat rows and charted legend as Emails. */}
          <DashCard title="Internal adoption">
            <StatTrio items={[['Admins', `${ADOPTION.admins.active30} of ${ADOPTION.admins.total}`],
              ['Project managers', `${ADOPTION.managers.active30} of ${ADOPTION.managers.total}`],
              ['Total', `${ADOPTION.admins.active30 + ADOPTION.managers.active30} of ${adoptionTotal}`]]} />
            <p className="bo-note">Active in the last 30 days</p>
            <LineChart labels={MONTHS} showLegend series={[{label: 'Active admins', values: ADOPTION.admins.series}, {label: 'Active project managers', values: ADOPTION.managers.series}]} />
          </DashCard>
        </div>
      </div>
    </Section>
  );
}

/** Users: the prototype's Demographics screen (participants timeline, then one card per registration field). */
function UsersTab({project}: {project: string}) {
  const [reg, rawPart] = DASHBOARD.people;
  const part = narrow(rawPart, project);
  const areaMax = Math.max(...USERS.area.map(a => a.count));
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-dashboard-kpis">
        <HeadlineTile {...reg} />
        <HeadlineTile {...part} />
        <StatTile label="Active users" value={n(USERS.active)} note="Took part in the last 90 days" />
      </div>
      <DashCard title="Participants timeline" type="participation-over-time">
        <Banner tone="info">Participation numbers may not be fully accurate, as some data is captured in an external survey that is not tracked.</Banner>
        <LineChart labels={MONTHS} showLegend series={[{label: part.label, values: part.series}, {label: reg.label, values: reg.series}]} />
      </DashCard>
      <div className="bo-dashboard-cards">
        <DashCard title="Gender" type="demographic-age"><DashboardDemographic label="Share of participants" items={USERS.gender} /></DashCard>
        <DashCard title="Age" type="demographic-age"><DashboardDemographic label="Share of participants" items={USERS.age} /></DashCard>
        <DashCard title="Area">
          {USERS.area.map(a => <BarRow key={a.label} label={a.label} percent={pct(a.count, areaMax)} value={n(a.count)} />)}
        </DashCard>
        <DashCard title="Education" type="demographic-age"><DashboardDemographic label="Share of participants" items={USERS.education} /></DashCard>
      </div>
    </div>
  );
}

/** Visitors: the prototype's Traffic screen (four KPIs, the line, then sources, languages and devices). */
function VisitorsTab() {
  const sourceMax = Math.max(...VISITORS.sources.map(s => s.count));
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-dashboard-kpis">
        {VISITORS.kpis.map(k => <StatTile key={k.label} label={k.label} value={k.value} note={k.note} />)}
      </div>
      <DashCard title="Visitors over time" type="visitors-over-time">
        <LineChart labels={MONTHS} showLegend series={[{label: 'Visitors', values: VISITORS.visitors}, {label: 'Visits', values: VISITORS.visits}]} />
      </DashCard>
      <div className="bo-dashboard-cards">
        <DashCard title="Traffic sources">
          {VISITORS.sources.map(s => <BarRow key={s.label} label={s.label} percent={pct(s.count, sourceMax)} value={n(s.count)} />)}
        </DashCard>
        <DashCard title="Language" type="demographic-age"><DashboardDemographic label="Share of visits" items={VISITORS.language} /></DashCard>
        <DashCard title="Device types" type="demographic-age"><DashboardDemographic label="Share of visits" items={VISITORS.devices} /></DashCard>
      </div>
    </div>
  );
}

/** Representativeness: participants against the reference population, one card per registration field. The two
 * series are named once, in the card's legend slot (the Chart legend, as every chart), not as Legend rows. */
function RepresentativenessTab() {
  const legend = <ChartLegend variant="square" align="start" items={[{label: 'Participants', color: 'bar'}, {label: 'Reference population', color: 'pass'}]} />;
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-dashboard-kpis">
        <StatTile label="Representativeness score" value={`${REPRESENTATION.score}%`} note="How closely participants match the population" />
        <StatTile label="Fields compared" value={String(REPRESENTATION.fields.length)} note="With reference data" />
        <StatTile label="Users with data" value={`${REPRESENTATION.withData}%`} note="Filled in the registration fields" />
      </div>
      <div className="bo-dashboard-cards">
        {REPRESENTATION.fields.map(f => (
          <DashCard key={f.field} title={f.field} legend={legend}>
            {f.rows.map(r => (
              <div key={r.label} className="bo-dashboard-pair">
                <BarRow label={r.label} percent={r.users} value={`${r.users}%`} />
                <BarRow label={<span className="bo-visually-hidden">{r.label}, reference population</span>} percent={r.population}
                  value={`${r.population}%`} barColor="--gv-chart-pass" />
              </div>
            ))}
          </DashCard>
        ))}
      </div>
    </div>
  );
}

/** Participation feed (the real admin's moderation feed) as a list page: a Panel with the Not yet viewed / Viewed
 * switch in its head, the Table toolbar (count, Selection bar, search), the Data table and Pagination. Marking as
 * viewed applies at once, with Undo in a Toast. */
function ParticipationFeed() {
  const [viewed, setViewed] = useState(() => new Set(PARTICIPATION_FEED.filter(f => f.viewed).map(f => f.id)));
  const [show, setShow] = useState<'new' | 'viewed'>('new');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const q = query.trim().toLowerCase();
  const rows = PARTICIPATION_FEED.filter(f => viewed.has(f.id) === (show === 'viewed'))
    .filter(f => !q || f.content.toLowerCase().includes(q) || f.project.toLowerCase().includes(q));
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const unseen = PARTICIPATION_FEED.length - viewed.size;
  const ticked = [...selected].map(String).filter(id => shown.some(r => r.id === id));

  const markViewed = (ids: string[]) => {
    setViewed(prev => new Set([...prev, ...ids]));
    setSelected(new Set());
    queue.add({
      title: ids.length === 1 ? 'Marked as viewed' : `${itemsWord(ids.length)} marked as viewed`,
      action: 'Undo',
      onAction: () => setViewed(prev => { const next = new Set(prev); ids.forEach(id => next.delete(id)); return next; })
    }, {timeout: 6000});
  };
  const switchTo = (v: 'new' | 'viewed') => { setShow(v); setPage(1); setSelected(new Set()); };

  const toolbar = (
    <TableToolbar aria-label="Feed tools" start={(
      <SelectionBar count={show === 'new' ? ticked.length : 0}
        items={[{id: 'viewed', label: 'Mark as viewed', icon: <Eye aria-hidden size={16} />}]}
        onAction={() => markViewed(ticked)} onClear={() => setSelected(new Set())}>
        <TableToolbarHeading>{itemsWord(rows.length)}</TableToolbarHeading>
      </SelectionBar>
    )}>
      <SearchField isCollapsible aria-label="Search the feed" placeholder="Search" value={query}
        onChange={v => { setQuery(v); setPage(1); }} />
    </TableToolbar>
  );

  return (
    <Panel title="Participation feed" description="New ideas, comments and proposals from every project." isFlush
      actions={(
        <SegmentedControl aria-label="Show" selectionMode="single" disallowEmptySelection selectedKeys={[show]}
          onSelectionChange={k => { const [v] = [...k]; if (v) switchTo(v as 'new' | 'viewed'); }}>
          <SegmentedControlItem id="new" isUnread={unseen > 0}>Not yet viewed</SegmentedControlItem>
          <SegmentedControlItem id="viewed">Viewed</SegmentedControlItem>
        </SegmentedControl>
      )}
      toolbar={toolbar}
      footer={rows.length > 0 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Feed pages" />}>
      {rows.length === 0 && !q ? (
        <EmptyState layout="panel" illustration="empty-notebook" headingLevel={3}
          title={show === 'new' ? 'You are all caught up' : 'Nothing viewed yet'}
          description={show === 'new' ? 'New ideas, comments and proposals will appear here.' : 'Items you mark as viewed move here.'} />
      ) : (
        <DataTable aria-label="Participation feed" selectionMode={show === 'new' ? 'multiple' : 'none'}
          selectedKeys={selected} onSelectionChange={k => setSelected(new Set(k === 'all' ? shown.map(r => r.id) : k))}>
          <DataTableHeader>
            <DataTableColumn id="type">Type</DataTableColumn>
            <DataTableColumn id="content" isRowHeader>Content</DataTableColumn>
            <DataTableColumn id="project">Project</DataTableColumn>
            <DataTableColumn id="date">Date</DataTableColumn>
            <DataTableColumn id="actions" align="options" showLabel={false}>Actions</DataTableColumn>
          </DataTableHeader>
          <DataTableBody renderEmptyState={() => <DataTableEmpty>No results</DataTableEmpty>}>
            {shown.map(f => (
              <DataTableRow key={f.id} id={f.id} textValue={f.content}>
                <DataTableCell><Badge>{f.type}</Badge></DataTableCell>
                <DataTableCell><DataTableText lines={2}>{f.content}</DataTableText></DataTableCell>
                <DataTableCell isMuted>{f.project}</DataTableCell>
                <DataTableCell isMuted><span className="bo-dashboard-nowrap">{f.date}</span></DataTableCell>
                <DataTableCell align="options">
                  {show === 'new'
                    ? <Button variant="quiet" size={32} aria-label={`Mark as viewed: ${f.content}`}
                      onPress={() => markViewed([f.id])}><Eye aria-hidden size={16} /> Mark as viewed</Button>
                    : <StatusBadge status="live">Viewed</StatusBadge>}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      )}
    </Panel>
  );
}

const ACTION_FACET: FilterFacet = {
  id: 'action', label: 'Action', icon: <Zap aria-hidden size={16} />,
  items: FEED_ACTIONS.map(a => ({id: a, label: a, count: MANAGEMENT_FEED.filter(m => m.action === a).length}))
};

/** Management feed: who changed what (the real admin's Date / User / Item / Action table), as a list page: Panel,
 * Table toolbar with search and the Filter menu, Filter chips, Data table, Pagination. */
function ManagementFeed() {
  const [filter, setFilter] = useState<FilterValue>({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const rows = useMemo(() => {
    const actions = filter.action ?? [];
    const q = query.trim().toLowerCase();
    return MANAGEMENT_FEED.filter(m => (!actions.length || actions.includes(m.action))
      && (!q || m.item.toLowerCase().includes(q) || m.user.toLowerCase().includes(q)));
  }, [filter, query]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  return (
    <Panel title="Management feed" description="What admins and managers created, changed and deleted." isFlush
      toolbar={(
        <>
          <TableToolbar aria-label="Feed tools" start={<TableToolbarHeading>{changesWord(rows.length)}</TableToolbarHeading>}>
            <SearchField isCollapsible aria-label="Search changes" placeholder="Search" value={query} onChange={fresh(setQuery)} />
            <FilterMenu aria-label="Filter changes" facets={[ACTION_FACET]} value={filter} onChange={fresh(setFilter)} countLabel={changesWord} />
          </TableToolbar>
          <FilterChips aria-label="Active filters" facets={[ACTION_FACET]} value={filter} onChange={fresh(setFilter)} />
        </>
      )}
      footer={<Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Change pages" />}>
      <DataTable aria-label="Management feed">
        <DataTableHeader>
          <DataTableColumn id="date">Date</DataTableColumn>
          <DataTableColumn id="user">User</DataTableColumn>
          <DataTableColumn id="item" isRowHeader>Item</DataTableColumn>
          <DataTableColumn id="action">Action</DataTableColumn>
        </DataTableHeader>
        <DataTableBody renderEmptyState={() => <DataTableEmpty>No results</DataTableEmpty>}>
          {shown.map(m => (
            <DataTableRow key={m.id} id={m.id} textValue={m.item}>
              <DataTableCell isMuted><span className="bo-dashboard-nowrap">{m.date}</span></DataTableCell>
              <DataTableCell>{m.user}</DataTableCell>
              <DataTableCell><DataTableStack sub={m.kind}>{m.item}</DataTableStack></DataTableCell>
              <DataTableCell><Badge>{m.action}</Badge></DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </Panel>
  );
}

export function Dashboard() {
  const {tab} = useParams();
  const navigate = useNavigate();
  const section = SECTIONS.find(s => s.slug === tab) ?? SECTIONS[0];
  const [project, setProject] = useState(ALL);
  const [preset, setPreset] = useState<string>(DATE_PRESETS[0]);
  const filters = <Filters project={project} setProject={setProject} preset={preset} setPreset={setPreset} />;
  return (
    <Page title="Dashboard">
      <Tabs selectedKey={section.slug}
        onSelectionChange={k => navigate(k === 'overview' ? '/dashboard' : `/dashboard/${String(k)}`)}>
        <TabList aria-label="Dashboard sections">{SECTIONS.map(s => <Tab key={s.slug} id={s.slug}>{s.label}</Tab>)}</TabList>
        <TabPanels>
        <TabPanel id="overview">
          {filters}
          <People project={project} />
          <Participation project={project} />
          <Management />
        </TabPanel>
        <TabPanel id="users"><SectionHeading>Users</SectionHeading>{filters}<UsersTab project={project} /></TabPanel>
        <TabPanel id="visitors"><SectionHeading>Visitors</SectionHeading>{filters}<VisitorsTab /></TabPanel>
        <TabPanel id="representativeness"><SectionHeading>Representativeness</SectionHeading><RepresentativenessTab /></TabPanel>
        {/* The feeds are Panels: their h2 is the Panel's title. */}
        <TabPanel id="participation-feed"><div className="bo-dashboard-tab"><ParticipationFeed /></div></TabPanel>
        <TabPanel id="management-feed"><div className="bo-dashboard-tab"><ManagementFeed /></div></TabPanel>
        </TabPanels>
      </Tabs>
      <ToastRegion />
    </Page>
  );
}

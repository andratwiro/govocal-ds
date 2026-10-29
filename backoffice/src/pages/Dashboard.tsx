import {useState, type ReactNode} from 'react';
import {useNavigate, useParams} from 'react-router';
import {ArrowRight, Download, Eye} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {Meter} from '../../../src/components/Meter';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {MyToastRegion, queue} from '../../../src/components/Toast';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {SegmentedControl, Segment} from '../../../src/components/gv/SegmentedControl';
import {DashboardCard, DashboardBars, DashboardDemographic, type DashboardCardType} from '../../../src/components/gv/DashboardCard';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Kpi} from '../../../src/components/gv/Kpi';
import {LineChart, Sparkline} from '../../../src/components/gv/Chart';
import {BarRow} from '../../../src/components/gv/BarRow';
import {StatRow} from '../../../src/components/gv/StatRow';
import {LegendRow} from '../../../src/components/gv/LegendRow';
import {Pill} from '../../../src/components/gv/Pill';
import {Status} from '../../../src/components/gv/Status';
import {Banner} from '../../../src/components/gv/Banner';
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
const n = (v: number) => v.toLocaleString('en');
const pct = (part: number, whole: number) => Math.round((part / whole) * 100);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Headline = {label: string; value: number; last30: number; series: number[]};

/** The real admin's stat card, in the prototype's look: a KPI tile with its trend under the number. */
function StatTile({label, value, last30, series, note}: Headline & {note?: string}) {
  return (
    <Kpi label={label} value={n(value)} note={note ?? `Last 30 days: +${n(last30)}`}>
      <Sparkline label={`${label} per month`} labels={MONTHS} values={series} height={34} grid={false} />
    </Kpi>
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

/** The real admin's dashboard card (title, download, body) as the gv Dashboard card from the prototype. */
function DashCard({title, type, control, children}: {title: string; type?: DashboardCardType; control?: ReactNode; children: ReactNode}) {
  const action = <span className="bo-dashboard-card-actions">{control}<DownloadMenu title={title} /></span>;
  return (
    <DashboardCard type={type} title={title} action={action}>
      <div className="bo-dashboard-body">{children}</div>
    </DashboardCard>
  );
}

/** The real admin's "All Time ▾" preset, in front of the date range. */
function DatePreset({preset, onChange}: {preset: string; onChange: (p: string) => void}) {
  return (
    <MenuTrigger>
      <Button variant="quiet" size={32} hasMenu aria-label={`Date preset: ${preset}`}>{preset}</Button>
      <Menu aria-label="Date preset" selectionMode="single" selectedKeys={[preset]}
        onSelectionChange={keys => { const [k] = [...keys]; if (k) onChange(String(k)); }}>
        {DATE_PRESETS.map(p => <MenuItem key={p} id={p}>{p}</MenuItem>)}
      </Menu>
    </MenuTrigger>
  );
}

type FilterState = {project: string; setProject: (p: string) => void; preset: string; setPreset: (p: string) => void};

function Filters({project, setProject, preset, setPreset}: FilterState) {
  return (
    <div className="bo-filters bo-dashboard-filters">
      <Select label="Project" selectedKey={project} onSelectionChange={k => setProject(String(k))}>
        <SelectItem id={ALL}>All projects</SelectItem>
        {PROJECTS.map(p => <SelectItem key={p.id} id={p.id}>{p.title}</SelectItem>)}
      </Select>
      <DatePreset preset={preset} onChange={setPreset} />
      <DateRangePicker label="Dates" />
      <span className="bo-push" />
      <SegmentedControl aria-label="Resolution" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['months']}>
        <Segment id="days">Days</Segment>
        <Segment id="weeks">Weeks</Segment>
        <Segment id="months">Months</Segment>
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

function People({project}: {project: string}) {
  const [reg, rawPart] = DASHBOARD.people;
  const part = narrow(rawPart, project);
  return (
    <section aria-labelledby="bo-dashboard-people">
      <h2 id="bo-dashboard-people" className="bo-section-title">People</h2>
      <div className="bo-dashboard-kpis">
        <StatTile {...reg} note={project === ALL ? undefined : 'Platform-wide'} />
        <StatTile {...part} />
      </div>
      <DashCard title="Registrations and participants" type="participation-over-time">
        <LineChart labels={MONTHS} legend series={[{label: part.label, values: part.series}, {label: reg.label, values: reg.series}]} />
      </DashCard>
    </section>
  );
}

function MetricSelect({value, onChange}: {value: Metric; onChange: (m: Metric) => void}) {
  return (
    <Select aria-label="Metric" selectedKey={value} onSelectionChange={k => onChange(k as Metric)}>
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
    <section aria-labelledby="bo-dashboard-participation">
      <h2 id="bo-dashboard-participation" className="bo-section-title">Projects and participation</h2>
      <div className="bo-dashboard-kpis">{headlines.map(d => <StatTile key={d.label} {...d} />)}</div>
      <div className="bo-dashboard-cards">
        <DashCard title="Participation over time" type="participation-over-time">
          <LineChart labels={MONTHS} legend series={[{label: inputs.label, values: inputs.series}, {label: comments.label, values: comments.series}]} />
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
    </section>
  );
}

function Management() {
  const s = DASHBOARD.inputStatus;
  const total = STATUS_BREAKDOWN.reduce((a, b) => a + b.count, 0);
  return (
    <section aria-labelledby="bo-dashboard-management">
      <h2 id="bo-dashboard-management" className="bo-section-title">Management</h2>
      <div className="bo-dashboard-cards">
        <div className="bo-dashboard-stack">
          <DashCard title="Input status">
            <Meter label="Feedback given" value={s.feedbackGiven} />
            <DashboardBars items={STATUS_BREAKDOWN.map(b => ({label: b.label, percent: (b.count / total) * 100, count: b.count, color: b.color}))} />
            <div className="bo-dashboard-stats">
              <StatRow isStatic label="Status changed" value={n(s.statusChanged)} />
              <StatRow isStatic label="Official updates" value={n(s.officialUpdates)} />
              <StatRow isStatic label="Avg. response" value={`${s.avgResponseDays} days`} />
            </div>
            <StatRow label="Waiting for feedback" value={n(total - s.statusChanged)} isNew href="#/inputs" />
            <Link href="#/inputs" className="react-aria-Link bo-dashboard-more">Go to Input Manager <ArrowRight aria-hidden size={14} /></Link>
          </DashCard>
          <DashCard title="Events">
            <div className="bo-dashboard-stats">
              <StatRow isStatic label="Total events added" value={n(EVENTS.added)} />
              <StatRow isStatic label="Upcoming" value={n(EVENTS.upcoming)} />
              <StatRow isStatic label="Completed" value={n(EVENTS.completed)} />
            </div>
          </DashCard>
        </div>
        <div className="bo-dashboard-stack">
          <DashCard title="Emails">
            <div className="bo-dashboard-stats">
              <StatRow isStatic label="Total emails sent" value={n(EMAILS.automated.total + EMAILS.custom.total)} />
              <StatRow isStatic label="Automated emails" value={n(EMAILS.automated.total)} />
              <StatRow isStatic label="Custom emails" value={n(EMAILS.custom.total)} />
            </div>
            <LineChart labels={MONTHS} legend series={[{label: 'Automated emails', values: EMAILS.automated.series}, {label: 'Custom emails', values: EMAILS.custom.series}]} />
          </DashCard>
          <DashCard title="Invitations">
            <div className="bo-dashboard-stats">
              <StatRow isStatic label="Total invites sent" value={n(INVITATIONS.sent)} />
              <StatRow isStatic label="Pending" value={n(INVITATIONS.pending)} />
              <StatRow isStatic label="Accepted" value={n(INVITATIONS.accepted)} />
            </div>
          </DashCard>
          <DashCard title="Internal adoption">
            <div className="bo-dashboard-rows">
              <LegendRow color="--gv-chart-line-primary" label={`Admins · ${ADOPTION.admins.total}`} value={`${ADOPTION.admins.active30} active last 30 days`} />
              <LegendRow color="--gv-chart-line-secondary" label={`Project managers · ${ADOPTION.managers.total}`} value={`${ADOPTION.managers.active30} active last 30 days`} />
            </div>
            <LineChart labels={MONTHS} series={[{label: 'Active admins', values: ADOPTION.admins.series}, {label: 'Active project managers', values: ADOPTION.managers.series}]} />
          </DashCard>
        </div>
      </div>
    </section>
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
        <StatTile {...reg} />
        <StatTile {...part} />
        <Kpi label="Active users" value={n(USERS.active)} note="Took part in the last 90 days" />
      </div>
      <DashCard title="Participants timeline" type="participation-over-time">
        <Banner>Participation numbers may not be fully accurate, as some data is captured in an external survey that is not tracked.</Banner>
        <LineChart labels={MONTHS} legend series={[{label: part.label, values: part.series}, {label: reg.label, values: reg.series}]} />
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
        {VISITORS.kpis.map(k => <Kpi key={k.label} label={k.label} value={k.value} note={k.note} />)}
      </div>
      <DashCard title="Visitors over time" type="visitors-over-time">
        <LineChart labels={MONTHS} legend series={[{label: 'Visitors', values: VISITORS.visitors}, {label: 'Visits', values: VISITORS.visits}]} />
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

/** Representativeness: participants against the reference population, one card per registration field. */
function RepresentativenessTab() {
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-dashboard-kpis">
        <Kpi label="Representativeness score" value={`${REPRESENTATION.score}%`} note="How closely participants match the population" />
        <Kpi label="Fields compared" value={String(REPRESENTATION.fields.length)} note="With reference data" />
        <Kpi label="Users with data" value={`${REPRESENTATION.withData}%`} note="Filled in the registration fields" />
      </div>
      <div className="bo-dashboard-cards">
        {REPRESENTATION.fields.map(f => (
          <DashCard key={f.field} title={f.field}>
            <div className="bo-dashboard-rows">
              <LegendRow color="--gv-chart-bar" label="Participants" value="% of participants" />
              <LegendRow color="--gv-chart-pass" label="Reference population" value="% of residents" />
            </div>
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

/** Participation feed (the real admin's moderation feed): new activity, marked as viewed one by one. */
function ParticipationFeed() {
  const [viewed, setViewed] = useState(() => new Set(PARTICIPATION_FEED.filter(f => f.viewed).map(f => f.id)));
  const [show, setShow] = useState<'new' | 'viewed'>('new');
  const rows = PARTICIPATION_FEED.filter(f => viewed.has(f.id) === (show === 'viewed'));
  const unseen = PARTICIPATION_FEED.length - viewed.size;
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-tabs-row">
        <SegmentedControl aria-label="Show" selectionMode="single" disallowEmptySelection selectedKeys={[show]}
          onSelectionChange={k => { const [v] = [...k]; if (v) setShow(v as 'new' | 'viewed'); }}>
          <Segment id="new" isUnread={unseen > 0}>Not yet viewed</Segment>
          <Segment id="viewed">Viewed</Segment>
        </SegmentedControl>
        <span className="bo-note" aria-live="polite">{unseen} not yet viewed</span>
      </div>
      <Table aria-label="Participation feed" className="react-aria-Table bo-dashboard-table">
        <TableHeader>
          <Column>Type</Column>
          <Column isRowHeader>Content</Column>
          <Column>Project</Column>
          <Column>Date</Column>
          <Column><span className="bo-visually-hidden">Actions</span></Column>
        </TableHeader>
        <TableBody renderEmptyState={() => <p className="bo-note">Nothing here.</p>}>
          {rows.map(f => (
            <Row key={f.id} id={f.id}>
              <Cell><Pill>{f.type}</Pill></Cell>
              <Cell>{f.content}</Cell>
              <Cell>{f.project}</Cell>
              <Cell>{f.date}</Cell>
              <Cell>
                {show === 'new'
                  ? <Button variant="quiet" size={32} aria-label={`Mark as viewed: ${f.content}`}
                    onPress={() => setViewed(prev => new Set(prev).add(f.id))}><Eye aria-hidden size={16} /> Mark as viewed</Button>
                  : <Status state="live">Viewed</Status>}
              </Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Management feed: who changed what, filtered by action (the real admin's Date / User / Item / Action table). */
function ManagementFeed() {
  const [action, setAction] = useState(ALL);
  const rows = MANAGEMENT_FEED.filter(m => action === ALL || m.action === action);
  return (
    <div className="bo-dashboard-tab">
      <div className="bo-filters">
        <Select label="Action" selectedKey={action} onSelectionChange={k => setAction(String(k))}>
          <SelectItem id={ALL}>All actions</SelectItem>
          {FEED_ACTIONS.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
        </Select>
      </div>
      <Table aria-label="Management feed" className="react-aria-Table bo-dashboard-table">
        <TableHeader>
          <Column>Date</Column>
          <Column>User</Column>
          <Column isRowHeader>Item</Column>
          <Column>Action</Column>
        </TableHeader>
        <TableBody>
          {rows.map(m => (
            <Row key={m.id} id={m.id}>
              <Cell>{m.date}</Cell>
              <Cell>{m.user}</Cell>
              <Cell><span className="bo-dashboard-item">{m.item}<span className="bo-note">{m.kind}</span></span></Cell>
              <Cell><Pill>{m.action}</Pill></Cell>
            </Row>
          ))}
        </TableBody>
      </Table>
    </div>
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
        <TabPanel id="participation-feed"><SectionHeading>Participation feed</SectionHeading><ParticipationFeed /></TabPanel>
        <TabPanel id="management-feed"><SectionHeading>Management feed</SectionHeading><ManagementFeed /></TabPanel>
        </TabPanels>
      </Tabs>
      <MyToastRegion />
    </Page>
  );
}

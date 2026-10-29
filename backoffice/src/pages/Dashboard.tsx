import type {ReactNode} from 'react';
import {Download} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {Meter} from '../../../src/components/Meter';
import {SegmentedControl, Segment} from '../../../src/components/gv/SegmentedControl';
import {DashboardCard, DashboardBars, type DashboardCardType} from '../../../src/components/gv/DashboardCard';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Kpi} from '../../../src/components/gv/Kpi';
import {LineChart, Sparkline} from '../../../src/components/gv/Chart';
import {BarRow} from '../../../src/components/gv/BarRow';
import {StatRow} from '../../../src/components/gv/StatRow';
import {LegendRow} from '../../../src/components/gv/LegendRow';
import {DASHBOARD, PROJECTS} from '../data';
import {MONTHS, PER_TAG, STATUS_BREAKDOWN, EMAILS, INVITATIONS, EVENTS, ADOPTION} from '../data-dashboard';
import {Page} from './Page';

const SECTIONS = ['Overview', 'Users', 'Visitors', 'Representativeness', 'Participation feed', 'Management feed'];
const n = (v: number) => v.toLocaleString('en');
const pct = (part: number, whole: number) => Math.round((part / whole) * 100);

type Headline = {label: string; value: number; last30: number; series: number[]};

/** The real admin's stat card, in the prototype's look: a KPI tile with its trend under the number. */
function StatTile({label, value, last30, series}: Headline) {
  return (
    <Kpi label={label} value={n(value)} note={`Last 30 days: +${n(last30)}`}>
      <Sparkline label={`${label} per month`} labels={MONTHS} values={series} height={34} grid={false} />
    </Kpi>
  );
}

/** The real admin's dashboard card (title, download, body) as Tali's Dashboard card from her prototype. */
function DashCard({title, type, children}: {title: string; type?: DashboardCardType; children: ReactNode}) {
  const action = (
    <IconButton aria-label={`Download ${title.toLowerCase()} data`}><Download aria-hidden size={16} /></IconButton>
  );
  return (
    <DashboardCard type={type} title={title} action={action}>
      <div className="bo-dashboard-body">{children}</div>
    </DashboardCard>
  );
}

function Filters() {
  return (
    <div className="bo-filters">
      <Select label="Project" defaultSelectedKey="all">
        <SelectItem id="all">All projects</SelectItem>
        {PROJECTS.map(p => <SelectItem key={p.id} id={p.id}>{p.title}</SelectItem>)}
      </Select>
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

function People() {
  const [reg, part] = DASHBOARD.people;
  return (
    <section aria-labelledby="bo-dashboard-people">
      <h2 id="bo-dashboard-people" className="bo-section-title">People</h2>
      <div className="bo-dashboard-kpis">{DASHBOARD.people.map(d => <StatTile key={d.label} {...d} />)}</div>
      <DashCard title="Registrations and participants" type="participation-over-time">
        <LineChart labels={MONTHS} legend series={[{label: part.label, values: part.series}, {label: reg.label, values: reg.series}]} />
      </DashCard>
    </section>
  );
}

function Participation() {
  const [inputs, comments] = DASHBOARD.participation;
  const projectMax = Math.max(...DASHBOARD.perProject.map(p => p.inputs));
  const tagMax = Math.max(...PER_TAG.map(t => t.inputs));
  return (
    <section aria-labelledby="bo-dashboard-participation">
      <h2 id="bo-dashboard-participation" className="bo-section-title">Projects and participation</h2>
      <div className="bo-dashboard-kpis">{DASHBOARD.participation.map(d => <StatTile key={d.label} {...d} />)}</div>
      <div className="bo-dashboard-cards">
        <DashCard title="Participation over time" type="participation-over-time">
          <LineChart labels={MONTHS} legend series={[{label: inputs.label, values: inputs.series}, {label: comments.label, values: comments.series}]} />
        </DashCard>
        <div className="bo-dashboard-stack">
          <DashCard title="Participation per project">
            {DASHBOARD.perProject.map(p => (
              <BarRow key={p.project} label={p.project} percent={pct(p.inputs, projectMax)} value={n(p.inputs)} />
            ))}
          </DashCard>
          <DashCard title="Participation per tag">
            {PER_TAG.map(t => <BarRow key={t.tag} label={t.tag} percent={pct(t.inputs, tagMax)} value={n(t.inputs)} />)}
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

export function Dashboard() {
  return (
    <Page title="Dashboard">
      <Tabs defaultSelectedKey="Overview">
        <TabList aria-label="Dashboard sections">{SECTIONS.map(s => <Tab key={s} id={s}>{s}</Tab>)}</TabList>
        <TabPanel id="Overview">
          <Filters />
          <People />
          <Participation />
          <Management />
        </TabPanel>
        {SECTIONS.slice(1).map(s => (
          <TabPanel key={s} id={s}><p className="bo-note">Shallow section: {s} comes after Overview.</p></TabPanel>
        ))}
      </Tabs>
    </Page>
  );
}

import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {SegmentedControl, SegmentedControlItem} from '../../../src/components/SegmentedControl';
import {Meter} from '../../../src/components/Meter';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {DASHBOARD, PROJECTS} from '../data';
import {Gap} from '../Gap';
import {Page} from './Page';

const SECTIONS = ['Overview', 'Users', 'Visitors', 'Representativeness', 'Participation feed', 'Management feed'];
const n = (v: number) => v.toLocaleString('en');

function Stat({label, value, last30, series}: {label: string; value: number; last30: number; series: number[]}) {
  return (
    <Gap name="StatCard">
      <strong>{label} {n(value)}</strong> <span className="bo-note">Last 30 days: +{n(last30)}</span>
      <Gap name="Chart · Line"><span className="bo-note">Total and per month: {series.join(', ')}</span></Gap>
    </Gap>
  );
}

function Overview() {
  const s = DASHBOARD.inputStatus;
  return (
    <>
      <div className="bo-filters">
        <Select label="Project" defaultSelectedKey="all">
          <SelectItem id="all">All projects</SelectItem>
          {PROJECTS.map(p => <SelectItem key={p.id} id={p.id}>{p.title}</SelectItem>)}
        </Select>
        <DateRangePicker label="Dates" />
        <SegmentedControl aria-label="Resolution" disallowEmptySelection defaultSelectedKeys={['months']}>
          <SegmentedControlItem id="days">Days</SegmentedControlItem>
          <SegmentedControlItem id="weeks">Weeks</SegmentedControlItem>
          <SegmentedControlItem id="months">Months</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <h2 className="bo-section-title">People</h2>
      <div className="bo-grid">{DASHBOARD.people.map(d => <Stat key={d.label} {...d} />)}</div>

      <h2 className="bo-section-title">Projects and participation</h2>
      <div className="bo-grid">
        {DASHBOARD.participation.map(d => <Stat key={d.label} {...d} />)}
        <Table aria-label="Participation per project">
          <TableHeader><Column isRowHeader>Project</Column><Column>Inputs</Column></TableHeader>
          <TableBody>{DASHBOARD.perProject.map(p => (
            <Row key={p.project}><Cell>{p.project}</Cell><Cell>{n(p.inputs)}</Cell></Row>))}
          </TableBody>
        </Table>
      </div>

      <h2 className="bo-section-title">Management</h2>
      <div className="bo-grid">
        <Gap name="Dashboard card">
          <strong>Input status</strong>
          <Meter label="Feedback given" value={s.feedbackGiven} />
          <span className="bo-note">Status changed {s.statusChanged} · Official updates {s.officialUpdates} · Average response {s.avgResponseDays} days</span>
        </Gap>
        {DASHBOARD.management.map(m => (
          <Gap key={m.label} name="KPI"><strong>{m.label} {n(m.value)}</strong> <span className="bo-note">{m.note}</span></Gap>
        ))}
      </div>
    </>
  );
}

export function Dashboard() {
  return (
    <Page title="Dashboard">
      <Tabs defaultSelectedKey="Overview">
        <TabList aria-label="Dashboard sections">{SECTIONS.map(s => <Tab key={s} id={s}>{s}</Tab>)}</TabList>
        <TabPanel id="Overview"><Overview /></TabPanel>
        {SECTIONS.slice(1).map(s => (
          <TabPanel key={s} id={s}><p className="bo-note">Shallow section: {s} comes after Overview.</p></TabPanel>
        ))}
      </Tabs>
    </Page>
  );
}

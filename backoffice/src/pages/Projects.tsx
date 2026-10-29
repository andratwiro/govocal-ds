import {MoreHorizontal} from 'lucide-react';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {ToggleButton} from '../../../src/components/ToggleButton';
import {DateRangePicker} from '../../../src/components/DateRangePicker';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {PROJECTS} from '../data';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const VIEWS = ['Projects', 'Folders', 'Spaces', 'Calendar', 'Arrange projects'];
const SORTS = ['Recently viewed', 'Phase starting or ending soon', 'Recently created (new-old)',
  'Recently created (old-new)', 'Alphabetically (a-z)', 'Alphabetically (z-a)'];

function ProjectTable() {
  return (
    <Table aria-label="Projects">
      <TableHeader>
        <Column isRowHeader>Project</Column><Column>Participants</Column><Column>Phase</Column>
        <Column>Managers</Column><Column>Visibility</Column><Column>Start</Column><Column>End</Column>
        <Column><span className="bo-visually-hidden">Actions</span></Column>
      </TableHeader>
      <TableBody>{PROJECTS.map(p => (
        <Row key={p.id} id={p.id}>
          <Cell>
            <Link href={`#/projects/${p.id}/phases/${p.phases[0].id}/build`}>{p.title}</Link>
            {p.folder && <div className="bo-note">{p.folder}</div>}
          </Cell>
          <Cell>{p.participants}</Cell>
          <Cell>{p.current}{p.timeLeft && <div className="bo-note">{p.timeLeft}</div>}</Cell>
          <Cell><Gap name="Avatar" inline>{p.managers?.length ? p.managers.join(', ') : 'Not assigned'}</Gap></Cell>
          <Cell>
            <Gap name="Status" inline>{p.status === 'Live' ? 'Published' : 'Draft'}</Gap>
            <div className="bo-note">{p.access}</div>
          </Cell>
          <Cell>{p.start}</Cell><Cell>{p.end ?? ''}</Cell>
          <Cell>
            <MenuTrigger>
              <Gap name="Icon button" inline>
                <Button variant="secondary" size={32} aria-label={`Actions for ${p.title}`}><MoreHorizontal aria-hidden size={16} /></Button>
              </Gap>
              <Menu>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem>Move to folder</MenuItem>
                <MenuItem>Delete</MenuItem>
              </Menu>
            </MenuTrigger>
          </Cell>
        </Row>))}
      </TableBody>
    </Table>
  );
}

export function Projects() {
  return (
    <Page title="Projects" actions={<Button variant="primary" size={32}>New project</Button>}>
      <Tabs defaultSelectedKey="Projects">
        <div className="bo-tabs-row">
          <TabList aria-label="Project views">
            {VIEWS.map(v => <Tab key={v} id={v}>{v}{v === 'Spaces' && <> <Gap name="Pill" inline>New</Gap></>}</Tab>)}
          </TabList>
          <SearchField aria-label="Search projects" placeholder="Search projects" />
        </div>
        <TabPanel id="Projects">
          <div className="bo-filters">
            <Select aria-label="Sort" defaultSelectedKey={SORTS[0]}>
              {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
            </Select>
            <ToggleButton>Pending approval</ToggleButton>
            <DateRangePicker aria-label="Dates" />
            <Button variant="secondary" size={32}>Add filter</Button>
          </div>
          <GapLegend names={['Avatar', 'Status', 'Icon button', 'Pill']} />
          <ProjectTable />
        </TabPanel>
        {VIEWS.slice(1).map(v => (
          <TabPanel key={v} id={v}><p className="bo-note">Shallow view: {v} comes after the project list.</p></TabPanel>
        ))}
      </Tabs>
    </Page>
  );
}

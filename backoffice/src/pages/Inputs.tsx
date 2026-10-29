import {useMemo, useState} from 'react';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {Switch} from '../../../src/components/Switch';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {ASSIGNEES, INPUTS, ME, PROJECTS, STATUSES} from '../data';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const title = (id: string) => PROJECTS.find(p => p.id === id)?.title ?? id;

export function Inputs() {
  const [project, setProject] = useState('all');
  const [assignee, setAssignee] = useState('any');
  const [assigned, setAssigned] = useState<Record<string, string>>(
    () => Object.fromEntries(INPUTS.map(i => [i.id, i.assignee])));
  const [status, setStatus] = useState('all');
  const [needsFeedback, setNeedsFeedback] = useState(false);
  const [query, setQuery] = useState('');
  const rows = useMemo(() => INPUTS.filter(i =>
    (assignee === 'any' || (assignee === 'none' ? assigned[i.id] === 'Unassigned' : assigned[i.id] === ME)) &&
    (project === 'all' || i.project === project) && (status === 'all' || i.status === status) &&
    (!needsFeedback || i.needsFeedback) && i.title.toLowerCase().includes(query.toLowerCase())),
  [assignee, assigned, project, status, needsFeedback, query]);
  const waiting = INPUTS.filter(i => i.needsFeedback).length;

  return (
    <Page title="Input manager" description="Give feedback, add tags and move input from one project to another.">
      <div className="bo-filters">
        <Select aria-label="Assignee" selectedKey={assignee} onSelectionChange={k => setAssignee(String(k))}>
          <SelectItem id="any">Any administrator</SelectItem>
          <SelectItem id="me">Assigned to me</SelectItem>
          <SelectItem id="none">Unassigned</SelectItem>
        </Select>
        <Switch isSelected={needsFeedback} onChange={setNeedsFeedback}>
          Only show inputs that need feedback <Gap name="Pill" inline>{waiting}</Gap>
        </Switch>
        <span className="bo-push" />
        <Button variant="secondary" size={32}>Exports</Button>
        <SearchField aria-label="Search inputs" placeholder="Search" value={query} onChange={setQuery} />
      </div>
      <GapLegend names={['Pill', 'Pagination']} />
      <div className="bo-split">
        <Tabs defaultSelectedKey="projects">
          <TabList aria-label="Filter by"><Tab id="projects">Projects</Tab><Tab id="status">Status</Tab></TabList>
          <TabPanel id="projects">
            <ListBox aria-label="Projects" selectionMode="single" disallowEmptySelection selectedKeys={[project]}
              onSelectionChange={k => setProject(String([...k][0]))}>
              <ListBoxItem id="all">All projects</ListBoxItem>
              {PROJECTS.filter(p => INPUTS.some(i => i.project === p.id)).map(p => <ListBoxItem key={p.id} id={p.id}>{p.title}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          <TabPanel id="status">
            <ListBox aria-label="Statuses" selectionMode="single" disallowEmptySelection selectedKeys={[status]}
              onSelectionChange={k => setStatus(String([...k][0]))}>
              <ListBoxItem id="all">All statuses</ListBoxItem>
              {STATUSES.map(s => <ListBoxItem key={s} id={s}>{s}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
        </Tabs>
        <div>
          <p className="bo-note">{rows.length} inputs</p>
          <Table aria-label="Inputs" selectionMode="multiple">
            <TableHeader>
              <Column isRowHeader>Title</Column><Column>Assignee</Column><Column>Comments</Column>
              <Column>Likes</Column><Column>Dislikes</Column><Column>Published on</Column>
            </TableHeader>
            <TableBody renderEmptyState={() => <p className="bo-note">No inputs match these filters.</p>}>{rows.map(i => (
              <Row key={i.id} id={i.id}>
                <Cell>
                  {i.title}
                  <div><Gap name="Pill" inline><Link href={`#/projects/${i.project}`}>{title(i.project)}</Link></Gap></div>
                </Cell>
                <Cell>
                  <Select aria-label={`Assignee for ${i.title}`} selectedKey={assigned[i.id]}
                    onSelectionChange={k => setAssigned(a => ({...a, [i.id]: String(k)}))}>
                    {ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
                  </Select>
                </Cell>
                <Cell>{i.comments}</Cell><Cell>{i.likes}</Cell><Cell>{i.dislikes}</Cell><Cell>{i.published}</Cell>
              </Row>))}
            </TableBody>
          </Table>
          <Gap name="Pagination" inline><span className="bo-note">Page 1 of 1</span></Gap>
        </div>
      </div>
    </Page>
  );
}

import {useMemo, useState} from 'react';
import {Table, TableHeader, Column, TableBody, Row, Cell} from '../../../src/components/Table';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {Switch} from '../../../src/components/Switch';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Pill} from '../../../src/components/gv/Pill';
import {Status} from '../../../src/components/gv/Status';
import {Avatar} from '../../../src/components/gv/Avatar';
import {NewDot} from '../../../src/components/gv/NewDot';
import {ListHeaderCell} from '../../../src/components/gv/ListHeaderCell';
import {Download, TriangleAlert} from 'lucide-react';
import {INPUTS, ME, PROJECTS, STATUSES} from '../data';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const title = (id: string) => PROJECTS.find(p => p.id === id)?.title ?? id;
const initial = (name: string) => name.split(' ').pop()?.charAt(0) ?? '';
// Inputs a content check flagged (the prototype's warning mark) and the ones published today (its new dot).
const FLAGGED = new Set(['i5']);
const isNew = (published: string) => published.includes('hour');
type Sort = 'title' | 'comments' | 'likes' | 'dislikes' | 'published';

export function Inputs() {
  const [project, setProject] = useState('all');
  const [assignee, setAssignee] = useState('any');
  const [status, setStatus] = useState('all');
  const [needsFeedback, setNeedsFeedback] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('published');
  const rows = useMemo(() => {
    const list = INPUTS.filter(i =>
      (assignee === 'any' || (assignee === 'none' ? i.assignee === 'Unassigned' : i.assignee === ME)) &&
      (project === 'all' || i.project === project) && (status === 'all' || i.status === status) &&
      (!needsFeedback || i.needsFeedback) && i.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'published') return list;
    return [...list].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : b[sort] - a[sort]);
  }, [assignee, project, status, needsFeedback, query, sort]);
  const waiting = INPUTS.filter(i => i.needsFeedback).length;
  const sortable = (key: Sort, label: string, variant?: 'number') => (
    <ListHeaderCell variant={variant} sorted={sort === key} onPress={() => setSort(key)}>{label}</ListHeaderCell>
  );

  return (
    <Page title="Input manager" description="Give feedback, add tags and move input from one project to another.">
      <div className="bo-filters bo-inputs-toolbar">
        <Select aria-label="Assignee" selectedKey={assignee} onSelectionChange={k => setAssignee(String(k))}>
          <SelectItem id="any">Any administrator</SelectItem>
          <SelectItem id="me">Assigned to me</SelectItem>
          <SelectItem id="none">Unassigned</SelectItem>
        </Select>
        <Switch isSelected={needsFeedback} onChange={setNeedsFeedback}>
          <span className="bo-inputs-switch-label">Only show inputs that need feedback <Pill>{waiting}</Pill></span>
        </Switch>
        <span className="bo-push" />
        <SearchField aria-label="Search inputs" placeholder="Search" value={query} onChange={setQuery} />
        <Button variant="secondary" size={32}><Download aria-hidden size={16} /> Exports</Button>
      </div>
      <div className="bo-inputs-body">
        <Tabs defaultSelectedKey="projects">
          <TabList aria-label="Filter by"><Tab id="projects">Projects</Tab><Tab id="status">Status</Tab></TabList>
          <TabPanel id="projects">
            <ListBox aria-label="Projects" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[project]}
              onSelectionChange={k => setProject(String([...k][0]))}>
              <ListBoxItem id="all">All projects</ListBoxItem>
              {PROJECTS.filter(p => INPUTS.some(i => i.project === p.id)).map(p => <ListBoxItem key={p.id} id={p.id}>{p.title}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          <TabPanel id="status">
            <ListBox aria-label="Statuses" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[status]}
              onSelectionChange={k => setStatus(String([...k][0]))}>
              <ListBoxItem id="all">All statuses</ListBoxItem>
              {STATUSES.map(s => <ListBoxItem key={s} id={s}>{s}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
        </Tabs>
        <div className="bo-inputs-list">
          <p className="bo-note">{rows.length} inputs</p>
          <div className="bo-inputs-table">
            <Table aria-label="Inputs" selectionMode="multiple" className="react-aria-Table bo-inputs-grid">
              <TableHeader>
                <Column isRowHeader>{sortable('title', 'Title')}</Column>
                <Column><ListHeaderCell square>Status</ListHeaderCell></Column>
                <Column><ListHeaderCell square>Assignee</ListHeaderCell></Column>
                <Column>{sortable('comments', 'Comments', 'number')}</Column>
                <Column>{sortable('likes', 'Likes', 'number')}</Column>
                <Column>{sortable('dislikes', 'Dislikes', 'number')}</Column>
                <Column>{sortable('published', 'Published on')}</Column>
              </TableHeader>
              <TableBody renderEmptyState={() => <p className="bo-note">No inputs match these filters.</p>}>{rows.map(i => (
                <Row key={i.id} id={i.id}>
                  <Cell textValue={i.title}>
                    <div className="bo-inputs-title">
                      <span className="bo-inputs-title-line">
                        {i.title}
                        {FLAGGED.has(i.id) && <TriangleAlert aria-label="Content warning" size={14} />}
                      </span>
                      <Pill><Link href={`#/projects/${i.project}`}>{title(i.project)}</Link></Pill>
                    </div>
                  </Cell>
                  <Cell textValue={i.status}>
                    <Status state={i.status === 'Accepted' || i.status === 'Implemented' ? 'live' : 'draft'}>{i.status}</Status>
                  </Cell>
                  <Cell textValue={i.assignee}>
                    {i.assignee === 'Unassigned'
                      ? <Avatar size={24} unassigned aria-label="Unassigned" />
                      : <Avatar size={24} initials={initial(i.assignee)} aria-label={`Assigned to ${i.assignee}`} />}
                  </Cell>
                  <Cell><span className="bo-inputs-num">{i.comments}</span></Cell>
                  <Cell><span className="bo-inputs-num">{i.likes}</span></Cell>
                  <Cell><span className="bo-inputs-num">{i.dislikes}</span></Cell>
                  <Cell textValue={i.published}>
                    <span className="bo-inputs-published">
                      {isNew(i.published) && <NewDot aria-label="New input" />}{i.published}
                    </span>
                  </Cell>
                </Row>))}
              </TableBody>
            </Table>
          </div>
          <GapLegend names={['Pagination']} />
          <Gap name="Pagination" inline><span className="bo-note">Page 1 of 1</span></Gap>
        </div>
      </div>
    </Page>
  );
}

import {useMemo, useState} from 'react';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableStack}
  from '../../../src/components/gv/DataTable';
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
  // Each sortable column has one order (titles A-Z, counts and dates highest/newest first), as before.
  const sortDescriptor = {column: sort, direction: sort === 'title' ? 'ascending' : 'descending'} as const;

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
            <DataTable aria-label="Inputs" selectionMode="multiple" className="bo-inputs-grid"
              sortDescriptor={sortDescriptor} onSortChange={d => setSort(d.column as Sort)}>
              <DataTableHeader>
                <DataTableColumn id="title" isRowHeader allowsSorting>Title</DataTableColumn>
                <DataTableColumn id="status">Status</DataTableColumn>
                <DataTableColumn id="assignee">Assignee</DataTableColumn>
                <DataTableColumn id="comments" align="number" allowsSorting>Comments</DataTableColumn>
                <DataTableColumn id="likes" align="number" allowsSorting>Likes</DataTableColumn>
                <DataTableColumn id="dislikes" align="number" allowsSorting>Dislikes</DataTableColumn>
                <DataTableColumn id="published" allowsSorting>Published on</DataTableColumn>
              </DataTableHeader>
              <DataTableBody renderEmptyState={() => <DataTableEmpty>No inputs match these filters.</DataTableEmpty>}>{rows.map(i => (
                <DataTableRow key={i.id} id={i.id}>
                  <DataTableCell textValue={i.title}>
                    {/* The prototype's title over a quiet sub-line (here: the input's project, still a link). */}
                    <DataTableStack strong sub={<Link href={`#/projects/${i.project}`}>{title(i.project)}</Link>}>
                      <span className="bo-inputs-title-line">
                        {i.title}
                        {FLAGGED.has(i.id) && <TriangleAlert aria-label="Content warning" size={14} />}
                      </span>
                    </DataTableStack>
                  </DataTableCell>
                  <DataTableCell textValue={i.status}>
                    <Status state={i.status === 'Accepted' || i.status === 'Implemented' ? 'live' : 'draft'}>{i.status}</Status>
                  </DataTableCell>
                  <DataTableCell textValue={i.assignee}>
                    {i.assignee === 'Unassigned'
                      ? <Avatar size={24} unassigned aria-label="Unassigned" />
                      : <Avatar size={24} initials={initial(i.assignee)} aria-label={`Assigned to ${i.assignee}`} />}
                  </DataTableCell>
                  <DataTableCell align="number">{i.comments}</DataTableCell>
                  <DataTableCell align="number">{i.likes}</DataTableCell>
                  <DataTableCell align="number">{i.dislikes}</DataTableCell>
                  <DataTableCell textValue={i.published}>
                    <span className="bo-inputs-published">
                      {isNew(i.published) && <NewDot aria-label="New input" />}{i.published}
                    </span>
                  </DataTableCell>
                </DataTableRow>))}
              </DataTableBody>
            </DataTable>
          </div>
          <GapLegend names={['Pagination']} />
          <Gap name="Pagination" inline><span className="bo-note">Page 1 of 1</span></Gap>
        </div>
      </div>
    </Page>
  );
}

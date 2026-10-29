import {useEffect, useMemo, useState} from 'react';
type Key = string | number;
type Selection = 'all' | Set<Key>;
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableStack}
  from '../../../src/components/gv/DataTable';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {SearchField} from '../../../src/components/SearchField';
import {Switch} from '../../../src/components/Switch';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {TextArea} from '../../../src/components/TextField';
import {MyToastRegion, queue} from '../../../src/components/Toast';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Badge} from '../../../src/components/gv/Badge';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {NewDot} from '../../../src/components/gv/NewDot';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Modal} from '../../../src/components/gv/Modal';
import {PanelSection} from '../../../src/patterns/PanelSection';
import {SelectionBar, type SelectionAction} from '../../../src/patterns/SelectionBar';
import {ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Download, Trash2, TriangleAlert, User, X} from 'lucide-react';
import {ASSIGNEES, ME, PROJECTS, STATUSES} from '../data';
import {MANAGED_INPUTS, PAGE_SIZE, TOPICS, type ManagedInput} from '../data-inputs';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const title = (id: string) => PROJECTS.find(p => p.id === id)?.title ?? id;
// Inputs a content check flagged (the prototype's warning mark) and the ones published today (its new dot).
const FLAGGED = new Set(['i5']);
const isNew = (published: string) => published.includes('hour');
const statusState = (s: string) => s === 'Accepted' || s === 'Implemented' ? 'live' : 'draft';
type Sort = 'title' | 'comments' | 'likes' | 'dislikes' | 'published';
type Change = (id: string, patch: Partial<ManagedInput>) => void;

/** The real admin's per-row "Unassigned ▾": assign an input without opening it. */
function AssigneeSelect({input, label, onChange}: {input: ManagedInput; label: string; onChange: Change}) {
  return (
    <Select aria-label={label} selectedKey={input.assignee} onSelectionChange={k => onChange(input.id, {assignee: String(k)})}>
      {ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
    </Select>
  );
}

/** The input preview the real admin slides in beside the list: the input, its status, assignee and feedback. */
function InputPreview({input, onChange, onClose}: {input: ManagedInput; onChange: Change; onClose: () => void}) {
  const [draft, setDraft] = useState('');
  const post = () => {
    onChange(input.id, {feedback: [...input.feedback, draft.trim()], needsFeedback: false});
    setDraft('');
  };
  return (
    // The system has no side panel (drawer) yet: the preview sits in a grid column beside the list, framed as a gap.
    <div className="bo-inputs-side">
      <Gap name="Side panel">
        <aside className="bo-inputs-preview" aria-label="Input preview" onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
          <div className="bo-inputs-preview-head">
            <h2 className="bo-section-title">{input.title}</h2>
            <IconButton aria-label="Close the preview" onPress={onClose}><X aria-hidden size={16} /></IconButton>
          </div>
          <p className="bo-note">{input.author} · Registered user · {input.published}</p>
          <p className="bo-inputs-preview-body">{input.body}</p>
          <div className="bo-inputs-preview-meta">
            <Link href={`#/projects/${input.project}`}>{title(input.project)}</Link>
            <Badge>{input.topic}</Badge>
          </div>
          <div className="bo-inputs-preview-fields">
            <Select label="Status" selectedKey={input.status} onSelectionChange={k => onChange(input.id, {status: String(k)})}>
              {STATUSES.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
            </Select>
            <Select label="Assignee" selectedKey={input.assignee} onSelectionChange={k => onChange(input.id, {assignee: String(k)})}>
              {ASSIGNEES.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
            </Select>
          </div>
          <PanelSection title="Official feedback" level={3} aside={input.needsFeedback ? 'Waiting for feedback' : undefined}>
            <div className="bo-inputs-preview-feedback">
              {input.feedback.length > 0 && (
                <ul aria-label="Posted feedback" className="bo-inputs-preview-posted">
                  {input.feedback.map((f, n) => <li key={n}><span className="bo-note">{ME} · just now</span><p>{f}</p></li>)}
                </ul>
              )}
              <TextArea label="Feedback" value={draft} onChange={setDraft} placeholder="Write an official update" />
              <span><Button variant="primary" size={32} isDisabled={!draft.trim()} onPress={post}>Post feedback</Button></span>
            </div>
          </PanelSection>
        </aside>
      </Gap>
    </div>
  );
}

export function Inputs() {
  const [inputs, setInputs] = useState(MANAGED_INPUTS);
  const [project, setProject] = useState('all');
  const [topic, setTopic] = useState('all');
  const [assignee, setAssignee] = useState('any');
  const [status, setStatus] = useState('all');
  const [needsFeedback, setNeedsFeedback] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('published');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<Key>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rows = useMemo(() => {
    const list = inputs.filter(i =>
      (assignee === 'any' || (assignee === 'none' ? i.assignee === 'Unassigned' : i.assignee === ME)) &&
      (project === 'all' || i.project === project) && (status === 'all' || i.status === status) &&
      (topic === 'all' || i.topic === topic) &&
      (!needsFeedback || i.needsFeedback) && i.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'published') return list;
    return [...list].sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : b[sort] - a[sort]);
  }, [inputs, assignee, project, status, topic, needsFeedback, query, sort]);
  useEffect(() => setPage(1), [assignee, project, status, topic, needsFeedback, query, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  // Bulk actions only ever reach rows on screen: a new filter, tab, search, sort or page clears the selection.
  const shownKey = shown.map(i => i.id).join(' ');
  useEffect(() => setSelected(new Set()), [shownKey]);

  const waiting = inputs.filter(i => i.needsFeedback).length;
  // Each sortable column has one order (titles A-Z, counts and dates highest/newest first), as before.
  const sortDescriptor = {column: sort, direction: sort === 'title' ? 'ascending' : 'descending'} as const;
  const change: Change = (id, patch) => setInputs(list => list.map(i => i.id === id ? {...i, ...patch} : i));
  const changeSelected = (patch: Partial<ManagedInput>) =>
    setInputs(list => list.map(i => selected.has(i.id) ? {...i, ...patch} : i));
  const deleteSelected = () => {
    const n = selected.size;
    setInputs(list => list.filter(i => !selected.has(i.id)));
    if (open && selected.has(open)) setOpen(null);
    setSelected(new Set());
    setConfirmDelete(false);
    queue.add({title: n === 1 ? '1 input deleted' : `${n} inputs deleted`}, {timeout: 5000});
  };
  const select = (keys: Selection) => setSelected(keys === 'all' ? new Set(shown.map(i => i.id)) : new Set(keys));
  const exportFile = (key: Key) => queue.add({
    title: key === 'inputs' ? 'Exporting all inputs' : key === 'comments' ? 'Exporting all comments' : `Exporting ${selected.size} inputs`,
    description: 'The .xlsx file downloads when it is ready.'
  }, {timeout: 5000});
  const preview = inputs.find(i => i.id === open);
  const bulkActions: SelectionAction[] = [
    {id: 'status', label: 'Change status', icon: <CircleCheck aria-hidden size={16} />, menu: (
      <Menu aria-label="Change status" onAction={k => changeSelected({status: String(k)})}>
        {STATUSES.map(s => <MenuItem key={s} id={s}>{s}</MenuItem>)}
      </Menu>
    )},
    {id: 'assign', label: 'Assign', icon: <User aria-hidden size={16} />, menu: (
      <Menu aria-label="Assign" onAction={k => changeSelected({assignee: String(k)})}>
        {ASSIGNEES.map(a => <MenuItem key={a} id={a}>{a}</MenuItem>)}
      </Menu>
    )},
    {id: 'delete', label: 'Delete', icon: <Trash2 aria-hidden size={16} />}
  ];

  return (
    <Page title="Input manager" description="Give feedback, add tags and move input from one project to another.">
      <div className="bo-filters bo-inputs-toolbar">
        <Select aria-label="Assignee" selectedKey={assignee} onSelectionChange={k => setAssignee(String(k))}>
          <SelectItem id="any">Any administrator</SelectItem>
          <SelectItem id="me">Assigned to me</SelectItem>
          <SelectItem id="none">Unassigned</SelectItem>
        </Select>
        <Switch isSelected={needsFeedback} onChange={setNeedsFeedback}>
          <span className="bo-inputs-switch-label">Only show inputs that need feedback <Badge>{waiting}</Badge></span>
        </Switch>
        <span className="bo-push" />
        <SearchField aria-label="Search inputs" placeholder="Search" value={query} onChange={setQuery} />
        <MenuTrigger>
          <Button variant="secondary" size={32}><Download aria-hidden size={16} /> Exports<ChevronDown aria-hidden size={16} /></Button>
          <Menu aria-label="Exports" onAction={exportFile} disabledKeys={selected.size ? [] : ['selected']}>
            <MenuItem id="inputs">Export all inputs (.xlsx)</MenuItem>
            <MenuItem id="comments">Export all comments (.xlsx)</MenuItem>
            <MenuItem id="selected">Export selected</MenuItem>
          </Menu>
        </MenuTrigger>
      </div>
      <div className="bo-inputs-body">
        <Tabs defaultSelectedKey="projects" onSelectionChange={() => setSelected(new Set())}>
          <TabList aria-label="Filter by">
            <Tab id="projects">Projects</Tab><Tab id="topics">Topics</Tab><Tab id="status">Status</Tab>
          </TabList>
          <TabPanels>
          <TabPanel id="projects">
            <div className="bo-inputs-filter-panel">
              <ListBox aria-label="Projects" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[project]}
                onSelectionChange={k => setProject(String([...k][0]))}>
                <ListBoxItem id="all">All projects</ListBoxItem>
                {PROJECTS.filter(p => inputs.some(i => i.project === p.id)).map(p => <ListBoxItem key={p.id} id={p.id}>{p.title}</ListBoxItem>)}
              </ListBox>
              <Link href="#/projects">Edit projects</Link>
            </div>
          </TabPanel>
          <TabPanel id="topics">
            <ListBox aria-label="Topics" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[topic]}
              onSelectionChange={k => setTopic(String([...k][0]))}>
              <ListBoxItem id="all">All topics</ListBoxItem>
              {TOPICS.map(t => <ListBoxItem key={t} id={t}>{t}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          <TabPanel id="status">
            <ListBox aria-label="Statuses" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[status]}
              onSelectionChange={k => setStatus(String([...k][0]))}>
              <ListBoxItem id="all">All statuses</ListBoxItem>
              {STATUSES.map(s => <ListBoxItem key={s} id={s}>{s}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          </TabPanels>
        </Tabs>
        <div className="bo-inputs-main">
          <div className="bo-inputs-list">
            <div className="bo-inputs-list-head">
              <p className="bo-note">{rows.length} inputs</p>
              <SelectionBar aria-label="Bulk actions" count={selected.size} actions={bulkActions}
                onAction={id => id === 'delete' && setConfirmDelete(true)} onClear={() => setSelected(new Set())} />
            </div>
            <div className="bo-inputs-table">
              <DataTable aria-label="Inputs" selectionMode="multiple" className="bo-inputs-grid"
                selectedKeys={selected} onSelectionChange={select}
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
                <DataTableBody renderEmptyState={() => <DataTableEmpty>No inputs match these filters.</DataTableEmpty>}>{shown.map(i => (
                  <DataTableRow key={i.id} id={i.id} onAction={() => setOpen(i.id)}>
                    <DataTableCell textValue={i.title}>
                      {/* The prototype's title over a quiet sub-line: the input's project (still a link) and topic. */}
                      <DataTableStack strong sub={<><Link href={`#/projects/${i.project}`}>{title(i.project)}</Link> · {i.topic}</>}>
                        <span className="bo-inputs-title-line">
                          {i.title}
                          {FLAGGED.has(i.id) && <TriangleAlert aria-label="Content warning" size={14} />}
                        </span>
                      </DataTableStack>
                    </DataTableCell>
                    <DataTableCell textValue={i.status}><StatusBadge state={statusState(i.status)}>{i.status}</StatusBadge></DataTableCell>
                    <DataTableCell textValue={i.assignee}>
                      <AssigneeSelect input={i} label={`Assignee for ${i.title}`} onChange={change} />
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
            <Gap name="Pagination" inline>
              <nav aria-label="Pages" className="bo-inputs-pages">
                <IconButton aria-label="Previous page" isDisabled={current === 1} onPress={() => setPage(current - 1)}>
                  <ChevronLeft aria-hidden size={16} />
                </IconButton>
                {Array.from({length: pages}, (_, n) => n + 1).map(n => (
                  <Button key={n} variant={n === current ? 'primary' : 'quiet'} size={32} aria-label={`Page ${n}`}
                    aria-current={n === current ? 'page' : undefined} onPress={() => setPage(n)}>{n}</Button>
                ))}
                <IconButton aria-label="Next page" isDisabled={current === pages} onPress={() => setPage(current + 1)}>
                  <ChevronRight aria-hidden size={16} />
                </IconButton>
                <span className="bo-note">Page {current} of {pages}</span>
              </nav>
            </Gap>
          </div>
          {preview && <InputPreview key={preview.id} input={preview} onChange={change} onClose={() => setOpen(null)} />}
        </div>
      </div>
      <Modal title="Delete these inputs?" isOpen={confirmDelete} onOpenChange={setConfirmDelete}
        footer={<>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button variant="primary" onPress={deleteSelected}>Delete {selected.size === 1 ? 'input' : `${selected.size} inputs`}</Button>
        </>}>
        <p>{selected.size === 1 ? 'The selected input' : `The ${selected.size} selected inputs`} and their comments will be deleted. This cannot be undone.</p>
      </Modal>
      <MyToastRegion />
    </Page>
  );
}

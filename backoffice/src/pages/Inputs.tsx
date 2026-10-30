import {useEffect, useMemo, useState} from 'react';
type Key = string | number;
type Selection = 'all' | Set<Key>;
import {AlertDialog, Avatar, Badge, CommentThread, DataTable, DataTableBody, DataTableCell, DataTableColumn,
  DataTableEmpty, DataTableHeader, DataTableRow, DataTableStack, Grid, IconButton, Inline, Link, Menu, MenuItem, MenuTrigger, NewDot,
  OfficialUpdate, Pagination, PropertyList, PropertyListItem, ReactionCounts, SearchField, Select, type SelectionAction,
  SelectionBar, SelectItem, Separator, SidePanel, type SidePanelAction, SidePanelActions, SidePanelRecordHead, SidePanelSection, Stack, StatusBadge,
  Switch, Tab, TableToolbar, TableToolbarHeading, TabList, TabPanel, TabPanels, Tabs, TagPicker, Text, type ThreadTab,
  type ThreadTarget, toast, Tooltip, TooltipTrigger} from 'govocal-ds';
import {ListBox, ListBoxItem} from 'govocal-ds/base';
import {CircleCheck, Download, ExternalLink, SquarePen, Trash2, TriangleAlert, User} from 'lucide-react';
import {ASSIGNEES, ME, PROJECTS, STATUSES} from '../data';
import {MANAGED_INPUTS, PAGE_SIZE, TOPICS, type ManagedInput} from '../data-inputs';
import {Page} from './Page';

const title = (id: string) => PROJECTS.find(p => p.id === id)?.title ?? id;
// Inputs a content check flagged (the prototype's warning mark) and the ones published today (its new dot).
const FLAGGED = new Set(['i5']);
const isNew = (published: string) => published.includes('hour');
const statusState = (s: string) => s === 'Accepted' || s === 'Implemented' ? 'live' : 'draft';
type Sort = 'title' | 'comments' | 'likes' | 'dislikes' | 'published';
type Change = (id: string, patch: Partial<ManagedInput>) => void;

/** The Select's "With avatars" options: a 16 Avatar before each manager, Unassigned the dashed one. */
const people = () => ASSIGNEES.map(a => (
  <SelectItem key={a} id={a} textValue={a}
    icon={a === 'Unassigned' ? <Avatar size={16} isUnassigned /> : <Avatar size={16} initials={a.slice(-1)} />}>{a}</SelectItem>
));

/** The real admin's per-row "Unassigned ▾": assign an input without opening it, on the side panel's pill. */
function AssigneeSelect({input, label, onChange}: {input: ManagedInput; label: string; onChange: Change}) {
  return (
    <Select variant="pill" size={22} aria-label={label} selectedKey={input.assignee}
      onSelectionChange={k => onChange(input.id, {assignee: String(k)})}>
      {people()}
    </Select>
  );
}

// The row's Comments count: each comment and each reply under it.
const countOf = (thread: ManagedInput['thread']) => thread.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
const ME_INITIALS = `M${ME.slice(-1)}`;
const TAG_OPTIONS = TOPICS.map(t => ({id: t, label: t}));
type Patch = (id: string, patch: Partial<ManagedInput>, title: string, body?: string) => void;

/** The open input in the Side panel (the Comment thread's "In a side panel" story): its title and words, its
 * reactions and quick actions, its properties, its official updates, then the thread. Every change applies at once,
 * with an Undo toast: the panel has no Save. */
function InputPanel({input, patch, onDelete}: {input: ManagedInput; patch: Patch; onDelete: () => void}) {
  const notYet = (what: string) => () => toast(`${what}: not in Figma yet`, undefined, {icon: null});
  const quick: SidePanelAction[] = [
    {id: 'edit', label: 'Edit', icon: <SquarePen aria-hidden size={16} />, onPress: notYet('Editing an input')},
    {id: 'view', label: 'View on the site', icon: <ExternalLink aria-hidden size={16} />, onPress: notYet('The input on the site')},
    {id: 'delete', label: 'Delete', icon: <Trash2 aria-hidden size={16} />, onPress: onDelete}
  ];
  // A post lands at once (no toast); Delete and Dismiss warning apply at once with an Undo toast.
  const setThread = (key: 'thread' | 'internal', list: ManagedInput['thread'], title = '') =>
    patch(input.id, {[key]: list, ...(key === 'thread' ? {comments: countOf(list)} : {})}, title);
  const post = (text: string, {tab, replyTo}: ThreadTarget) => {
    const key = tab === 'internal' ? 'internal' : 'thread';
    const c = {id: `${input.id}-p${Date.now()}`, author: ME, initials: ME_INITIALS, time: 'Just now', text};
    const list = input[key];
    setThread(key, replyTo ? list.map(x => (x.id === replyTo ? {...x, replies: [...(x.replies ?? []), c]} : x)) : [...list, c]);
  };
  const remove = (id: string, tab: ThreadTab) => {
    const key = tab === 'internal' ? 'internal' : 'thread';
    const list = input[key];
    const next = list.filter(c => c.id !== id).map(c => ({...c, replies: c.replies?.filter(r => r.id !== id)}));
    setThread(key, next, 'Comment deleted');
  };
  const dismiss = (id: string) => setThread('thread', input.thread.map(c => (c.id === id ? {...c, warning: undefined} : c)),
    'Content warning dismissed');
  return (
    <>
      <SidePanelSection>
        <SidePanelRecordHead title={input.title} author={input.author} authorRole="Registered user" date={input.published}
          actions={(
            <SidePanelActions items={quick}>
              <ReactionCounts likes={input.likes} dislikes={input.dislikes} comments={input.comments} />
            </SidePanelActions>
          )}>
          {input.body}
        </SidePanelRecordHead>
      </SidePanelSection>
      <SidePanelSection>
        <PropertyList aria-label="Input details">
          <PropertyListItem label="Status">
            <Select variant="pill" size={22} aria-label="Status" selectedKey={input.status}
              onSelectionChange={k => patch(input.id, {status: String(k)}, `Status changed to ${k}`)}>
              {STATUSES.map(st => <SelectItem key={st} id={st}>{st}</SelectItem>)}
            </Select>
          </PropertyListItem>
          <PropertyListItem label="Assignee">
            <Select variant="pill" size={22} aria-label="Assignee" selectedKey={input.assignee}
              onSelectionChange={k => patch(input.id, {assignee: String(k)}, k === 'Unassigned' ? 'Input unassigned' : `Assigned to ${k}`)}>
              {people()}
            </Select>
          </PropertyListItem>
          <PropertyListItem label="Tags">
            <TagPicker aria-label="Tags" items={TAG_OPTIONS} value={input.tags} selectionLabel={n => `${n} selected`}
              onChange={tags => patch(input.id, {tags}, 'Tags changed')} />
          </PropertyListItem>
          <PropertyListItem label="Project">
            <Link href={`#/projects/${input.project}`}>{title(input.project)}</Link>
          </PropertyListItem>
        </PropertyList>
      </SidePanelSection>
      <SidePanelSection>
        <OfficialUpdate updates={input.updates} onPublish={({text, name}) => patch(input.id,
          {updates: [{id: `${input.id}-u${Date.now()}`, text, by: name || undefined, date: 'Today'}, ...input.updates], needsFeedback: false},
          'Official update published', 'The author and everyone following this input will see it.')} />
      </SidePanelSection>
      <SidePanelSection>
        <CommentThread comments={input.thread} internal={input.internal} me={ME_INITIALS}
          onPost={post} onDelete={remove} onDismissWarning={dismiss} />
      </SidePanelSection>
    </>
  );
}

const rowOf = (id: string) =>
  document.querySelector<HTMLElement>(`[role="grid"][aria-label="Inputs"] [role="row"][data-key="${CSS.escape(id)}"]`);

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
  // The inputs Delete asks about: the checked rows (Selection bar) or the open input (its quick action).
  const [toDelete, setToDelete] = useState<string[] | null>(null);

  const rows = useMemo(() => {
    const list = inputs.filter(i =>
      (assignee === 'any' || (assignee === 'none' ? i.assignee === 'Unassigned' : i.assignee === ME)) &&
      (project === 'all' || i.project === project) && (status === 'all' || i.status === status) &&
      (topic === 'all' || i.tags.includes(topic)) &&
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
  // A change from the panel or a row applies at once; its toast can undo it (the panel has no Save).
  const patch: Patch = (id, next, title, body) => {
    const before = inputs.find(i => i.id === id);
    if (!before) return;
    const undo = Object.fromEntries(Object.keys(next).map(k => [k, before[k as keyof ManagedInput]])) as Partial<ManagedInput>;
    change(id, next);
    if (title) toast(title, body, {action: 'Undo', onAction: () => change(id, undo), timeout: 6000});
  };
  const changeSelected = (patch: Partial<ManagedInput>) =>
    setInputs(list => list.map(i => selected.has(i.id) ? {...i, ...patch} : i));
  const deleteChosen = () => {
    const gone = new Set(toDelete ?? []);
    setInputs(list => list.filter(i => !gone.has(i.id)));
    if (open && gone.has(open)) setOpen(null);
    setSelected(s => new Set([...s].filter(k => !gone.has(String(k)))));
    setToDelete(null);
    toast(gone.size === 1 ? '1 input deleted' : `${gone.size} inputs deleted`);
  };
  const select = (keys: Selection) => setSelected(keys === 'all' ? new Set(shown.map(i => i.id)) : new Set(keys));
  const exportFile = (key: Key) => toast(key === 'inputs' ? 'Exporting all inputs' : key === 'comments' ? 'Exporting all comments' : `Exporting ${selected.size} inputs`, 'The .xlsx file downloads when it is ready.');
  const preview = inputs.find(i => i.id === open);
  // The pager walks the filtered, sorted list across its pages; the table turns to the open input's page.
  const at = preview ? rows.findIndex(i => i.id === preview.id) : -1;
  const walk = (n: number) => {
    const next = rows[n - 1];
    if (!next) return;
    setOpen(next.id);
    setPage(Math.ceil(n / PAGE_SIZE));
  };
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
      <Inline gap="16" paddingBlock="16">
        <Select variant="quiet" aria-label="Assignee" selectedKey={assignee} onSelectionChange={k => setAssignee(String(k))}>
          <SelectItem id="any">Any administrator</SelectItem>
          <SelectItem id="me">Assigned to me</SelectItem>
          <SelectItem id="none">Unassigned</SelectItem>
        </Select>
        <Switch isSelected={needsFeedback} onChange={setNeedsFeedback}>
          <Inline elementType="span" gap="8" wrap="nowrap">Only show inputs that need feedback <Badge>{waiting}</Badge></Inline>
        </Switch>
        <span className="bo-push" />
        <SearchField aria-label="Search inputs" placeholder="Search" value={query} onChange={setQuery} />
      </Inline>
      <Stack gap="16">
        <Tabs defaultSelectedKey="projects" onSelectionChange={() => setSelected(new Set())}>
          <TabList aria-label="Filter by">
            <Tab id="projects">Projects</Tab><Tab id="topics">Topics</Tab><Tab id="status">Status</Tab>
          </TabList>
          <TabPanels>
          <TabPanel id="projects" className="bo-inputs-tab">
            <Stack gap="12" alignItems="start">
              <ListBox aria-label="Projects" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[project]}
                onSelectionChange={k => setProject(String([...k][0]))}>
                <ListBoxItem id="all">All projects</ListBoxItem>
                {PROJECTS.filter(p => inputs.some(i => i.project === p.id)).map(p => <ListBoxItem key={p.id} id={p.id}>{p.title}</ListBoxItem>)}
              </ListBox>
              <Link href="#/projects">Edit projects</Link>
            </Stack>
          </TabPanel>
          <TabPanel id="topics" className="bo-inputs-tab">
            <ListBox aria-label="Topics" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[topic]}
              onSelectionChange={k => setTopic(String([...k][0]))}>
              <ListBoxItem id="all">All topics</ListBoxItem>
              {TOPICS.map(t => <ListBoxItem key={t} id={t}>{t}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          <TabPanel id="status" className="bo-inputs-tab">
            <ListBox aria-label="Statuses" orientation="horizontal" selectionMode="single" disallowEmptySelection selectedKeys={[status]}
              onSelectionChange={k => setStatus(String([...k][0]))}>
              <ListBoxItem id="all">All statuses</ListBoxItem>
              {STATUSES.map(s => <ListBoxItem key={s} id={s}>{s}</ListBoxItem>)}
            </ListBox>
          </TabPanel>
          </TabPanels>
        </Tabs>
        <Grid gap="16" alignItems="start" className="bo-inputs-main">
          <Stack gap="12">
            {/* The Data table's "In a panel" toolbar: the count (the Selection bar while rows are checked), the export. */}
            <TableToolbar aria-label="Input tools" start={(
              <SelectionBar aria-label="Bulk actions" count={selected.size} items={bulkActions}
                onAction={id => id === 'delete' && setToDelete([...selected].map(String))} onClear={() => setSelected(new Set())}>
                <TableToolbarHeading>{rows.length} inputs</TableToolbarHeading>
              </SelectionBar>
            )}>
              <MenuTrigger placement="bottom end">
                <TooltipTrigger>
                  <IconButton variant="bordered" emphasis="strong" aria-label="Export"><Download aria-hidden size={16} /></IconButton>
                  <Tooltip>Export</Tooltip>
                </TooltipTrigger>
                <Menu aria-label="Export" onAction={exportFile} disabledKeys={selected.size ? [] : ['selected']}>
                  <MenuItem id="inputs">All inputs (.xlsx)</MenuItem>
                  <MenuItem id="comments">All comments (.xlsx)</MenuItem>
                  <Separator />
                  <MenuItem id="selected">Selected inputs (.xlsx)</MenuItem>
                </Menu>
              </MenuTrigger>
            </TableToolbar>
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
                      {/* The prototype's title over a quiet sub-line: the input's project (still a link) and tags. */}
                      <DataTableStack isStrong sub={<><Link href={`#/projects/${i.project}`}>{title(i.project)}</Link> · {i.tags.join(', ')}</>}>
                        <Inline elementType="span" gap="6" wrap="nowrap">
                          {i.title}
                          {FLAGGED.has(i.id) && <TriangleAlert aria-label="Content warning" size={14} />}
                        </Inline>
                      </DataTableStack>
                    </DataTableCell>
                    <DataTableCell textValue={i.status}><StatusBadge status={statusState(i.status)}>{i.status}</StatusBadge></DataTableCell>
                    <DataTableCell textValue={i.assignee}>
                      <AssigneeSelect input={i} label={`Assignee for ${i.title}`}
                        onChange={(id, p) => patch(id, p, p.assignee === 'Unassigned' ? 'Input unassigned' : `Assigned to ${p.assignee}`)} />
                    </DataTableCell>
                    <DataTableCell align="number">{i.comments}</DataTableCell>
                    <DataTableCell align="number">{i.likes}</DataTableCell>
                    <DataTableCell align="number">{i.dislikes}</DataTableCell>
                    <DataTableCell textValue={i.published}>
                      <Inline elementType="span" gap="6" wrap="nowrap">
                        {isNew(i.published) && <NewDot aria-label="New input" />}{i.published}
                      </Inline>
                    </DataTableCell>
                  </DataTableRow>))}
                </DataTableBody>
              </DataTable>
            </div>
            <Inline justifyContent="end">
              <Pagination page={current} pageCount={pages} onPageChange={setPage} aria-label="Input pages" />
            </Inline>
          </Stack>
          {preview && (
            <div className="bo-inputs-side">
              <SidePanel isInline autoFocus label={title(preview.project)} aria-label={`Input: ${preview.title}`}
                position={at >= 0 ? {current: at + 1, total: rows.length} : undefined} onPositionChange={walk}
                onOpenChange={o => !o && setOpen(null)} returnFocus={() => (open ? rowOf(open) : null)}
                labels={{previous: 'Previous input', next: 'Next input', close: 'Close the input'}}>
                <InputPanel key={preview.id} input={preview} patch={patch} onDelete={() => setToDelete([preview.id])} />
              </SidePanel>
            </div>
          )}
        </Grid>
      </Stack>
      <AlertDialog tone="danger" title={toDelete?.length === 1 ? 'Delete this input?' : 'Delete these inputs?'}
        isOpen={toDelete !== null} onOpenChange={o => !o && setToDelete(null)}
        confirmLabel={`Delete ${toDelete?.length === 1 ? 'input' : `${toDelete?.length} inputs`}`} onConfirm={deleteChosen}>
        <p>{toDelete?.length === 1 ? 'The input' : `The ${toDelete?.length} selected inputs`} and their comments will be deleted. This cannot be undone.</p>
      </AlertDialog>
    </Page>
  );
}

import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import {Copy, FileText, LayoutGrid, Pencil, Plus, SearchX, Sparkles, Trash2} from 'lucide-react';
import {AlertDialog, Badge, Banner, Button, CheckboxGroup, ChoiceCard, ChoiceCardCheckbox, ChoiceCardGroupHeading,
  DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableOptions, DataTableRow, EmptyState,
  Grid, Inline, MenuItem, Modal, Pagination, Panel, RadioGroup, SearchField, SegmentedControl, SegmentedControlItem, Separator, Tab,
  TableToolbar, TabList, TabPanel, TabPanels, Tabs, Stack, Text, TextField, toast} from 'govocal-ds';
import {CONTENTS, CONTENT_GROUPS, REPORTS, type Report} from '../data-reporting';
import {daysBefore, TODAY, useDay} from '../dates';
import {Page} from './Page';

// Every admin table pages (docs/DECISIONS.md).
const PAGE_SIZE = 10;
const reportsWord = (n: number) => `${n} ${n === 1 ? 'report' : 'reports'}`;
const editorHref = (r: Report) => `#/reporting/report-builder/${r.id}/editor`;
const icon = (Icon: typeof Plus) => <Icon aria-hidden size={16} />;


// ── Report list: a tab per view, each a Panel over the Data table (the list shape of every admin screen) ────────

type TabId = 'yours' | 'all' | 'progress';
const TABS: {id: TabId; label: string; description: string; keep: (r: Report) => boolean}[] = [
  {id: 'yours', label: 'Your reports', description: 'The reports you created.', keep: r => r.owner === 'you'},
  {id: 'all', label: 'All reports', description: 'Everything your team has built with the report builder.', keep: () => true},
  {id: 'progress', label: 'Progress reports', description: 'A look at the platform each quarter.', keep: r => r.kind === 'progress'}
];

type RowAction = 'edit' | 'copy' | 'delete';

function ReportTable({label, reports, onAction}: {label: string; reports: Report[]; onAction: (r: Report, a: RowAction) => void}) {
  const day = useDay();
  return (
    <div className="bo-reporting-scroll">
      <DataTable aria-label={label}>
        <DataTableHeader>
          <DataTableColumn isRowHeader>Report</DataTableColumn>
          <DataTableColumn>Created</DataTableColumn>
          <DataTableColumn>Last edited</DataTableColumn>
          <DataTableColumn align="options" showLabel={false}>Actions</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {reports.map(r => (
            <DataTableRow key={r.id} id={r.id} textValue={r.title} href={editorHref(r)}>
              <DataTableCell>
                <Inline elementType="span" gap="8">
                  <span>{r.title}</span>
                  {r.isNew && <Badge>New</Badge>}
                  {r.kind === 'progress' && <Badge>Progress</Badge>}
                </Inline>
              </DataTableCell>
              <DataTableCell>{day(r.created)}</DataTableCell>
              {/* Both columns are days, in the one list date format (dates.ts), never a mix of 27/10/2026 and "1 day ago". */}
              <DataTableCell isMuted>{day(daysBefore(r.modifiedDays))}</DataTableCell>
              <DataTableCell align="options">
                {/* Row menus put their icons in Menu's icon slot; the removing item after a separator (Users, Tools). */}
                <DataTableOptions aria-label={`Actions for ${r.title}`} onAction={k => onAction(r, k as RowAction)}>
                  <MenuItem id="edit" icon={icon(Pencil)}>Edit</MenuItem>
                  <MenuItem id="copy" icon={icon(Copy)}>Duplicate</MenuItem>
                  <Separator />
                  <MenuItem id="delete" icon={icon(Trash2)}>Delete</MenuItem>
                </DataTableOptions>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  );
}

function ReportPanel({tab, reports, onAction, onCreate}: {
  tab: typeof TABS[number]; reports: Report[]; onAction: (r: Report, a: RowAction) => void; onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const found = useMemo(() => reports.filter(tab.keep).filter(r => r.title.toLowerCase().includes(query.trim().toLowerCase())),
    [reports, tab, query]);
  const pageCount = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = found.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  // The toolbar row (Panel's "With a toolbar" story): the count, which follows the search, then the search.
  const toolbar = (
    <TableToolbar aria-label="Report tools" heading={reportsWord(found.length)}>
      <SearchField aria-label="Search reports" placeholder="Search" value={query} onChange={q => { setQuery(q); setPage(1); }} />
    </TableToolbar>
  );
  return (
    <Panel title={tab.label} description={tab.description} isFlush toolbar={toolbar}
      footer={found.length > 0 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Report pages" />}>
      {tab.id === 'progress' && (
        <div className="bo-reporting-note">
          <Banner tone="info">These reports are created by your Go Vocal success manager, once a quarter.</Banner>
        </div>
      )}
      {/* Nothing found, or nothing yet: the Empty state in the Panel body, as every admin list (docs/DECISIONS.md). */}
      {found.length === 0 ? (
        query.trim() ? (
          <EmptyState layout="panel" headingLevel={3} icon={<SearchX size={24} />} title="No reports match"
            description="Try another word, or clear the search." />
        ) : (
          <EmptyState layout="panel" headingLevel={3} illustration="empty-notebook" title="No reports yet"
            description="Turn a project's results into a report you can share."
            actions={<Button variant="secondary" size={32} onPress={onCreate}>{icon(Plus)}Create a report</Button>} />
        )
      ) : <ReportTable label={tab.label} reports={shown} onAction={onAction} />}
    </Panel>
  );
}

// ── Create a report: the prototype's start screen (template + contents) as a dialog; the report opens in the report view ──

type Template = 'blank' | 'template' | 'ai';
const TEMPLATES: {id: Template; label: string; description: string; media: typeof Plus}[] = [
  {id: 'blank', label: 'Start blank', description: 'Add widgets one by one.', media: FileText},
  {id: 'template', label: 'Use a template', description: 'Start from a ready structure.', media: LayoutGrid},
  {id: 'ai', label: 'Create with AI', description: 'Draft it from your project data.', media: Sparkles}
];

function CreateReportModal({onClose, onCreate}: {onClose: () => void; onCreate: (title: string, template: Template) => void}) {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<Template>('template');
  const footer = (
    <>
      <Button variant="quiet" size={32} onPress={onClose}>Cancel</Button>
      <Button variant="primary" size={32} onPress={() => onCreate(title.trim() || 'Untitled report', template)}>Create report</Button>
    </>
  );
  return (
    <Modal description="Turn a project's results into a report you can share. Start from scratch, pick a template, or let the assistant draft it from your data." title="Create a report" width="wide" isOpen onOpenChange={open => !open && onClose()} footer={footer}>
      <Grid columns={2} gap="24" alignItems="start">
        <Stack gap="16">
          <TextField label="Report title" placeholder="Larkvale park renewal: project report" value={title} onChange={setTitle} autoFocus />
          {/* One pick: Choice cards in a RadioGroup (Choice card's "With icon" story). */}
          <RadioGroup label="Report template" value={template} onChange={v => setTemplate(v as Template)}>
            {TEMPLATES.map(t => (
              <ChoiceCard key={t.id} value={t.id} media={icon(t.media)} description={t.description}>{t.label}</ChoiceCard>
            ))}
          </RadioGroup>
        </Stack>
        <Stack gap="16">
          {/* The Choice card's "Checkbox group with group headings": the contents under their group's heading. */}
          <CheckboxGroup label="Report contents" defaultValue={CONTENTS.filter(c => c.on).map(c => c.id)}>
            <Text slot="description" elementType="p" kind="small" color="meta">Choose what this report covers. Each becomes one or more pages.</Text>
            {CONTENT_GROUPS.map(g => [
              <ChoiceCardGroupHeading key={g}>{g}</ChoiceCardGroupHeading>,
              ...CONTENTS.filter(c => c.group === g).map(c => (
                <ChoiceCardCheckbox key={c.id} value={c.id} description={c.meta}>{c.label}</ChoiceCardCheckbox>
              ))
            ])}
          </CheckboxGroup>
          <Stack gap="8" alignItems="start">
            <Text kind="small" color="meta" aria-hidden>Length</Text>
            <SegmentedControl aria-label="Length" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['standard']}>
              <SegmentedControlItem id="short">Short</SegmentedControlItem>
              <SegmentedControlItem id="standard">Standard</SegmentedControlItem>
              <SegmentedControlItem id="detailed">Detailed</SegmentedControlItem>
            </SegmentedControl>
          </Stack>
        </Stack>
      </Grid>
    </Modal>
  );
}

export function Reporting() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(REPORTS);
  const [view, setView] = useState<TabId>('all');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Report | null>(null);

  const putBack = (r: Report, at: number) => setReports(rs => [...rs.slice(0, at), r, ...rs.slice(at)]);
  const onAction = (r: Report, a: RowAction) => {
    if (a === 'edit') return navigate(editorHref(r).slice(1));
    if (a === 'delete') return setDeleting(r);
    const copy: Report = {...r, id: `${r.id}-copy-${Date.now()}`, title: `${r.title} (copy)`, created: TODAY,
      modifiedDays: 0, owner: 'you', isNew: true};
    setReports(rs => { const i = rs.findIndex(x => x.id === r.id); return [...rs.slice(0, i + 1), copy, ...rs.slice(i + 1)]; });
    toast('Report duplicated', copy.title, {action: 'Undo', onAction: () => setReports(rs => rs.filter(x => x.id !== copy.id))});
  };
  // Delete asks first, then offers Undo too (Projects).
  const destroy = (r: Report) => {
    const at = reports.findIndex(x => x.id === r.id);
    setReports(rs => rs.filter(x => x.id !== r.id));
    setDeleting(null);
    toast('Report deleted', r.title, {action: 'Undo', onAction: () => putBack(r, at)});
  };
  const create = () => setCreating(true);

  return (
    <Page title="Reporting" description="Customise your report and share it with internal stakeholders or the community as a web link or a PDF."
      actions={<Button variant="primary" size={32} onPress={create}>{icon(Plus)}Create a report</Button>}>
      <Tabs selectedKey={view} onSelectionChange={k => setView(k as TabId)}>
        <TabList aria-label="Reports">
          {TABS.map(t => <Tab key={t.id} id={t.id} count={reports.filter(t.keep).length}>{t.label}</Tab>)}
        </TabList>
        <TabPanels>
          {TABS.map(t => (
            <TabPanel key={t.id} id={t.id} className="bo-reporting-view">
              <ReportPanel tab={t} reports={reports} onAction={onAction} onCreate={create} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* A new report opens in the report view: blank, from the template, or generated by the assistant. */}
      {creating && (
        <CreateReportModal onClose={() => setCreating(false)}
          onCreate={(title, template) => navigate('/reporting/report-builder/new/editor', {state: {title, template}})} />
      )}
      {deleting && (
        <AlertDialog tone="danger" title="Delete this report?" confirmLabel="Delete report" isOpen
          onOpenChange={open => !open && setDeleting(null)} onCancel={() => setDeleting(null)} onConfirm={() => destroy(deleting)}>
          {deleting.title} leaves every list, and its web link stops working.
        </AlertDialog>
      )}
    </Page>
  );
}

import {useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {Plus} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableOptions} from '../../../src/components/gv/DataTable';
import {MenuItem} from '../../../src/components/Menu';
import {SearchField} from '../../../src/components/SearchField';
import {Button} from '../../../src/components/Button';
import {TextField} from '../../../src/components/TextField';
import {Card} from '../../../src/components/gv/Card';
import {ChoiceCard, ChoiceCardCheckbox, ChoiceCardGroupHeading} from '../../../src/components/gv/ChoiceCard';
import {RadioGroup} from '../../../src/components/RadioGroup';
import {CheckboxGroup} from '../../../src/components/CheckboxGroup';
import {Badge} from '../../../src/components/gv/Badge';
import {Banner} from '../../../src/components/gv/Banner';
import {SegmentedControl, SegmentedControlItem} from '../../../src/components/gv/SegmentedControl';
import {ToastRegion} from '../../../src/components/Toast';
import {CONTENTS, CONTENT_GROUPS, REPORTS, type Report} from '../data-reporting';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const modified = (d: number) => `Modified ${d} ${d === 1 ? 'day' : 'days'} ago`;

const editorHref = (r: Report) => `#/reporting/report-builder/${r.id}/editor`;

// ── Report list (the real admin's report builder page, laid out as the prototype's overview) ─────

type TabId = 'yours' | 'all' | 'progress';
const TABS: {id: TabId; label: string; keep: (r: Report) => boolean}[] = [
  {id: 'yours', label: 'Your reports', keep: r => r.owner === 'you'},
  {id: 'all', label: 'All reports', keep: () => true},
  {id: 'progress', label: 'Progress reports', keep: r => r.kind === 'progress'}
];

function ReportTable({label, reports, onEdit, onDuplicate, onDelete}: {
  label: string; reports: Report[];
  onEdit: (r: Report) => void; onDuplicate: (r: Report) => void; onDelete: (r: Report) => void;
}) {
  return (
    <DataTable aria-label={label}>
      <DataTableHeader>
        <DataTableColumn isRowHeader>Report</DataTableColumn>
        <DataTableColumn>Created</DataTableColumn>
        <DataTableColumn>Last edited</DataTableColumn>
        <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
      </DataTableHeader>
      <DataTableBody renderEmptyState={() => <DataTableEmpty>No reports match your search.</DataTableEmpty>}>
        {reports.map(r => (
          <DataTableRow key={r.id} id={r.id} textValue={r.title} href={editorHref(r)}>
            <DataTableCell>
              <span className="bo-reporting-title">
                <span>{r.title}</span>
                {r.isNew && <Badge>New</Badge>}
                {r.kind === 'progress' && <Badge>Progress</Badge>}
              </span>
            </DataTableCell>
            <DataTableCell><span className="bo-reporting-nowrap">{r.created}</span></DataTableCell>
            <DataTableCell><span className="bo-note bo-reporting-nowrap">{modified(r.modifiedDays)}</span></DataTableCell>
            <DataTableCell align="options">
              <DataTableOptions aria-label={`Actions for ${r.title}`}
                onAction={k => (k === 'edit' ? onEdit(r) : k === 'copy' ? onDuplicate(r) : onDelete(r))}>
                <MenuItem id="edit">Edit</MenuItem>
                <MenuItem id="copy">Duplicate</MenuItem>
                <MenuItem id="delete">Delete</MenuItem>
              </DataTableOptions>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}

function ReportList({reports, setReports, onEdit}: {reports: Report[]; setReports: (f: (r: Report[]) => Report[]) => void; onEdit: (r: Report) => void}) {
  const copies = useRef(0);
  const [query, setQuery] = useState('');
  const found = useMemo(() => reports.filter(r => r.title.toLowerCase().includes(query.trim().toLowerCase())), [reports, query]);
  const duplicate = (r: Report) => setReports(rs => {
    const i = rs.findIndex(x => x.id === r.id);
    const copy: Report = {...r, id: `${r.id}-copy-${++copies.current}`, title: `${r.title} (copy)`, created: '29/10/2026', modifiedDays: 0, owner: 'you', isNew: true};
    return [...rs.slice(0, i + 1), copy, ...rs.slice(i + 1)];
  });
  const remove = (r: Report) => setReports(rs => rs.filter(x => x.id !== r.id));
  return (
    <section aria-label="Reports list" className="bo-reporting-list">
      <SearchField aria-label="Search reports" placeholder="Search reports" value={query} onChange={setQuery} />
      <Tabs defaultSelectedKey="all">
        <TabList aria-label="Reports">
          {TABS.map(t => <Tab key={t.id} id={t.id}>{`${t.label} (${reports.filter(t.keep).length})`}</Tab>)}
        </TabList>
        <TabPanels>
        {TABS.map(t => (
          <TabPanel key={t.id} id={t.id}>
            <div className="bo-reporting-stack">
              {t.id === 'progress' && <Banner>These reports are created by your Go Vocal success manager, once a quarter.</Banner>}
              <ReportTable label={t.label} reports={found.filter(t.keep)} onEdit={onEdit} onDuplicate={duplicate} onDelete={remove} />
            </div>
          </TabPanel>
        ))}
        </TabPanels>
      </Tabs>
    </section>
  );
}

// ── Create a report: the prototype's start screen (template + contents); the report opens in the report view ──

type Template = 'blank' | 'template' | 'ai';

function BlankBuilder({onCreate}: {onCreate: (title: string, template: Template) => void}) {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<Template>('template');
  return (
    <div className="bo-reporting-blank">
      <Card tone="manage" layout="stacked" title="Build your report">
        <div className="bo-reporting-form">
          <p className="bo-note">Turn a project's results into a report you can share. Start from scratch, pick a template, or let the assistant draft it from your data.</p>
          <TextField label="Report title" placeholder="Larkvale park renewal: project report" value={title} onChange={setTitle} />
          <RadioGroup aria-label="Report template" value={template} onChange={v => setTemplate(v as Template)}>
            <ChoiceCard value="blank" description="Add widgets one by one.">Start blank</ChoiceCard>
            <ChoiceCard value="template" description="Start from a ready structure.">Use a template</ChoiceCard>
            <ChoiceCard value="ai" description="Draft it from your project data.">Create with AI</ChoiceCard>
          </RadioGroup>
        </div>
      </Card>
      <Card tone="manage" layout="stacked" title="Report contents">
        <div className="bo-reporting-form">
          <p className="bo-note">Choose what this report covers. Each becomes one or more pages.</p>
          {/* The Choice card's "Checkbox group with group headings": the contents under their group's heading. */}
          <CheckboxGroup aria-label="Report contents" defaultValue={CONTENTS.filter(c => c.on).map(c => c.id)}>
            {CONTENT_GROUPS.map(g => [
              <ChoiceCardGroupHeading key={g}>{g}</ChoiceCardGroupHeading>,
              ...CONTENTS.filter(c => c.group === g).map(c => (
                <ChoiceCardCheckbox key={c.id} value={c.id} description={c.meta}>{c.label}</ChoiceCardCheckbox>
              ))
            ])}
          </CheckboxGroup>
          <div className="bo-reporting-field">
            <span className="bo-note" aria-hidden>Length</span>
            <SegmentedControl aria-label="Length" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['standard']}>
              <SegmentedControlItem id="short">Short</SegmentedControlItem>
              <SegmentedControlItem id="standard">Standard</SegmentedControlItem>
              <SegmentedControlItem id="detailed">Detailed</SegmentedControlItem>
            </SegmentedControl>
          </div>
          <Button variant="primary" size={32} onPress={() => onCreate(title || 'Untitled report', template)}>Create report</Button>
        </div>
      </Card>
    </div>
  );
}

export function Reporting() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(REPORTS);
  const [creating, setCreating] = useState(false);
  return (
    <Page title="Reporting" description="Customise your report and share it with internal stakeholders or the community as a web link or a PDF."
      actions={<Button variant="primary" size={32} onPress={() => setCreating(true)}><Plus aria-hidden size={16} />Create a report</Button>}>
      <div className="bo-reporting-stack">
        <ReportList reports={reports} setReports={setReports} onEdit={r => navigate(editorHref(r).slice(1))} />
        {creating && (
          // A new report opens in the report view: blank, from the template, or generated by the assistant.
          <section aria-label="Report builder: New report" className="bo-reporting-builder">
            <SectionHeading>Create a report</SectionHeading>
            <BlankBuilder onCreate={(title, template) => navigate('/reporting/report-builder/new/editor', {state: {title, template}})} />
          </section>
        )}
      </div>
      <ToastRegion />
    </Page>
  );
}

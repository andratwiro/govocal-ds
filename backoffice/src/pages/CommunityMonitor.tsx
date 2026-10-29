import {useState, type ReactNode} from 'react';
import {ArrowLeft, ArrowRight, Download, Eye, Plus, Upload, Pencil, FileText, ShieldCheck} from 'lucide-react';
import {AlertDialog, Avatar, Badge, Banner, BarRow, Button, Checkbox, ChoiceCard, DashboardCard, DashboardDemographic,
  DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableOptions, DataTablePerson,
  DataTableRow, DataTableStack, Divider, DropZone, EmptyState, FileList, HelpPopover, LegendRow, LineChart, MenuItem,
  Modal, NumberField, Pagination, Panel, PropertyList, PropertyListItem, queue, Select, SelectItem, Sparkline, StatRow,
  StatTile, StatusBadge, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, TextField, ToastRegion} from 'govocal-ds';
import {CheckboxGroup, Radio, RadioGroup} from 'govocal-ds/base';
import {CANDIDATES, CATEGORIES, CURRENT, MANAGERS, POPUP_CONDITIONS, POPUP_SHOWN, QUARTERS, QUESTIONS, REPORTS, RESPONDENTS,
  SENTIMENT, SURVEY_ACCESS, WHO, type Report} from '../data-community-monitor';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const SECTIONS = ['Live monitor', 'Participants', 'Reports', 'Settings'];
/** Instant changes say so in a Toast; the ones that can be taken back carry Undo (docs/DECISIONS.md). */
const toast = (title: string, description?: string, undo?: () => void) =>
  queue.add({title, description, ...(undo && {action: 'Undo', onAction: undo})}, {timeout: 5000});
/** "Manager B" → "MB". */
const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const n = (v: number) => v.toLocaleString('en');
const score = (v: number) => `${v.toFixed(1)} / 5`;
const mean = (vs: number[]) => Math.round((vs.reduce((a, b) => a + b, 0) / vs.length) * 10) / 10;
const signed = (raw: number) => { const v = Math.round(raw * 10) / 10; return `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v).toFixed(1)}`; };

/** The overall health score per quarter: the mean of the three category scores. */
const HEALTH = QUARTERS.map((_, q) => mean(CATEGORIES.map(c => c.scores[q])));

/** A question's average in quarter `q`: its current score moved as its category moved. */
function questionScore(i: number, q: number) {
  const qn = QUESTIONS[i];
  const cat = CATEGORIES.find(c => c.id === qn.category)!;
  return Math.round((qn.score + cat.scores[q] - cat.scores[CURRENT]) * 10) / 10;
}

/** Share of answers per sentiment level (1 to 5) around an average, summing to 100. */
function distribution(avg: number) {
  const w = [1, 2, 3, 4, 5].map(k => Math.exp(-((k - avg) ** 2) / 1.6));
  const total = w.reduce((a, b) => a + b, 0);
  const p = w.map(x => Math.round((x / total) * 100));
  p[2] += 100 - p.reduce((a, b) => a + b, 0);
  return p;
}

/** The real admin's ← Q4 2026 → picker and View button, as the system's buttons and Select. */
function QuarterPicker({quarter, onChange, show, onViewSurvey}: {quarter: number; onChange: (q: number) => void; show: boolean; onViewSurvey: () => void}) {
  return (
    <div className="bo-community-monitor-actions">
      {show && <>
      <Button variant="secondary" size={32} aria-label="Previous quarter" isDisabled={quarter === 0}
        onPress={() => onChange(quarter - 1)}><ArrowLeft aria-hidden size={16} /></Button>
      <Select aria-label="Quarter" size={32} selectedKey={String(quarter)} onSelectionChange={k => onChange(Number(k))}>
        {QUARTERS.map((q, i) => <SelectItem key={q} id={String(i)}>{q}</SelectItem>)}
      </Select>
      <Button variant="secondary" size={32} aria-label="Next quarter" isDisabled={quarter === CURRENT}
        onPress={() => onChange(quarter + 1)}><ArrowRight aria-hidden size={16} /></Button>
      </>}
      <Button variant="primary" size={32} onPress={onViewSurvey}><Eye aria-hidden size={16} /> View survey</Button>
    </div>
  );
}

function ScoreTile({label, scores, quarter}: {label: ReactNode; scores: number[]; quarter: number}) {
  const now = scores[quarter];
  const note = quarter === 0 ? 'First quarter' : `${signed(now - scores[quarter - 1])} vs ${QUARTERS[quarter - 1]}`;
  return (
    <StatTile label={label} value={score(now)} note={quarter === CURRENT ? `${note} · updating live` : note} />
  );
}

function LiveMonitor({quarter}: {quarter: number}) {
  const [question, setQuestion] = useState(0);
  const shown = QUARTERS.slice(0, quarter + 1);
  const avg = questionScore(question, quarter);
  const dist = distribution(avg);
  return (
    <div className="bo-community-monitor-body">
      {quarter === CURRENT && (
        <Banner>{QUARTERS[quarter]} is still collecting answers: scores update as residents respond.</Banner>
      )}
      <div className="bo-community-monitor-kpis">
        <ScoreTile scores={HEALTH} quarter={quarter} label={<span className="bo-community-monitor-label">Health score
          <HelpPopover title="Health score">The average of the three category scores: every sentiment question, from 1 (very
            dissatisfied) to 5 (very satisfied).</HelpPopover></span>} />
        {CATEGORIES.map(c => <ScoreTile key={c.id} label={c.label} scores={c.scores} quarter={quarter} />)}
      </div>
      <DashboardCard type="participation-over-time" title="Health score over time"
        subtitle="Average of every sentiment question · per quarter">
        <LineChart labels={shown} max={5} series={[{label: 'Health score', values: HEALTH.slice(0, quarter + 1), tone: 'primary'}]} />
      </DashboardCard>
      <h2 className="bo-section-title">Questions by category</h2>
      <div className="bo-community-monitor-stack">
        {CATEGORIES.map(c => {
          const rows = QUESTIONS.map((qn, i) => ({qn, i})).filter(r => r.qn.category === c.id);
          return (
            <DashboardCard key={c.id} title={c.label}
              subtitle={`${rows.length} questions · ${n(RESPONDENTS[quarter])} responses · sentiment scale, optional`}
              action={<Badge>{score(c.scores[quarter])}</Badge>}>
              {rows.map(({qn, i}) => {
                const s = questionScore(i, quarter);
                return <BarRow key={qn.title} label={`${i + 1}. ${qn.title}`} percent={(s / 5) * 100} value={score(s)} />;
              })}
            </DashboardCard>
          );
        })}
        <DashboardCard title="Answers per question" subtitle={`${QUARTERS[quarter]} · share of answers per level`}
          action={
            <Select aria-label="Question" selectedKey={String(question)} onSelectionChange={k => setQuestion(Number(k))}>
              {QUESTIONS.map((qn, i) => <SelectItem key={qn.title} id={String(i)}>{`${i + 1}. ${qn.title}`}</SelectItem>)}
            </Select>
          }>
          <DashboardDemographic label={`${question + 1}. ${QUESTIONS[question].title}`}
            items={SENTIMENT.map((s, k) => ({label: s.label, percent: dist[k], color: s.color}))} />
          <div className="bo-community-monitor-stats">
            <StatRow isStatic label="Average" value={score(avg)} />
            <StatRow isStatic label="Responses" value={n(RESPONDENTS[quarter])} />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

function Participants({quarter}: {quarter: number}) {
  const shown = QUARTERS.slice(0, quarter + 1);
  const rate = Math.round((RESPONDENTS[quarter] / POPUP_SHOWN[quarter]) * 100);
  const allTime = RESPONDENTS.slice(0, quarter + 1).reduce((a, b) => a + b, 0);
  return (
    <div className="bo-community-monitor-body">
      <div className="bo-community-monitor-kpis">
        <StatTile label="Respondents" value={n(RESPONDENTS[quarter])} note={quarter === CURRENT ? 'updating live' : QUARTERS[quarter]}>
          <Sparkline label="Respondents per quarter" labels={shown} values={RESPONDENTS.slice(0, quarter + 1)} height={34} grid={false} />
        </StatTile>
        <StatTile label="Popup shown" value={n(POPUP_SHOWN[quarter])} note="times this quarter" />
        <StatTile label="Response rate" value={`${rate}%`} note="of residents shown the popup" />
        <StatTile label="Respondents to date" value={n(allTime)} note={`since ${QUARTERS[0]}`} />
      </div>
      <DashboardCard type="participation-over-time" title="Respondents over time" subtitle="People who answered · per quarter">
        <LineChart labels={shown} series={[{label: 'Respondents', values: RESPONDENTS.slice(0, quarter + 1), tone: 'primary'}]} />
        <div className="bo-community-monitor-rows">
          <LegendRow color="--gv-chart-line-primary" label="Respondents" value={`${n(RESPONDENTS[quarter])} in ${QUARTERS[quarter]}`} />
        </div>
      </DashboardCard>
      <h2 className="bo-section-title">Who is answering</h2>
      <Banner>From registration fields. Groups with fewer than 5 respondents are hidden, and no answer is shown next to who gave it.</Banner>
      <div className="bo-community-monitor-cards">
        {WHO.map(w => (
          <DashboardCard key={w.label} type="demographic-age" aria-label={w.label}>
            <DashboardDemographic label={w.label} items={w.items} />
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}

/** View survey: the survey as residents get it, its questions in order with the sentiment scale. */
function SurveyModal({isOpen, onOpenChange}: {isOpen: boolean; onOpenChange: (o: boolean) => void}) {
  return (
    <Modal title="Community monitor survey" size="wide" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<Button variant="secondary" slot="close">Close</Button>}>
      <div className="bo-community-monitor-modal">
        <p className="bo-note">How residents see it: a short popup, eleven questions, each answered on the same five-point scale.</p>
        {CATEGORIES.map(c => (
          <section key={c.id} className="bo-community-monitor-modal" aria-label={c.label}>
            <h3 className="bo-section-title">{c.label}</h3>
            <ol className="bo-community-monitor-questions">
              {QUESTIONS.map((q, i) => ({q, i})).filter(r => r.q.category === c.id).map(({q, i}) => (
                <li key={q.title}>{`${i + 1}. ${q.title}`}</li>
              ))}
            </ol>
          </section>
        ))}
        <RadioGroup label="Every question is answered on this scale (try it)" orientation="horizontal">
          {SENTIMENT.map(s => <Radio key={s.label} value={s.label}>{s.label}</Radio>)}
        </RadioGroup>
      </div>
    </Modal>
  );
}

/** A report opened: the quarter's headline scores, as the report's first page. */
function ReportModal({report, onClose}: {report: Report | null; onClose: () => void}) {
  const q = report ? Math.max(0, QUARTERS.indexOf(report.quarter)) : CURRENT;
  return (
    <Modal title={report?.title ?? 'Report'} size="wide" isOpen={report !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<Button variant="secondary" slot="close">Close</Button>}>
      {report && (
        <div className="bo-community-monitor-modal">
          <PropertyList aria-label="About this report">
            <PropertyListItem label="Status">
              <StatusBadge state={report.published ? 'live' : 'draft'}>{report.published ? 'Published' : 'Draft'}</StatusBadge>
            </PropertyListItem>
            <PropertyListItem label="Quarter">{report.quarter}</PropertyListItem>
            <PropertyListItem label="Updated">{report.updated}</PropertyListItem>
          </PropertyList>
          <div className="bo-community-monitor-kpis">
            <StatTile label="Health score" value={score(HEALTH[q])} note={report.quarter} />
            <StatTile label="Respondents" value={n(RESPONDENTS[q])} note={`${Math.round((RESPONDENTS[q] / POPUP_SHOWN[q]) * 100)}% response rate`} />
          </div>
          <DashboardCard title="Scores by category" subtitle={report.quarter}>
            {CATEGORIES.map(c => <BarRow key={c.id} label={c.label} percent={(c.scores[q] / 5) * 100} value={score(c.scores[q])} />)}
          </DashboardCard>
        </div>
      )}
    </Modal>
  );
}

/** Create report: a title and the quarter it reports on. */
function CreateReportModal({isOpen, onOpenChange, onCreate}: {isOpen: boolean; onOpenChange: (o: boolean) => void; onCreate: (r: Report) => void}) {
  const [title, setTitle] = useState('');
  const [quarter, setQuarter] = useState(QUARTERS[CURRENT]);
  const create = () => {
    onCreate({id: `r${Date.now()}`, title: title.trim() || 'Untitled report', quarter, updated: '29 Oct 2026', published: false});
    setTitle('');
    onOpenChange(false);
  };
  return (
    <Modal title="Create a report" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={create}>Create</Button>
      </>}>
      <div className="bo-community-monitor-modal">
        <TextField label="Report title" value={title} onChange={setTitle} placeholder="e.g. Q4 2026 results" />
        <Select label="Quarter" selectedKey={quarter} onSelectionChange={k => setQuarter(String(k))}>
          {QUARTERS.map(q => <SelectItem key={q} id={q}>{q}</SelectItem>)}
        </Select>
        <p className="bo-note">The report starts as a draft with this quarter's scores; publish it when it reads right.</p>
      </div>
    </Modal>
  );
}

// Every admin table pages (docs/DECISIONS.md).
const REPORTS_PAGE = 5;

/** Reports: a Panel with Create report in its head, the table flush, Pagination in its foot (Panel's "With footer"). */
function Reports() {
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Report | null>(null);
  const [deleting, setDeleting] = useState<Report | null>(null);
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(reports.length / REPORTS_PAGE));
  const current = Math.min(page, pageCount);
  const shown = reports.slice((current - 1) * REPORTS_PAGE, current * REPORTS_PAGE);
  const setPublished = (r: Report, published: boolean) =>
    setReports(list => list.map(x => (x.id === r.id ? {...x, published} : x)));
  const onAction = (r: Report, key: string) => {
    if (key === 'open') setOpen(r);
    if (key === 'publish') {
      setPublished(r, !r.published);
      toast(r.published ? 'Report unpublished' : 'Report published', r.title, () => setPublished(r, r.published));
    }
    if (key === 'delete') setDeleting(r);
  };
  const create = <Button variant="primary" size={32} onPress={() => setCreating(true)}><Plus aria-hidden size={16} />Create report</Button>;
  return (
    <div className="bo-community-monitor-body">
      <Panel title="Reports" headingLevel={3} count={reports.length} flush actions={create}
        description="Reports built from the monitor's quarterly results."
        footer={reports.length > 0 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Report pages" />}>
        {reports.length === 0 ? (
          <EmptyState size="panel" icon={<FileText size={24} />} title="No reports yet" headingLevel={4}
            description="Create one from a quarter's results, then publish it when it reads right." />
        ) : (
          <DataTable aria-label="Reports">
            <DataTableHeader>
              <DataTableColumn isRowHeader>Report</DataTableColumn>
              <DataTableColumn>Quarter</DataTableColumn>
              <DataTableColumn>Status</DataTableColumn>
              <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
            </DataTableHeader>
            <DataTableBody>{shown.map(r => (
              <DataTableRow key={r.id} id={r.id} textValue={r.title} onAction={() => setOpen(r)}>
                <DataTableCell><DataTableStack strong sub={`Updated ${r.updated}`}>{r.title}</DataTableStack></DataTableCell>
                <DataTableCell>{r.quarter}</DataTableCell>
                <DataTableCell><StatusBadge state={r.published ? 'live' : 'draft'}>{r.published ? 'Published' : 'Draft'}</StatusBadge></DataTableCell>
                <DataTableCell align="options">
                  <DataTableOptions aria-label={`Actions for ${r.title}`} onAction={k => onAction(r, String(k))}>
                    <MenuItem id="open">Open</MenuItem>
                    <MenuItem id="publish">{r.published ? 'Unpublish' : 'Publish'}</MenuItem>
                    <MenuItem id="delete">Delete</MenuItem>
                  </DataTableOptions>
                </DataTableCell>
              </DataTableRow>
            ))}</DataTableBody>
          </DataTable>
        )}
      </Panel>
      <CreateReportModal isOpen={creating} onOpenChange={setCreating} onCreate={r => {
        setReports(prev => [r, ...prev]);
        setPage(1);
        toast('Report created', `${r.title} is a draft until you publish it.`);
      }} />
      <ReportModal report={open} onClose={() => setOpen(null)} />
      <AlertDialog tone="danger" title="Delete this report?" confirmLabel="Delete report" isOpen={deleting !== null}
        onOpenChange={o => { if (!o) setDeleting(null); }}
        onConfirm={() => {
          const r = deleting!;
          setReports(list => list.filter(x => x.id !== r.id));
          setDeleting(null);
          toast('Report deleted', r.title);
        }}>
        {deleting?.title} goes for good, with any text you wrote in it. The monitor's results stay.
      </AlertDialog>
    </div>
  );
}

/** Edit survey: the questions' wording, one field each, grouped by category. */
function EditSurveyModal({isOpen, onOpenChange, onSave}: {isOpen: boolean; onOpenChange: (o: boolean) => void; onSave: () => void}) {
  return (
    <Modal title="Edit survey" size="wide" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" onPress={() => { onSave(); onOpenChange(false); }}>Save</Button>
      </>}>
      <div className="bo-community-monitor-modal">
        <Banner tone="warning">Changing a question's wording starts a new comparison: earlier quarters keep the old wording.</Banner>
        {CATEGORIES.map(c => (
          <section key={c.id} className="bo-community-monitor-modal" aria-label={c.label}>
            <h3 className="bo-section-title">{c.label}</h3>
            {QUESTIONS.map((q, i) => ({q, i})).filter(r => r.q.category === c.id).map(({q, i}) => (
              <TextField key={q.title} label={`Question ${i + 1}`} defaultValue={q.title} />
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
}

/** Import answers: answers collected offline, from the survey's spreadsheet template; the file shows in a File list. */
function ImportModal({isOpen, onOpenChange, onImport}: {isOpen: boolean; onOpenChange: (o: boolean) => void; onImport: (file: string) => void}) {
  const [file, setFile] = useState<string | null>(null);
  const shut = (o: boolean) => { onOpenChange(o); if (!o) setFile(null); };
  return (
    <Modal title="Import answers" isOpen={isOpen} onOpenChange={shut}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" isDisabled={!file} onPress={() => { if (file) onImport(file); shut(false); }}>Import</Button>
      </>}>
      <div className="bo-community-monitor-modal">
        <p className="bo-note">Answers collected on paper or at an event: fill in the template, one row per respondent, then upload it.</p>
        <div className="bo-community-monitor-buttons">
          <Button variant="secondary" size={32} onPress={() => toast('Template downloaded', 'community-monitor-template.xlsx')}>
            <Download aria-hidden size={16} />Download the template</Button>
        </div>
        {file ? (
          <FileList aria-label="File to import" items={[{id: file, name: file, meta: file.endsWith('.csv') ? 'CSV' : 'XLSX'}]}
            onDelete={() => setFile(null)} />
        ) : (
          <DropZone acceptedFileTypes={['.xlsx', '.csv']} aria-label="Answers file"
            onSelect={files => setFile(files?.[0]?.name ?? null)}
            onDrop={() => setFile('answers.xlsx')} />
        )}
      </div>
    </Modal>
  );
}

/** Add a manager: one of the platform's users, picked from a Select with avatars (Select's "With avatars"). */
function AddManagerModal({isOpen, onOpenChange, options, onAdd}: {isOpen: boolean; onOpenChange: (o: boolean) => void; options: string[]; onAdd: (m: string) => void}) {
  const [picked, setPerson] = useState<string | null>(null);
  // Someone already added drops out of the list, so fall back to the first one still there.
  const person = picked && options.includes(picked) ? picked : options[0] ?? null;
  return (
    <Modal title="Add a manager" isOpen={isOpen} onOpenChange={onOpenChange}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" isDisabled={!person} onPress={() => { if (person) onAdd(person); onOpenChange(false); }}>Add</Button>
      </>}>
      <div className="bo-community-monitor-modal">
        <p className="bo-note">Managers can edit the survey and its permissions, see the answers and create reports.</p>
        <Select label="Person" selectedKey={person} onSelectionChange={k => setPerson(k === null ? null : String(k))}>
          {options.map(o => <SelectItem key={o} id={o} icon={<Avatar size={16} initials={initials(o)} />}>{o}</SelectItem>)}
        </Select>
      </div>
    </Modal>
  );
}

const SETTINGS = ['Survey', 'Popup', 'Access rights', 'Managers'];

/** The real admin's settings, under its four sub-tabs; each a Panel, as every form in the back office. */
function Settings() {
  const [open, setOpen] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [confirmAnonymous, setConfirmAnonymous] = useState(false);
  const [access, setAccess] = useState(SURVEY_ACCESS[0].id);
  const [conditions, setConditions] = useState<string[]>(['home']);
  const [frequency, setFrequency] = useState(100);
  const [dirty, setDirty] = useState(false);
  const [modal, setModal] = useState<'edit' | 'import' | 'manager' | null>(null);
  const [managers, setManagers] = useState(MANAGERS);
  const touch = () => setDirty(true);
  const show = (m: typeof modal) => () => setModal(m);
  const shut = (o: boolean) => { if (!o) setModal(null); };
  const toggleOpen = (on: boolean) => {
    setOpen(on);
    toast(on ? 'Survey open for responses' : 'Survey closed', on ? 'The popup shows again.' : 'No new answers come in.', () => setOpen(!on));
  };
  const changeAccess = (id: string) => {
    const before = access;
    setAccess(id);
    toast('Access updated', SURVEY_ACCESS.find(a => a.id === id)?.label, () => setAccess(before));
  };
  const removeManager = (m: string) => {
    const before = managers;
    setManagers(list => list.filter(x => x !== m));
    toast('Manager removed', m, () => setManagers(before));
  };
  return (
    <>
    <Tabs defaultSelectedKey="Survey">
      <TabList aria-label="Settings sections" className="react-aria-TabList bo-community-monitor-subtabs">
        {SETTINGS.map(t => <Tab key={t} id={t}>{t}</Tab>)}
      </TabList>
      <TabPanels>
      <TabPanel id="Survey">
        <div className="bo-community-monitor-body">
          <Panel title="Survey" headingLevel={3} description="Eleven sentiment questions, shown to residents in a short popup."
            actions={<>
              <Button variant="secondary" size={32} onPress={show('import')}><Upload aria-hidden size={16} />Import answers</Button>
              <Button variant="secondary" size={32} onPress={show('edit')}><Pencil aria-hidden size={16} />Edit survey</Button>
            </>}>
            <Switch isSelected={open} onChange={toggleOpen}
              description={open ? 'Accepting answers: the popup shows to residents.' : 'Closed: the popup is hidden and no answers come in.'}>
              Open for responses
            </Switch>
          </Panel>
        </div>
      </TabPanel>
      <TabPanel id="Popup">
        <div className="bo-community-monitor-body">
          <Panel title="Popup settings" headingLevel={3} description="When residents see the survey."
            footer={<Button variant="primary" size={32} aria-label="Save popup settings" isDisabled={!dirty}
              onPress={() => { setDirty(false); toast('Popup settings saved'); }}>Save</Button>}>
            <div className="bo-community-monitor-section">
              <CheckboxGroup label="Under what conditions can the popup appear?" value={conditions}
                onChange={v => { setConditions(v); touch(); }}>
                {POPUP_CONDITIONS.map(c => <Checkbox key={c.id} value={c.id}>{c.label}</Checkbox>)}
              </CheckboxGroup>
              <NumberField label="Popup frequency (0 to 100)" description="The share of eligible visits that show the popup. The default is 100."
                minValue={0} maxValue={100} value={frequency} onChange={v => { setFrequency(v); touch(); }} />
            </div>
          </Panel>
        </div>
      </TabPanel>
      <TabPanel id="Access rights">
        <div className="bo-community-monitor-body">
          <Panel title="Who can respond" headingLevel={3} description="Changes apply at once.">
            <RadioGroup label="Who can take the survey?" value={access} onChange={changeAccess}>
              {SURVEY_ACCESS.map(a => <ChoiceCard key={a.id} value={a.id} description={a.description}>{a.label}</ChoiceCard>)}
            </RadioGroup>
          </Panel>
          <Panel title="Access and user data" headingLevel={3}>
            <Switch isSelected={anonymous}
              onChange={on => { if (on) setConfirmAnonymous(true); else { setAnonymous(false); toast('Answers are linked to profiles again'); } }}
              description={anonymous ? 'Answers are stored without a profile, so the Participants breakdowns stay empty.'
                : 'Answers are linked to profiles. Turned on, it applies to answers collected from then on.'}>
              Anonymize all user data
            </Switch>
          </Panel>
        </div>
      </TabPanel>
      <TabPanel id="Managers">
        <div className="bo-community-monitor-body">
          <Panel title="Managers" headingLevel={3} count={managers.length} flush
            description="Admins and these community monitor managers see the results and edit the survey."
            actions={<Button variant="secondary" size={32} onPress={show('manager')}><Plus aria-hidden size={16} />Add a manager</Button>}>
            {managers.length === 0 ? (
              <EmptyState size="panel" icon={<ShieldCheck size={24} />} title="Only admins for now" headingLevel={4}
                description="Add a manager to share the monitor with someone who isn't an admin." />
            ) : (
              <DataTable aria-label="Managers">
                <DataTableHeader>
                  <DataTableColumn isRowHeader>Name</DataTableColumn>
                  <DataTableColumn>Role</DataTableColumn>
                  <DataTableColumn align="options" hideLabel>Actions</DataTableColumn>
                </DataTableHeader>
                <DataTableBody>{managers.map(m => (
                  <DataTableRow key={m} id={m} textValue={m}>
                    <DataTableCell><DataTablePerson name={m} initials={initials(m)} /></DataTableCell>
                    <DataTableCell>Community monitor manager</DataTableCell>
                    <DataTableCell align="options">
                      <DataTableOptions aria-label={`Actions for ${m}`} onAction={() => removeManager(m)}>
                        <MenuItem id="remove">Remove as manager</MenuItem>
                      </DataTableOptions>
                    </DataTableCell>
                  </DataTableRow>
                ))}</DataTableBody>
              </DataTable>
            )}
          </Panel>
        </div>
      </TabPanel>
      </TabPanels>
    </Tabs>
      <EditSurveyModal isOpen={modal === 'edit'} onOpenChange={shut} onSave={() => toast('Survey saved', 'New wording shows from the next popup.')} />
      <ImportModal isOpen={modal === 'import'} onOpenChange={shut} onImport={f => toast('Importing answers', f)} />
      <AddManagerModal isOpen={modal === 'manager'} onOpenChange={shut}
        options={CANDIDATES.filter(c => !managers.includes(c))} onAdd={m => { setManagers(prev => [...prev, m]); toast('Manager added', m); }} />
      <AlertDialog title="Anonymize all user data?" confirmLabel="Anonymize" isOpen={confirmAnonymous}
        onOpenChange={setConfirmAnonymous}
        onConfirm={() => { setAnonymous(true); setConfirmAnonymous(false); toast('User data anonymized', 'For answers collected from now on.'); }}>
        Answers collected from now on are stored without the respondent's profile, so the Participants tab can't break
        them down by age, gender or area.
      </AlertDialog>
    </>
  );
}

export function CommunityMonitor() {
  const [quarter, setQuarter] = useState(CURRENT);
  const [section, setSection] = useState('Live monitor');
  // The quarter only applies to the results (Live monitor, Participants), as in the real admin.
  const byQuarter = section === 'Live monitor' || section === 'Participants';
  const [survey, setSurvey] = useState(false);
  return (
    <Page title="Community monitor" actions={<QuarterPicker quarter={quarter} onChange={setQuarter} show={byQuarter} onViewSurvey={() => setSurvey(true)} />}>
      <Tabs selectedKey={section} onSelectionChange={k => setSection(String(k))}>
        <TabList aria-label="Community monitor sections">{SECTIONS.map(s => <Tab key={s} id={s}>{s}</Tab>)}</TabList>
        <TabPanels>
        <TabPanel id="Live monitor"><LiveMonitor quarter={quarter} /></TabPanel>
        <TabPanel id="Participants"><Participants quarter={quarter} /></TabPanel>
        <TabPanel id="Reports"><SectionHeading>Reports</SectionHeading><Reports /></TabPanel>
        <TabPanel id="Settings"><SectionHeading>Settings</SectionHeading><Settings /></TabPanel>
        </TabPanels>
      </Tabs>
      <SurveyModal isOpen={survey} onOpenChange={setSurvey} />
      <ToastRegion />
    </Page>
  );
}

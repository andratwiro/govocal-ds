import {useState} from 'react';
import {ArrowLeft, ArrowRight, Download, Eye, Plus, Upload, Pencil} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel, TabPanels} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {Button} from '../../../src/components/Button';
import {NumberField} from '../../../src/components/NumberField';
import {CheckboxGroup} from '../../../src/components/CheckboxGroup';
import {TextField} from '../../../src/components/TextField';
import {RadioGroup, Radio} from '../../../src/components/RadioGroup';
import {Modal} from '../../../src/components/gv/Modal';
import {DropZone} from '../../../src/components/gv/DropZone';
import {DashboardCard, DashboardDemographic} from '../../../src/components/gv/DashboardCard';
import {Kpi} from '../../../src/components/gv/Kpi';
import {LineChart, Sparkline} from '../../../src/components/gv/Chart';
import {BarRow} from '../../../src/components/gv/BarRow';
import {LegendRow} from '../../../src/components/gv/LegendRow';
import {StatRow} from '../../../src/components/gv/StatRow';
import {Card, CardSwitch} from '../../../src/components/gv/Card';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {Status} from '../../../src/components/gv/Status';
import {Pill} from '../../../src/components/gv/Pill';
import {Banner} from '../../../src/components/gv/Banner';
import {Divider} from '../../../src/components/gv/Divider';
import {CANDIDATES, CATEGORIES, CURRENT, MANAGERS, POPUP_CONDITIONS, POPUP_SHOWN, QUARTERS, QUESTIONS, REPORTS, RESPONDENTS,
  SENTIMENT, SURVEY_ACCESS, WHO, type Report} from '../data-community-monitor';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const SECTIONS = ['Live monitor', 'Participants', 'Reports', 'Settings'];
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
      <Select aria-label="Quarter" selectedKey={String(quarter)} onSelectionChange={k => onChange(Number(k))}>
        {QUARTERS.map((q, i) => <SelectItem key={q} id={String(i)}>{q}</SelectItem>)}
      </Select>
      <Button variant="secondary" size={32} aria-label="Next quarter" isDisabled={quarter === CURRENT}
        onPress={() => onChange(quarter + 1)}><ArrowRight aria-hidden size={16} /></Button>
      </>}
      <Button variant="primary" size={32} onPress={onViewSurvey}><Eye aria-hidden size={16} /> View survey</Button>
    </div>
  );
}

function ScoreTile({label, scores, quarter}: {label: string; scores: number[]; quarter: number}) {
  const now = scores[quarter];
  const note = quarter === 0 ? 'First quarter' : `${signed(now - scores[quarter - 1])} vs ${QUARTERS[quarter - 1]}`;
  return (
    <Kpi label={label} value={score(now)} note={quarter === CURRENT ? `${note} · updating live` : note} />
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
        <ScoreTile label="Health score" scores={HEALTH} quarter={quarter} />
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
              action={<Pill>{score(c.scores[quarter])}</Pill>}>
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
        <Kpi label="Respondents" value={n(RESPONDENTS[quarter])} note={quarter === CURRENT ? 'updating live' : QUARTERS[quarter]}>
          <Sparkline label="Respondents per quarter" labels={shown} values={RESPONDENTS.slice(0, quarter + 1)} height={34} grid={false} />
        </Kpi>
        <Kpi label="Popup shown" value={n(POPUP_SHOWN[quarter])} note="times this quarter" />
        <Kpi label="Response rate" value={`${rate}%`} note="of residents shown the popup" />
        <Kpi label="Respondents to date" value={n(allTime)} note={`since ${QUARTERS[0]}`} />
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
          <div className="bo-community-monitor-buttons">
            <Status state={report.published ? 'live' : 'draft'}>{report.published ? 'Published' : 'Draft'}</Status>
            <span className="bo-note">{report.quarter} · updated {report.updated}</span>
          </div>
          <div className="bo-community-monitor-kpis">
            <Kpi label="Health score" value={score(HEALTH[q])} note={report.quarter} />
            <Kpi label="Respondents" value={n(RESPONDENTS[q])} note={`${Math.round((RESPONDENTS[q] / POPUP_SHOWN[q]) * 100)}% response rate`} />
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
    onCreate({title: title.trim() || 'Untitled report', quarter, updated: '29 Oct 2026', published: false});
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

function Reports() {
  const [reports, setReports] = useState<Report[]>(REPORTS);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Report | null>(null);
  return (
    <div className="bo-community-monitor-body">
      <div className="bo-community-monitor-bar">
        <p className="bo-note">Reports built from the monitor's quarterly results.</p>
        <Button variant="primary" size={32} onPress={() => setCreating(true)}><Plus aria-hidden size={16} /> Create report</Button>
      </div>
      <ul className="bo-community-monitor-list">
        {reports.map(r => (
          <li key={r.title}>
            <Card tone="manage" title={r.title} summary={`Updated ${r.updated}`} pills={[{label: r.quarter}]}
              actions={<Status state={r.published ? 'live' : 'draft'}>{r.published ? 'Published' : 'Draft'}</Status>}
              control="open" onOpen={() => setOpen(r)} />
          </li>
        ))}
      </ul>
      <CreateReportModal isOpen={creating} onOpenChange={setCreating} onCreate={r => setReports(prev => [r, ...prev])} />
      <ReportModal report={open} onClose={() => setOpen(null)} />
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
        <Banner>Changing a question's wording starts a new comparison: earlier quarters keep the old wording.</Banner>
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

/** Import answers: answers collected offline, from the survey's spreadsheet template. */
function ImportModal({isOpen, onOpenChange, onImport}: {isOpen: boolean; onOpenChange: (o: boolean) => void; onImport: (file: string) => void}) {
  const [file, setFile] = useState<string | null>(null);
  const [template, setTemplate] = useState(false);
  return (
    <Modal title="Import answers" isOpen={isOpen} onOpenChange={o => { onOpenChange(o); if (!o) { setFile(null); setTemplate(false); } }}
      footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button variant="primary" isDisabled={!file} onPress={() => { if (file) onImport(file); onOpenChange(false); setFile(null); }}>Import</Button>
      </>}>
      <div className="bo-community-monitor-modal">
        <p className="bo-note">Answers collected on paper or at an event: fill in the template, one row per respondent, then upload it.</p>
        <div className="bo-community-monitor-buttons">
          <Button variant="secondary" size={32} onPress={() => setTemplate(true)}><Download aria-hidden size={16} /> Download the template</Button>
          <span role="status" className="bo-note">{template ? 'community-monitor-template.xlsx downloaded' : ''}</span>
        </div>
        <DropZone acceptedFileTypes={['.xlsx', '.csv']} aria-label="Answers file"
          onSelect={files => setFile(files?.[0]?.name ?? null)}
          onDrop={() => setFile('answers.xlsx')} />
        <span role="status" className="bo-note">{file ? `Ready to import: ${file}` : ''}</span>
      </div>
    </Modal>
  );
}

/** Add a manager: one of the platform's users, picked from a list. */
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
          {options.map(o => <SelectItem key={o} id={o}>{o}</SelectItem>)}
        </Select>
      </div>
    </Modal>
  );
}

const SETTINGS = ['Survey', 'Popup', 'Access rights', 'Managers'];

/** The real admin's settings, under its four sub-tabs: Survey, Popup, Access rights, Managers. */
function Settings() {
  const [open, setOpen] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [access, setAccess] = useState(SURVEY_ACCESS[0].id);
  const [conditions, setConditions] = useState<string[]>(['home']);
  const [frequency, setFrequency] = useState(100);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState<'edit' | 'import' | 'manager' | null>(null);
  const [surveyNote, setSurveyNote] = useState('');
  const [managers, setManagers] = useState(MANAGERS);
  const touch = () => { setDirty(true); setSaved(false); };
  const show = (m: typeof modal) => () => setModal(m);
  const shut = (o: boolean) => { if (!o) setModal(null); };
  return (
    <>
    <Tabs defaultSelectedKey="Survey">
      <TabList aria-label="Settings sections" className="react-aria-TabList bo-community-monitor-subtabs">
        {SETTINGS.map(t => <Tab key={t} id={t}>{t}</Tab>)}
      </TabList>
      <TabPanels>
      <TabPanel id="Survey">
        <div className="bo-community-monitor-body">
          <Card title="Survey" summary={open ? 'Accepting answers' : 'Closed'}
            actions={<CardSwitch aria-label="Open for responses" isSelected={open} onChange={setOpen} />}>
            <div className="bo-community-monitor-section">
              <Status state={open ? 'live' : 'draft'}>{open ? 'Open for responses' : 'Closed'}</Status>
              <div className="bo-community-monitor-buttons">
                <Button variant="secondary" size={32} onPress={show('edit')}><Pencil aria-hidden size={16} /> Edit survey</Button>
                <Button variant="secondary" size={32} onPress={show('import')}><Upload aria-hidden size={16} /> Import answers</Button>
                <span role="status" className="bo-note">{surveyNote}</span>
              </div>
            </div>
          </Card>
        </div>
      </TabPanel>
      <TabPanel id="Popup">
        <div className="bo-community-monitor-body">
          <Card title="Popup settings" layout="stacked">
            <div className="bo-community-monitor-section">
              <CheckboxGroup label="Under what conditions can the popup appear?" value={conditions}
                onChange={v => { setConditions(v); touch(); }}>
                {POPUP_CONDITIONS.map(c => <Checkbox key={c.id} value={c.id}>{c.label}</Checkbox>)}
              </CheckboxGroup>
              <NumberField label="Popup frequency (0 to 100)" description="The share of eligible visits that show the popup. The default is 100."
                minValue={0} maxValue={100} value={frequency} onChange={v => { setFrequency(v); touch(); }} />
              <Divider />
              <div className="bo-community-monitor-buttons">
                <Button variant="primary" aria-label="Save popup settings" isDisabled={!dirty}
                  onPress={() => { setDirty(false); setSaved(true); }}>Save</Button>
                <span role="status" className="bo-note">{saved ? 'Popup settings saved' : ''}</span>
              </div>
            </div>
          </Card>
        </div>
      </TabPanel>
      <TabPanel id="Access rights">
        <div className="bo-community-monitor-body">
          <Card title="Who can respond" layout="stacked">
            <RadioGroup label="Who can take the survey?" value={access} onChange={setAccess}>
              {SURVEY_ACCESS.map(a => <Radio key={a.id} value={a.id}>{a.label}</Radio>)}
            </RadioGroup>
          </Card>
          <Card title="Access and user data"
            summary={anonymous ? 'Answers are stored without a profile' : 'Answers are linked to profiles'}
            actions={<CardSwitch aria-label="Anonymize all user data" isSelected={anonymous} onChange={setAnonymous} />}>
            <p className="bo-note">Anonymize all user data: answers are kept without the respondent's profile, so the
              Participants breakdowns stay empty. This applies to answers collected from now on.</p>
          </Card>
        </div>
      </TabPanel>
      <TabPanel id="Managers">
        <div className="bo-community-monitor-body">
          <Card title="Management" layout="stacked">
            <div className="bo-community-monitor-section">
              <p className="bo-note">Who are the managers? Admins and these community monitor managers see results and edit the survey.</p>
              <div className="bo-community-monitor-buttons">
                {managers.map(m => <Pill key={m}>{m}</Pill>)}
                <Button variant="quiet" size={32} onPress={show('manager')}><Plus aria-hidden size={16} /> Add a manager</Button>
              </div>
            </div>
          </Card>
        </div>
      </TabPanel>
      </TabPanels>
    </Tabs>
      <EditSurveyModal isOpen={modal === 'edit'} onOpenChange={shut} onSave={() => setSurveyNote('Survey saved')} />
      <ImportModal isOpen={modal === 'import'} onOpenChange={shut} onImport={f => setSurveyNote(`Importing ${f}`)} />
      <AddManagerModal isOpen={modal === 'manager'} onOpenChange={shut}
        options={CANDIDATES.filter(c => !managers.includes(c))} onAdd={m => setManagers(prev => [...prev, m])} />
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
    </Page>
  );
}

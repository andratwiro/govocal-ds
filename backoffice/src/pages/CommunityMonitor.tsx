import {useState} from 'react';
import {ArrowLeft, ArrowRight, Eye, Plus, Upload, Pencil} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {Select, SelectItem} from '../../../src/components/Select';
import {Button} from '../../../src/components/Button';
import {NumberField} from '../../../src/components/NumberField';
import {CheckboxGroup} from '../../../src/components/CheckboxGroup';
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
import {CATEGORIES, CURRENT, MANAGERS, POPUP_CONDITIONS, POPUP_SHOWN, QUARTERS, QUESTIONS, REPORTS, RESPONDENTS,
  SENTIMENT, WHO} from '../data-community-monitor';
import {Page} from './Page';

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
function QuarterPicker({quarter, onChange, show}: {quarter: number; onChange: (q: number) => void; show: boolean}) {
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
      <Button variant="primary" size={32}><Eye aria-hidden size={16} /> View survey</Button>
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

function Reports() {
  return (
    <div className="bo-community-monitor-body">
      <div className="bo-community-monitor-bar">
        <p className="bo-note">Reports built from the monitor's quarterly results.</p>
        <Button variant="primary" size={32}><Plus aria-hidden size={16} /> Create report</Button>
      </div>
      <ul className="bo-community-monitor-list">
        {REPORTS.map(r => (
          <li key={r.title}>
            <Card tone="manage" title={r.title} summary={`Updated ${r.updated}`} pills={[{label: r.quarter}]}
              actions={<Status state={r.published ? 'live' : 'draft'}>{r.published ? 'Published' : 'Draft'}</Status>}
              control="open" onOpen={() => {}} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Settings() {
  const [open, setOpen] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [conditions, setConditions] = useState<string[]>(['home']);
  const [frequency, setFrequency] = useState(100);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const touch = () => { setDirty(true); setSaved(false); };
  return (
    <div className="bo-community-monitor-body">
      <Card title="Survey" summary={open ? 'Accepting answers' : 'Closed'}
        actions={<CardSwitch aria-label="Open for responses" isSelected={open} onChange={setOpen} />}>
        <div className="bo-community-monitor-section">
          <Status state={open ? 'live' : 'draft'}>{open ? 'Open for responses' : 'Closed'}</Status>
          <div className="bo-community-monitor-buttons">
            <Button variant="secondary" size={32}><Pencil aria-hidden size={16} /> Edit survey</Button>
            <Button variant="secondary" size={32}><Upload aria-hidden size={16} /> Import answers</Button>
          </div>
        </div>
      </Card>
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
      <Card title="Access and user data"
        summary={anonymous ? 'Answers are stored without a profile' : 'Answers are linked to profiles'}
        actions={<CardSwitch aria-label="Anonymize all user data" isSelected={anonymous} onChange={setAnonymous} />}>
        <p className="bo-note">Anonymize all user data: answers are kept without the respondent's profile, so the
          Participants breakdowns stay empty. This applies to answers collected from now on.</p>
      </Card>
      <Card title="Management" layout="stacked">
        <div className="bo-community-monitor-section">
          <p className="bo-note">Who are the managers? Admins and these community monitor managers see results and edit the survey.</p>
          <div className="bo-community-monitor-buttons">
            {MANAGERS.map(m => <Pill key={m}>{m}</Pill>)}
            <Button variant="quiet" size={32}><Plus aria-hidden size={16} /> Add a manager</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function CommunityMonitor() {
  const [quarter, setQuarter] = useState(CURRENT);
  const [section, setSection] = useState('Live monitor');
  // The quarter only applies to the results (Live monitor, Participants), as in the real admin.
  const byQuarter = section === 'Live monitor' || section === 'Participants';
  return (
    <Page title="Community monitor" actions={<QuarterPicker quarter={quarter} onChange={setQuarter} show={byQuarter} />}>
      <Tabs selectedKey={section} onSelectionChange={k => setSection(String(k))}>
        <TabList aria-label="Community monitor sections">{SECTIONS.map(s => <Tab key={s} id={s}>{s}</Tab>)}</TabList>
        <TabPanel id="Live monitor"><LiveMonitor quarter={quarter} /></TabPanel>
        <TabPanel id="Participants"><Participants quarter={quarter} /></TabPanel>
        <TabPanel id="Reports"><Reports /></TabPanel>
        <TabPanel id="Settings"><Settings /></TabPanel>
      </Tabs>
    </Page>
  );
}

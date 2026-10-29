import {useMemo, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight, Copy, Download, Play, Plus, Share2, Sparkles} from 'lucide-react';
import {Tabs, TabList, Tab, TabPanel} from '../../../src/components/Tabs';
import {DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableRow, DataTableCell, DataTableEmpty,
  DataTableOptions} from '../../../src/components/gv/DataTable';
import {MenuTrigger, Menu, MenuItem} from '../../../src/components/Menu';
import {SearchField} from '../../../src/components/SearchField';
import {Button} from '../../../src/components/Button';
import {TextField} from '../../../src/components/TextField';
import {Select, SelectItem} from '../../../src/components/Select';
import {Switch} from '../../../src/components/Switch';
import {ListBox, ListBoxItem} from '../../../src/components/ListBox';
import {Card, CardRadio, CardRadioGroup} from '../../../src/components/gv/Card';
import {DashboardCard} from '../../../src/components/gv/DashboardCard';
import {Kpi} from '../../../src/components/gv/Kpi';
import {LineChart} from '../../../src/components/gv/Chart';
import {BarRow} from '../../../src/components/gv/BarRow';
import {LegendRow} from '../../../src/components/gv/LegendRow';
import {Status} from '../../../src/components/gv/Status';
import {Pill} from '../../../src/components/gv/Pill';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Banner} from '../../../src/components/gv/Banner';
import {Checkbox} from '../../../src/components/gv/Checkbox';
import {SegmentedControl, Segment} from '../../../src/components/gv/SegmentedControl';
import {CONTENTS, DECK, REPORTS, SLIDES, type Report, type Slide} from '../data-reporting';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const n = (v: number) => v.toLocaleString('en');
const modified = (d: number) => `Modified ${d} ${d === 1 ? 'day' : 'days'} ago`;

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
          <DataTableRow key={r.id} id={r.id}>
            <DataTableCell>
              <span className="bo-reporting-title">
                <span>{r.title}</span>
                {r.isNew && <Pill>New</Pill>}
                {r.kind === 'progress' && <Pill>Progress</Pill>}
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
        {TABS.map(t => (
          <TabPanel key={t.id} id={t.id}>
            <div className="bo-reporting-stack">
              {t.id === 'progress' && <Banner>These reports are created by your Go Vocal success manager, once a quarter.</Banner>}
              <ReportTable label={t.label} reports={found.filter(t.keep)} onEdit={onEdit} onDuplicate={duplicate} onDelete={remove} />
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </section>
  );
}

// ── Builder, blank: the prototype's start screen (template + contents) ──────────────────────────

type Template = 'blank' | 'template' | 'ai';

function BlankBuilder({onCreate}: {onCreate: (title: string, template: Template) => void}) {
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<Template>('template');
  return (
    <div className="bo-reporting-blank">
      <Card tone="manage" layout="stacked" title="Build your report">
        <div className="bo-reporting-form">
          <p className="bo-note">Turn a project's results into a slide deck you can share. Start from scratch, pick a template, or let Go Vocal AI draft it from your data.</p>
          <TextField label="Report title" placeholder="Larkvale park renewal: project report" value={title} onChange={setTitle} />
          <CardRadioGroup aria-label="Report template" orientation="horizontal" value={template} onChange={v => setTemplate(v as Template)}>
            <CardRadio value="blank" description="Add slides one by one.">Start blank</CardRadio>
            <CardRadio value="template" description="Start from a ready structure.">Use a template</CardRadio>
            <CardRadio value="ai" description="Draft it from your project data.">Create with AI</CardRadio>
          </CardRadioGroup>
        </div>
      </Card>
      <Card tone="manage" layout="stacked" title="Report contents">
        <div className="bo-reporting-form">
          <p className="bo-note">Choose what this report covers. Each becomes one or more slides.</p>
          <div className="bo-reporting-checks">
            {CONTENTS.map(c => <Checkbox key={c.id} defaultSelected={c.on} description={c.meta}>{c.label}</Checkbox>)}
          </div>
          <div className="bo-reporting-field">
            <span className="bo-note" aria-hidden>Number of slides</span>
            <SegmentedControl aria-label="Number of slides" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['auto']}>
              <Segment id="auto">Auto</Segment>
              <Segment id="short">Short</Segment>
              <Segment id="standard">Standard</Segment>
              <Segment id="detailed">Detailed</Segment>
            </SegmentedControl>
          </div>
          <Button variant="primary" size={32} onPress={() => onCreate(title || 'Untitled report', template)}>Create report</Button>
        </div>
      </Card>
    </div>
  );
}

// ── Builder, deck: filmstrip · slide stage · slide settings (the prototype's slide deck direction) ─

function SlideBody({slide}: {slide: Slide}) {
  switch (slide.kind) {
    case 'cover':
      return (
        <div className="bo-reporting-slide-stack">
          <p className="bo-note">Project report · 4 May to 10 Jul 2026</p>
          <ul className="bo-reporting-bullets">
            <li>{n(1846)} participants over ten weeks</li>
            <li>3 phases: ideas, a vote and a survey</li>
            <li>Prepared by Manager A</li>
          </ul>
        </div>
      );
    case 'summary':
      return (
        <DashboardCard type="ai-summary" icon={<Sparkles />} title="What did people say?" footer={<>1 / 3<span className="bo-note">AI summary, check before sharing</span></>}>
          <p>{DECK.summary}</p>
        </DashboardCard>
      );
    case 'kpis':
      return (
        <div className="bo-reporting-kpis">
          {DECK.kpis.map(k => <Kpi key={k.label} label={k.label} value={k.value} note={k.note} type="with-note" />)}
        </div>
      );
    case 'timeline':
      return (
        <LineChart labels={DECK.weeks} legend
          series={[{label: 'Participants', values: DECK.participants}, {label: 'Visitors', values: DECK.visitors}]} />
      );
    case 'phases': {
      const max = Math.max(...DECK.phases.map(p => p.value));
      return (
        <div className="bo-reporting-bars">
          {DECK.phases.map(p => <BarRow key={p.phase} label={p.phase} percent={Math.round((p.value / max) * 100)} value={`${n(p.value)} ${p.unit}`} />)}
        </div>
      );
    }
    case 'demographics':
      return (
        <div className="bo-reporting-bars">
          {DECK.age.map((a, i) => (
            <LegendRow key={a.label} color={`--gv-chart-blue-${i + 1}`} label={a.label} value={`${a.percent}%`} />
          ))}
          <p className="bo-note">Age, from the 1,212 participants who gave it. Groups under 10 people are not shown.</p>
        </div>
      );
    case 'recommendations':
      return <ul className="bo-reporting-bullets">{DECK.recommendations.map(r => <li key={r}>{r}</li>)}</ul>;
  }
}

function DeckBuilder({title, ai}: {title: string; ai: boolean}) {
  const slides = ai ? SLIDES : SLIDES.slice(0, 4);
  const [current, setCurrent] = useState(slides[2].id);
  const i = Math.max(0, slides.findIndex(s => s.id === current));
  const slide = slides[i];
  const go = (d: number) => setCurrent(slides[Math.min(slides.length - 1, Math.max(0, i + d))].id);
  return (
    <div className="bo-reporting-deckwrap">
      {ai && (
        <div className="bo-reporting-aibar">
          <Banner>
            <strong>Built by Go Vocal AI</strong> from your project data. {slides.length} slides: edit anything, or ask for changes.
          </Banner>
          <div className="bo-reporting-refine">
            <TextField aria-label="Refine the report" placeholder="For example: add a slide on demographics" />
            <Button variant="secondary" size={32}><Sparkles aria-hidden size={16} />Refine</Button>
          </div>
        </div>
      )}
      <div className="bo-reporting-deck">
        <div className="bo-reporting-film">
          <ListBox aria-label="Slides" selectionMode="single" disallowEmptySelection selectedKeys={[slide.id]}
            onSelectionChange={k => k !== 'all' && k.size && setCurrent(String([...k][0]))}>
            {slides.map(s => (
              <ListBoxItem key={s.id} id={s.id} textValue={`${s.n} ${s.title}`}>
                <span className="bo-reporting-thumb"><span className="bo-note">{s.n}</span><span>{s.title}</span></span>
              </ListBoxItem>
            ))}
          </ListBox>
          <Button variant="quiet" size={32}><Plus aria-hidden size={16} />Add slide</Button>
        </div>
        <div className="bo-reporting-center">
          <Gap name="Slide stage">
            <article aria-label={`Slide ${i + 1}: ${slide.title}`} className="bo-reporting-slide">
              <p className="bo-note">{DECK.brand}</p>
              <h3 className="bo-section-title">{slide.title}</h3>
              <div className="bo-reporting-slide-body"><SlideBody slide={slide} /></div>
              <p className="bo-note bo-reporting-slide-foot"><span>{title}</span><span>{i + 1} / {slides.length}</span></p>
            </article>
          </Gap>
          <div className="bo-reporting-nav">
            <IconButton variant="bordered" aria-label="Previous slide" isDisabled={i === 0} onPress={() => go(-1)}><ChevronLeft aria-hidden size={16} /></IconButton>
            <span className="bo-note" aria-live="polite">{i + 1} / {slides.length}</span>
            <IconButton variant="bordered" aria-label="Next slide" isDisabled={i === slides.length - 1} onPress={() => go(1)}><ChevronRight aria-hidden size={16} /></IconButton>
            <Button variant="secondary" size={32}><Play aria-hidden size={16} />Present</Button>
          </div>
        </div>
        <div className="bo-reporting-side">
          <Card tone="manage" layout="stacked" title={`Slide ${i + 1}`}>
            <div className="bo-reporting-form">
              <Select label="Data source" defaultSelectedKey="totals">
                <SelectItem id="totals">Participation totals</SelectItem>
                <SelectItem id="ideas">Collect ideas only</SelectItem>
                <SelectItem id="survey">Survey only</SelectItem>
              </Select>
              <div className="bo-reporting-field">
                <span className="bo-note" aria-hidden>Metrics shown</span>
                <SegmentedControl aria-label="Metrics shown" selectionMode="single" disallowEmptySelection defaultSelectedKeys={['4']}>
                  <Segment id="4">4</Segment><Segment id="3">3</Segment><Segment id="2">2</Segment>
                </SegmentedControl>
              </div>
              <Switch defaultSelected>Show slide numbers</Switch>
            </div>
          </Card>
          <div className="bo-reporting-cta">
            <Button variant="secondary" size={32}><Download aria-hidden size={16} />Export PDF</Button>
            <Button variant="primary" size={32}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type Open = {title: string; state: 'blank' | 'deck' | 'ai'};

function Builder({open, setOpen}: {open: Open; setOpen: (o: Open) => void}) {
  return (
    <section aria-label={`Report builder: ${open.title}`} className="bo-reporting-builder">
      <div className="bo-reporting-head">
        <div className="bo-reporting-title">
          <h2 className="bo-section-title">{open.title}</h2>
          <Status state="draft">Draft</Status>
        </div>
        {open.state !== 'blank' && (
          <MenuTrigger>
            <Button variant="secondary" size={32}><Share2 aria-hidden size={16} />Share</Button>
            <Menu aria-label="Share">
              <MenuItem id="link"><Copy aria-hidden size={16} />Share as web link</MenuItem>
              <MenuItem id="pdf"><Download aria-hidden size={16} />Print to PDF</MenuItem>
            </Menu>
          </MenuTrigger>
        )}
      </div>
      {open.state === 'blank'
        ? <BlankBuilder onCreate={(title, t) => setOpen({title, state: t === 'ai' ? 'ai' : 'deck'})} />
        : <DeckBuilder key={open.title + open.state} title={open.title} ai={open.state === 'ai'} />}
    </section>
  );
}

export function Reporting() {
  const [reports, setReports] = useState(REPORTS);
  const [open, setOpen] = useState<Open>({title: REPORTS[0].title, state: 'ai'});
  return (
    <Page title="Reporting" description="Customise your report and share it with internal stakeholders or the community as a web link or a PDF."
      actions={<Button variant="primary" size={32} onPress={() => setOpen({title: 'New report', state: 'blank'})}><Plus aria-hidden size={16} />Create a report</Button>}>
      <div className="bo-reporting-stack">
        <ReportList reports={reports} setReports={setReports} onEdit={r => setOpen({title: r.title, state: 'deck'})} />
        <GapLegend names={['Slide stage']} />
        <Builder open={open} setOpen={setOpen} />
      </div>
    </Page>
  );
}

import {useMemo, useState} from 'react';
import {BadgeCheck, Copy, ExternalLink, Users} from 'lucide-react';
import {Button} from '../../../src/components/Button';
import {Link} from '../../../src/components/Link';
import {Modal} from '../../../src/components/gv/Modal';
import {SearchField} from '../../../src/components/SearchField';
import {Select, SelectItem} from '../../../src/components/Select';
import {Tag, TagGroup} from '../../../src/components/TagGroup';
import {Avatar} from '../../../src/components/gv/Avatar';
import {Banner} from '../../../src/components/gv/Banner';
import {Card} from '../../../src/components/gv/Card';
import {IconButton} from '../../../src/components/gv/IconButton';
import {Badge} from '../../../src/components/gv/Badge';
import {StatusBadge} from '../../../src/components/gv/StatusBadge';
import {COUNTRIES, LIBRARY, METHODS, PHASE_TITLES, POPULATIONS, SORTS, TOPICS, type Country, type LibraryProject} from '../data-inspiration-hub';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

const ANY = 'any';
type FilterKey = 'method' | 'country' | 'population' | 'topic';
const FILTERS: {key: FilterKey; label: string; any: string; options: readonly string[]}[] = [
  {key: 'method', label: 'Method', any: 'Any method', options: METHODS},
  {key: 'country', label: 'Country', any: 'Any country', options: COUNTRIES},
  {key: 'population', label: 'Population', any: 'Any size', options: POPULATIONS},
  {key: 'topic', label: 'Topic', any: 'Any topic', options: TOPICS}
];
const NO_FILTERS: Record<FilterKey, string> = {method: ANY, country: ANY, population: ANY, topic: ANY};

function initials(platform: string) {
  return platform.replace(/^(City|Town) of /, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function matches(p: LibraryProject, f: Record<FilterKey, string>, query: string) {
  if (f.method !== ANY && !p.methods.includes(f.method as LibraryProject['methods'][number])) return false;
  if (f.country !== ANY && p.country !== f.country) return false;
  if (f.population !== ANY && p.population !== f.population) return false;
  if (f.topic !== ANY && p.topic !== f.topic) return false;
  const q = query.trim().toLowerCase();
  return !q || `${p.title} ${p.platform}`.toLowerCase().includes(q);
}

function sortBy(list: LibraryProject[], sort: string) {
  const out = [...list];
  if (sort === SORTS[0]) out.sort((a, b) => b.start.localeCompare(a.start));
  if (sort === SORTS[1]) out.sort((a, b) => a.start.localeCompare(b.start));
  if (sort === SORTS[2]) out.sort((a, b) => b.participants - a.participants);
  if (sort === SORTS[3]) out.sort((a, b) => a.participants - b.participants);
  return out;
}

// The prototype's project card (.gv-pcard): image on top, title, then the platform line, the methods and the action.
function ProjectCard({project, highlighted, copied, onCopy, onOpen}: {project: LibraryProject; highlighted?: boolean; copied: boolean; onCopy: () => void; onOpen: () => void}) {
  const Art = project.art;
  return (
    <Card
      layout="stacked"
      title={<Link onPress={onOpen} className="react-aria-Link bo-inspiration-hub-title">{project.title}</Link>}
      actions={<IconButton aria-label={`Preview: ${project.title}`} onPress={onOpen}><ExternalLink aria-hidden size={16} /></IconButton>}>
      <div className="bo-inspiration-hub-body">
        <Gap name="Project image" inline>
          <span className="bo-inspiration-hub-art">
            <Art aria-hidden size={40} strokeWidth={1.5} />
            {highlighted && <span className="bo-inspiration-hub-stamp"><BadgeCheck aria-label="Highlighted" size={20} /></span>}
          </span>
        </Gap>
        <div className="bo-inspiration-hub-meta">
          <span className="bo-inspiration-hub-platform">
            <Avatar initials={initials(project.platform)} size={24} />
            <span className="bo-note">{project.platform} · {project.country}</span>
          </span>
          <span className="bo-inspiration-hub-platform bo-note" aria-label={`${project.participants.toLocaleString('en')} participants`}>
            <Users aria-hidden size={14} />{project.participants.toLocaleString('en')}
          </span>
        </div>
        {highlighted && project.highlight && (
          <Gap name="Quote" inline><blockquote className="bo-inspiration-hub-quote">{project.highlight}</blockquote></Gap>
        )}
        <div className="bo-inspiration-hub-tags">
          {project.methods.map(m => <Badge key={m}>{m}</Badge>)}
        </div>
        <div className="bo-inspiration-hub-actions">
          <Button variant="secondary" size={32} isDisabled={copied} onPress={onCopy}>
            <Copy aria-hidden size={16} />Copy project
          </Button>
          {copied && <StatusBadge state="live">Copied to your drafts</StatusBadge>}
        </div>
      </div>
    </Card>
  );
}

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});

/** The project's preview: what it asked, how (its phases, one per method), and how many took part. */
function ProjectPreview({project, copied, onCopy, onClose}: {project: LibraryProject | null; copied: boolean; onCopy: () => void; onClose: () => void}) {
  return (
    <Modal title={project?.title ?? 'Project'} size="wide" isOpen={project !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Close</Button>
        <Button variant="primary" isDisabled={copied} onPress={() => { onCopy(); onClose(); }}>
          <Copy aria-hidden size={16} />{copied ? 'Copied' : 'Copy project'}
        </Button>
      </>}>
      {project && (
        <div className="bo-inspiration-hub-preview">
          <p className="bo-inspiration-hub-platform">
            <Avatar initials={initials(project.platform)} size={24} />
            <span className="bo-note">{project.platform} · {project.country} · {project.participants.toLocaleString('en')} participants</span>
          </p>
          <p>{project.summary}</p>
          <div className="bo-inspiration-hub-tags">{project.methods.map(m => <Badge key={m}>{m}</Badge>)}</div>
          <dl className="bo-inspiration-hub-facts">
            {[['Topic', project.topic], ['Population', project.population], ['Started', longDate(project.start)]].map(([k, v]) => (
              <div key={k}><dt className="bo-note">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <h3 className="bo-section-title">Phases</h3>
          <ol className="bo-inspiration-hub-phases">
            {project.methods.map((m, i) => (
              <li key={m} className="bo-inspiration-hub-phase">
                <span className="bo-note">{`Phase ${i + 1}`}</span><span>{PHASE_TITLES[m]}</span><Badge>{m}</Badge>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Modal>
  );
}

export function InspirationHub() {
  const [pinCountry, setPinCountry] = useState<Country>('Northmark');
  const [filters, setFilters] = useState(NO_FILTERS);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>(SORTS[0]);
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<LibraryProject | null>(null);

  const pinned = LIBRARY.filter(p => p.highlight && p.country === pinCountry);
  const shown = useMemo(() => sortBy(LIBRARY.filter(p => matches(p, filters, query)), sort), [filters, query, sort]);
  const active = FILTERS.filter(f => filters[f.key] !== ANY);
  const copy = (id: string) => setCopied(prev => new Set(prev).add(id));
  const card = (p: LibraryProject, highlighted?: boolean) => (
    <li key={p.id} className="bo-inspiration-hub-item">
      <ProjectCard project={p} highlighted={highlighted} copied={copied.has(p.id)} onCopy={() => copy(p.id)} onOpen={() => setPreview(p)} />
    </li>
  );

  return (
    <Page title="Inspiration hub" description="Browse projects on other platforms for inspiration, and copy one to start your own.">
      <Banner>Projects on your platform can show up here for other platforms. To keep one out, contact your success manager.</Banner>

      <div className="bo-inspiration-hub-head">
        <h2 className="bo-section-title" id="bo-inspiration-hub-highlighted">Highlighted</h2>
        <Select label="Highlighted for" selectedKey={pinCountry} onSelectionChange={k => setPinCountry(k as Country)}>
          {COUNTRIES.map(c => <SelectItem key={c} id={c}>{c}</SelectItem>)}
        </Select>
      </div>
      {pinned.length ? (
        <ul className="bo-inspiration-hub-grid" aria-label="Highlighted projects">
          {pinned.map(p => card(p, true))}
        </ul>
      ) : <p className="bo-note">No projects are highlighted for this country yet.</p>}

      <div className="bo-inspiration-hub-head">
        <h2 className="bo-section-title" id="bo-inspiration-hub-all">All projects</h2>
        <Select label="Sort by" selectedKey={sort} onSelectionChange={k => setSort(String(k))}>
          {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
        </Select>
      </div>
      <div className="bo-inspiration-hub-filters">
        <SearchField label="Search" aria-label="Search projects" placeholder="Search projects" value={query} onChange={setQuery} />
        {FILTERS.map(f => (
          <Select key={f.key} label={f.label} selectedKey={filters[f.key]}
            onSelectionChange={k => setFilters(prev => ({...prev, [f.key]: String(k)}))}>
            <SelectItem id={ANY}>{f.any}</SelectItem>
            {f.options.map(o => <SelectItem key={o} id={o}>{o}</SelectItem>)}
          </Select>
        ))}
      </div>
      <div className="bo-inspiration-hub-sortbar">
        {active.length > 0 && (
          <TagGroup aria-label="Active filters"
            onRemove={keys => setFilters(prev => {
              const next = {...prev};
              for (const k of keys) next[k as FilterKey] = ANY;
              return next;
            })}>
            {active.map(f => <Tag key={f.key} id={f.key}>{`${f.label}: ${filters[f.key]}`}</Tag>)}
          </TagGroup>
        )}
        <span className="bo-note" aria-live="polite">{shown.length} {shown.length === 1 ? 'project' : 'projects'}</span>
        <span className="bo-push" />
        <Button variant="quiet" size={32} onPress={() => { setFilters(NO_FILTERS); setQuery(''); }}>Reset filters</Button>
      </div>
      <ul className="bo-inspiration-hub-grid" aria-label="All projects">
        {shown.map(p => card(p))}
      </ul>
      <div className="bo-inspiration-hub-end">
        <Banner>Seems like there are no more projects. Try changing the filters.</Banner>
      </div>
      <GapLegend names={['project images', 'the highlight quote']} />
      <ProjectPreview project={preview} copied={preview ? copied.has(preview.id) : false}
        onCopy={() => { if (preview) copy(preview.id); }} onClose={() => setPreview(null)} />
    </Page>
  );
}

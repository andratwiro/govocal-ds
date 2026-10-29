import {useMemo, useState} from 'react';
import {BadgeCheck, Check, Copy, ExternalLink, Globe, Lightbulb, SearchX, Sparkles, Tag, Users} from 'lucide-react';
import {Avatar, Badge, Banner, Button, Card, EmptyState, FilterChips, type FilterFacet, FilterMenu, type FilterValue,
  IconButton, Modal, Pagination, Panel, PropertyList, PropertyListItem, queue, SearchField, Select, SelectItem,
  TableToolbar, ToastRegion} from 'govocal-ds';
import {Link} from 'govocal-ds/base';
import {COUNTRIES, LIBRARY, METHODS, PHASE_TITLES, POPULATIONS, SORTS, TOPICS, type Country, type LibraryProject} from '../data-inspiration-hub';
import {Gap, GapLegend} from '../Gap';
import {Page} from './Page';

// The real admin's filters (method, city size, country) and topic, as the Filter menu's facets: a facet keeps the
// projects with any of its ticked values, and facets add up, as on every other list (docs/DECISIONS.md).
type FacetId = 'method' | 'country' | 'population' | 'topic';
const facetValues: Record<FacetId, (p: LibraryProject) => readonly string[]> = {
  method: p => p.methods,
  country: p => [p.country],
  population: p => [p.population],
  topic: p => [p.topic]
};
const option = (facet: FacetId) => (id: string) =>
  ({id, label: id, count: LIBRARY.filter(p => facetValues[facet](p).includes(id)).length});
const FACETS: FilterFacet[] = [
  {id: 'method', label: 'Method', icon: <Lightbulb aria-hidden size={16} />, options: METHODS.map(option('method'))},
  {id: 'country', label: 'Country', icon: <Globe aria-hidden size={16} />, options: COUNTRIES.map(option('country'))},
  {id: 'population', label: 'Population', icon: <Users aria-hidden size={16} />, options: POPULATIONS.map(option('population'))},
  {id: 'topic', label: 'Topic', icon: <Tag aria-hidden size={16} />, options: TOPICS.map(option('topic'))}
];
const projectsWord = (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`;
// Every list pages (docs/DECISIONS.md): two rows of three cards.
const PAGE_SIZE = 6;

function initials(platform: string) {
  return platform.replace(/^(City|Town) of /, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function matches(p: LibraryProject, f: FilterValue, query: string) {
  for (const id of Object.keys(facetValues) as FacetId[]) {
    const ticked = f[id];
    if (ticked?.length && !facetValues[id](p).some(v => ticked.includes(v))) return false;
  }
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
      title={<Link onPress={onOpen} className="bo-inspiration-hub-title">{project.title}</Link>}
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
            {copied ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}{copied ? 'Copied' : 'Copy project'}
          </Button>
          {copied && <span className="bo-note">In your drafts</span>}
        </div>
      </div>
    </Card>
  );
}

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});

/** The project's preview: what it asked, its facts as a Property list, how (its phases, one per method). */
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
          <p>{project.summary}</p>
          <PropertyList aria-label="About this project">
            <PropertyListItem label="Platform">
              <span className="bo-inspiration-hub-platform"><Avatar initials={initials(project.platform)} size={24} />{project.platform}</span>
            </PropertyListItem>
            <PropertyListItem label="Country">{project.country}</PropertyListItem>
            <PropertyListItem label="Participants">{`${project.participants.toLocaleString('en')} participants`}</PropertyListItem>
            <PropertyListItem label="Topic">{project.topic}</PropertyListItem>
            <PropertyListItem label="Population">{project.population}</PropertyListItem>
            <PropertyListItem label="Started">{longDate(project.start)}</PropertyListItem>
          </PropertyList>
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
  const [filters, setFilters] = useState<FilterValue>({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<string>(SORTS[0]);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<LibraryProject | null>(null);

  const pinned = LIBRARY.filter(p => p.highlight && p.country === pinCountry);
  const rows = useMemo(() => sortBy(LIBRARY.filter(p => matches(p, filters, query)), sort), [filters, query, sort]);
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const shown = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  // A new search, filter or sort goes back to the first page.
  const fresh = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };
  const clear = () => { setFilters({}); setQuery(''); setPage(1); };

  // Copying is instant: the card says so, and a Toast offers Undo.
  const copy = (p: LibraryProject) => {
    setCopied(prev => new Set(prev).add(p.id));
    queue.add({title: 'Copied to your drafts', description: p.title, action: 'Undo', onAction: () => setCopied(prev => {
      const next = new Set(prev);
      next.delete(p.id);
      return next;
    })}, {timeout: 5000});
  };
  const card = (p: LibraryProject, highlighted?: boolean) => (
    <li key={p.id} className="bo-inspiration-hub-item">
      <ProjectCard project={p} highlighted={highlighted} copied={copied.has(p.id)} onCopy={() => copy(p)} onOpen={() => setPreview(p)} />
    </li>
  );

  const toolbar = (
    <div className="bo-inspiration-hub-toolbar">
      <TableToolbar aria-label="Project tools" heading={projectsWord(rows.length)}>
        <SearchField aria-label="Search projects" placeholder="Search projects" value={query} onChange={fresh(setQuery)} />
        <FilterMenu aria-label="Filter projects" facets={FACETS} value={filters} onChange={fresh(setFilters)} countLabel={projectsWord} />
      </TableToolbar>
      <FilterChips aria-label="Active filters" facets={FACETS} value={filters} onChange={fresh(setFilters)} />
    </div>
  );

  return (
    <Page title="Inspiration hub" description="Browse projects on other platforms for inspiration, and copy one to start your own.">
      <div className="bo-inspiration-hub-stack">
        <Banner>Projects on your platform can show up here for other platforms. To keep one out, contact your success manager.</Banner>

        <Panel title="Highlighted" headingLevel={2} description="Picked by the Go Vocal team, with a word on why."
          actions={
            <Select variant="pill" size={28} prefix="Country:" aria-label="Highlighted for" icon={<Sparkles aria-hidden size={16} />}
              selectedKey={pinCountry} onSelectionChange={k => setPinCountry(k as Country)}>
              {COUNTRIES.map(c => <SelectItem key={c} id={c}>{c}</SelectItem>)}
            </Select>
          }>
          {pinned.length ? (
            <ul className="bo-inspiration-hub-grid" aria-label="Highlighted projects">
              {pinned.map(p => card(p, true))}
            </ul>
          ) : (
            <EmptyState size="panel" icon={<Sparkles size={24} />} headingLevel={3} title="Nothing highlighted here yet"
              description="Highlights for this country appear here as the Go Vocal team picks them." />
          )}
        </Panel>

        <Panel title="All projects" headingLevel={2} toolbar={toolbar}
          actions={
            <Select variant="quiet" prefix="Sort:" aria-label="Sort by" selectedKey={sort} onSelectionChange={k => fresh(setSort)(String(k))}>
              {SORTS.map(s => <SelectItem key={s} id={s}>{s}</SelectItem>)}
            </Select>
          }
          footer={rows.length > 0 && <Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label="Project pages" />}>
          {rows.length ? (
            <ul className="bo-inspiration-hub-grid" aria-label="All projects">
              {shown.map(p => card(p))}
            </ul>
          ) : (
            <EmptyState size="panel" icon={<SearchX size={24} />} headingLevel={3} title="No projects match"
              description="Try another search, or fewer filters."
              action={<Button variant="secondary" size={32} onPress={clear}>Clear search and filters</Button>} />
          )}
        </Panel>
        <GapLegend names={['project images', 'the highlight quote']} />
      </div>
      <ProjectPreview project={preview} copied={preview ? copied.has(preview.id) : false}
        onCopy={() => { if (preview) copy(preview); }} onClose={() => setPreview(null)} />
      <ToastRegion />
    </Page>
  );
}

import {useMemo, useState} from 'react';
import {BadgeCheck, Check, Copy, ExternalLink, Globe, Lightbulb, SearchX, Sparkles, Tag, Users} from 'lucide-react';
import {Avatar, Badge, Banner, Button, Card, EmptyState, FilterChips, type FilterFacet, FilterMenu, type FilterValue,
  IconButton, Link, Modal, Pagination, Panel, PropertyList, PropertyListItem, SearchField, Select, SelectItem,
  Inline, Stack, TableToolbar, Text, TileGrid, toast} from 'govocal-ds';
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
  {id: 'method', label: 'Method', icon: <Lightbulb aria-hidden size={16} />, items: METHODS.map(option('method'))},
  {id: 'country', label: 'Country', icon: <Globe aria-hidden size={16} />, items: COUNTRIES.map(option('country'))},
  {id: 'population', label: 'Population', icon: <Users aria-hidden size={16} />, items: POPULATIONS.map(option('population'))},
  {id: 'topic', label: 'Topic', icon: <Tag aria-hidden size={16} />, items: TOPICS.map(option('topic'))}
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
  const participants = project.participants.toLocaleString('en');
  return (
    <Card
      layout="stacked"
      media={<img src={project.picture} alt="" />}
      title={<Link onPress={onOpen}>{project.title}</Link>}
      actions={<IconButton aria-label={`Preview: ${project.title}`} onPress={onOpen}><ExternalLink aria-hidden size={16} /></IconButton>}>
      <Stack gap="12">
        <Inline gap="8" justifyContent="space-between">
          <Inline gap="6">
            <Avatar initials={initials(project.platform)} size={24} />
            <Text kind="small" color="meta">{project.platform} · {project.country}</Text>
          </Inline>
          <Text kind="small" color="meta" aria-label={`${participants} participants`}>
            <Inline elementType="span" gap="6"><Users aria-hidden size={14} />{participants}</Inline>
          </Text>
        </Inline>
        {highlighted && project.highlight && (
          <Gap name="Quote" inline><blockquote className="bo-inspiration-hub-quote">{project.highlight}</blockquote></Gap>
        )}
        <Inline gap="8">
          {highlighted && <Badge icon={<BadgeCheck aria-hidden size={14} />}>Highlighted</Badge>}
          {project.methods.map(m => <Badge key={m}>{m}</Badge>)}
        </Inline>
        <Inline gap="12">
          <Button variant="secondary" size={32} isDisabled={copied} onPress={onCopy}>
            {copied ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}{copied ? 'Copied' : 'Copy project'}
          </Button>
          {copied && <Text kind="small" color="meta">In your drafts</Text>}
        </Inline>
      </Stack>
    </Card>
  );
}

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'});

/** The project's preview: what it asked, its facts as a Property list, how (its phases, one per method). */
function ProjectPreview({project, copied, onCopy, onClose}: {project: LibraryProject | null; copied: boolean; onCopy: () => void; onClose: () => void}) {
  return (
    <Modal title={project?.title ?? 'Project'} width="wide" isOpen={project !== null} onOpenChange={o => { if (!o) onClose(); }}
      footer={<>
        <Button variant="secondary" slot="close">Close</Button>
        <Button variant="primary" isDisabled={copied} onPress={() => { onCopy(); onClose(); }}>
          <Copy aria-hidden size={16} />{copied ? 'Copied' : 'Copy project'}
        </Button>
      </>}>
      {project && (
        <Stack gap="12">
          <Text elementType="p" kind="ui">{project.summary}</Text>
          <PropertyList aria-label="About this project">
            <PropertyListItem label="Platform">
              <Inline gap="6"><Avatar initials={initials(project.platform)} size={24} />{project.platform}</Inline>
            </PropertyListItem>
            <PropertyListItem label="Country">{project.country}</PropertyListItem>
            <PropertyListItem label="Participants">{`${project.participants.toLocaleString('en')} participants`}</PropertyListItem>
            <PropertyListItem label="Topic">{project.topic}</PropertyListItem>
            <PropertyListItem label="Population">{project.population}</PropertyListItem>
            <PropertyListItem label="Started">{longDate(project.start)}</PropertyListItem>
          </PropertyList>
          <Text elementType="h3" kind="body" isStrong color="primary">Phases</Text>
          <Stack elementType="ol" gap="8">
            {project.methods.map((m, i) => (
              <Inline key={m} elementType="li" gap="12">
                <Text kind="small" color="meta">{`Phase ${i + 1}`}</Text><span>{PHASE_TITLES[m]}</span><Badge>{m}</Badge>
              </Inline>
            ))}
          </Stack>
        </Stack>
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
    toast('Copied to your drafts', p.title, {action: 'Undo', onAction: () => setCopied(prev => {
      const next = new Set(prev);
      next.delete(p.id);
      return next;
    })});
  };
  const card = (p: LibraryProject, highlighted?: boolean) => (
    <li key={p.id} className="bo-inspiration-hub-item">
      <ProjectCard project={p} highlighted={highlighted} copied={copied.has(p.id)} onCopy={() => copy(p)} onOpen={() => setPreview(p)} />
    </li>
  );

  const toolbar = (
    <Stack gap="8">
      <TableToolbar aria-label="Project tools" heading={projectsWord(rows.length)}>
        <SearchField aria-label="Search projects" placeholder="Search projects" value={query} onChange={fresh(setQuery)} />
        <FilterMenu aria-label="Filter projects" facets={FACETS} value={filters} onChange={fresh(setFilters)} countLabel={projectsWord} />
      </TableToolbar>
      <FilterChips aria-label="Active filters" facets={FACETS} value={filters} onChange={fresh(setFilters)} />
    </Stack>
  );

  return (
    <Page title="Inspiration hub" description="Browse projects on other platforms for inspiration, and copy one to start your own.">
      <Stack gap="16">
        <Banner>Projects on your platform can show up here for other platforms. To keep one out, contact your success manager.</Banner>

        <Panel title="Highlighted" headingLevel={2} description="Picked by the Go Vocal team, with a word on why."
          actions={
            <Select variant="pill" size={28} prefix="Country:" aria-label="Highlighted for" icon={<Sparkles aria-hidden size={16} />}
              selectedKey={pinCountry} onSelectionChange={k => setPinCountry(k as Country)}>
              {COUNTRIES.map(c => <SelectItem key={c} id={c}>{c}</SelectItem>)}
            </Select>
          }>
          {pinned.length ? (
            <TileGrid elementType="ul" layout="gallery" aria-label="Highlighted projects">
              {pinned.map(p => card(p, true))}
            </TileGrid>
          ) : (
            <EmptyState layout="panel" icon={<Sparkles size={24} />} headingLevel={3} title="Nothing highlighted here yet"
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
            <TileGrid elementType="ul" layout="gallery" aria-label="All projects">
              {shown.map(p => card(p))}
            </TileGrid>
          ) : (
            <EmptyState layout="panel" icon={<SearchX size={24} />} headingLevel={3} title="No projects match"
              description="Try another search, or fewer filters."
              actions={<Button variant="secondary" size={32} onPress={clear}>Clear search and filters</Button>} />
          )}
        </Panel>
        <GapLegend names={['the highlight quote']} />
      </Stack>
      <ProjectPreview project={preview} copied={preview ? copied.has(preview.id) : false}
        onCopy={() => { if (preview) copy(preview); }} onClose={() => setPreview(null)} />
    </Page>
  );
}

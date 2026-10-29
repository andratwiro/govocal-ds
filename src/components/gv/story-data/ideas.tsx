// Invented data for the table stories (Data table, Table toolbar, Panel): the Manage tab's ideas, its batch actions
// and its export menu. Nobody and nowhere real; the facets are the Filter menu's own (`IDEA_FACETS`).
import {CircleCheck, Copy, Download, MessageSquareText, Tag, TriangleAlert, User} from 'lucide-react';
import {MenuTrigger} from 'react-aria-components/Menu';
import {Menu, MenuItem} from '../../Menu';
import {Separator} from '../../Separator';
import {Popover} from '../../Popover';
import {Tooltip, TooltipTrigger} from '../../Tooltip';
import {IconButton} from '../IconButton';
import {PICTURES} from '../story-images';
import type {FilterValue} from '../../../patterns/FilterMenu';
import type {SelectionAction} from '../../../patterns/SelectionBar';

export interface Idea {
  id: string;
  title: string;
  author: string;
  picture?: string;
  /** A manager's name; none = unassigned. */
  assignee?: string;
  tags: string[];
  status: string;
  source: 'online' | 'imported';
  reply: 'awaiting' | 'replied';
  likes: number;
  comments: number;
  /** ISO date. */
  published: string;
  /** Came in since the manager last looked. */
  isNew?: boolean;
  /** Content warnings the moderation flagged. */
  warnings?: number;
}

const TITLES = [
  'More benches along the river walk', 'Plant trees on the high street', 'A protected bike lane to the station',
  'A mural on the underpass', 'Longer library hours at weekends', 'Brighter lights in the park at night',
  'A playground for older children', 'Water fountains in the main square', 'Car-free Sundays in the old town',
  'Covered bike parking at schools', 'A community garden on the empty lot', 'Safer crossing by the primary school',
  'Recycling bins for every street', 'Outdoor gym equipment in the park', 'Shade sails over the market',
  'A dog park near the stadium', 'Free wifi in public buildings', 'More frequent night buses',
  'A skate park by the sports centre', 'Wildflower verges instead of mowing', 'Public toilets at the beach',
  'Repair café in the community centre', 'Wider pavements on Station Road', 'A weekly farmers market',
  'Bike repair stands at the station', 'Swap shelves in every library', 'Quiet hours at the swimming pool',
  'Picnic tables by the lake', 'Ramps at every bus stop', 'A youth council for the district',
  'Street parties once a summer', 'A cinema night in the square', 'Lower speed limits near schools',
  'Solar panels on public roofs', 'Bird boxes in the cemetery trees', 'A tool library for neighbours',
  'Bring back the Saturday tram', 'Seating at the health centre', 'Drinking water at the playgrounds',
  'An open-air reading room'
];
const TAGS = ['Cycling', 'Environment', 'Public space', 'Transport', 'Safety', 'Housing', 'Culture'];
const STATUSES = ['Proposed', 'Viewed', 'Under consideration', 'Accepted', 'Rejected', 'Implemented'];
const MANAGERS = ['Manager A', 'Manager B', 'Manager C'];
const PICTURE_LIST = Object.values(PICTURES);

/** Forty ideas, newest first. Every third one has a picture; some have no assignee, some have many tags. */
export const IDEAS: Idea[] = TITLES.map((title, i) => ({
  id: `idea-${i + 1}`,
  title,
  author: `Resident ${String.fromCharCode(65 + (i * 7) % 26)}`,
  picture: i % 3 === 0 ? PICTURE_LIST[(i / 3) % PICTURE_LIST.length] : undefined,
  assignee: i % 4 === 1 ? undefined : MANAGERS[i % 3],
  tags: TAGS.filter((_, t) => (i + t * 3) % 5 === 0 || (i % 7 === 0 && t < 4)),
  status: STATUSES[(i * 5) % STATUSES.length],
  source: i % 9 === 4 ? 'imported' : 'online',
  reply: i % 3 === 2 ? 'replied' : 'awaiting',
  likes: (i * 37 + 11) % 90,
  comments: (i * 13 + 3) % 24,
  published: new Date(Date.UTC(2026, 9, 28) - i * 86400000 * 1.6).toISOString().slice(0, 10),
  isNew: i < 5,
  warnings: i % 11 === 3 ? 1 + (i % 2) : undefined
}));

const facetOf = (idea: Idea, facet: string): string[] => {
  switch (facet) {
    case 'source': return [idea.source];
    case 'status': return [idea.status];
    case 'assignee': return [idea.assignee ?? 'Unassigned'];
    case 'tags': return idea.tags;
    case 'reply': return [idea.reply];
    default: return [];
  }
};

/** The quick views on the Manage tab's stats row, each a key-only chip once it's on. */
export const METRICS = {
  new: {label: 'New ideas', test: (idea: Idea) => !!idea.isNew},
  unassigned: {label: 'Unassigned', test: (idea: Idea) => !idea.assignee},
  warnings: {label: 'Content warnings', test: (idea: Idea) => !!idea.warnings}
} as const;
export type Metric = keyof typeof METRICS;

/** The ideas that pass the search, every facet that is on (any of its values) and the metric. */
export function filterIdeas(ideas: Idea[], {query = '', value = {}, metric}: {query?: string; value?: FilterValue; metric?: Metric}) {
  const q = query.trim().toLowerCase();
  return ideas.filter(idea =>
    (!q || idea.title.toLowerCase().includes(q) || idea.author.toLowerCase().includes(q)) &&
    Object.entries(value).every(([facet, ids]) => !ids.length || facetOf(idea, facet).some(v => ids.includes(v))) &&
    (!metric || METRICS[metric].test(idea)));
}

export const ideaCount = (n: number) => `${n.toLocaleString('en')} ${n === 1 ? 'idea' : 'ideas'}`;

const ic = (Icon: typeof Tag) => <Icon aria-hidden size={16} />;
const menu = (label: string, items: string[]) => (
  <Menu aria-label={label}>{items.map(i => <MenuItem key={i} id={i}>{i}</MenuItem>)}</Menu>
);

/** The Manage tab's batch actions. */
export const IDEA_ACTIONS: SelectionAction[] = [
  {id: 'status', label: 'Status', icon: ic(CircleCheck), menu: menu('Status', STATUSES)},
  {id: 'assign', label: 'Assign', icon: ic(User), menu: menu('Assign', ['Unassigned', ...MANAGERS])},
  {id: 'tags', label: 'Tags', icon: ic(Tag), menu: menu('Tags', TAGS)},
  {id: 'copy', label: 'Copy to phase', icon: ic(Copy), menu: menu('Copy to phase', ['Shortlist proposals', 'Community vote'])},
  {id: 'update', label: 'Official update', icon: ic(MessageSquareText)}
];

/** Shown after the others while the content-warnings view is on. */
export const DISMISS_WARNINGS: SelectionAction = {id: 'dismiss-warnings', label: 'Dismiss warnings', icon: ic(TriangleAlert)};

/**
 * The export button in a table's tools: a bordered download icon (tooltip "Export") opening the formats, the real
 * admin's three exports. "Selected ideas" waits for a selection.
 */
export function ExportMenu({selected = 0, onExport}: {selected?: number; onExport?: (what: string) => void}) {
  return (
    <MenuTrigger>
      <TooltipTrigger>
        <IconButton variant="bordered" tone="strong" aria-label="Export"><Download aria-hidden size={16} /></IconButton>
        <Tooltip>Export</Tooltip>
      </TooltipTrigger>
      <Popover placement="bottom end" showArrow={false}>
        <Menu aria-label="Export" onAction={key => onExport?.(String(key))} disabledKeys={selected ? [] : ['selected']}>
          <MenuItem id="ideas">All ideas (.xlsx)</MenuItem>
          <MenuItem id="comments">All comments (.xlsx)</MenuItem>
          <Separator />
          <MenuItem id="selected">Selected ideas (.xlsx)</MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

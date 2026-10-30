'use client';
import {useState, type ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {Ellipsis} from 'lucide-react';
import clsx from 'clsx';
import {Button} from '../Button';
import {Menu, MenuItem, MenuTrigger} from '../Menu';
import type {PlacementProps} from '../className';
import {useNumberFormatter} from '../format';
import {mergeLabels, type CountLabel} from '../labels';
import {IconButton} from './IconButton';
import {ItemChip, type ItemChipStatus} from './ItemChip';
import {Pagination, paginationLabels, type PaginationLabels} from './Pagination';
import './ActivityFeed.css';

/** The words Activity feed says itself (docs/API.md rule 11), and its pager's. */
export interface ActivityFeedLabels extends PaginationLabels {
  /** After the time on the version you are looking at. */
  showingNow: string;
  /** The prompt quote's toggle. */
  showPrompt: string;
  hidePrompt: string;
  /** The changes' toggle, given how many. */
  showChanges: CountLabel;
  hideChanges: string;
  /** The ⋯ menu's name and its one item. */
  more: string;
  restore: string;
  /** The button at the foot that loads older entries. */
  showOlder: string;
  /** Said when there is nothing yet. */
  empty: string;
}

/** Activity feed's English words; a page passes its own over them with `labels`. */
export const activityFeedLabels: ActivityFeedLabels = {
  ...paginationLabels,
  showingNow: 'Showing now',
  showPrompt: 'Show full prompt',
  hidePrompt: 'Show less',
  showChanges: (count, n) => (count === 1 ? 'Show the change' : `Show ${n} changes`),
  hideChanges: 'Hide the changes',
  more: 'More',
  restore: 'Restore this version',
  showOlder: 'Show older',
  empty: 'No changes yet. Each save adds a version here.'
};

/** One item a version changed, drawn as an Item chip. */
export interface ActivityChange {
  id: string;
  /** The item's name ("Votes per cycle lane route"). */
  label: string;
  /** Its kind, as a Lucide icon, `aria-hidden`. */
  icon?: ReactNode;
  /** added, removed or renamed; none: changed. */
  status?: ItemChipStatus;
  /** A renamed item's old name. */
  previousLabel?: string;
}

/** One version in the feed. */
export interface ActivityEntry {
  id: string;
  /** The day group it falls in, as the page writes it ("Today", "Yesterday", "28 October"). Entries come newest
   * first; a new value starts a new group. */
  day: string;
  /** Who did it: "You", a person's name, "Assistant". Bold, before `action`. */
  actor: string;
  /** What they did: "edited 2 widgets", "changed the report". */
  action: ReactNode;
  /** When, formatted by the page ("Today, 10:12 to 10:19"), and any more meta ("asked by Resident A"). */
  time: string;
  /** The actor's Avatar, 28. */
  avatar?: ReactNode;
  /** The version on the page now: "Showing now" after the time, and no Restore. */
  isCurrent?: boolean;
  /** An assistant's run: the AI tint and an accent edge at the start. */
  isAssistant?: boolean;
  /** The prompt the run answered, quoted, three lines until "Show full prompt". */
  prompt?: string;
  /** The run's count: "142 changed, 3 added, 1 removed". */
  summary?: string;
  /** The items it changed, as chips; more than a page sit behind "Show N changes" with a pager. */
  changes?: ActivityChange[];
  /** A muted line under the chips ("One of these widgets is no longer in the report."). */
  note?: string;
}

export interface ActivityFeedProps extends PlacementProps {
  /** The versions, newest first. None: the empty line. */
  items: ActivityEntry[];
  /** Restore a version: a ⋯ menu on every entry but the current one. No menu without it. */
  onRestore?: (id: string) => void;
  /** A change chip pressed: the page shows that item (scrolls to it, flashes it). A removed item can't be pressed. */
  onChangePress?: (entryId: string, changeId: string) => void;
  /** Load older versions: a "Show older" button at the foot. */
  onShowOlder?: () => void;
  /** How many change chips show at once; more go behind a toggle and a pager. @default 10 */
  changesPerPage?: number;
  /** The day headings' level. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Its own words, over `activityFeedLabels`. */
  labels?: Partial<ActivityFeedLabels>;
}

/**
 * Activity feed: a document's version history, newest first, grouped by day. Each entry: the actor's Avatar, who
 * did what, when, and "Showing now" on the version on the page. An assistant's run sits on the AI tint with its
 * prompt quoted (three lines, then "Show full prompt") and a count of what it changed. The items a version changed
 * are Item chips (added, removed, renamed), paged when there are many. A ⋯ menu restores an older version. Shared
 * by the report builder and the survey editor. Not in Figma.
 *
 * ```tsx
 * <ActivityFeed items={versions} onRestore={restore} onChangePress={(v, c) => reveal(c)} onShowOlder={loadOlder} />
 * ```
 */
export function ActivityFeed({
  items, onRestore, onChangePress, onShowOlder, changesPerPage = 10, headingLevel = 3, labels, className, style
}: ActivityFeedProps) {
  const l = mergeLabels(activityFeedLabels, labels);
  const Heading = `h${headingLevel}` as const;
  const days: {day: string; entries: ActivityEntry[]}[] = [];
  for (const e of items) {
    const last = days.at(-1);
    if (last && last.day === e.day) last.entries.push(e);
    else days.push({day: e.day, entries: [e]});
  }
  return (
    <div className={clsx('gv-activity-feed', className)} style={style}>
      {items.length === 0 && <p className="gv-activity-feed__empty">{l.empty}</p>}
      {days.map(({day, entries}) => (
        <section key={day} className="gv-activity-feed__day">
          <Heading className="gv-activity-feed__day-title">{day}</Heading>
          <ol className="gv-activity-feed__list">
            {entries.map(e => (
              <ActivityFeedEntry key={e.id} entry={e} labels={l} perPage={changesPerPage}
                onRestore={onRestore && !e.isCurrent ? () => onRestore(e.id) : undefined}
                onChangePress={onChangePress ? c => onChangePress(e.id, c) : undefined} />
            ))}
          </ol>
        </section>
      ))}
      {onShowOlder && items.length > 0 && (
        <div className="gv-activity-feed__older">
          <Button variant="secondary" size={32} onPress={onShowOlder}>{l.showOlder}</Button>
        </div>
      )}
    </div>
  );
}

function ActivityFeedEntry({entry: e, labels: l, perPage, onRestore, onChangePress}: {
  entry: ActivityEntry; labels: ActivityFeedLabels; perPage: number; onRestore?: () => void;
  onChangePress?: (changeId: string) => void;
}) {
  const number = useNumberFormatter();
  const [promptOpen, setPromptOpen] = useState(false);
  const changes = e.changes ?? [];
  const isPaged = changes.length > perPage;
  const [changesOpen, setChangesOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(changes.length / perPage);
  const shown = !isPaged ? changes : changesOpen ? changes.slice((page - 1) * perPage, page * perPage) : [];
  return (
    <li className="gv-activity-feed__entry" data-assistant={e.isAssistant || undefined} data-menu={onRestore ? true : undefined}>
      <span className="gv-activity-feed__avatar">{e.avatar}</span>
      <div className="gv-activity-feed__main">
        <p className="gv-activity-feed__title"><strong>{e.actor}</strong> {e.action}</p>
        <p className="gv-activity-feed__meta">
          <span>{e.time}</span>
          {e.isCurrent && <span className="gv-activity-feed__now">{l.showingNow}</span>}
        </p>
        {e.prompt && (
          <blockquote className="gv-activity-feed__prompt" data-open={promptOpen || undefined}>
            <p><q>{e.prompt}</q></p>
          </blockquote>
        )}
        {e.summary && <p className="gv-activity-feed__summary">{e.summary}</p>}
        {(e.prompt || isPaged) && (
          <div className="gv-activity-feed__toggles">
            {e.prompt && (
              <RACButton className="gv-activity-feed__toggle" aria-expanded={promptOpen} onPress={() => setPromptOpen(o => !o)}>
                {promptOpen ? l.hidePrompt : l.showPrompt}
              </RACButton>
            )}
            {isPaged && (
              <RACButton className="gv-activity-feed__toggle" aria-expanded={changesOpen} onPress={() => setChangesOpen(o => !o)}>
                {changesOpen ? l.hideChanges : l.showChanges(changes.length, number.format(changes.length))}
              </RACButton>
            )}
          </div>
        )}
        {isPaged && changesOpen && (
          <div className="gv-activity-feed__pager">
            <Pagination pageCount={pageCount} page={page} onPageChange={setPage} labels={l} />
          </div>
        )}
        {shown.length > 0 && (
          <ul className="gv-activity-feed__changes">
            {shown.map(c => (
              <li key={c.id}>
                <ItemChip label={c.label} icon={c.icon} status={c.status} previousLabel={c.previousLabel}
                  onPress={onChangePress ? () => onChangePress(c.id) : undefined} />
              </li>
            ))}
          </ul>
        )}
        {e.note && <p className="gv-activity-feed__summary">{e.note}</p>}
      </div>
      {onRestore && (
        <MenuTrigger placement="bottom end">
          <IconButton aria-label={l.more} size={24}><Ellipsis aria-hidden size={16} /></IconButton>
          <Menu aria-label={l.more} onAction={() => onRestore()}>
            <MenuItem id="restore">{l.restore}</MenuItem>
          </Menu>
        </MenuTrigger>
      )}
    </li>
  );
}

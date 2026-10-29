'use client';
import {
  Cell as AriaCell,
  type CellProps as AriaCellProps,
  Collection,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  Row as AriaRow,
  type RowProps as AriaRowProps,
  Table as AriaTable,
  TableBody as AriaTableBody,
  type TableBodyProps,
  TableHeader as AriaTableHeader,
  type TableHeaderProps as AriaTableHeaderProps,
  type TableProps as AriaTableProps,
  useTableOptions
} from 'react-aria-components/Table';
import type {Key, Selection} from 'react-aria-components';
import {ArrowDown, ArrowUp, MoreHorizontal, Plus} from 'lucide-react';
import {clsx} from 'clsx';
import {createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import {Checkbox} from './Checkbox';
import {Avatar} from './Avatar';
import {Badge} from './Badge';
import {IconButton} from './IconButton';
import {Menu, MenuTrigger} from '../Menu';
import './DataTable.css';

/**
 * The back office's data table (the prototype's `gv-bo-table is-list`): quiet small headers over a hairline,
 * hairline-divided rows with no zebra, an arrow on the sorted column (and on a sortable one under the pointer), a
 * soft hover, a gv Checkbox column when the table is selectable, and a trailing "…" options column. React Aria's
 * Table underneath: sorting (`sortDescriptor` / `onSortChange`), selection (`selectionMode`, `selectedKeys`), row
 * actions (`onRowAction`), keyboard grid navigation.
 *
 * **Bulk selection and an open row live together.** `selectionMode` alone decides the check column (there is no
 * `selectionBehavior` to set). With `onRowAction`, pressing a row (click, tap, Enter) always opens it, whether or not
 * rows are ticked; only the checkbox, Space, or a Shift / ⌘ / Ctrl click tick it. `openKey` marks the row shown beside
 * the table (in a Side panel): a tint, a bar at its start edge, `data-open` and `aria-current="true"`. The "With bulk
 * selection and an open row" story is the recipe.
 *
 * The phase Manage tab's input table is the same component, `density="compact"` with `showChecksOnHover` and an
 * `addColumn` control: dense rows that grow with wrapping text, checkboxes that appear on hover or once checked,
 * and a trailing "+" in the header. Cells: `DataTableText` (with a `DataTableThumbnail`), `DataTablePerson`,
 * `DataTableAssignee`, `DataTableTags`, `DataTableStack`, `DataTableOptions`. Around it: a `Panel` frames it, a
 * `TableToolbar` holds its count, search and filters, `Pagination` sits in the Panel's foot (the `InAPanel` story).
 *
 * `className` and `style` place the table (width, margin, grid area); they never paint it. The header, body,
 * columns, rows and cells take no class: the table lays them out (`width` on a column, `align` on a cell).
 */

/** How a column's content lines up. `number`: counts (centred, tabular figures); `options`: the trailing "…". */
export type DataTableAlign = 'start' | 'number' | 'options';

/**
 * React Aria's selection as a Set of keys: `'all'` (the header's select-all) becomes every key in `allKeys`.
 * `allKeys` is what "all" means on the page: the rows shown, or the rows shown plus the ones already ticked on
 * other pages (`[...selected, ...rows.map(r => r.id)]`).
 */
export function toKeySet<K extends Key = Key>(selection: Selection, allKeys: Iterable<K>): Set<K> {
  return new Set(selection === 'all' ? allKeys : (selection as Iterable<K>));
}

export interface DataTableProps extends Omit<AriaTableProps, 'className' | 'style' | 'selectionBehavior' | 'onRowAction'> {
  /** Places the table (width, margin, grid area); never paints it. Merged with the table's own class. */
  className?: string;
  /** Places the table, like `className`. */
  style?: CSSProperties;
  /**
   * A table standing on its own (not inside a Card or Panel): a 1px card border, rounded corners and a tinted
   * header row, as the prototype's Projects list. Inside a Card or Panel, leave it off: that is the frame.
   *
   * @default false
   */
  isFramed?: boolean;
  /**
   * `compact`: the prototype's Manage input table: 9px row padding, 18px lines, every cell top-aligned to the first
   * line of wrapping text, 8px edges.
   *
   * @default 'default'
   */
  density?: 'default' | 'compact';
  /**
   * Row checkboxes show only on a hovered, focused or checked row, and the header's select-all only while the
   * table is hovered or focused, or something is selected: dimmed until it is hovered itself, filled (or
   * indeterminate) once rows are checked (the prototype's Manage table).
   *
   * @default false
   */
  showChecksOnHover?: boolean;
  /**
   * A trailing header control for adding columns, e.g. `<DataTableAddColumn>`. Rows get a matching empty cell.
   */
  addColumn?: ReactNode;
  /**
   * Called with a row's key when the row is pressed: a click or tap anywhere but its checkbox, or Enter. With bulk
   * selection on (`selectionMode`), a press still opens the row; the checkbox, Space and Shift / ⌘ / Ctrl clicks
   * tick it. A row's own `onAction` runs too.
   */
  onRowAction?: (key: Key) => void;
  /**
   * The row open beside the table, e.g. the record a Side panel shows: it gets a tint, a bar at its start edge,
   * `data-open` and `aria-current="true"`. Rows need an `id` for it.
   */
  openKey?: Key | null;
}

interface RowEntry {
  key: Key;
  onAction?: () => void;
}

interface DataTableState {
  addColumn?: ReactNode;
  showChecksOnHover?: boolean;
  /** Bulk selection is on and the table reads row presses itself (see DataTable): rows keep their action here. */
  readsPresses: boolean;
  rows: Map<string, RowEntry>;
  onRowAction?: (key: Key) => void;
  openKey?: Key | null;
}

const DataTableContext = createContext<DataTableState>({readsPresses: false, rows: new Map()});

/** What started the change React Aria reports next: a press on a row (or on its check cell), or a key. */
interface PressOrigin {
  kind: 'pointer' | 'virtual' | 'key';
  pointerType?: string;
  key?: string;
  /** The row pressed, by its React Aria key. */
  row?: Key;
  /** In the check column (the checkbox or its cell), or the header. */
  isCheck: boolean;
  /** Shift, ⌘ or Ctrl: the press extends or toggles the selection. */
  hasModifier: boolean;
}

export function DataTable({
  className, style, isFramed, density, showChecksOnHover, addColumn, onRowAction, openKey,
  selectionMode = 'none', selectedKeys, defaultSelectedKeys, onSelectionChange, ...props
}: DataTableProps) {
  const ref = useRef<HTMLTableElement>(null);
  const rows = useRef(new Map<string, RowEntry>()).current;
  const origin = useRef<PressOrigin | null>(null);
  // A mouse press opens on release, as React Aria's own row actions do: the row waits here until its click.
  const pendingOpen = useRef<Key | null>(null);
  const readsPresses = selectionMode !== 'none';

  // Selection held here when the page doesn't control it, so a press React Aria reads as a tick can open instead.
  const [own, setOwn] = useState<Selection>(() => defaultSelectedKeys === 'all' ? 'all' : new Set(defaultSelectedKeys ?? []));
  const selection = selectedKeys ?? own;

  const actionOf = (key: Key) => {
    const own = rows.get(String(key))?.onAction;
    if (!own && !onRowAction) return undefined;
    return () => { own?.(); onRowAction?.(key); };
  };
  const latest = useRef({actionOf});
  latest.current = {actionOf};

  // React Aria's checkbox selection turns every row press into a tick once anything is ticked. The table listens
  // before React Aria does (capture), notes where each press or key started, and turns a plain row press back into
  // an open in `select` below.
  useEffect(() => {
    const table = ref.current;
    if (!table || !readsPresses) return;
    const rowOf = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest<HTMLElement>('.gv-data-table__row') : null;
      if (!el || el.closest('.gv-data-table') !== table) return undefined;
      const dom = el.dataset.key;
      return dom == null ? undefined : rows.get(dom)?.key ?? dom;
    };
    const isCheck = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('.gv-data-table__check, .gv-data-table__header'));
    const onPointerDown = (e: PointerEvent) => {
      pendingOpen.current = null;
      origin.current = {kind: 'pointer', pointerType: e.pointerType, row: rowOf(e.target), isCheck: isCheck(e.target),
        hasModifier: e.shiftKey || e.metaKey || e.ctrlKey};
    };
    const onKeyDown = (e: KeyboardEvent) => {
      origin.current = {kind: 'key', key: e.key, row: rowOf(e.target), isCheck: isCheck(e.target),
        hasModifier: e.shiftKey || e.metaKey || e.ctrlKey};
    };
    const onClick = (e: MouseEvent) => {
      const row = rowOf(e.target);
      if (pendingOpen.current != null) {
        const key = pendingOpen.current;
        pendingOpen.current = null;
        if (row === key) latest.current.actionOf(key)?.();
        return;
      }
      // A click with no press before it: a screen reader's, which React Aria handles on this click.
      if (e.detail === 0) origin.current = {kind: 'virtual', row, isCheck: isCheck(e.target), hasModifier: false};
    };
    table.addEventListener('pointerdown', onPointerDown, true);
    table.addEventListener('keydown', onKeyDown, true);
    table.addEventListener('click', onClick, true);
    return () => {
      table.removeEventListener('pointerdown', onPointerDown, true);
      table.removeEventListener('keydown', onKeyDown, true);
      table.removeEventListener('click', onClick, true);
    };
  }, [readsPresses, rows]);

  // React Aria passes only data-* and events to a row, so the open row (`data-open`) says so to assistive tech here:
  // `aria-current="true"`, kept in step as rows change. (Not a ref on the row: a new ref each render breaks React
  // Aria's arrow-key focus.)
  useEffect(() => {
    const table = ref.current;
    if (!table) return;
    const mark = () => table.querySelectorAll<HTMLElement>('.gv-data-table__row').forEach(row => {
      if (row.closest('.gv-data-table') !== table) return;
      const isOpen = row.hasAttribute('data-open');
      if (isOpen === (row.getAttribute('aria-current') === 'true')) return;
      if (isOpen) row.setAttribute('aria-current', 'true');
      else row.removeAttribute('aria-current');
    });
    mark();
    const watch = new MutationObserver(mark);
    watch.observe(table, {subtree: true, childList: true, attributeFilter: ['data-open']});
    return () => watch.disconnect();
  }, []);

  const select = (next: Selection) => {
    const from = origin.current;
    origin.current = null;
    const opens = from && from.row != null && !from.isCheck && !from.hasModifier &&
      (from.kind !== 'key' || from.key === 'Enter');
    const action = opens ? actionOf(from.row!) : undefined;
    if (action) {
      if (from!.kind === 'pointer' && from!.pointerType === 'mouse') pendingOpen.current = from!.row!;
      else action();
      return;
    }
    if (selectedKeys === undefined) setOwn(next);
    onSelectionChange?.(next);
  };

  return (
    <DataTableContext.Provider value={{addColumn, showChecksOnHover, readsPresses, rows, onRowAction, openKey}}>
      <AriaTable {...props} ref={ref} className={clsx('gv-data-table', className)} style={style}
        selectionMode={selectionMode} selectionBehavior="toggle"
        selectedKeys={readsPresses ? selection : selectedKeys} defaultSelectedKeys={readsPresses ? undefined : defaultSelectedKeys}
        onSelectionChange={readsPresses ? select : onSelectionChange}
        onRowAction={readsPresses ? undefined : onRowAction}
        data-framed={isFramed || undefined}
        data-density={density === 'compact' ? 'compact' : undefined}
        data-checks-on-hover={showChecksOnHover || undefined} />
    </DataTableContext.Provider>
  );
}

export interface DataTableHeaderProps<T> extends Omit<AriaTableHeaderProps<T>, 'className'> {
  /**
   * In a multiple-selection table, the header's check column carries a "select all" checkbox. Turn it off when the
   * page already has its own select-all control (e.g. a toolbar "Select" checkbox), so there is only one.
   *
   * @default true
   */
  showSelectAll?: boolean;
}

export function DataTableHeader<T extends object>({columns, children, showSelectAll = true, ...props}: DataTableHeaderProps<T>) {
  const {selectionMode} = useTableOptions();
  const {addColumn, showChecksOnHover} = useContext(DataTableContext);
  return (
    <AriaTableHeader {...props} className="gv-data-table__header">
      {selectionMode !== 'none' && (
        <AriaColumn className="gv-data-table__column gv-data-table__check" textValue="Selection">
          {selectionMode === 'multiple' && showSelectAll
            ? <Checkbox slot="selection" isQuiet={showChecksOnHover} />
            : <span className="gv-data-table__hidden">Selection</span>}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
      {addColumn ? (
        <AriaColumn className="gv-data-table__column gv-data-table__add" textValue="Add column">{addColumn}</AriaColumn>
      ) : null}
    </AriaTableHeader>
  );
}

export interface DataTableColumnProps extends Omit<AriaColumnProps, 'children' | 'className'> {
  children?: ReactNode;
  /** @default 'start' */
  align?: DataTableAlign;
  /**
   * Show the label. `false` hides it visually; it stays the column's accessible name (e.g. the options column).
   *
   * @default true
   */
  showLabel?: boolean;
}

export function DataTableColumn({children, align = 'start', showLabel = true, ...props}: DataTableColumnProps) {
  return (
    <AriaColumn {...props} className="gv-data-table__column" data-align={align}>
      {({allowsSorting, sortDirection}) => (
        <span className="gv-data-table__head">
          <span className={showLabel ? undefined : 'gv-data-table__hidden'}>{children}</span>
          {allowsSorting && (
            <span className="gv-data-table__sort" data-active={sortDirection ? true : undefined} aria-hidden>
              {sortDirection === 'descending' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
            </span>
          )}
        </span>
      )}
    </AriaColumn>
  );
}

export interface DataTableBodyProps<T> extends Omit<TableBodyProps<T>, 'className'> {}

export function DataTableBody<T extends object>(props: DataTableBodyProps<T>) {
  return <AriaTableBody {...props} className="gv-data-table__body" />;
}

export interface DataTableEmptyProps {
  children: ReactNode;
  /** Places the line; never paints it. */
  className?: string;
  style?: CSSProperties;
}

/** The empty-state line, for `DataTableBody`'s `renderEmptyState`. */
export function DataTableEmpty({children, className, style}: DataTableEmptyProps) {
  return <p className={clsx('gv-data-table__empty', className)} style={style}>{children}</p>;
}

export interface DataTableRowProps<T> extends Omit<AriaRowProps<T>, 'className'> {}

/**
 * A row. Give it an `id`: `openKey`, `onRowAction` and the selection name rows by it. Its own `onAction` runs on a
 * press, beside the table's `onRowAction`.
 */
export function DataTableRow<T extends object>({id, columns, children, onAction, ...props}: DataTableRowProps<T>) {
  const {selectionMode} = useTableOptions();
  const {addColumn, readsPresses, rows, onRowAction, openKey} = useContext(DataTableContext);
  // With bulk selection the table reads the press itself (see DataTable): the row's action waits in its list, so React
  // Aria doesn't fire it a second time.
  const kept = readsPresses && id != null;
  if (kept) rows.set(String(id), {key: id, onAction});
  const isOpen = openKey != null && id != null && openKey === id;
  return (
    <AriaRow id={id} {...props} onAction={kept ? undefined : onAction} className="gv-data-table__row"
      data-open={isOpen || undefined}
      data-actionable={onAction || onRowAction || props.href ? true : undefined}>
      {selectionMode !== 'none' && (
        <AriaCell className="gv-data-table__cell gv-data-table__check">
          <Checkbox slot="selection" />
        </AriaCell>
      )}
      <Collection items={columns}>{children}</Collection>
      {addColumn ? <AriaCell className="gv-data-table__cell gv-data-table__add" /> : null}
    </AriaRow>
  );
}

export interface DataTableCellProps extends Omit<AriaCellProps, 'className'> {
  /** @default 'start' */
  align?: DataTableAlign;
  /** Quieter text, e.g. the Manage table's Status word. */
  isMuted?: boolean;
}

export function DataTableCell({align = 'start', isMuted, ...props}: DataTableCellProps) {
  return <AriaCell {...props} className="gv-data-table__cell" data-align={align} data-muted={isMuted || undefined} />;
}

/** `className` and `style` place a cell's content (width, margin, alignment); they never paint it. */
interface Placement {
  className?: string;
  style?: CSSProperties;
}

export interface DataTableTextProps extends Placement {
  children: ReactNode;
  /** Before the text, e.g. the idea's picture as a `DataTableThumbnail`. */
  leading?: ReactNode;
  /**
   * Wrap up to this many lines, then clip with an ellipsis.
   *
   * @default 3
   */
  lines?: 1 | 2 | 3;
  /** Marks after the text, e.g. a content-warning icon with its own `aria-label`. */
  marks?: ReactNode;
}

/**
 * Wrapping cell text clamped to a few lines, with trailing marks (the Manage table's idea text and its ⚠) and an
 * optional leading thumbnail.
 */
export function DataTableText({children, leading, lines = 3, marks, className, style}: DataTableTextProps) {
  return (
    <span className={clsx('gv-data-table__text', className)} style={style} data-leading={leading ? true : undefined}>
      {leading}
      <span className="gv-data-table__clamp" data-lines={lines}>{children}</span>
      {marks && <span className="gv-data-table__marks">{marks}</span>}
    </span>
  );
}

export interface DataTablePersonProps extends Placement {
  /** The person's (invented) display name, or a link carrying it. */
  name: ReactNode;
  /** Initials for the gv Avatar, e.g. "RE". They also stand in for a photo that can't load. */
  initials: string;
  /** A photo for the Avatar (the prototype's Audience table). */
  src?: string;
  /** The line under the name, e.g. an email address. */
  sub?: ReactNode;
}

/** A person cell: gv Avatar, then the name over a quieter sub-line (the prototype's `__person`). */
export function DataTablePerson({name, initials, src, sub, className, style}: DataTablePersonProps) {
  return (
    <span className={clsx('gv-data-table__person', className)} style={style}>
      <Avatar initials={initials} src={src} />
      <span className="gv-data-table__stack">
        <span className="gv-data-table__name">{name}</span>
        {sub && <span className="gv-data-table__sub">{sub}</span>}
      </span>
    </span>
  );
}

export interface DataTableStackProps extends Placement {
  children: ReactNode;
  /** The quieter line under it. */
  sub?: ReactNode;
  /** The first line in the strong UI type, e.g. a title. */
  isStrong?: boolean;
  /** Before the two lines, e.g. the project's tile as a `DataTableThumbnail`. */
  leading?: ReactNode;
}

/**
 * A primary line over a quieter sub-line (e.g. a role over "Assigned items"; with `isStrong`, a title over its
 * author and date; with a `leading` tile, a project over its folder).
 */
export function DataTableStack({children, sub, isStrong, leading, className, style}: DataTableStackProps) {
  const lines = (
    <>
      <span className={isStrong ? 'gv-data-table__name' : undefined}>{children}</span>
      {sub && <span className="gv-data-table__sub">{sub}</span>}
    </>
  );
  return leading ? (
    <span className={clsx('gv-data-table__person', className)} style={style}>
      {leading}
      <span className="gv-data-table__stack">{lines}</span>
    </span>
  ) : (
    <span className={clsx('gv-data-table__stack', className)} style={style}>{lines}</span>
  );
}

export interface DataTableThumbnailProps extends Placement {
  /** A picture: a 32px rounded square it covers (the Manage table's idea image). */
  src?: string;
  /** Without a picture, an icon on a coloured 36×28 tile (the Projects list's project tile). */
  icon?: ReactNode;
  /** The tile's colour (a hue, not a tone: it says nothing). @default 'teal' */
  color?: 'teal' | 'blue';
  /** What the picture shows. Leave it empty when the text beside it says it all. @default '' */
  alt?: string;
}

/** The picture before a row's title: an image, or an icon tile. For `DataTableText` and `DataTableStack`'s `leading`. */
export function DataTableThumbnail({src, icon, color = 'teal', alt = '', className, style}: DataTableThumbnailProps) {
  if (src) return <img className={clsx('gv-data-table__thumb', className)} style={style} src={src} alt={alt} loading="lazy" />;
  return <span className={clsx('gv-data-table__tile', className)} style={style} data-color={color} aria-hidden>{icon}</span>;
}

export interface DataTableAssigneeProps extends Placement {
  /** Who it is assigned to (an invented name in stories). Leave it out for nobody. */
  name?: string;
  /** Initials for the Avatar. @default the name's first letter at 24, the first letters of its first two words at 28 */
  initials?: string;
  /** A photo for the Avatar. */
  src?: string;
  /** What nobody reads. @default 'Unassigned' */
  emptyLabel?: string;
  /** The avatar's size: 24 in a dense table, 28 in a roomy one. @default 24 */
  size?: 24 | 28;
}

/**
 * An assignee cell: Avatar and name, or the dashed empty ring and "Unassigned" in quieter text (the prototype's
 * Manage assignee and Projects list manager).
 */
export function DataTableAssignee({name, initials, src, emptyLabel = 'Unassigned', size = 24, className, style}: DataTableAssigneeProps) {
  const letters = initials ?? name?.split(/\s+/).slice(0, size === 28 ? 2 : 1).map(w => w[0]).join('').toUpperCase();
  return (
    <span className={clsx('gv-data-table__assignee', className)} style={style} data-empty={name ? undefined : true}>
      <Avatar size={size} initials={letters} src={src} unassigned={!name} />
      <span className="gv-data-table__assignee-name">{name ?? emptyLabel}</span>
    </span>
  );
}

export interface DataTableTagsProps extends Placement {
  /** The tags' names. */
  items: readonly string[];
  /** How many to show before "+N". @default 2 */
  max?: number;
}

/**
 * A tags cell: the first few as Badges (each clipped at 96px), then "+N" for the rest, which names them on hover and
 * to screen readers.
 */
export function DataTableTags({items, max = 2, className, style}: DataTableTagsProps) {
  const shown = items.slice(0, max);
  const rest = items.slice(max);
  return (
    <span className={clsx('gv-data-table__tags', className)} style={style}>
      {shown.map(t => <Badge key={t} variant="outlined">{t}</Badge>)}
      {rest.length > 0 && (
        <span className="gv-data-table__more" title={rest.join(', ')}>
          <span aria-hidden><Badge variant="outlined">+{rest.length}</Badge></span>
          <span className="gv-data-table__hidden">and {rest.join(', ')}</span>
        </span>
      )}
    </span>
  );
}

export interface DataTableOptionsProps {
  /** Names the button, e.g. "Options for Resident E". */
  'aria-label': string;
  /** The menu's items: starter `MenuItem`s. */
  children: ReactNode;
  onAction?: (key: Key) => void;
}

/** The row's options: a ghost "…" gv IconButton opening a menu (the prototype's `__opts`). Takes no class: the
 * options column places it. */
export function DataTableOptions({'aria-label': label, children, onAction}: DataTableOptionsProps) {
  return (
    <MenuTrigger>
      <IconButton aria-label={label}><MoreHorizontal aria-hidden size={16} /></IconButton>
      <Menu aria-label={label} onAction={onAction}>{children}</Menu>
    </MenuTrigger>
  );
}

export interface DataTableAddColumnProps {
  /** The columns that can be added: starter `MenuItem`s (e.g. with `selectionMode` checkmarks). */
  children: ReactNode;
  onAction?: (key: Key) => void;
  /** Menu selection, to show which optional columns are on. */
  selectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  /** @default 'Add column' */
  'aria-label'?: string;
}

/** The header's "+" (the prototype's Manage table): a ghost gv IconButton opening a menu of columns to add. Takes no
 * class: the header places it. */
export function DataTableAddColumn({children, onAction, selectedKeys, onSelectionChange,
  'aria-label': label = 'Add column'}: DataTableAddColumnProps) {
  return (
    <MenuTrigger>
      <IconButton aria-label={label}><Plus aria-hidden size={16} /></IconButton>
      <Menu aria-label={label} onAction={onAction} selectionMode={selectedKeys ? 'multiple' : undefined}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange && (k => onSelectionChange(new Set(k === 'all' ? [] : k)))}>
        {children}
      </Menu>
    </MenuTrigger>
  );
}

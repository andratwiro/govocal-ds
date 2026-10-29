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
import {ArrowDown, ArrowUp, MoreHorizontal, Plus} from 'lucide-react';
import {createContext, useContext, type ReactNode} from 'react';
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
 * actions (`onAction` on a row), keyboard grid navigation.
 *
 * The phase Manage tab's input table is the same component, `density="compact"` with `revealChecks` and an
 * `addColumn` control: dense rows that grow with wrapping text, checkboxes that appear on hover or once checked,
 * and a trailing "+" in the header. Cells: `DataTableText` (with a `DataTableThumbnail`), `DataTablePerson`,
 * `DataTableAssignee`, `DataTableTags`, `DataTableStack`, `DataTableOptions`. Around it: a `Panel` frames it, a
 * `TableToolbar` holds its count, search and filters, `Pagination` sits in the Panel's foot (the `InAPanel` story).
 */

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/** How a column's content lines up. `number`: counts (centred, tabular figures); `options`: the trailing "…". */
export type DataTableAlign = 'start' | 'number' | 'options';

export interface DataTableProps extends Omit<AriaTableProps, 'className'> {
  className?: string;
  /**
   * A table standing on its own (not inside a Card): a 1px card border, rounded corners and a tinted header row,
   * as the prototype's Projects list. Inside a Card, leave it off: the Card is the frame.
   *
   * @default false
   */
  framed?: boolean;
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
  revealChecks?: boolean;
  /**
   * A trailing header control for adding columns, e.g. `<DataTableAddColumn>`. Rows get a matching empty cell.
   */
  addColumn?: ReactNode;
}

const DataTableContext = createContext<{addColumn?: ReactNode; revealChecks?: boolean}>({});

export function DataTable({className, framed, density, revealChecks, addColumn, ...props}: DataTableProps) {
  return (
    <DataTableContext.Provider value={{addColumn, revealChecks}}>
      <AriaTable {...props} className={cx('gv-data-table', className)} data-framed={framed || undefined}
        data-density={density === 'compact' ? 'compact' : undefined} data-reveal-checks={revealChecks || undefined} />
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
  selectAll?: boolean;
}

export function DataTableHeader<T extends object>({columns, children, selectAll = true, ...props}: DataTableHeaderProps<T>) {
  const {selectionBehavior, selectionMode} = useTableOptions();
  const {addColumn, revealChecks} = useContext(DataTableContext);
  const selectable = selectionBehavior === 'toggle' && selectionMode !== 'none';
  return (
    <AriaTableHeader {...props} className="gv-data-table__header">
      {selectable && (
        <AriaColumn className="gv-data-table__column gv-data-table__check" textValue="Selection">
          {selectionMode === 'multiple' && selectAll
            ? <Checkbox slot="selection" isQuiet={revealChecks} />
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
  /** Visually hide the label (it stays the column's accessible name), e.g. for the options column. */
  hideLabel?: boolean;
}

export function DataTableColumn({children, align = 'start', hideLabel, ...props}: DataTableColumnProps) {
  return (
    <AriaColumn {...props} className="gv-data-table__column" data-align={align}>
      {({allowsSorting, sortDirection}) => (
        <span className="gv-data-table__head">
          <span className={hideLabel ? 'gv-data-table__hidden' : undefined}>{children}</span>
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

/** The empty-state line, for `DataTableBody`'s `renderEmptyState`. */
export function DataTableEmpty({children}: {children: ReactNode}) {
  return <p className="gv-data-table__empty">{children}</p>;
}

export interface DataTableRowProps<T> extends Omit<AriaRowProps<T>, 'className'> {}

export function DataTableRow<T extends object>({id, columns, children, ...props}: DataTableRowProps<T>) {
  const {selectionBehavior, selectionMode} = useTableOptions();
  const {addColumn} = useContext(DataTableContext);
  return (
    <AriaRow id={id} {...props} className="gv-data-table__row"
      data-actionable={props.onAction || props.href ? true : undefined}>
      {selectionBehavior === 'toggle' && selectionMode !== 'none' && (
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
  muted?: boolean;
}

export function DataTableCell({align = 'start', muted, ...props}: DataTableCellProps) {
  return <AriaCell {...props} className="gv-data-table__cell" data-align={align} data-muted={muted || undefined} />;
}

export interface DataTableTextProps {
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
export function DataTableText({children, leading, lines = 3, marks}: DataTableTextProps) {
  return (
    <span className="gv-data-table__text" data-leading={leading ? true : undefined}>
      {leading}
      <span className="gv-data-table__clamp" data-lines={lines}>{children}</span>
      {marks && <span className="gv-data-table__marks">{marks}</span>}
    </span>
  );
}

export interface DataTablePersonProps {
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
export function DataTablePerson({name, initials, src, sub}: DataTablePersonProps) {
  return (
    <span className="gv-data-table__person">
      <Avatar initials={initials} src={src} />
      <span className="gv-data-table__stack">
        <span className="gv-data-table__name">{name}</span>
        {sub && <span className="gv-data-table__sub">{sub}</span>}
      </span>
    </span>
  );
}

export interface DataTableStackProps {
  children: ReactNode;
  /** The quieter line under it. */
  sub?: ReactNode;
  /** The first line in the strong UI type, e.g. a title. */
  strong?: boolean;
  /** Before the two lines, e.g. the project's tile as a `DataTableThumbnail`. */
  leading?: ReactNode;
}

/**
 * A primary line over a quieter sub-line (e.g. a role over "Assigned items"; with `strong`, a title over its author
 * and date; with a `leading` tile, a project over its folder).
 */
export function DataTableStack({children, sub, strong, leading}: DataTableStackProps) {
  const stack = (
    <span className="gv-data-table__stack">
      <span className={strong ? 'gv-data-table__name' : undefined}>{children}</span>
      {sub && <span className="gv-data-table__sub">{sub}</span>}
    </span>
  );
  return leading ? <span className="gv-data-table__person">{leading}{stack}</span> : stack;
}

export interface DataTableThumbnailProps {
  /** A picture: a 32px rounded square it covers (the Manage table's idea image). */
  src?: string;
  /** Without a picture, an icon on a coloured 36×28 tile (the Projects list's project tile). */
  icon?: ReactNode;
  /** The tile's colour. @default 'teal' */
  tone?: 'teal' | 'blue';
  /** What the picture shows. Leave it empty when the text beside it says it all. @default '' */
  alt?: string;
}

/** The picture before a row's title: an image, or an icon tile. For `DataTableText` and `DataTableStack`'s `leading`. */
export function DataTableThumbnail({src, icon, tone = 'teal', alt = ''}: DataTableThumbnailProps) {
  if (src) return <img className="gv-data-table__thumb" src={src} alt={alt} loading="lazy" />;
  return <span className="gv-data-table__tile" data-tone={tone} aria-hidden>{icon}</span>;
}

export interface DataTableAssigneeProps {
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
export function DataTableAssignee({name, initials, src, emptyLabel = 'Unassigned', size = 24}: DataTableAssigneeProps) {
  const letters = initials ?? name?.split(/\s+/).slice(0, size === 28 ? 2 : 1).map(w => w[0]).join('').toUpperCase();
  return (
    <span className="gv-data-table__assignee" data-empty={name ? undefined : true}>
      <Avatar size={size} initials={letters} src={src} isUnassigned={!name} />
      <span className="gv-data-table__assignee-name">{name ?? emptyLabel}</span>
    </span>
  );
}

export interface DataTableTagsProps {
  tags: readonly string[];
  /** How many to show before "+N". @default 2 */
  max?: number;
}

/**
 * A tags cell: the first few as Badges (each clipped at 96px), then "+N" for the rest, which names them on hover and
 * to screen readers.
 */
export function DataTableTags({tags, max = 2}: DataTableTagsProps) {
  const shown = tags.slice(0, max);
  const rest = tags.slice(max);
  return (
    <span className="gv-data-table__tags">
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
  onAction?: (key: string | number) => void;
}

/** The row's options: a ghost "…" gv IconButton opening a menu (the prototype's `__opts`). */
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
  onAction?: (key: string | number) => void;
  /** Menu selection, to show which optional columns are on. */
  selectedKeys?: Iterable<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;
  /** @default 'Add column' */
  'aria-label'?: string;
}

/** The header's "+" (the prototype's Manage table): a ghost gv IconButton opening a menu of columns to add. */
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

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
  TableLoadMoreItem,
  useTableOptions
} from 'react-aria-components/Table';
import {TableLayout, Virtualizer} from 'react-aria-components/Virtualizer';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import type {Key, Selection} from 'react-aria-components';
import {ArrowDown, ArrowUp, MoreHorizontal, Plus} from 'lucide-react';
import {clsx} from 'clsx';
import {
  createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode
} from 'react';
import {Checkbox} from './Checkbox';
import {Avatar} from './Avatar';
import {Badge} from './Badge';
import {IconButton} from './IconButton';
import {Menu, MenuTrigger} from '../Menu';
import {useListFormatter} from '../format';
import {mergeLabels, type LoadMoreLabels} from '../labels';
import './DataTable.css';

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
  /**
   * Draw only the rows in view: for a long list (more than about 200 rows). The table scrolls inside itself with its
   * header on top, so it needs a bounded height (its own `style={{height}}`, or a parent with a height); every row is
   * one height (`rowLines`) and every cell one line. See "Long lists" above.
   *
   * @default false
   */
  isVirtualized?: boolean;
  /**
   * With `isVirtualized`, the lines each row holds, which set its one height: `2` for a line over a sub-line
   * (`DataTablePerson` with a `sub`, `DataTableStack` with a `sub`) or two lines of `DataTableText`.
   *
   * @default 1
   */
  rowLines?: 1 | 2;
}

interface RowEntry {
  key: Key;
  onAction?: () => void;
}

/**
 * What a virtualised table must know in pixels to place what it hasn't drawn: the row and header heights and the
 * widths of the columns that size themselves (check, "…", "+"). DataTable.css draws them from tokens.
 */
interface VirtualMetrics {
  rowHeight: number;
  headHeight: number;
  checkWidth: number;
  endWidth: number;
}

/**
 * What the header, rows and cells read from the table. Only values that rarely change, so that a long list's rows
 * (cached by React Aria) aren't rebuilt by a press elsewhere: the open row is marked on the page (see DataTable), and
 * the "+" control reaches the header alone (`AddColumnContext`).
 */
interface DataTableState {
  showChecksOnHover?: boolean;
  /** Bulk selection is on and the table reads row presses itself (see DataTable): rows keep their action here. */
  readsPresses: boolean;
  rows: Map<string, RowEntry>;
  hasRowAction: boolean;
  hasAddColumn: boolean;
  /** Set when the table is virtualised. */
  virtual?: VirtualMetrics;
}

const DataTableContext = createContext<DataTableState>({readsPresses: false, rows: new Map(), hasRowAction: false, hasAddColumn: false});
const AddColumnContext = createContext<ReactNode>(null);

/**
 * The same metrics as DataTable.css's registered properties (`--gv-data-table-row-height` and its siblings): the
 * CSS's calc() of today's tokens, for the first render (before the stylesheet is read) and a browser without
 * `@property`. tests/data-table.test.mjs keeps them equal to the stylesheet.
 */
export function virtualMetrics(density: 'default' | 'compact' = 'default', rowLines: 1 | 2 = 1): VirtualMetrics {
  return density === 'compact'
    ? {rowHeight: rowLines === 2 ? 57 : 37, headHeight: 32, checkWidth: 28, endWidth: 44}
    : {rowHeight: rowLines === 2 ? 63 : 45, headHeight: 37, checkWidth: 40, endWidth: 56};
}

/** The metrics the stylesheet draws for this table, each read as pixels, or the fallback where a value isn't one. */
function readMetrics(table: HTMLElement, fallback: VirtualMetrics): VirtualMetrics {
  const css = getComputedStyle(table);
  const px = (name: string, or: number) => {
    const n = parseFloat(css.getPropertyValue(name));
    return n > 0 ? n : or;
  };
  return {
    rowHeight: px('--gv-data-table-row-height', fallback.rowHeight),
    headHeight: px('--gv-data-table-head-height', fallback.headHeight),
    checkWidth: px('--gv-data-table-check-width', fallback.checkWidth),
    endWidth: px('--gv-data-table-end-width', fallback.endWidth)
  };
}

const sameMetrics = (a: VirtualMetrics, b: VirtualMetrics) =>
  a.rowHeight === b.rowHeight && a.headHeight === b.headHeight && a.checkWidth === b.checkWidth && a.endWidth === b.endWidth;

/**
 * Under virtualisation every cell sits alone in the box the layout gives it, so `:first-child`, `:last-child` and the
 * sibling selectors can't find the table's edges, its last row or a run of ticked rows. The table marks them:
 * `data-edge="start" | "end"` on the first and last column's cells, `data-last` on the last row, `data-run="start" |
 * "end"` on a ticked row next to the header, the list's end or a drawn unticked row. Only the drawn rows (a few dozen)
 * are read.
 */
function markVirtual(table: HTMLElement) {
  const own = (el: Element) => el.closest('.gv-data-table') === table;
  const set = (el: Element, name: string, value: string | null) => {
    if (el.getAttribute(name) === value) return;
    if (value == null) el.removeAttribute(name);
    else el.setAttribute(name, value);
  };
  const lastColumn = Number(table.getAttribute('aria-colcount') ?? 0);
  table.querySelectorAll('.gv-data-table__column[aria-colindex], .gv-data-table__cell[aria-colindex]').forEach(cell => {
    if (!own(cell)) return;
    const at = Number(cell.getAttribute('aria-colindex'));
    set(cell, 'data-edge', [at === 1 && 'start', at === lastColumn && 'end'].filter(Boolean).join(' ') || null);
  });
  const lastRow = Number(table.getAttribute('aria-rowcount') ?? 0);
  // Each drawn row's place (the header row is 1) and whether it is ticked. A neighbour not drawn is off screen: the run
  // goes on into it as far as the eye can tell, so only a drawn, unticked neighbour (or the list's end) ends a run.
  const ticked = new Map<number, boolean>();
  const rows = [...table.querySelectorAll<HTMLElement>('.gv-data-table__row')].filter(own);
  rows.forEach(row => ticked.set(Number(row.getAttribute('aria-rowindex')), row.hasAttribute('data-selected')));
  rows.forEach(row => {
    const at = Number(row.getAttribute('aria-rowindex'));
    set(row, 'data-last', at > 0 && at === lastRow ? 'true' : null);
    const run = at > 0 && ticked.get(at)
      ? [(at - 1 <= 1 || ticked.get(at - 1) === false) && 'start',
        (at + 1 > lastRow || ticked.get(at + 1) === false) && 'end'].filter(Boolean).join(' ')
      : '';
    set(row, 'data-run', run || null);
  });
}

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

/**
 * Records in rows and columns, to sort, tick in bulk and open one at a time: every admin list (users, inputs,
 * projects, reports). The look is the prototype's `gv-bo-table is-list`: quiet small headers over a hairline,
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
 *
 * **Long lists: `isVirtualized`.** Past about 200 rows, turn it on: the table draws only the rows in view (a few dozen
 * of 5,000), with the same look, keyboard, sorting, bulk selection, open row and `toKeySet`. What it needs:
 * - **A bounded height.** The table scrolls inside itself, its header pinned on top: give it a height (`style={{height:
 *   560}}`, or let it fill a parent with a height, such as a flex or grid cell with `min-height: 0`). Without one it
 *   grows to its full length and the page scrolls instead, and the header no longer stays on top (it warns in
 *   development).
 * - **One row height.** Every row is the same height, so the table can place the rows it hasn't drawn: `rowLines={2}`
 *   for a line over a sub-line (`DataTablePerson` with an email, `DataTableStack` with a `sub`), else one line. A cell
 *   keeps to its line and clips with an ellipsis.
 * - **A width from its container.** Its rows aren't laid out as a table's, so it doesn't grow to fit them: it fills
 *   the width it is given (a block, a grid or flex cell that stretches), and in a box that shrinks to fit its content
 *   it shrinks to almost nothing.
 * - **Column widths.** The table spreads the columns evenly; give a column a `width` (`200`, `"30%"`, `"2fr"`) to
 *   change its share. The check, "…" and "+" columns size themselves. Right to left follows React Aria's locale
 *   (`I18nProvider`), as every other component's keyboard does.
 * - **Rows as `items`.** `<DataTableBody items={rows}>{row => <DataTableRow id={row.id}>…</DataTableRow>}</DataTableBody>`
 *   lets React Aria reuse rows it has built; a `.map()` rebuilds all 5,000 on every change.
 * - **Loading more:** `DataTableBody`'s `onLoadMore` (and `isLoading` while it fetches) for a list that arrives in pages
 *   as it scrolls. The "Virtualized · 5,000 people" and "Virtualized · loading more" stories are the recipes.
 */
export function DataTable({
  className, style, isFramed, density, showChecksOnHover, addColumn, onRowAction, openKey, isVirtualized = false,
  rowLines = 1, selectionMode = 'none', selectedKeys, defaultSelectedKeys, onSelectionChange, ...props
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

  // The open row (`openKey`) is marked on the page: `data-open` for its look and `aria-current="true"` for assistive
  // tech (React Aria passes only data-* and events to a row; a ref on the row, new each render, breaks its arrow-key
  // focus). Marking it here, not in each row's render, spares a long list from rebuilding every row when another one
  // opens. Kept in step as rows change (and, virtualised, as they scroll in or are reused); a virtualised table also
  // marks its edges and runs (`markVirtual`). A layout effect, and the observer's callbacks run before the browser
  // paints: no frame shows a row unmarked.
  const openRef = useRef(openKey);
  openRef.current = openKey;
  const markRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const table = ref.current;
    if (!table) return;
    const mark = () => {
      const open = openRef.current == null ? null : String(openRef.current);
      table.querySelectorAll<HTMLElement>('.gv-data-table__row').forEach(row => {
        if (row.closest('.gv-data-table') !== table) return;
        const isOpen = open != null && row.dataset.key === open;
        if (isOpen === row.hasAttribute('data-open')) return;
        if (isOpen) {
          row.setAttribute('data-open', 'true');
          row.setAttribute('aria-current', 'true');
        } else {
          row.removeAttribute('data-open');
          row.removeAttribute('aria-current');
        }
      });
      if (isVirtualized) markVirtual(table);
    };
    markRef.current = mark;
    mark();
    const watch = new MutationObserver(mark);
    watch.observe(table, {subtree: true, childList: true, attributeFilter: isVirtualized
      ? ['data-key', 'data-selected', 'aria-rowindex', 'aria-colindex', 'aria-rowcount', 'aria-colcount'] : ['data-key']});
    return () => watch.disconnect();
  }, [isVirtualized]);
  useLayoutEffect(() => markRef.current(), [openKey]);

  // React Aria moves focus on Page Up / Down and Home / End but leaves the browser's own action on (1.22, a table
  // without selection-follows-focus), so the page, or a virtualised table's own scroll, jumped a second time: past the
  // row it had just brought into view, under the pinned header. The table keeps those keys, except in a text field.
  useEffect(() => {
    const table = ref.current;
    if (!table) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key) || e.defaultPrevented) return;
      if (e.target instanceof Element && e.target.closest(TEXT_FIELD)) return;
      e.preventDefault();
    };
    table.addEventListener('keydown', onKeyDown);
    return () => table.removeEventListener('keydown', onKeyDown);
  }, []);

  // Virtualised: the row and header heights and the self-sized columns' widths, as the stylesheet draws them, read
  // before the first paint (and again when the look changes); the layout needs them as numbers.
  const fallback = virtualMetrics(density, rowLines);
  const [measured, setMeasured] = useState<VirtualMetrics | null>(null);
  const metrics = measured ?? fallback;
  useLayoutEffect(() => {
    if (!isVirtualized || !ref.current) return;
    const next = readMetrics(ref.current, virtualMetrics(density, rowLines));
    setMeasured(m => (m && sameMetrics(m, next) ? m : next));
  }, [isVirtualized, density, rowLines, isFramed]);
  const layoutOptions = useMemo(() => ({
    rowHeight: metrics.rowHeight, headingHeight: metrics.headHeight, loaderHeight: metrics.rowHeight
  }), [metrics.rowHeight, metrics.headHeight]);

  // Without a bounded height the table grows to its whole length: say so once, in development.
  useEffect(() => {
    const table = ref.current;
    if (process.env.NODE_ENV === 'production' || !isVirtualized || !table || warnedUnbounded.has(table)) return;
    const check = () => {
      if (table.scrollHeight > window.innerHeight * 2 && table.clientHeight >= table.scrollHeight - 1) {
        warnedUnbounded.add(table);
        console.warn(`DataTable "${props['aria-label'] ?? ''}" is virtualised but has no bounded height, so it grew to ` +
          `${table.scrollHeight}px and its header scrolls away. Give it a height (style={{height: 560}}) or a parent ` +
          'with one (a flex or grid cell with min-height: 0).');
      }
    };
    const id = requestAnimationFrame(check);
    return () => cancelAnimationFrame(id);
  });

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

  // One value while nothing it holds changes, so 5,000 rows aren't rebuilt for a press elsewhere on the page.
  const hasRowAction = Boolean(onRowAction);
  const hasAddColumn = Boolean(addColumn);
  const virtual = isVirtualized ? metrics : undefined;
  const context = useMemo<DataTableState>(
    () => ({showChecksOnHover, readsPresses, rows, hasRowAction, hasAddColumn, virtual}),
    [showChecksOnHover, readsPresses, rows, hasRowAction, hasAddColumn, virtual]);

  const table = (
    <AriaTable {...props} ref={ref} className={clsx('gv-data-table', className)} style={style}
      selectionMode={selectionMode} selectionBehavior="toggle"
      selectedKeys={readsPresses ? selection : selectedKeys} defaultSelectedKeys={readsPresses ? undefined : defaultSelectedKeys}
      onSelectionChange={readsPresses ? select : onSelectionChange}
      onRowAction={readsPresses ? undefined : onRowAction}
      data-framed={isFramed || undefined}
      data-density={density === 'compact' ? 'compact' : undefined}
      data-checks-on-hover={showChecksOnHover || undefined}
      data-virtualized={isVirtualized || undefined}
      data-row-lines={isVirtualized ? rowLines : undefined} />
  );
  return (
    <DataTableContext.Provider value={context}>
      <AddColumnContext.Provider value={addColumn}>
        {isVirtualized ? <Virtualizer layout={TableLayout} layoutOptions={layoutOptions}>{table}</Virtualizer> : table}
      </AddColumnContext.Provider>
    </DataTableContext.Provider>
  );
}

/** Tables already warned about a missing height (development only). */
const warnedUnbounded = new WeakSet<HTMLElement>();
/** Keys whose browser action scrolls: the table moves focus on them instead. */
const SCROLL_KEYS = new Set(['PageUp', 'PageDown', 'Home', 'End']);
/** Where those keys move a caret, not focus. */
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable]:not([contenteditable="false"])';

/** The words Data table header says itself (docs/API.md rule 11): its check and add columns' names. */
export interface DataTableHeaderLabels {
  /** The name of the check column, e.g. for the select-all check. */
  selection: string;
  /** The name of the add-column column in the header. */
  addColumn: string;
}

/** Data table header's English words; a page passes its own over them with `labels`. */
export const dataTableHeaderLabels: DataTableHeaderLabels = {selection: 'Selection', addColumn: 'Add column'};

export interface DataTableHeaderProps<T> extends Omit<AriaTableHeaderProps<T>, 'className'> {
  /**
   * In a multiple-selection table, the header's check column carries a "select all" checkbox. Turn it off when the
   * page already has its own select-all control (e.g. a toolbar "Select" checkbox), so there is only one.
   *
   * @default true
   */
  showSelectAll?: boolean;
  /** Its own words (the check and add columns' names), over `dataTableHeaderLabels`. */
  labels?: Partial<DataTableHeaderLabels>;
}

export function DataTableHeader<T extends object>({columns, children, showSelectAll = true, labels, ...props}: DataTableHeaderProps<T>) {
  const l = mergeLabels(dataTableHeaderLabels, labels);
  const {selectionMode} = useTableOptions();
  const {showChecksOnHover, virtual} = useContext(DataTableContext);
  const addColumn = useContext(AddColumnContext);
  return (
    <AriaTableHeader {...props} className="gv-data-table__header">
      {selectionMode !== 'none' && (
        <AriaColumn className="gv-data-table__column gv-data-table__check" textValue={l.selection}
          width={virtual?.checkWidth} minWidth={virtual?.checkWidth}>
          {selectionMode === 'multiple' && showSelectAll
            ? <Checkbox slot="selection" isQuiet={showChecksOnHover} />
            : <span className="gv-data-table__hidden">{l.selection}</span>}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
      {addColumn ? (
        <AriaColumn className="gv-data-table__column gv-data-table__add" textValue={l.addColumn}
          width={virtual?.endWidth} minWidth={virtual?.endWidth}>
          {addColumn}
        </AriaColumn>
      ) : null}
    </AriaTableHeader>
  );
}

export interface DataTableColumnProps extends Omit<AriaColumnProps, 'children' | 'className'> {
  /** The column's label. */
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

export function DataTableColumn({children, align = 'start', showLabel = true, width, minWidth, ...props}: DataTableColumnProps) {
  // Virtualised, the "…" column sizes itself like the check column (the layout spreads the others evenly).
  const {virtual} = useContext(DataTableContext);
  const fits = virtual && align === 'options' ? virtual.endWidth : undefined;
  return (
    <AriaColumn {...props} width={width ?? fits} minWidth={minWidth ?? fits}
      className="gv-data-table__column" data-align={align}>
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

/** The words Data table body says itself (docs/API.md rule 11): the load-more row's. */
export interface DataTableBodyLabels extends LoadMoreLabels {}

/** Data table body's English words; a page passes its own over them with `labels`. */
export const dataTableBodyLabels: DataTableBodyLabels = {loading: 'Loading more…'};

export interface DataTableBodyProps<T> extends Omit<TableBodyProps<T>, 'className'> {
  /**
   * For a list that arrives in pages as it scrolls: called when the last row comes near the view (within one view's
   * height). Pass it while more rows remain; fetch, append to `items`, and set `isLoading` meanwhile.
   */
  onLoadMore?: () => void;
  /**
   * More rows are on their way: a "Loading more…" row (`labels.loading`) under the last one.
   *
   * @default false
   */
  isLoading?: boolean;
  /** Its own words (the load-more row's), over `dataTableBodyLabels`. */
  labels?: Partial<DataTableBodyLabels>;
}

/**
 * The table's rows. Give it `items` and a function (`{row => <DataTableRow id={row.id}>…}`) for a long list: React Aria
 * then reuses the rows it has built. `onLoadMore` and `isLoading` add the infinite-scroll row at the end.
 */
export function DataTableBody<T extends object>({
  items, children, dependencies, onLoadMore, isLoading, labels, ...props
}: DataTableBodyProps<T>) {
  if (!onLoadMore && !isLoading) {
    return <AriaTableBody {...props} items={items} dependencies={dependencies} className="gv-data-table__body">{children}</AriaTableBody>;
  }
  return (
    <AriaTableBody {...props} className="gv-data-table__body">
      <Collection items={items} dependencies={dependencies}>{children}</Collection>
      <TableLoadMoreItem className="gv-data-table__loading" onLoadMore={onLoadMore} isLoading={isLoading}>
        <span className="gv-data-table__loading-label">{mergeLabels(dataTableBodyLabels, labels).loading}</span>
      </TableLoadMoreItem>
    </AriaTableBody>
  );
}

export interface DataTableEmptyProps {
  /** The line shown when the table has no rows. */
  children: ReactNode;
  /** Places the line; never paints it. */
  className?: string;
  /** Places the line, like `className`. */
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
  const {hasAddColumn, readsPresses, rows, hasRowAction} = useContext(DataTableContext);
  // With bulk selection the table reads the press itself (see DataTable): the row's action waits in its list, so React
  // Aria doesn't fire it a second time.
  const kept = readsPresses && id != null;
  if (kept) rows.set(String(id), {key: id, onAction});
  // `data-open` and `aria-current` are the table's to set (`openKey`).
  return (
    <AriaRow id={id} {...props} onAction={kept ? undefined : onAction} className="gv-data-table__row"
      data-actionable={onAction || hasRowAction || props.href ? true : undefined}>
      {selectionMode !== 'none' && (
        <AriaCell className="gv-data-table__cell gv-data-table__check">
          <Checkbox slot="selection" />
        </AriaCell>
      )}
      <Collection items={columns}>{children}</Collection>
      {hasAddColumn ? <AriaCell className="gv-data-table__cell gv-data-table__add" /> : null}
    </AriaRow>
  );
}

export interface DataTableCellProps extends Omit<AriaCellProps, 'className'> {
  /** @default 'start' */
  align?: DataTableAlign;
  /** Quieter text, e.g. the Manage table's Status word. */
  isMuted?: boolean;
}

export function DataTableCell({align = 'start', isMuted, children, ...props}: DataTableCellProps) {
  // Virtualised, the cell is a fixed box: its content sits in one line that clips with an ellipsis, centred on the row.
  const {virtual} = useContext(DataTableContext);
  return (
    <AriaCell {...props} className="gv-data-table__cell" data-align={align} data-muted={isMuted || undefined}>
      {virtual ? composeRenderProps(children, c => <span className="gv-data-table__fit">{c}</span>) : children}
    </AriaCell>
  );
}

/** `className` and `style` place a cell's content (width, margin, alignment); they never paint it. */
interface Placement {
  /** Places the part (grid area, width, margin); never paints it (docs/API.md). */
  className?: string;
  /** Places the part, like `className`. */
  style?: CSSProperties;
}

export interface DataTableTextProps extends Placement {
  /** The text. */
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
  /** The primary line. */
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

/** The words Data table assignee says itself (docs/API.md rule 11). */
export interface DataTableAssigneeLabels {
  /** What nobody reads, when no `emptyLabel` is given. */
  unassigned: string;
}

/** Data table assignee's English words; a page passes its own over them with `labels`. */
export const dataTableAssigneeLabels: DataTableAssigneeLabels = {unassigned: 'Unassigned'};

export interface DataTableAssigneeProps extends Placement {
  /** Who it is assigned to (an invented name in stories). Leave it out for nobody. */
  name?: string;
  /** Initials for the Avatar. @default the name's first letter at 24, the first letters of its first two words at 28 */
  initials?: string;
  /** A photo for the Avatar. */
  src?: string;
  /** What nobody reads, in this cell. @default `labels.unassigned` */
  emptyLabel?: string;
  /** Its own words, over `dataTableAssigneeLabels`. */
  labels?: Partial<DataTableAssigneeLabels>;
  /** The avatar's size: 24 in a dense table, 28 in a roomy one. @default 24 */
  size?: 24 | 28;
}

/**
 * An assignee cell: Avatar and name, or the dashed empty ring and "Unassigned" in quieter text (the prototype's
 * Manage assignee and Projects list manager).
 */
export function DataTableAssignee({name, initials, src, emptyLabel, labels, size = 24, className, style}: DataTableAssigneeProps) {
  const letters = initials ?? name?.split(/\s+/).slice(0, size === 28 ? 2 : 1).map(w => w[0]).join('').toUpperCase();
  return (
    <span className={clsx('gv-data-table__assignee', className)} style={style} data-empty={name ? undefined : true}>
      <Avatar size={size} initials={letters} src={src} isUnassigned={!name} />
      <span className="gv-data-table__assignee-name">{name ?? emptyLabel ?? mergeLabels(dataTableAssigneeLabels, labels).unassigned}</span>
    </span>
  );
}

/** The words Data table tags says itself (docs/API.md rule 11). */
export interface DataTableTagsLabels {
  /** What "+N" reads, given the hidden tags' names, joined as the locale lists them. */
  more: (names: string) => string;
}

/** Data table tags' English words; a page passes its own over them with `labels`. */
export const dataTableTagsLabels: DataTableTagsLabels = {more: names => `and ${names}`};

export interface DataTableTagsProps extends Placement {
  /** The tags' names. */
  items: readonly string[];
  /** How many to show before "+N". @default 2 */
  max?: number;
  /** Its own words (what "+N" reads), over `dataTableTagsLabels`. */
  labels?: Partial<DataTableTagsLabels>;
}

/**
 * A tags cell: the first few as Badges (each clipped at 96px), then "+N" for the rest, which names them on hover and
 * to screen readers.
 */
export function DataTableTags({items, max = 2, labels, className, style}: DataTableTagsProps) {
  const shown = items.slice(0, max);
  const rest = items.slice(max);
  const names = useListFormatter({type: 'unit', style: 'short'}).format(rest);
  return (
    <span className={clsx('gv-data-table__tags', className)} style={style}>
      {shown.map(t => <Badge key={t} variant="outlined">{t}</Badge>)}
      {rest.length > 0 && (
        <span className="gv-data-table__more" title={names}>
          <span aria-hidden><Badge variant="outlined">+{rest.length}</Badge></span>
          <span className="gv-data-table__hidden">{mergeLabels(dataTableTagsLabels, labels).more(names)}</span>
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
  /** Fires when the person picks an item from the menu, with the item's key. */
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

/** The words Data table add column says itself (docs/API.md rule 11). */
export interface DataTableAddColumnLabels {
  /** The "+" and its menu's name, when no `aria-label` is given. */
  addColumn: string;
}

/** Data table add column's English words; a page passes its own over them with `labels`. */
export const dataTableAddColumnLabels: DataTableAddColumnLabels = {addColumn: 'Add column'};

export interface DataTableAddColumnProps {
  /** The columns that can be added: starter `MenuItem`s (e.g. with `selectionMode` checkmarks). */
  children: ReactNode;
  /** Fires when the person picks a column from the menu, with its key. */
  onAction?: (key: Key) => void;
  /** Menu selection, to show which optional columns are on. */
  selectedKeys?: Iterable<Key>;
  /** Fires when the person ticks or unticks a column, with the keys now selected. */
  onSelectionChange?: (keys: Set<Key>) => void;
  /** @default `labels.addColumn` ("Add column") */
  'aria-label'?: string;
  /** Its own words, over `dataTableAddColumnLabels`. */
  labels?: Partial<DataTableAddColumnLabels>;
}

/** The header's "+" (the prototype's Manage table): a ghost gv IconButton opening a menu of columns to add. Takes no
 * class: the header places it. */
export function DataTableAddColumn({children, onAction, selectedKeys, onSelectionChange,
  'aria-label': ariaLabel, labels}: DataTableAddColumnProps) {
  const label = ariaLabel ?? mergeLabels(dataTableAddColumnLabels, labels).addColumn;
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

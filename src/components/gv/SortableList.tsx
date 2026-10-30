'use client';
import type {ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {GridList, GridListItem} from 'react-aria-components/GridList';
import {DropIndicator, useDragAndDrop} from 'react-aria-components/useDragAndDrop';
import type {Key} from 'react-aria-components';
import {GripVertical} from 'lucide-react';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {mergeLabels} from '../labels';
import './SortableList.css';

/** The words Sortable list says itself (docs/API.md rule 11). */
export interface SortableListLabels {
  /** The drag handle's name, given the item's name ("Move 3,600 Participants"). */
  drag: (item: string) => string;
}

/** Sortable list's English words; a page passes its own over them with `labels`. */
export const sortableListLabels: SortableListLabels = {
  drag: item => `Move ${item}`
};

export interface SortableListProps<T extends {id: Key}> extends PlacementProps {
  /** The rows, in their order. Each needs a stable `id`. */
  items: T[];
  /** Fires after a drag or a keyboard move, with every row in its new order. */
  onReorder: (items: T[]) => void;
  /** A row's name, as words: what the drag handle and a screen reader call it ("3,600 · Participants"). */
  itemLabel: (item: T) => string;
  /** A row's content after its handle: words, a value, buttons (a chevron that opens the row's fields). */
  children: (item: T) => ReactNode;
  /** The list's name. */
  'aria-label': string;
  /** No dragging, no moving (the list is read only while the report generates). */
  isDisabled?: boolean;
  /** Its own words, over `sortableListLabels`. */
  labels?: Partial<SortableListLabels>;
}

/** The rows with the dragged ones moved before or after the target row. */
function moved<T extends {id: Key}>(items: T[], keys: Set<Key>, target: Key, position: 'before' | 'after' | 'on') {
  const dragged = items.filter(i => keys.has(i.id));
  const rest = items.filter(i => !keys.has(i.id));
  let at = rest.findIndex(i => i.id === target);
  if (at < 0) return items;
  if (position === 'after') at += 1;
  return [...rest.slice(0, at), ...dragged, ...rest.slice(at)];
}

/**
 * Sortable list: rows people put in their own order by dragging a handle, or from the keyboard. Use it where order is
 * the setting: a report's key figures, a survey's answer options, the columns of an export. A list people pick from
 * is an Option list; rows of records are a Data table; moving a whole block on a page is the Block frame's ↑ ↓.
 *
 * - React Aria's grid list with drag and drop: a drop line shows where the row will land.
 * - Keyboard: Tab to a row's handle, Enter to pick it up, ↑ ↓ to choose the place, Enter to drop it, Esc to cancel.
 *   Screen readers hear each step.
 * - `onReorder` hands back every row in its new order; the page keeps them.
 *
 * `className` and `style` place it; they never paint it. Not in Figma.
 *
 * ```tsx
 * <SortableList aria-label="Numbers" items={figures} onReorder={setFigures}
 *   itemLabel={f => `${f.value} ${f.label}`}>
 *   {f => <><strong>{f.value}</strong> {f.label}</>}
 * </SortableList>
 * ```
 */
export function SortableList<T extends {id: Key}>({
  items, onReorder, itemLabel, children, 'aria-label': ariaLabel, isDisabled, labels, className, style
}: SortableListProps<T>) {
  const l = mergeLabels(sortableListLabels, labels);
  const {dragAndDropHooks} = useDragAndDrop({
    isDisabled,
    getItems: keys => [...keys].map(key => {
      const item = items.find(i => i.id === key);
      return {'text/plain': item ? itemLabel(item) : String(key)};
    }),
    onReorder: e => onReorder(moved(items, e.keys, e.target.key, e.target.dropPosition)),
    renderDropIndicator: target => <DropIndicator target={target} className="gv-sortable-list__drop" />
  });
  return (
    <GridList aria-label={ariaLabel} items={items} dragAndDropHooks={dragAndDropHooks} keyboardNavigationBehavior="tab"
      className={clsx('gv-sortable-list', className)} style={style} data-disabled={isDisabled || undefined}>
      {item => {
        const name = itemLabel(item);
        return (
          <GridListItem id={item.id} textValue={name} className="gv-sortable-list__row">
            <RACButton slot="drag" className="gv-sortable-list__handle" aria-label={l.drag(name)}>
              <GripVertical aria-hidden />
            </RACButton>
            <div className="gv-sortable-list__content">{children(item)}</div>
          </GridListItem>
        );
      }}
    </GridList>
  );
}

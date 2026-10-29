'use client';
import {useContext, useState, type KeyboardEvent, type ReactNode} from 'react';
import {Autocomplete, useFilter} from 'react-aria-components/Autocomplete';
import {OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {Menu, MenuItem} from '../Menu';
import {Text} from '../Content';
import {SearchField} from '../SearchField';
import {Button} from '../Button';
import {useControlledState} from '../useControlledState';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './OptionList.css';

export interface OptionListItem {
  id: string;
  label: string;
  /** Overrides the list's `icon` for this option, e.g. a gv Avatar for a person. */
  icon?: ReactNode;
  /** How many items carry this value ("14 ideas"). */
  count?: number;
}

export interface OptionListProps extends PlacementProps {
  /** Names the list, e.g. "Tags". */
  'aria-label': string;
  /** The options. */
  items: OptionListItem[];
  /** The ids that are chosen (controlled). */
  value?: readonly string[];
  /** The ids chosen at first, when the list keeps its own value. @default [] */
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
  /**
   * Several (a box at the start of each row; the list stays open) or one (a check at the end of the chosen row; the
   * popover closes on a choice).
   *
   * @default 'multiple'
   */
  selectionMode?: 'single' | 'multiple';
  /** The icon in front of every option, e.g. a tag. */
  icon?: ReactNode;
  /** Words for an option's count. @default n => String(n) */
  countLabel?: (n: number) => string;
  /** A search over the list, the magnifier first. @default more than five options */
  isSearchable?: boolean;
  /** @default 'Filter...' */
  placeholder?: string;
  /** Names the search for screen readers. @default "Filter <aria-label, lower case>" */
  searchLabel?: string;
  /** What the list says when nothing matches the search, or when there are no options. @default 'No results' */
  emptyLabel?: string;
  /**
   * Adds a footer: how many are chosen, in these words ("2 tags selected"), and Done, which closes the popover the
   * list sits in.
   */
  selectionLabel?: (n: number) => string;
  /** What Done does. @default closes the popover the list sits in */
  onDone?: () => void;
}

/**
 * A list of options to pick from, in a popover (a filter's submenu, a tag picker, a setup step): an optional search
 * over rows of box · icon · value · count. Pick several (the box shows on the hovered row and on ticked ones; ticking
 * keeps the list open) or one (a check at the end). A React Aria Menu with selection inside an Autocomplete with the
 * system's SearchField, so typing narrows the list and the arrows still move through it. Not in Figma yet.
 */
export function OptionList({'aria-label': label, items, value, defaultValue = [], onChange, selectionMode = 'multiple',
  icon, countLabel = String, isSearchable: searchable = items.length > 5, placeholder = 'Filter...', searchLabel,
  emptyLabel = 'No results', selectionLabel, onDone, className, style}: OptionListProps) {
  const {contains} = useFilter({sensitivity: 'base'});
  const [query, setQuery] = useState('');
  const overlay = useContext(OverlayTriggerStateContext);
  // With the search focused, React Aria's Escape would also clear every ticked option. Here Escape empties the search
  // first, then closes the popover, and never touches the ticks.
  const onEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    e.preventDefault();
    if (query) { setQuery(''); return; }
    // Back to what opened this list (a submenu's row), as React Aria's own Escape would.
    const menuId = e.currentTarget.querySelector('[role="menu"]')?.id;
    const trigger = menuId ? document.querySelector<HTMLElement>(`[aria-controls="${menuId}"]`) : null;
    overlay?.close();
    trigger?.focus();
  };
  const [selected, setSelected] = useControlledState<readonly string[]>(value, defaultValue);
  const choose = (ids: string[]) => {
    setSelected(ids);
    onChange?.(ids);
    if (selectionMode === 'single') overlay?.close();
  };
  const list = (
    <Menu aria-label={label} className="gv-option-list__list" items={items}
      selectionMode={selectionMode} selectedKeys={selected} escapeKeyBehavior="none"
      disallowEmptySelection={selectionMode === 'single'}
      // React Aria closes a menu on Enter even when picking several; in a search Space types, so Enter must tick
      // and leave the list open. Esc or Done closes it.
      shouldCloseOnSelect={selectionMode === 'single' ? undefined : false}
      onSelectionChange={keys => choose(keys === 'all' ? items.map(o => o.id) : [...keys].map(String))}
      renderEmptyState={() => emptyLabel}>
      {o => (
        <MenuItem id={o.id} textValue={o.label} icon={o.icon ?? icon} className="gv-option-list__item">
          <Text slot="label" className="gv-option-list__label">
            <span className="gv-option-list__name">{o.label}</span>
            {o.count != null && <span className="gv-option-list__count">{countLabel(o.count)}</span>}
          </Text>
        </MenuItem>
      )}
    </Menu>
  );
  return (
    <div className={clsx('gv-option-list', className)} style={style} onKeyDownCapture={searchable ? onEscape : undefined}>
      {searchable ? (
        <Autocomplete filter={contains} inputValue={query} onInputChange={setQuery}>
          <SearchField aria-label={searchLabel ?? `Filter ${label.toLowerCase()}`} placeholder={placeholder} autoFocus
            className="gv-option-list__search" />
          {list}
        </Autocomplete>
      ) : list}
      {selectionLabel && (
        <div className="gv-option-list__footer">
          <span className="gv-option-list__summary" role="status">{selectionLabel(selected.length)}</span>
          <Button variant="quiet" size={32} onPress={onDone ?? (() => overlay?.close())}>Done</Button>
        </div>
      )}
    </div>
  );
}

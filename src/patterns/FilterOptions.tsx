'use client';
import {useContext, useState, type KeyboardEvent, type ReactNode} from 'react';
import {Check} from 'lucide-react';
import {Autocomplete, useFilter} from 'react-aria-components/Autocomplete';
import {OverlayTriggerStateContext} from 'react-aria-components/Dialog';
import {MenuItem} from 'react-aria-components/Menu';
import {Menu} from '../components/Menu';
import {SearchField} from '../components/SearchField';
import './FilterOptions.css';

export interface FilterOption {
  id: string;
  label: string;
  /** Overrides the list's `icon` for this option, e.g. a gv Avatar for a person. */
  icon?: ReactNode;
  /** How many items carry this value ("14 ideas"). */
  count?: number;
}

export interface FilterOptionsProps {
  /** Names the list, e.g. "Tags". */
  'aria-label': string;
  options: FilterOption[];
  /** The ids that are ticked. */
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  /** The icon in front of every option, e.g. a tag. */
  icon?: ReactNode;
  /** Words for an option's count. @default n => String(n) */
  countLabel?: (n: number) => string;
  /** A "Filter..." search over the list. @default more than five options */
  searchable?: boolean;
  /** @default 'Filter...' */
  placeholder?: string;
  /** What the list says when the search matches nothing. @default 'No matches' */
  emptyLabel?: string;
}

/**
 * The searchable submenu of a filter (the prototype's `.pj-fsub`, after Linear): a "Filter..." search over a list
 * of options, each a checkbox, an icon, the value and how many items carry it ("Cycling 14 ideas"). The box shows on
 * the hovered row and on ticked ones; ticking keeps the list open. A React Aria Menu (multiple selection) inside an
 * Autocomplete with the system's SearchField, so typing narrows the list and the arrows still move through it.
 * Not in Figma yet.
 */
export function FilterOptions({'aria-label': label, options, selected, onChange, icon, countLabel = String,
  searchable = options.length > 5, placeholder = 'Filter...', emptyLabel = 'No matches'}: FilterOptionsProps) {
  const {contains} = useFilter({sensitivity: 'base'});
  const [query, setQuery] = useState('');
  const overlay = useContext(OverlayTriggerStateContext);
  // With the search focused, React Aria's Escape would also clear every ticked option. Here Escape empties the search
  // first, then closes the submenu, and never touches the ticks.
  const onEscape = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    e.preventDefault();
    if (query) { setQuery(''); return; }
    // Back to the row that opened this submenu, as React Aria's own Escape would.
    const menuId = e.currentTarget.querySelector('[role="menu"]')?.id;
    const trigger = menuId ? document.querySelector<HTMLElement>(`[aria-controls="${menuId}"]`) : null;
    overlay?.close();
    trigger?.focus();
  };
  const list = (
    <Menu aria-label={label} className="react-aria-Menu gv-filter-options__list" items={options}
      selectionMode="multiple" selectedKeys={selected}
      onSelectionChange={keys => onChange(keys === 'all' ? options.map(o => o.id) : [...keys].map(String))}
      renderEmptyState={() => emptyLabel}>
      {o => (
        <MenuItem id={o.id} textValue={o.label} className="react-aria-MenuItem gv-filter-options__item">
          {({isSelected}) => (
            <>
              <span className="gv-filter-options__box" data-selected={isSelected || undefined} aria-hidden>
                {isSelected && <Check size={11} strokeWidth={3} />}
              </span>
              {(o.icon ?? icon) && <span className="gv-filter-options__icon" aria-hidden>{o.icon ?? icon}</span>}
              <span className="gv-filter-options__label">{o.label}</span>
              {o.count != null && <span className="gv-filter-options__count">{countLabel(o.count)}</span>}
            </>
          )}
        </MenuItem>
      )}
    </Menu>
  );
  return (
    <div className="gv-filter-options" onKeyDownCapture={searchable ? onEscape : undefined}>
      {searchable ? (
        <Autocomplete filter={contains} inputValue={query} onInputChange={setQuery}>
          <SearchField aria-label={`Filter ${label.toLowerCase()}`} placeholder={placeholder} autoFocus
            className="react-aria-SearchField gv-filter-options__search" />
          {list}
        </Autocomplete>
      ) : list}
    </div>
  );
}

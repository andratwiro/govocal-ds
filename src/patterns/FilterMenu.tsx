'use client';
import type {ReactNode} from 'react';
import {Funnel, X} from 'lucide-react';
import {MenuTrigger as AriaMenuTrigger} from 'react-aria-components/Menu';
import {Dialog} from 'react-aria-components/Dialog';
import {Menu, MenuItem, Separator, SubmenuTrigger} from '../components/Menu';
import {Popover} from '../components/Popover';
import {IconButton} from '../components/gv/IconButton';
import {FilterOptions, type FilterOption} from './FilterOptions';
import './FilterMenu.css';

/** One thing a list can be filtered by ("Tags"), with the values it can take. */
export interface FilterFacet {
  id: string;
  label: string;
  /** The facet's icon, in the menu, the chip and (unless an option has its own) in front of every option. */
  icon: ReactNode;
  options: FilterOption[];
  /** A "Filter..." search over the options. @default more than five options */
  searchable?: boolean;
}

/** The active filters: for each facet id, the ticked option ids. A facet with none is off. */
export type FilterValue = Record<string, readonly string[]>;

/** The facets that have at least one value ticked. */
export const activeFacets = (facets: FilterFacet[], value: FilterValue) => facets.filter(f => value[f.id]?.length);

export interface FilterMenuProps {
  facets: FilterFacet[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  /** Words for an option's count in the submenus, e.g. `n => \`${n} ideas\``. */
  countLabel?: (n: number) => string;
  /** Names the trigger and the menu. @default 'Filter' */
  'aria-label'?: string;
  /** Opens the menu on first render (for stories and screenshots). */
  defaultOpen?: boolean;
}

/**
 * The filter button and its menu (the prototype's Manage filter, after Linear): a bordered funnel icon button that
 * wears a dot while any filter is on; its menu lists the facets, each with how many values are ticked and a
 * submenu of options (`FilterOptions`, searchable when long); "Clear all filters" follows a divider once something
 * is on. Ticking an option keeps the menus open. React Aria's MenuTrigger, Menu and SubmenuTrigger underneath.
 * Pair it with `FilterChips` on the same `value` so the two stay in sync. Not in Figma yet.
 */
export function FilterMenu({facets, value, onChange, countLabel, 'aria-label': label = 'Filter', defaultOpen}: FilterMenuProps) {
  const on = activeFacets(facets, value).length;
  const options = (f: FilterFacet) => (
    <FilterOptions aria-label={f.label} options={f.options} icon={f.icon} countLabel={countLabel}
      searchable={f.searchable ?? f.options.length > 5} selected={value[f.id] ?? []}
      onChange={next => onChange({...value, [f.id]: next})} />
  );
  return (
    <AriaMenuTrigger defaultOpen={defaultOpen}>
      <span className="gv-filter-menu__trigger" data-active={on > 0 || undefined}>
        <IconButton variant="bordered" tone="strong" aria-label={on ? `${label} (${on} on)` : label}>
          <Funnel aria-hidden size={16} />
        </IconButton>
      </span>
      <Popover placement="bottom end" hideArrow>
        <Menu aria-label={label} className="react-aria-Menu gv-filter-menu"
          onAction={key => { if (key === 'clear-all') onChange({}); }}>
          {facets.map(f => {
            const n = value[f.id]?.length ?? 0;
            return (
              <SubmenuTrigger key={f.id}>
                <MenuItem id={f.id} textValue={f.label}>
                  <span className="gv-filter-menu__icon" aria-hidden>{f.icon}</span>
                  <span className="gv-filter-menu__label">{f.label}</span>
                  {n > 0 && <span className="gv-filter-menu__count">{n}</span>}
                </MenuItem>
                {/* A long list gets its search: a dialog submenu holding the Autocomplete. A short one is a plain submenu. */}
                {(f.searchable ?? f.options.length > 5) ? (
                  <Dialog aria-label={f.label} className="gv-filter-menu__sub">{options(f)}</Dialog>
                ) : options(f)}
              </SubmenuTrigger>
            );
          })}
          {on > 0 && <Separator />}
          {on > 0 && (
            <MenuItem id="clear-all" textValue="Clear all filters">
              <X aria-hidden />
              <span className="gv-filter-menu__label">Clear all filters</span>
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </AriaMenuTrigger>
  );
}

'use client';
import type {ReactNode} from 'react';
import {Funnel, X} from 'lucide-react';
import {MenuTrigger as AriaMenuTrigger} from 'react-aria-components/Menu';
import {Dialog} from 'react-aria-components/Dialog';
import {Menu, MenuItem, SubmenuTrigger} from '../components/Menu';
import {Separator} from '../components/Separator';
import {Popover} from '../components/Popover';
import {IconButton} from '../components/gv/IconButton';
import {OptionList, optionListLabels, type OptionListItem, type OptionListLabels} from '../components/gv/OptionList';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels} from '../components/labels';
import clsx from 'clsx';
import './FilterMenu.css';

/** The words Filter menu says itself (docs/API.md rule 11), with the Option list's, which it hands on. */
export interface FilterMenuLabels extends OptionListLabels {
  /** The trigger's and the menu's name, when no `aria-label` is given. */
  filter: string;
  /** The trigger's name while filters are on, given that name and how many facets are on. */
  active: (label: string, count: number, formatted: string) => string;
  clearAll: string;
}

/** Filter menu's English words; a page passes its own over them with `labels`. */
export const filterMenuLabels: FilterMenuLabels = {
  ...optionListLabels,
  filter: 'Filter',
  active: (label, count, n) => `${label} (${n} on)`,
  clearAll: 'Clear all filters'
};

/** One thing a list can be filtered by ("Tags"), with the values it can take. */
export interface FilterFacet {
  id: string;
  label: string;
  /** The facet's icon, in the menu, the chip and (unless an option has its own) in front of every option. */
  icon: ReactNode;
  /** The values it can take. */
  items: OptionListItem[];
  /** A "Filter..." search over the values. @default more than five */
  isSearchable?: boolean;
}

/** The active filters: for each facet id, the ticked option ids. A facet with none is off. */
export type FilterValue = Record<string, readonly string[]>;

/** The facets that have at least one value ticked. */
export const activeFacets = (facets: FilterFacet[], value: FilterValue) => facets.filter(f => value[f.id]?.length);

export interface FilterMenuProps extends PlacementProps {
  facets: FilterFacet[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  /** Words for an option's count in the submenus, e.g. `n => \`${n} ideas\``. */
  countLabel?: (n: number) => string;
  /** Names the trigger and the menu. @default `labels.filter` ("Filter") */
  'aria-label'?: string;
  /** Opens the menu on first render (for stories and screenshots). */
  defaultOpen?: boolean;
  /** Its own words (the trigger's name, Clear all filters, the submenus' search), over `filterMenuLabels`. */
  labels?: Partial<FilterMenuLabels>;
}

/**
 * The filter button and its menu (the prototype's Manage filter, after Linear): a bordered funnel icon button that
 * wears a dot while any filter is on; its menu lists the facets, each with how many values are ticked and a
 * submenu of options (`OptionList`, searchable when long); "Clear all filters" follows a divider once something
 * is on. Ticking an option keeps the menus open. React Aria's MenuTrigger, Menu and SubmenuTrigger underneath.
 * Pair it with `FilterChips` on the same `value` so the two stay in sync. Not in Figma yet.
 */
export function FilterMenu({facets, value, onChange, countLabel, 'aria-label': ariaLabel, defaultOpen, labels, className, style}: FilterMenuProps) {
  const l = mergeLabels(filterMenuLabels, labels);
  const label = ariaLabel ?? l.filter;
  const on = activeFacets(facets, value).length;
  const number = useNumberFormatter();
  const options = (f: FilterFacet) => (
    <OptionList aria-label={f.label} items={f.items} icon={f.icon} countLabel={countLabel} labels={l}
      isSearchable={f.isSearchable ?? f.items.length > 5} value={value[f.id] ?? []}
      onChange={next => onChange({...value, [f.id]: next})} />
  );
  return (
    <AriaMenuTrigger defaultOpen={defaultOpen}>
      <span className={clsx('gv-filter-menu__trigger', className)} style={style} data-active={on > 0 || undefined}>
        <IconButton variant="bordered" emphasis="strong" aria-label={on ? l.active(label, on, number.format(on)) : label}>
          <Funnel aria-hidden size={16} />
        </IconButton>
      </span>
      <Popover placement="bottom end" showArrow={false}>
        <Menu aria-label={label} className="gv-filter-menu"
          onAction={key => { if (key === 'clear-all') onChange({}); }}>
          {facets.map(f => {
            const n = value[f.id]?.length ?? 0;
            return (
              <SubmenuTrigger key={f.id}>
                <MenuItem id={f.id} textValue={f.label}>
                  <span className="gv-filter-menu__icon" aria-hidden>{f.icon}</span>
                  <span className="gv-filter-menu__label">{f.label}</span>
                  {n > 0 && <span className="gv-filter-menu__count">{number.format(n)}</span>}
                </MenuItem>
                {/* A long list gets its search: a dialog submenu holding the Autocomplete. A short one is a plain submenu. */}
                {(f.isSearchable ?? f.items.length > 5) ? (
                  <Dialog aria-label={f.label} className="gv-filter-menu__sub">{options(f)}</Dialog>
                ) : options(f)}
              </SubmenuTrigger>
            );
          })}
          {on > 0 && <Separator />}
          {on > 0 && (
            <MenuItem id="clear-all" textValue={l.clearAll}>
              <X aria-hidden />
              <span className="gv-filter-menu__label">{l.clearAll}</span>
            </MenuItem>
          )}
        </Menu>
      </Popover>
    </AriaMenuTrigger>
  );
}

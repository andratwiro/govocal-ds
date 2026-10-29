'use client';
import {X} from 'lucide-react';
import {Button} from 'react-aria-components/Button';
import {Tag, TagGroup, TagList} from 'react-aria-components/TagGroup';
import {activeFacets, type FilterFacet, type FilterValue} from './FilterMenu';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useListFormatter} from '../components/format';
import {mergeLabels, type CountLabel} from '../components/labels';
import './FilterChips.css';

/** The words Filter chips says itself (docs/API.md rule 11). */
export interface FilterChipsLabels {
  /** The bar's name, when no `aria-label` is given. */
  filters: string;
  /** Between a facet and its values, given how many values are ticked ("is", "is any of"). */
  operator: CountLabel;
  /** A chip's × name, given the facet's (or the quick view's) name. */
  remove: (name: string) => string;
  /** The Clear button's text, which turns every filter off. */
  clear: string;
}

/** Filter chips' English words; a page passes its own over them with `labels`. */
export const filterChipsLabels: FilterChipsLabels = {
  filters: 'Active filters',
  operator: count => (count > 1 ? 'is any of' : 'is'),
  remove: name => `Remove the ${name} filter`,
  clear: 'Clear'
};

export interface FilterChipsProps extends PlacementProps {
  /** The things the list can be filtered by; the same facets as `FilterMenu`. */
  facets: FilterFacet[];
  /** The active filters: for each facet id, the ticked option ids. */
  value: FilterValue;
  /** Fires when a chip's × (or Clear) turns filters off, with the new value. */
  onChange: (value: FilterValue) => void;
  /** Adds a "Clear" button after the chips that turns every filter off. @default true */
  showClear?: boolean;
  /**
   * A quick view that filters the table too, picked from the stats above it ("New ideas", "Unassigned"): a chip
   * with its name only, first in the bar. Its × and Clear call `onMetricRemove`.
   */
  metric?: string;
  /** Turns the quick view off. */
  onMetricRemove?: () => void;
  /** @default `labels.filters` ("Active filters") */
  'aria-label'?: string;
  /** Its own words ("is", "is any of", each ×'s name, Clear), over `filterChipsLabels`. The values are joined as the
   * locale lists them. */
  labels?: Partial<FilterChipsLabels>;
}

const METRIC = '__metric';

/**
 * The active-filter bar (the prototype's `.pj-infbar`, after Linear): one chip per facet that is on, reading
 * "Assignee | is | Manager A | ×" ("is any of" and a list once several values are ticked), on a quiet strip with
 * "Clear" at the end. The × (or Delete / Backspace on a focused chip) turns that facet off. A React Aria TagGroup, so
 * the arrows move between chips. Renders nothing while no filter is on. Share `value` with `FilterMenu` and the two
 * stay in sync. A `metric` (a quick view from the stats row) leads the bar as a chip with its name only. Not in Figma
 * yet.
 */
export function FilterChips({
  facets, value, onChange, showClear = true, metric, onMetricRemove, 'aria-label': label, labels,
  className,
  style
}: FilterChipsProps) {
  const l = mergeLabels(filterChipsLabels, labels);
  const list = useListFormatter({type: 'unit', style: 'short'});
  const on = activeFacets(facets, value);
  if (on.length === 0 && !metric) return null;
  const remove = (ids: Iterable<string | number>) => {
    const keys = [...ids].map(String);
    if (keys.includes(METRIC)) onMetricRemove?.();
    const facetKeys = keys.filter(k => k !== METRIC);
    if (!facetKeys.length) return;
    const next = {...value};
    for (const id of facetKeys) delete next[id];
    onChange(next);
  };
  const clear = () => {
    if (metric) onMetricRemove?.();
    if (on.length) onChange({});
  };
  return (
    <div className={clsx('gv-filter-chips', className)} style={style}>
      <TagGroup aria-label={label ?? l.filters} onRemove={keys => remove(keys)} className="gv-filter-chips__group">
        <TagList className="gv-filter-chips__list">
          {metric && (
            <Tag id={METRIC} textValue={metric} className="gv-filter-chip" data-metric>
              <span className="gv-filter-chip__key">{metric}</span>
              <Button slot="remove" className="gv-filter-chip__remove" aria-label={l.remove(metric)}>
                <X aria-hidden size={14} />
              </Button>
            </Tag>
          )}
          {on.map(f => {
            const ids = value[f.id];
            const words = list.format(ids.map(id => f.items.find(o => o.id === id)?.label ?? id));
            const op = l.operator(ids.length, String(ids.length));
            return (
              <Tag key={f.id} id={f.id} textValue={`${f.label} ${op} ${words}`} className="gv-filter-chip">
                <span className="gv-filter-chip__key"><span className="gv-filter-chip__icon" aria-hidden>{f.icon}</span>{f.label}</span>
                <span className="gv-filter-chip__op">{op}</span>
                <span className="gv-filter-chip__value">{words}</span>
                <Button slot="remove" className="gv-filter-chip__remove" aria-label={l.remove(f.label)}>
                  <X aria-hidden size={14} />
                </Button>
              </Tag>
            );
          })}
        </TagList>
      </TagGroup>
      {showClear && (
        <Button className="gv-filter-chips__clear" onPress={clear}>{l.clear}</Button>
      )}
    </div>
  );
}

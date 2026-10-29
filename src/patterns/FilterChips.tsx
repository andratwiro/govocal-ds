'use client';
import {X} from 'lucide-react';
import {Button} from 'react-aria-components/Button';
import {Tag, TagGroup, TagList} from 'react-aria-components/TagGroup';
import {activeFacets, type FilterFacet, type FilterValue} from './FilterMenu';
import './FilterChips.css';

export interface FilterChipsProps {
  facets: FilterFacet[];
  value: FilterValue;
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
  /** @default 'Active filters' */
  'aria-label'?: string;
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
  facets, value, onChange, showClear = true, metric, onMetricRemove, 'aria-label': label = 'Active filters'
}: FilterChipsProps) {
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
    <div className="gv-filter-chips">
      <TagGroup aria-label={label} onRemove={keys => remove(keys)} className="gv-filter-chips__group">
        <TagList className="gv-filter-chips__list">
          {metric && (
            <Tag id={METRIC} textValue={metric} className="gv-filter-chip" data-metric>
              <span className="gv-filter-chip__key">{metric}</span>
              <Button slot="remove" className="gv-filter-chip__remove" aria-label={`Remove the ${metric} filter`}>
                <X aria-hidden size={14} />
              </Button>
            </Tag>
          )}
          {on.map(f => {
            const ids = value[f.id];
            const words = ids.map(id => f.options.find(o => o.id === id)?.label ?? id).join(', ');
            const op = ids.length > 1 ? 'is any of' : 'is';
            return (
              <Tag key={f.id} id={f.id} textValue={`${f.label} ${op} ${words}`} className="gv-filter-chip">
                <span className="gv-filter-chip__key"><span className="gv-filter-chip__icon" aria-hidden>{f.icon}</span>{f.label}</span>
                <span className="gv-filter-chip__op">{op}</span>
                <span className="gv-filter-chip__value">{words}</span>
                <Button slot="remove" className="gv-filter-chip__remove" aria-label={`Remove the ${f.label} filter`}>
                  <X aria-hidden size={14} />
                </Button>
              </Tag>
            );
          })}
        </TagList>
      </TagGroup>
      {showClear && (
        <Button className="gv-filter-chips__clear" onPress={clear}>Clear</Button>
      )}
    </div>
  );
}

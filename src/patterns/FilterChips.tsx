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
  /** @default 'Active filters' */
  'aria-label'?: string;
}

/**
 * The active-filter bar (the prototype's `.pj-infbar`, after Linear): one chip per facet that is on, reading
 * "Assignee | is | Manager A | ×" ("is any of" and a list once several values are ticked), on a quiet strip with
 * "Clear" at the end. The × (or Delete / Backspace on a focused chip) turns that facet off. A React Aria TagGroup, so
 * the arrows move between chips. Renders nothing while no filter is on. Share `value` with `FilterMenu` and the two
 * stay in sync. Not in Figma yet.
 */
export function FilterChips({facets, value, onChange, showClear = true, 'aria-label': label = 'Active filters'}: FilterChipsProps) {
  const on = activeFacets(facets, value);
  if (on.length === 0) return null;
  const remove = (ids: Iterable<string | number>) => {
    const next = {...value};
    for (const id of ids) delete next[String(id)];
    onChange(next);
  };
  return (
    <div className="gv-filter-chips">
      <TagGroup aria-label={label} onRemove={keys => remove(keys)} className="gv-filter-chips__group">
        <TagList className="gv-filter-chips__list">
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
        <Button className="gv-filter-chips__clear" onPress={() => onChange({})}>Clear</Button>
      )}
    </div>
  );
}

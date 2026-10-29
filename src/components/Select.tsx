'use client';
import type {ReactNode} from 'react';
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue,
  type ValidationResult,
  type ListBoxProps
} from 'react-aria-components/Select';
import {Autocomplete, useFilter} from 'react-aria-components/Autocomplete';
import {Button} from './Button';
import {DropdownItem, DropdownListBox, type DropdownItemProps} from './ListBox';
import {ChevronDown} from 'lucide-react';
import {Popover} from './Popover';
import {SearchField} from './SearchField';
import {Label, FieldError, Description} from './Form';
import clsx from 'clsx';
import './Select.css';
import {keepClass} from './className';
import {mergeLabels} from './labels';

/** The words Select says itself (docs/API.md rule 11), all in its search. */
export interface SelectLabels {
  /** The search's placeholder when no `searchPlaceholder` is given. */
  placeholder: string;
  /** The search's name, given the field's name (its label, else its `aria-label`, else `labels.options`). A
   * `searchPlaceholder` without its dots names it instead, unless this is given. */
  search: (field: string) => string;
  /** What the list says when the search matches nothing, when no `emptyLabel` is given. */
  empty: string;
  /** The field's name for the search when it has neither a label nor an `aria-label`. */
  options: string;
}

/** Select's English words; a page passes its own over them with `labels`. */
export const selectLabels: SelectLabels = {
  placeholder: 'Search...',
  search: field => `Search ${field.toLowerCase()}`,
  empty: 'No results',
  options: 'options'
};

interface SelectBaseProps<T, M extends 'single' | 'multiple'> extends Omit<
  AriaSelectProps<T, M>,
  'children'
> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  /** A 16 icon at the start of the trigger, when the options carry none of their own (theirs show there too). */
  icon?: ReactNode;
  /** Words before the value, seen but not read ("Space:"): the label or `aria-label` names the field. */
  prefix?: string;
  /** A search at the top of the list, the magnifier first: typing narrows it, ↑↓ still move through it. */
  isSearchable?: boolean;
  /** This field's search hint ("Search spaces"); it names the search too, without its dots. @default `labels.placeholder` */
  searchPlaceholder?: string;
  /** What this list says when the search matches nothing. @default `labels.empty` */
  emptyLabel?: string;
  /** Its own words (the search's name and hint, No results), over `selectLabels`. */
  labels?: Partial<SelectLabels>;
}

/**
 * The trigger's look and its height, which the look decides.
 * - `field` (default): a form field, as wide as the Select; 36 (default) or 32.
 * - `quiet`: no fill until hovered, for a toolbar ("Sort: Newest"); 32 (default) or 36.
 * - `pill`: a round grey chip sized to its value, for a value shown among others (New project's "Space", a side
 *   panel's Status); 28 (default, New project) or 22 (a side panel's property row, Small strong).
 */
export type SelectLook =
  | {variant?: 'field' | 'quiet'; size?: 32 | 36}
  | {variant: 'pill'; size?: 22 | 28};

export type SelectProps<T, M extends 'single' | 'multiple' = 'single'> = SelectBaseProps<T, M> & SelectLook;

/**
 * Pick one value (or several) from a list in a popover: React Aria's Select, its options the dropdown rows (a 16
 * icon or avatar, a description line, a check at the end of the chosen one). With `isSearchable`, an Autocomplete and
 * the system's SearchField sit over the list. Not in Figma yet.
 */
export function Select<T, M extends 'single' | 'multiple' = 'single'>({
  label,
  description,
  errorMessage,
  children,
  items,
  variant = 'field',
  size,
  icon,
  prefix,
  isSearchable,
  searchPlaceholder,
  emptyLabel,
  labels,
  ...props
}: SelectProps<T, M>) {
  const l = mergeLabels(selectLabels, labels);
  const {contains} = useFilter({sensitivity: 'base'});
  const height = variant === 'pill' ? (size === 22 ? 22 : 28) : size === 36 || (!size && variant === 'field') ? 36 : 32;
  const name = label ?? props['aria-label'] ?? l.options;
  const searchName = searchPlaceholder != null && !labels?.search ? searchPlaceholder.replace(/(\.\.\.|…)$/, '') : l.search(name);
  const list = (
    // Inside a search, React Aria would call the list "Suggestions"; it keeps the field's name.
    <SelectListBox items={items} aria-label={isSearchable ? name : undefined} renderEmptyState={() => emptyLabel ?? l.empty}>
      {children}
    </SelectListBox>
  );
  return (
    <AriaSelect {...props} className={keepClass(props.className, 'gv-base-select')} data-variant={variant} data-size={height}>
      {label && <Label>{label}</Label>}
      <Button variant={variant === 'field' ? 'secondary' : 'quiet'} size={height === 36 ? 36 : 32}>
        {icon && <span className="gv-select-icon" aria-hidden>{icon}</span>}
        {prefix && <span className="gv-select-prefix" aria-hidden>{prefix}</span>}
        <SelectValue className="react-aria-SelectValue gv-base-select-value" />
        <ChevronDown />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover showArrow={false} className={clsx('select-popover', variant !== 'field' && 'select-popover--fit',
        isSearchable && 'select-popover--search')}>
        {isSearchable ? (
          <Autocomplete filter={contains}>
            <div className="select-search">
              <SearchField aria-label={searchName} placeholder={searchPlaceholder ?? l.placeholder}
                autoFocus className="select-search__field" />
              {list}
            </div>
          </Autocomplete>
        ) : list}
      </Popover>
    </AriaSelect>
  );
}

export function SelectListBox<T>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export type SelectItemProps = DropdownItemProps;

/** An option: its name, an optional 16 `icon` (or a 16 Avatar) before it and a `description` line under it. */
export function SelectItem(props: SelectItemProps) {
  return <DropdownItem {...props} />;
}

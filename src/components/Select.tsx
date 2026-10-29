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
  /** @default 'Search...' */
  searchPlaceholder?: string;
  /** Names the search for screen readers. @default the placeholder without its dots, else "Search <label>" */
  searchLabel?: string;
  /** What the list says when the search matches nothing. @default 'No results' */
  emptyLabel?: string;
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
  searchPlaceholder = 'Search...',
  searchLabel,
  emptyLabel = 'No results',
  ...props
}: SelectProps<T, M>) {
  const {contains} = useFilter({sensitivity: 'base'});
  const height = variant === 'pill' ? (size === 22 ? 22 : 28) : size === 36 || (!size && variant === 'field') ? 36 : 32;
  const name = label ?? props['aria-label'] ?? 'options';
  const list = (
    // Inside a search, React Aria would call the list "Suggestions"; it keeps the field's name.
    <SelectListBox items={items} aria-label={isSearchable ? name : undefined} renderEmptyState={() => emptyLabel}>
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
              <SearchField aria-label={searchLabel ?? (searchPlaceholder === 'Search...' ? `Search ${name.toLowerCase()}`
                : searchPlaceholder.replace(/(\.\.\.|…)$/, ''))} placeholder={searchPlaceholder}
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

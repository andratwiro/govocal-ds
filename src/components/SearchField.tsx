'use client';
import {
  Button,
  Input,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  type ValidationResult
} from 'react-aria-components/SearchField';
import {useEffect, useId, useRef, useState} from 'react';
import {Label, FieldError, Description} from './Form';
import {IconButton} from './gv/IconButton';
import {Tooltip, TooltipTrigger} from './Tooltip';
import {Search, X} from 'lucide-react';
import './SearchField.css';
import {keepClass} from './className';
import {mergeLabels} from './labels';

/** The words Search field says itself (docs/API.md rule 11). React Aria names the × ("Clear search") in the
 * locale itself. */
export interface SearchFieldLabels {
  /** The collapsible field's button and its tooltip, when no `aria-label` or `label` names it. */
  search: string;
}

/** Search field's English words; a page passes its own over them with `labels`. */
export const searchFieldLabels: SearchFieldLabels = {search: 'Search'};

export interface SearchFieldProps extends AriaSearchFieldProps {
  /** The field's name, above it. Leave it out and pass an `aria-label` for a bare search box. */
  label?: string;
  /** A grey line under the field. */
  description?: string;
  /** The error shown under it when it is invalid: text, or a function of React Aria's validation result. */
  errorMessage?: string | ((validation: ValidationResult) => string);
  /** Hint text shown while the field is empty, e.g. "Search projects". */
  placeholder?: string;
  /**
   * Starts as a bordered search icon button that opens into the field, as the prototype's Manage tables do. Esc
   * on an empty field folds it back and puts focus on the button; leaving it empty folds it too. It stays open
   * while it holds a query. Give it an `aria-label`: the button and the field share it.
   *
   * @default false
   */
  isCollapsible?: boolean;
  /** Collapsible only: start open. @default false */
  defaultExpanded?: boolean;
  /** Collapsible only: called when the field opens or folds. */
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Its own words, over `searchFieldLabels`. */
  labels?: Partial<SearchFieldLabels>;
}

/**
 * Search field: a field like the others with the magnifier at the start and a quiet × at the end once there is
 * text (Esc clears it too). React Aria's SearchField: Enter submits (`onSubmit`), `onClear` follows the × and Esc.
 */
export function SearchField({
  label,
  description,
  errorMessage,
  placeholder,
  isCollapsible,
  defaultExpanded,
  onExpandedChange,
  labels,
  ...props
}: SearchFieldProps) {
  const l = mergeLabels(searchFieldLabels, labels);
  const filled = !!(props.value ?? props.defaultValue);
  const [expanded, setExpandedState] = useState(!isCollapsible || defaultExpanded || filled);
  // Where focus goes after the next render: into the field once it opens, onto the button once it folds.
  const focusNext = useRef<'field' | 'button' | null>(null);
  const buttonId = useId();
  const input = useRef<HTMLInputElement>(null);
  // Only a field the person opened grows out of its button; one that starts open just stands there.
  const opened = useRef(false);

  const setExpanded = (next: boolean, focus: 'field' | 'button' | null) => {
    focusNext.current = focus;
    setExpandedState(next);
    onExpandedChange?.(next);
  };

  useEffect(() => {
    if (focusNext.current === 'field') input.current?.focus();
    if (focusNext.current === 'button') document.getElementById(buttonId)?.focus();
    focusNext.current = null;
  }, [expanded]);

  if (isCollapsible && !expanded) {
    const name = props['aria-label'] ?? label ?? l.search;
    return (
      <TooltipTrigger>
        <IconButton id={buttonId} variant="bordered" emphasis="strong" aria-label={name} isDisabled={props.isDisabled}
          className={typeof props.className === 'string' ? props.className : undefined} style={typeof props.style === 'object' ? props.style : undefined}
          onPress={() => { opened.current = true; setExpanded(true, 'field'); }}>
          <Search aria-hidden size={16} />
        </IconButton>
        <Tooltip>{l.search}</Tooltip>
      </TooltipTrigger>
    );
  }

  // React Aria clears a filled field on Esc and lets an empty one's Esc through: that one folds the field. The
  // input still shows what it held before this key, so an Esc that only cleared it doesn't fold it as well.
  const onKeyDown: AriaSearchFieldProps['onKeyDown'] = e => {
    props.onKeyDown?.(e);
    if (isCollapsible && e.key === 'Escape' && input.current?.value === '') {
      e.preventDefault();
      setExpanded(false, 'button');
    }
  };

  return (
    <AriaSearchField {...props} className={keepClass(props.className, 'gv-base-search-field')} onKeyDown={onKeyDown}
      onBlur={e => {
        props.onBlur?.(e);
        // Leaving an empty field folds it (not while an Esc fold is already on its way back to the button).
        if (isCollapsible && focusNext.current === null && input.current?.value === '') setExpanded(false, null);
      }}
      data-collapsible={isCollapsible || undefined} data-opened={(isCollapsible && opened.current) || undefined}>
      {label && <Label>{label}</Label>}
      <Search size={18} />
      <Input ref={input} placeholder={placeholder} className="react-aria-Input gv-base-input inset" />
      <Button className="clear-button">
        <X size={14} />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </AriaSearchField>
  );
}

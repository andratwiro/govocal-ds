'use client';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  type ListBoxItemProps,
  type ListBoxLoadMoreItemProps,
  type ListBoxProps,
  type ListBoxSectionProps
} from 'react-aria-components/ListBox';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Check} from 'lucide-react';
import type {ReactNode} from 'react';
import {Text} from './Content';
import {ProgressCircle} from './ProgressCircle';
import {loadMoreLabels, mergeLabels, type LoadMoreLabels} from './labels';
import './ListBox.css';
import {keepClass, ownClass} from './className';
import clsx from 'clsx';

export function ListBox<T>({children, ...props}: ListBoxProps<T>) {
  return <AriaListBox {...props} className={keepClass(props.className, 'gv-base-list-box')}>{children}</AriaListBox>;
}

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} className={keepClass(props.className, 'gv-base-list-box-item')} textValue={textValue}>
      {composeRenderProps(props.children, children =>
        typeof children === 'string' ? <Text slot="label">{children}</Text> : children
      )}
    </AriaListBoxItem>
  );
}

export function ListBoxSection<T>(props: ListBoxSectionProps<T>) {
  return <AriaListBoxSection {...props} className={clsx('react-aria-ListBoxSection gv-base-list-box-section', props.className)} />;
}

/** The spinner a ListBox shows while its next page loads; its name is `labels.loading` (`loadMoreLabels`). */
export function ListBoxLoadMoreItem({labels, ...props}: ListBoxLoadMoreItemProps & {labels?: Partial<LoadMoreLabels>}) {
  return (
    <AriaListBoxLoadMoreItem {...props} className={clsx('react-aria-ListBoxLoadingIndicator gv-base-list-box-loading-indicator', props.className)}>
      <ProgressCircle isIndeterminate aria-label={mergeLabels(loadMoreLabels, labels).loading} />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} className={ownClass('dropdown-listbox', props.className)} />;
}

export interface DropdownItemProps extends ListBoxItemProps {
  /** A 16 icon, or a 16 Avatar for a person, before the name. */
  icon?: ReactNode;
  /** A second line under the name, in Small secondary. */
  description?: ReactNode;
}

/** A Select or ComboBox option: icon · name (· description line) · a check at the end when chosen. */
export function DropdownItem({icon, description, ...props}: DropdownItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={ownClass('dropdown-item', props.className)}>
      {composeRenderProps(props.children, (children, {isSelected}) => (
        <>
          {icon && <span className="dropdown-item__icon" aria-hidden>{icon}</span>}
          {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
          {description && <Text slot="description">{description}</Text>}
          {isSelected && <Check className="dropdown-item__check" />}
        </>
      ))}
    </AriaListBoxItem>
  );
}

export type {ListBoxProps, ListBoxItemProps, ListBoxSectionProps};

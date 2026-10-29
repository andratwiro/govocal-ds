'use client';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  ListBoxSection as AriaListBoxSection,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  Header,
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
import './ListBox.css';

export function ListBox<T>({children, ...props}: ListBoxProps<T>) {
  return <AriaListBox {...props}>{children}</AriaListBox>;
}

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue}>
      {composeRenderProps(props.children, children =>
        typeof children === 'string' ? <Text slot="label">{children}</Text> : children
      )}
    </AriaListBoxItem>
  );
}

export function ListBoxSection<T>(props: ListBoxSectionProps<T>) {
  return <AriaListBoxSection {...props} />;
}

export function ListBoxLoadMoreItem(props: ListBoxLoadMoreItemProps) {
  return (
    <AriaListBoxLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaListBoxLoadMoreItem>
  );
}

export function DropdownListBox<T>(props: ListBoxProps<T>) {
  return <AriaListBox {...props} className="dropdown-listbox" />;
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
    <ListBoxItem {...props} textValue={textValue} className="dropdown-item">
      {composeRenderProps(props.children, (children, {isSelected}) => (
        <>
          {icon && <span className="dropdown-item__icon" aria-hidden>{icon}</span>}
          {typeof children === 'string' ? <Text slot="label">{children}</Text> : children}
          {description && <Text slot="description">{description}</Text>}
          {isSelected && <Check className="dropdown-item__check" />}
        </>
      ))}
    </ListBoxItem>
  );
}

export {Text, Header};

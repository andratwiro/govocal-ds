'use client';
import {Check, ChevronRight, Dot} from 'lucide-react';
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuLoadMoreItem as AriaMenuLoadMoreItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  SubmenuTrigger as AriaSubmenuTrigger,
  Header,
  Separator,
  Keyboard,
  type MenuItemProps,
  type MenuLoadMoreItemProps,
  type MenuProps,
  type MenuSectionProps,
  type MenuTriggerProps,
  type SubmenuTriggerProps
} from 'react-aria-components/Menu';
import {Popover} from './Popover';
import {ProgressCircle} from './ProgressCircle';
import {Text} from './Content';
import React from 'react';
import './Menu.css';

export function MenuTrigger(props: MenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement
  ];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover>{menu}</Popover>
    </AriaMenuTrigger>
  );
}

export function Menu<T>(props: MenuProps<T>) {
  return <AriaMenu {...props}>{props.children}</AriaMenu>;
}

export function MenuLoadMoreItem(props: MenuLoadMoreItemProps) {
  return (
    <AriaMenuLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaMenuLoadMoreItem>
  );
}

export function MenuItem(props: Omit<MenuItemProps, 'children'> & {children?: React.ReactNode}) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem {...props} textValue={textValue}>
      {({hasSubmenu, isSelected, selectionMode}) => (
        <>
          {isSelected && selectionMode === 'multiple' ? <Check /> : null}
          {isSelected && selectionMode === 'single' ? <Dot /> : null}
          {typeof props.children === 'string' ? (
            <Text slot="label">{props.children}</Text>
          ) : (
            props.children
          )}
          {hasSubmenu && <ChevronRight />}
        </>
      )}
    </AriaMenuItem>
  );
}

export function MenuSection<T>(props: MenuSectionProps<T>) {
  return <AriaMenuSection {...props} />;
}

export function SubmenuTrigger(props: SubmenuTriggerProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement
  ];
  return (
    <AriaSubmenuTrigger {...props}>
      {trigger}
      {/* 4 from the menu (its 6 padding + 1 border + 4), the first row on the line of the row that opens it. */}
      <Popover hideArrow offset={11} crossOffset={-7}>
        {menu}
      </Popover>
    </AriaSubmenuTrigger>
  );
}

export {Text, Header, Separator, Keyboard};

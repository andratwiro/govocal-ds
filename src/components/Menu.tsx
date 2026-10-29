'use client';
import {Check, ChevronRight} from 'lucide-react';
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
  type MenuItemProps as AriaMenuItemProps,
  type MenuLoadMoreItemProps,
  type MenuProps,
  type MenuSectionProps,
  type MenuTriggerProps,
  type SubmenuTriggerProps
} from 'react-aria-components/Menu';
import {Popover, type PopoverProps} from './Popover';
import {ProgressCircle} from './ProgressCircle';
import {Text} from './Content';
import React, {type ReactNode} from 'react';
import './Menu.css';

export interface MenuTriggerOwnProps extends MenuTriggerProps {
  /** Where the menu opens against its trigger. @default 'bottom start' */
  placement?: PopoverProps['placement'];
}

export function MenuTrigger({placement, ...props}: MenuTriggerOwnProps) {
  let [trigger, menu] = React.Children.toArray(props.children) as [
    React.ReactElement,
    React.ReactElement
  ];
  return (
    <AriaMenuTrigger {...props}>
      {trigger}
      <Popover placement={placement}>{menu}</Popover>
    </AriaMenuTrigger>
  );
}

/**
 * A list of actions or options in a popover (React Aria's Menu), in the prototype's one dropdown rhythm: rows 32 tall,
 * a leading icon, a description line, sections, separators, submenus. With `selectionMode="multiple"` each row carries
 * a box (shown when ticked or under the pointer); with `"single"` the chosen row gets a check at its end, as Select
 * draws it. Not in Figma yet.
 */
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

export interface MenuItemProps extends Omit<AriaMenuItemProps, 'children'> {
  children?: ReactNode;
  /** A leading 16 icon, or a 16 Avatar for a person. */
  icon?: ReactNode;
  /** A second line under the name, in Small secondary ("The project will show on every area filter."). */
  description?: ReactNode;
  /** A badge right after the name, read with it ("Download as Word · Beta"), e.g. `<Badge variant="outlined">`. */
  badge?: ReactNode;
}

export function MenuItem({icon, description, badge, ...props}: MenuItemProps) {
  let textValue =
    props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaMenuItem {...props} textValue={textValue}>
      {({hasSubmenu, isSelected, selectionMode}) => (
        <>
          {selectionMode === 'multiple' && (
            <span className="gv-menu-box" data-selected={isSelected || undefined} aria-hidden>
              {isSelected && <Check size={11} strokeWidth={3} />}
            </span>
          )}
          {icon && <span className="gv-menu-icon" aria-hidden>{icon}</span>}
          {typeof props.children === 'string' ? (
            <Text slot="label">{props.children}{badge && <> {badge}</>}</Text>
          ) : (
            props.children
          )}
          {description && <Text slot="description">{description}</Text>}
          {((isSelected && selectionMode === 'single') || hasSubmenu) && (
            <span className="gv-menu-end" aria-hidden>
              {isSelected && selectionMode === 'single' && <Check className="gv-menu-check" />}
              {hasSubmenu && <ChevronRight className="gv-menu-chevron" />}
            </span>
          )}
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

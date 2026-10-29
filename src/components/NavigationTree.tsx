'use client';
import {
  Button,
  Link,
  type LinkProps,
  NavigationTree as AriaNavigationTree,
  NavigationTreeHeader as AriaNavigationTreeHeader,
  type NavigationTreeHeaderProps,
  NavigationTreeItem as AriaNavigationTreeItem,
  NavigationTreeItemContent as AriaNavigationTreeItemContent,
  type NavigationTreeItemContentRenderProps,
  type NavigationTreeItemProps as AriaNavigationTreeItemProps,
  type NavigationTreeProps,
  NavigationTreeSection as AriaNavigationTreeSection,
  type NavigationTreeSectionProps
} from 'react-aria-components/NavigationTree';
import {ChevronRight} from 'lucide-react';
import React from 'react';
import './NavigationTree.css';
import {keepClass} from './className';
import clsx from 'clsx';

const RenderLinkContext = React.createContext<LinkProps['render'] | undefined>(undefined);

export function NavigationTree<T>({
  renderLink,
  ...props
}: NavigationTreeProps<T> & {renderLink?: LinkProps['render']}) {
  return (
    <RenderLinkContext.Provider value={renderLink}>
      <AriaNavigationTree {...props} className={keepClass(props.className)} />
    </RenderLinkContext.Provider>
  );
}

export function NavigationTreeItemContent(props: {children?: React.ReactNode}) {
  return (
    <AriaNavigationTreeItemContent>
      {({hasChildItems}: NavigationTreeItemContentRenderProps) => (
        <>
          {props.children}
          <Button
            slot="chevron"
            isDisabled={!hasChildItems}
            style={{visibility: hasChildItems ? undefined : 'hidden'}}>
            <ChevronRight aria-hidden />
          </Button>
        </>
      )}
    </AriaNavigationTreeItemContent>
  );
}

export function NavigationTreeItem(props: AriaNavigationTreeItemProps) {
  return <AriaNavigationTreeItem {...props} className={keepClass(props.className)} />;
}

export function NavigationTreeSection<T extends object>(props: NavigationTreeSectionProps<T>) {
  return <AriaNavigationTreeSection {...props} className={clsx('react-aria-NavigationTreeSection', props.className)} />;
}

export function NavigationTreeHeader(props: NavigationTreeHeaderProps) {
  return <AriaNavigationTreeHeader {...props} className={clsx('react-aria-NavigationTreeHeader', props.className)} />;
}

export function NavigationTreeItemLink({render: renderProp, ...props}: LinkProps) {
  const contextRender = React.useContext(RenderLinkContext);
  return <Link render={renderProp ?? contextRender} {...props} className={keepClass(props.className)} />;
}

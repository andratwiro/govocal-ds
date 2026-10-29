'use client';
import {
  Button,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  type TreeItemContentProps,
  type TreeItemContentRenderProps,
  type TreeItemProps as AriaTreeItemProps,
  type TreeProps,
  TreeLoadMoreItem as AriaTreeLoadMoreItem,
  type TreeLoadMoreItemProps,
  TreeSection as AriaTreeSection,
  TreeHeader as AriaTreeHeader
} from 'react-aria-components/Tree';
import {ChevronRight, GripVertical} from 'lucide-react';
import {Checkbox} from './Checkbox';
import {ProgressCircle} from './ProgressCircle';
import {loadMoreLabels, mergeLabels, type LoadMoreLabels} from './labels';
import './Tree.css';
import {keepClass} from './className';
import clsx from 'clsx';

/** A nested list that expands and collapses, with selectable rows; React Aria's Tree. Use it for folders or hierarchies. */
export function Tree<T>(props: TreeProps<T>) {
  return <AriaTree {...props} className={keepClass(props.className, 'gv-base-tree')} />;
}

export function TreeItemContent(
  props: Omit<TreeItemContentProps, 'children'> & {children?: React.ReactNode}
) {
  return (
    <AriaTreeItemContent>
      {({selectionBehavior, selectionMode, allowsDragging}: TreeItemContentRenderProps) => (
        <>
          {allowsDragging && (
            <Button className="react-aria-Button gv-base-button" slot="drag">
              <GripVertical size={16} />
            </Button>
          )}
          {selectionBehavior === 'toggle' && selectionMode !== 'none' && (
            <Checkbox slot="selection" />
          )}
          <Button className="react-aria-Button gv-base-button" slot="chevron">
            <ChevronRight />
          </Button>
          {props.children}
        </>
      )}
    </AriaTreeItemContent>
  );
}

export interface TreeItemProps extends Partial<AriaTreeItemProps> {
  title?: React.ReactNode;
}

export function TreeItem(props: TreeItemProps) {
  let textValue = typeof props.title === 'string' ? props.title : '';
  return (
    <AriaTreeItem textValue={textValue} {...props} className={keepClass(props.className, 'gv-base-tree-item')}>
      {props.title != null ? (
        <>
          <TreeItemContent>{props.title}</TreeItemContent>
          {props.children}
        </>
      ) : (
        props.children
      )}
    </AriaTreeItem>
  );
}

/** The spinner a Tree shows while its next page loads; its name is `labels.loading` (`loadMoreLabels`). */
export function TreeLoadMoreItem({labels, ...props}: TreeLoadMoreItemProps & {labels?: Partial<LoadMoreLabels>}) {
  return (
    <AriaTreeLoadMoreItem {...props} className={keepClass(props.className)}>
      <ProgressCircle isIndeterminate aria-label={mergeLabels(loadMoreLabels, labels).loading} />
    </AriaTreeLoadMoreItem>
  );
}

export function TreeSection(props: React.ComponentProps<typeof AriaTreeSection>) {
  return <AriaTreeSection {...props} className={clsx('react-aria-TreeSection gv-base-tree-section', props.className)} />;
}

export function TreeHeader(props: React.ComponentProps<typeof AriaTreeHeader>) {
  return <AriaTreeHeader {...props} className={clsx('react-aria-TreeHeader gv-base-tree-header', props.className)} />;
}
export type {TreeProps};

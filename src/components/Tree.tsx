'use client';
import {
  Button,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  type TreeItemContentProps,
  type TreeItemContentRenderProps,
  type TreeItemProps as AriaTreeItemProps,
  type TreeProps as AriaTreeProps,
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

export interface TreeProps<T> extends AriaTreeProps<T> {
  /**
   * No frame of its own: no border or radius, the full width of what holds it, for a tree inside a Panel (the report's
   * outline in a flush Panel body). Its rows line up with the Panel's head.
   *
   * @default false
   */
  isFlush?: boolean;
}

/** A tree of rows that open and close (React Aria's Tree): an outline, folders. `isFlush` drops its frame inside a Panel;
 * a row's `trailing` puts a page number or a count at its end. */
export function Tree<T>({isFlush, ...props}: TreeProps<T>) {
  return <AriaTree {...props} className={keepClass(props.className, 'gv-base-tree')} data-flush={isFlush || undefined} />;
}

export interface TreeItemContentOwnProps {
  /** At the row's end, in small grey figures: a page number, a count. */
  trailing?: React.ReactNode;
}

export function TreeItemContent(
  props: Omit<TreeItemContentProps, 'children'> & TreeItemContentOwnProps & {children?: React.ReactNode}
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
          {props.trailing != null && <span className="gv-base-tree-item__trailing">{props.trailing}</span>}
        </>
      )}
    </AriaTreeItemContent>
  );
}

export interface TreeItemProps extends Partial<AriaTreeItemProps>, TreeItemContentOwnProps {
  title?: React.ReactNode;
}

export function TreeItem({trailing, ...props}: TreeItemProps) {
  let textValue = typeof props.title === 'string' ? props.title : '';
  return (
    <AriaTreeItem textValue={textValue} {...props} className={keepClass(props.className, 'gv-base-tree-item')}>
      {props.title != null ? (
        <>
          <TreeItemContent trailing={trailing}>{props.title}</TreeItemContent>
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

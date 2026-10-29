'use client';
import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListLoadMoreItem as AriaGridListLoadMoreItem,
  GridListSection as AriaGridListSection,
  GridListHeader as AriaGridListHeader,
  type GridListItemProps,
  type GridListProps,
  type GridListLoadMoreItemProps,
  type GridListSectionProps,
  type GridListHeaderProps
} from 'react-aria-components/GridList';
import {Checkbox} from './Checkbox';
import {Text} from './Content';
import {GripVertical} from 'lucide-react';
import {ProgressCircle} from './ProgressCircle';
import './GridList.css';
import clsx from 'clsx';
import {keepClass} from './className';

export function GridList<T>({children, layout = 'grid', ...props}: GridListProps<T>) {
  return (
    <AriaGridList {...props} className={keepClass(props.className)} layout={layout}>
      {children}
    </AriaGridList>
  );
}

export function GridListItem({
  children,
  ...props
}: Omit<GridListItemProps, 'children'> & {
  children?: React.ReactNode;
}) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className={keepClass(props.className)}>
      {({selectionMode, selectionBehavior, allowsDragging}) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && (
            <Button slot="drag">
              <GripVertical size={16} />
            </Button>
          )}
          {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      )}
    </AriaGridListItem>
  );
}

export function GridListLoadMoreItem(props: GridListLoadMoreItemProps) {
  return (
    <AriaGridListLoadMoreItem {...props} className={clsx('react-aria-GridListLoadingIndicator', props.className)}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaGridListLoadMoreItem>
  );
}

export function GridListSection<T extends object>(props: GridListSectionProps<T>) {
  return <AriaGridListSection {...props} className={clsx('react-aria-GridListSection', props.className)} />;
}

export function GridListHeader(props: GridListHeaderProps) {
  return <AriaGridListHeader {...props} className={clsx('react-aria-GridListHeader', props.className)} />;
}

export {Text};

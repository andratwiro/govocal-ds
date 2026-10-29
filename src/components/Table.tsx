'use client';
import {
  Button,
  Collection,
  Column as AriaColumn,
  type ColumnProps as AriaColumnProps,
  Row as AriaRow,
  type RowProps,
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  type TableHeaderProps,
  type TableProps,
  useTableOptions,
  type TableBodyProps,
  TableBody as AriaTableBody,
  type CellProps,
  Cell as AriaCell,
  ColumnResizer,
  TableLoadMoreItem as AriaTableLoadMoreItem,
  type TableLoadMoreItemProps,
  TableFooter as AriaTableFooter,
  type TableFooterProps
} from 'react-aria-components/Table';
import {Group} from 'react-aria-components/Group';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Checkbox} from './Checkbox';
import {ProgressCircle} from './ProgressCircle';
import {ChevronUp, ChevronDown, GripVertical, ChevronRight} from 'lucide-react';
import './Table.css';
import {keepClass} from './className';
import clsx from 'clsx';

export function Table(props: TableProps) {
  return <AriaTable {...props} className={keepClass(props.className, 'gv-base-table')} />;
}

interface ColumnProps extends AriaColumnProps {
  allowsResizing?: boolean;
}

export function Column(props: Omit<ColumnProps, 'children'> & {children?: React.ReactNode}) {
  return (
    <AriaColumn {...props} className={keepClass(props.className, 'gv-base-column', 'button-base')}>
      {({allowsSorting, sortDirection}) => (
        <div className="column-header">
          <Group role="presentation" tabIndex={-1} className="column-name">
            {props.children}
          </Group>
          {allowsSorting && (
            <span aria-hidden="true" className="sort-indicator">
              {sortDirection === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
          {props.allowsResizing && <ColumnResizer className="react-aria-ColumnResizer gv-base-column-resizer" />}
        </div>
      )}
    </AriaColumn>
  );
}

export function TableHeader<T>({columns, children, ...otherProps}: TableHeaderProps<T>) {
  let {selectionBehavior, selectionMode, allowsDragging} = useTableOptions();

  return (
    <AriaTableHeader {...otherProps} className={keepClass(otherProps.className, 'gv-base-table-header')}>
      {/* Add extra columns for drag and drop and selection. */}
      {allowsDragging && (
        <AriaColumn
          width={20}
          minWidth={20}
          style={{width: 20}}
          className="react-aria-Column gv-base-column button-base"
        />
      )}
      {selectionBehavior === 'toggle' && (
        <AriaColumn
          width={32}
          minWidth={32}
          style={{width: 32}}
          ///- begin highlight -///
          focusMode="child"
          allowsArrowNavigation
          ///- end highlight -///
          className="react-aria-Column gv-base-column button-base">
          {selectionMode === 'multiple' && <Checkbox slot="selection" />}
        </AriaColumn>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaTableHeader>
  );
}

export function Row<T>({id, columns, children, ...otherProps}: RowProps<T>) {
  let {selectionBehavior, allowsDragging} = useTableOptions();

  return (
    <AriaRow id={id} {...otherProps} className={keepClass(otherProps.className, 'gv-base-row')}>
      {allowsDragging && (
        <Cell>
          <Button slot="drag" className="drag-button">
            <GripVertical />
          </Button>
        </Cell>
      )}
      {selectionBehavior === 'toggle' && (
        <Cell
          ///- begin highlight -///
          focusMode="child"
          allowsArrowNavigation
          ///- end highlight -///
        >
          <Checkbox slot="selection" />
        </Cell>
      )}
      <Collection items={columns}>{children}</Collection>
    </AriaRow>
  );
}

export function TableBody<T>(props: TableBodyProps<T>) {
  return <AriaTableBody {...props} className={keepClass(props.className, 'gv-base-table-body')} />;
}

export function TableFooter<T>(props: TableFooterProps<T>) {
  return <AriaTableFooter {...props} className={clsx('react-aria-TableFooter gv-base-table-footer', props.className)} />;
}

export function Cell(props: CellProps) {
  return (
    <AriaCell {...props} className={keepClass(props.className, 'gv-base-cell')}>
      {composeRenderProps(props.children, (children, {hasChildItems, isTreeColumn}) => (
        <>
          {isTreeColumn && hasChildItems && (
            <Button className="react-aria-Button gv-base-button" slot="chevron">
              <ChevronRight />
            </Button>
          )}
          {children}
        </>
      ))}
    </AriaCell>
  );
}

export function TableLoadMoreItem(props: TableLoadMoreItemProps) {
  return (
    <AriaTableLoadMoreItem {...props} className={clsx('react-aria-TableLoadingIndicator gv-base-table-loading-indicator', props.className)}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <ProgressCircle isIndeterminate aria-label="Loading more..." />
      </div>
    </AriaTableLoadMoreItem>
  );
}
export type {TableProps, TableHeaderProps, RowProps, TableBodyProps, CellProps};

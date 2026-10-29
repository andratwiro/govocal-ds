'use client';
import {Paperclip} from 'lucide-react';
import type {CSSProperties, ReactNode} from 'react';
import {clsx} from 'clsx';
import {GridList, GridListItem} from '../GridList';
import {Link} from '../Link';
import './FileList.css';

export interface FileListItemData {
  id: string;
  /** The file's name, e.g. "street.webp". */
  name: string;
  /** The meta line, e.g. "PDF · 0 KB" (the prototype's `.attf__meta`). */
  meta: string;
  /** Opened by "View", in a new tab. Left out, "View" isn't shown. */
  url?: string;
}

export interface FileListProps {
  items: FileListItemData[];
  /** Called by a row's Delete with its file. Left out, "Delete" isn't shown. The latest handler always runs, so it
   * may read the page's list as rendered (`setFiles(files.filter(…))`). */
  onDelete?: (item: FileListItemData) => void;
  /** Shown in place of the list when `items` is empty. @default 'No files yet' */
  emptyLabel?: string;
  /** A trailing row under the list, e.g. a compact Drop zone or an "Add a file" button. */
  footer?: ReactNode;
  'aria-label': string;
  /** Places the list (a margin, a grid area); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * File list (Figma not yet drawn; the prototype's `.attlist` / `.attf` rows): one row per
 * attachment — a file icon, its name and "PDF · 0 KB", then View / Delete. Built on GridList, so
 * the rows stay keyboard-navigable even though nothing in them is selectable.
 */
export function FileList({items, onDelete, emptyLabel = 'No files yet', footer, className, style, ...props}: FileListProps) {
  return (
    <div className={clsx('gv-file-list', className)} style={style}>
      {items.length > 0 ? (
        // React Aria keeps each row as first drawn for as long as its item object is the same; `dependencies` redraws
        // the rows when the handler changes, or a row would call a handler that still holds a deleted file.
        <GridList aria-label={props['aria-label']} className="gv-file-list__grid" items={items} dependencies={[onDelete]}>
          {item => (
            <GridListItem key={item.id} id={item.id} textValue={item.name} className="gv-file-list__row">
              <Paperclip aria-hidden size={16} className="gv-file-list__icon" />
              <span className="gv-file-list__text">
                <span className="gv-file-list__name">{item.name}</span>
                <span className="gv-file-list__meta">{item.meta}</span>
              </span>
              <span className="gv-file-list__actions">
                {item.url && (
                  <Link size="small" href={item.url} target="_blank" rel="noopener noreferrer">
                    View
                  </Link>
                )}
                {onDelete && (
                  <Link size="small" onPress={() => onDelete(item)}>
                    Delete
                  </Link>
                )}
              </span>
            </GridListItem>
          )}
        </GridList>
      ) : (
        <p className="gv-file-list__empty">{emptyLabel}</p>
      )}
      {footer && <div className="gv-file-list__add">{footer}</div>}
    </div>
  );
}

'use client';
import {Paperclip} from 'lucide-react';
import type {ReactNode} from 'react';
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
  onDelete?: (item: FileListItemData) => void;
  /** Shown in place of the list when `items` is empty. @default 'No files yet' */
  emptyLabel?: string;
  /** A trailing row under the list, e.g. a compact Drop zone or an "Add a file" button. */
  addButton?: ReactNode;
  'aria-label': string;
}

/**
 * File list (Figma not yet drawn; the prototype's `.attlist` / `.attf` rows): one row per
 * attachment — a file icon, its name and "PDF · 0 KB", then View / Delete. Built on GridList, so
 * the rows stay keyboard-navigable even though nothing in them is selectable.
 */
export function FileList({items, onDelete, emptyLabel = 'No files yet', addButton, ...props}: FileListProps) {
  return (
    <div className="gv-file-list">
      {items.length > 0 ? (
        <GridList aria-label={props['aria-label']} className="gv-file-list__grid" items={items}>
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
      {addButton && <div className="gv-file-list__add">{addButton}</div>}
    </div>
  );
}

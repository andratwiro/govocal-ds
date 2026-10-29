'use client';
import {useEffect, useRef} from 'react';
import {Button} from 'react-aria-components/Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useLocale} from 'react-aria-components/I18nProvider';
import './Pagination.css';

export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

/**
 * The pages to show: all of them up to seven; past that, always seven slots (the first page, the last, and five that
 * slide with the current one, an ellipsis standing in for the rest), so the pager keeps its width as you walk it.
 */
export function pageItems(page: number, pageCount: number): PageItem[] {
  const count = Math.max(1, pageCount);
  if (count <= 7) return Array.from({length: count}, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'end-ellipsis', count];
  if (page >= count - 3) return [1, 'start-ellipsis', count - 4, count - 3, count - 2, count - 1, count];
  return [1, 'start-ellipsis', page - 1, page, page + 1, 'end-ellipsis', count];
}

export interface PaginationProps {
  /** The current page, from 1. */
  page: number;
  /** How many pages there are. */
  pageCount: number;
  /** Called with the page to go to. */
  onPageChange?: (page: number) => void;
  /**
   * Names the navigation landmark; give each pager on a page its own ("Ideas pages").
   *
   * @default 'Pagination'
   */
  'aria-label'?: string;
}

/**
 * The pager at the foot of a table (the prototype's Audience table, `.gv-bo-pager`): "‹ 1 2 3 4 5 … 12 ›", the
 * current page filled. A `nav` landmark of buttons: each page is "Page N", the current one `aria-current="page"`;
 * ‹ and › are disabled at the ends, and when pressing one brings you to an end, focus moves to the current page
 * instead of being lost on a disabled button. Not in Figma yet.
 */
export function Pagination({page, pageCount, onPageChange, 'aria-label': label = 'Pagination'}: PaginationProps) {
  const count = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), count);
  const nav = useRef<HTMLElement>(null);
  const toCurrent = useRef(false);
  const {direction} = useLocale();
  const [Back, Forward] = direction === 'rtl' ? [ChevronRight, ChevronLeft] : [ChevronLeft, ChevronRight];

  useEffect(() => {
    if (!toCurrent.current) return;
    toCurrent.current = false;
    nav.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
  }, [current]);

  const go = (next: number) => {
    toCurrent.current = next === 1 || next === count;
    onPageChange?.(next);
  };

  return (
    <nav ref={nav} aria-label={label} className="gv-pagination">
      <Button className="gv-pagination__step" aria-label="Previous page" isDisabled={current === 1}
        onPress={() => go(current - 1)}>
        <Back aria-hidden size={16} />
      </Button>
      {pageItems(current, count).map(item => typeof item === 'number' ? (
        <Button key={item} className="gv-pagination__page" aria-label={`Page ${item}`}
          aria-current={item === current ? 'page' : undefined} onPress={() => item !== current && onPageChange?.(item)}>
          {item}
        </Button>
      ) : (
        <span key={item} className="gv-pagination__gap" aria-hidden>…</span>
      ))}
      <Button className="gv-pagination__step" aria-label="Next page" isDisabled={current === count}
        onPress={() => go(current + 1)}>
        <Forward aria-hidden size={16} />
      </Button>
    </nav>
  );
}

'use client';
import {useId, useMemo, type ReactNode} from 'react';
import {useLocale} from 'react-aria-components/I18nProvider';
import {Badge} from './Badge';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Panel.css';

export interface PanelProps extends PlacementProps {
  /** The panel's heading, e.g. "All participants". */
  title: ReactNode;
  /**
   * The heading's level, to fit the page's outline (the page title is the h1).
   *
   * @default 2
   */
  headingLevel?: 2 | 3 | 4;
  /** How many things the panel holds, in a Badge after the title: a number is written the reader's way ("2,184"). */
  count?: number | string;
  /** A line under the title saying what the panel holds. */
  description?: ReactNode;
  /** The head's trailing actions, e.g. a primary "Create email" Button. */
  actions?: ReactNode;
  /**
   * A row between the head and a flush body, 20 in like the head: a `TableToolbar` (count, search, filters) and its
   * filter chips, over the table they drive (the prototype's Audience card).
   */
  toolbar?: ReactNode;
  /** The foot, under a hairline: a Pagination, or Cancel / Send. Its content sits at the end. */
  footer?: ReactNode;
  /**
   * No padding around the body, for a table or list that runs edge to edge (it brings its own 20 edges).
   *
   * @default false
   */
  flush?: boolean;
  children?: ReactNode;
}

/**
 * The white frame a table or list sits in (the prototype's Audience table card, Messaging panel and composer): a
 * head with the title, an optional count Badge and description and trailing actions, over a hairline; an optional
 * toolbar row; the body; an optional foot. A `section` named by its heading. For a bare table without a head, Data table's `framed` is
 * enough. Not in Figma yet.
 */
export function Panel({
  title, headingLevel = 2, count, description, actions, toolbar, footer, flush, children, className, style
}: PanelProps) {
  const id = useId();
  const {locale} = useLocale();
  const shown = useMemo(() => typeof count === 'number' ? new Intl.NumberFormat(locale).format(count) : count, [count, locale]);
  const Heading = `h${headingLevel}` as const;
  return (
    <section className={clsx('gv-panel', className)} style={style} aria-labelledby={id}>
      <header className="gv-panel__head">
        <div className="gv-panel__titles">
          <Heading id={id} className="gv-panel__title">
            {title}
            {shown != null && shown !== '' && <Badge>{shown}</Badge>}
          </Heading>
          {description && <p className="gv-panel__description">{description}</p>}
        </div>
        {actions && <div className="gv-panel__actions">{actions}</div>}
      </header>
      {toolbar && <div className="gv-panel__toolbar">{toolbar}</div>}
      <div className="gv-panel__body" data-flush={flush || undefined}>{children}</div>
      {footer && <footer className="gv-panel__foot">{footer}</footer>}
    </section>
  );
}

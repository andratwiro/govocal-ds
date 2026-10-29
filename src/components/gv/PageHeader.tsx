'use client';
import type {CSSProperties, ReactNode} from 'react';
import {clsx} from 'clsx';
import './PageHeader.css';

export interface PageHeaderProps {
  /** The page's title: Title type, the page's first heading. */
  title: ReactNode;
  /** The title's heading level. @default 1 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** A line under the title saying what the page is for: Small, meta grey. */
  description?: ReactNode;
  /** The page's actions, at the end of the title's row: a primary Button, a Menu button. */
  actions?: ReactNode;
  /** The trail back to the parent pages, above the title: a `Breadcrumbs`. It is put in a `nav` named by
   * `breadcrumbsLabel`. */
  breadcrumbs?: ReactNode;
  /** @default 'Breadcrumbs' */
  breadcrumbsLabel?: string;
  /** Places the header (its margin below, a grid area); never paints it. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Page header: the top of a page, the breadcrumbs (on a sub-page), then the title with the page's actions at the end
 * of its row, then a line about the page. Breadcrumbs 12 above the title, the line 8 under it; it has no margin of its
 * own (the page places it). Not in Figma: the back office's page head, on every page.
 *
 * ```tsx
 * <PageHeader title="Public API tokens" description="Tokens let other tools read this platform's data."
 *   breadcrumbs={<Breadcrumbs items={[{key: 'tools', label: 'Tools', href: '#/tools'}, {key: 'tokens', label: 'Public API tokens'}]} />}
 *   actions={<Button>Create token</Button>} />
 * ```
 */
export function PageHeader({
  title, headingLevel = 1, description, actions, breadcrumbs, breadcrumbsLabel = 'Breadcrumbs', className, style
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <header className={clsx('gv-page-header', className)} style={style}>
      {breadcrumbs != null && <nav aria-label={breadcrumbsLabel} className="gv-page-header__breadcrumbs">{breadcrumbs}</nav>}
      <div className="gv-page-header__row">
        <Heading className="gv-page-header__title">{title}</Heading>
        {actions != null && <div className="gv-page-header__actions">{actions}</div>}
      </div>
      {description != null && <p className="gv-page-header__description">{description}</p>}
    </header>
  );
}

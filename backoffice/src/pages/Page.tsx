import type {ReactNode} from 'react';
import {Breadcrumbs, type BreadcrumbItem} from '../../../src/components/gv/Breadcrumbs';

/** A back-office page, as the prototype draws it: a white bar with the title (a sub-page's trail ends in it) and the
 * actions, then the page's modules on the grey canvas. */
export function Page({title, description, actions, crumbs, children}: {
  title: string; description?: ReactNode; actions?: ReactNode; crumbs?: BreadcrumbItem[]; children: ReactNode;
}) {
  return (
    <div className="bo-page">
      <header className="bo-page-bar">
        {crumbs ? <>
          <nav aria-label="Breadcrumbs"><Breadcrumbs items={[...crumbs, {key: 'current', label: title}]} /></nav>
          <h1 className="bo-visually-hidden">{title}</h1>
        </> : <h1>{title}</h1>}
        {actions && <div className="bo-actions">{actions}</div>}
      </header>
      {description && <p className="bo-note bo-page-description">{description}</p>}
      {children}
    </div>
  );
}

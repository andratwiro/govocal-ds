import type {ReactNode} from 'react';
import {Breadcrumb, type BreadcrumbItem} from '../../../src/components/gv/Breadcrumb';

/** A back-office page: the title, its actions and a line about it. A sub-page adds the trail back to its parent. */
export function Page({title, description, actions, crumbs, children}: {
  title: string; description?: ReactNode; actions?: ReactNode; crumbs?: BreadcrumbItem[]; children: ReactNode;
}) {
  return (
    <div className="bo-page">
      {crumbs && (
        <nav aria-label="Breadcrumbs" className="bo-page-crumbs">
          <Breadcrumb items={[...crumbs, {key: 'current', label: title}]} />
        </nav>
      )}
      <header className="bo-page-header"><h1>{title}</h1>{actions && <div className="bo-actions">{actions}</div>}</header>
      {description && <p className="bo-note bo-page-description">{description}</p>}
      {children}
    </div>
  );
}

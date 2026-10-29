'use client';
import {
  Breadcrumbs as RACBreadcrumbs,
  type BreadcrumbsProps,
  Breadcrumb as RACBreadcrumb,
  type BreadcrumbProps,
  type LinkProps,
  Link
} from 'react-aria-components/Breadcrumbs';
import {ChevronRight} from 'lucide-react';
import './Breadcrumbs.css';
import {keepClass} from './className';
import clsx from 'clsx';

export function Breadcrumbs<T>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} className={clsx('react-aria-Breadcrumbs', props.className)} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <RACBreadcrumb {...props} className={keepClass(props.className)}>
      {({isCurrent}) => (
        <>
          <Link {...props} />
          {!isCurrent && <ChevronRight size={14} />}
        </>
      )}
    </RACBreadcrumb>
  );
}

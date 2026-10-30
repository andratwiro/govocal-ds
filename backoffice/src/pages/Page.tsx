import type {ReactNode} from 'react';
import {AppFramePanel, type BreadcrumbItem, Breadcrumbs, PageHeader, Stack} from 'govocal-ds';

/** A back-office page, as the prototype draws it: a white bar with the Page header (a sub-page's trail above its
 * title, the actions at the end, the line about the page under it), then the page's modules on the grey ground. */
export function Page({title, description, actions, crumbs, children}: {
  title: string; description?: ReactNode; actions?: ReactNode;
  /** The parent pages; the trail ends on this page's title, as Page header's own example does. */
  crumbs?: BreadcrumbItem[]; children: ReactNode;
}) {
  return (
    <Stack gap="8">
      <AppFramePanel paddingInline="16" paddingBlock="12">
        <PageHeader title={title} description={description} actions={actions}
          breadcrumbs={crumbs && <Breadcrumbs items={[...crumbs, {key: 'current', label: title}]} />} />
      </AppFramePanel>
      {children}
    </Stack>
  );
}

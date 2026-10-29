'use client';
import type {ComponentProps, ReactNode} from 'react';
import {I18nProvider, RouterProvider} from 'react-aria-components';
import {LucideProvider} from 'lucide-react';
import {ToastRegion, ToastRegionContext} from '../Toast';

type RouterProps = ComponentProps<typeof RouterProvider>;

export interface AppProviderProps {
  /** The app. */
  children: ReactNode;
  /**
   * The app's locale, e.g. "en-GB" or "ar-SA": dates, numbers, and the direction React Aria lays parts out in. Left
   * out, the locale around it (the browser's at the root). Set `lang` and `dir` on `<html>` to match.
   */
  locale?: string;
  /**
   * Client-side navigation for every system link, menu item and tab with an `href` (React Aria's RouterProvider):
   * the router's `navigate`, e.g. react-router's `useNavigate()`. Left out, an `href` loads like a plain link.
   */
  navigate?: RouterProps['navigate'];
  /** Turns a router path into the `href` the browser sees (react-router's `useHref`), with `navigate`. */
  useHref?: RouterProps['useHref'];
}

/**
 * App provider: wrap the app in it once, at its root. It renders the one `ToastRegion` (so pages call `toast()` and
 * mount nothing), draws Lucide icons at the system's 1.75 stroke (Figma's; Lucide's own is 2; an icon's own
 * `strokeWidth` still wins), and passes the locale and the router to every React Aria part. It draws no DOM of its
 * own, so it takes no `className`.
 *
 * ```tsx
 * createRoot(root).render(
 *   <AppProvider locale="en-GB"><RouterProvider router={router} /></AppProvider>
 * );
 * // anywhere:
 * toast('Idea archived', 'Moved to the archive.', {action: 'Undo', onAction: restore});
 * ```
 *
 * A `ToastRegion` a page still renders inside it draws nothing, so pages can drop theirs one at a time.
 */
export function AppProvider({children, locale, navigate, useHref}: AppProviderProps) {
  let app = (
    <LucideProvider strokeWidth={1.75}>
      <ToastRegionContext.Provider value>{children}</ToastRegionContext.Provider>
      <ToastRegion />
    </LucideProvider>
  );
  if (navigate) app = <RouterProvider navigate={navigate} useHref={useHref}>{app}</RouterProvider>;
  return locale ? <I18nProvider locale={locale}>{app}</I18nProvider> : app;
}

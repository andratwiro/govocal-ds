'use client';
import {Children, createContext, forwardRef, useContext, type ReactNode} from 'react';
import {Button as RACButton, type ButtonProps as RACButtonProps} from 'react-aria-components/Button';
import {ChevronRight, CircleArrowLeft} from 'lucide-react';
import {Link} from 'react-aria-components/Link';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {useNumberFormatter} from '../components/format';
import {mergeLabels} from '../components/labels';
import './SideNav.css';

/**
 * The back office's main sidebar (the real admin's dark rail, the prototype's `.gv-bo-side`):
 * a "To platform" band, groups of items, and button rows that open menus (notifications,
 * account, support). `isFolded` turns it into the 52px icon rail the prototype uses inside a
 * project: labels become visually hidden (they stay the controls' names) and show as tooltips.
 * Not in Figma yet.
 */
export interface SideNavProps extends PlacementProps {
  'aria-label': string;
  /** The icon-only rail (inside a project or phase). @default false */
  isFolded?: boolean;
  children: ReactNode;
}

const Folded = createContext(false);

export function SideNav({'aria-label': ariaLabel, isFolded: folded = false, children, className, style}: SideNavProps) {
  return (
    <Folded.Provider value={folded}>
      <nav className={clsx('gv-side-nav', className)} style={style} aria-label={ariaLabel} data-folded={folded || undefined}>{children}</nav>
    </Folded.Provider>
  );
}

/** A list of items. `isAtBottom` sends the group to the bottom of the rail (the real admin's bottom items). */
export interface SideNavGroupProps extends PlacementProps {isAtBottom?: boolean; children: ReactNode}

export function SideNavGroup({isAtBottom, children, className, style}: SideNavGroupProps) {
  return (
    <ul className={clsx('gv-side-nav__group', className)} style={style} data-push={isAtBottom || undefined}>
      {Children.toArray(children).map((child, i) => <li key={i}>{child}</li>)}
    </ul>
  );
}

/** The words Side nav home says itself (docs/API.md rule 11). */
export interface SideNavHomeLabels {
  /** The band's words, when no `children` give them. */
  home: string;
}

/** Side nav home's English words; a page passes its own over them with `labels`. */
export const sideNavHomeLabels: SideNavHomeLabels = {home: 'To platform'};

/** The band at the top that leaves the back office for the resident site. */
export interface SideNavHomeProps extends PlacementProps {
  href: string;
  /** @default `labels.home` ("To platform") */
  children?: string;
  /** Its own words, over `sideNavHomeLabels`. */
  labels?: Partial<SideNavHomeLabels>;
}

export function SideNavHome({href, children: words, labels, className, style}: SideNavHomeProps) {
  const folded = useContext(Folded);
  const children = words ?? mergeLabels(sideNavHomeLabels, labels).home;
  return (
    <WithTooltip label={children} on={folded}>
      <Link className={clsx('gv-side-nav__home', className)} style={style} href={href}>
        <CircleArrowLeft aria-hidden size={18} className="gv-side-nav__icon" />
        <span className="gv-side-nav__label">{children}</span>
      </Link>
    </WithTooltip>
  );
}

interface RowContent {
  /** The leading icon or avatar, e.g. `<Inbox aria-hidden size={16} />`. */
  icon: ReactNode;
  /** The row's name; stays its accessible name when folded. */
  label: string;
  /** A second line under the label (the account row's role). */
  sub?: string;
  /** A red count after the label; on the icon when folded. */
  count?: number;
  /** What the count means, for screen readers ("46 inputs need feedback"). @default the number */
  countLabel?: string;
  /** A trailing chevron: the row opens a menu (as Button's `hasMenu`). */
  hasMenu?: boolean;
  /** Paints the icon in the accent green (the real admin's Support row). */
  hasAccentIcon?: boolean;
}

function Content({icon, label, sub, count, countLabel, hasMenu, hasAccentIcon}: RowContent) {
  const number = useNumberFormatter();
  const shown = count ? number.format(count) : '';
  return (
    <>
      <span className="gv-side-nav__icon" data-accent={hasAccentIcon || undefined} aria-hidden>
        {icon}
        {!!count && <span className="gv-side-nav__count" data-on-icon>{shown}</span>}
      </span>
      <span className="gv-side-nav__text">
        <span className="gv-side-nav__label">{label}</span>
        {sub && <span className="gv-side-nav__sub">{sub}</span>}
      </span>
      {!!count && (
        <span className="gv-side-nav__count">
          <span aria-hidden>{shown}</span>
          <span className="gv-side-nav__hidden">{countLabel ?? shown}</span>
        </span>
      )}
      {hasMenu && <ChevronRight aria-hidden size={16} className="gv-side-nav__chevron" />}
    </>
  );
}

export interface SideNavLinkProps extends RowContent, PlacementProps {
  href: string;
  /** The page this link leads to is open. */
  isCurrent?: boolean;
}

/** A nav item that goes to a page. */
export function SideNavLink({href, isCurrent, className, style, ...content}: SideNavLinkProps) {
  const folded = useContext(Folded);
  return (
    <WithTooltip label={content.label} on={folded}>
      <Link className={clsx('gv-side-nav__row', className)} style={style} href={href} aria-current={isCurrent ? 'page' : undefined}>
        <Content {...content} />
      </Link>
    </WithTooltip>
  );
}

export type SideNavButtonProps = RowContent & Omit<RACButtonProps, 'children' | 'className' | 'style'> & PlacementProps;

/** A row that opens something (a menu, the notifications panel): put it first inside a MenuTrigger or DialogTrigger. */
export const SideNavButton = forwardRef<HTMLButtonElement, SideNavButtonProps>(
  function SideNavButton({icon, label, sub, count, countLabel, hasMenu, hasAccentIcon, className, style, ...rest}, ref) {
    const folded = useContext(Folded);
    return (
      <WithTooltip label={label} on={folded}>
        <RACButton {...rest} ref={ref} className={clsx('gv-side-nav__row', className)} style={style}>
          <Content {...{icon, label, sub, count, countLabel, hasMenu, hasAccentIcon}} />
        </RACButton>
      </WithTooltip>
    );
  });

function WithTooltip({label, on, children}: {label: string; on: boolean; children: ReactNode}) {
  if (!on) return <>{children}</>;
  return (
    <TooltipTrigger delay={300}>
      {children}
      <Tooltip placement="end">{label}</Tooltip>
    </TooltipTrigger>
  );
}

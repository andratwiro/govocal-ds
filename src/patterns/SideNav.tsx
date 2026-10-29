'use client';
import {Children, createContext, forwardRef, useContext, type ReactNode} from 'react';
import {Button as RACButton, type ButtonProps as RACButtonProps} from 'react-aria-components/Button';
import {ChevronRight, CircleArrowLeft} from 'lucide-react';
import {Link} from '../components/Link';
import {Tooltip, TooltipTrigger} from '../components/Tooltip';
import './SideNav.css';

/**
 * The back office's main sidebar (the real admin's dark rail, the prototype's `.gv-bo-side`):
 * a "To platform" band, groups of items, and button rows that open menus (notifications,
 * account, support). `folded` turns it into the 52px icon rail the prototype uses inside a
 * project: labels become visually hidden (they stay the controls' names) and show as tooltips.
 * Not in Figma yet.
 */
export interface SideNavProps {
  'aria-label': string;
  /** The icon-only rail (inside a project or phase). @default false */
  folded?: boolean;
  children: ReactNode;
}

const Folded = createContext(false);

export function SideNav({'aria-label': ariaLabel, folded = false, children}: SideNavProps) {
  return (
    <Folded.Provider value={folded}>
      <nav className="gv-side-nav" aria-label={ariaLabel} data-folded={folded || undefined}>{children}</nav>
    </Folded.Provider>
  );
}

/** A list of items. `push` sends the group to the bottom of the rail (the real admin's bottom items). */
export function SideNavGroup({push, children}: {push?: boolean; children: ReactNode}) {
  return (
    <ul className="gv-side-nav__group" data-push={push || undefined}>
      {Children.toArray(children).map((child, i) => <li key={i}>{child}</li>)}
    </ul>
  );
}

/** The band at the top that leaves the back office for the resident site. */
export function SideNavHome({href, children = 'To platform'}: {href: string; children?: string}) {
  const folded = useContext(Folded);
  return (
    <WithTooltip label={children} on={folded}>
      <Link className="gv-side-nav__home" href={href}>
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
  /** A trailing chevron: the row opens a menu. */
  chevron?: boolean;
  /** Paints the icon in the accent green (the real admin's Support row). */
  accent?: boolean;
}

function Content({icon, label, sub, count, countLabel, chevron, accent}: RowContent) {
  return (
    <>
      <span className="gv-side-nav__icon" data-accent={accent || undefined} aria-hidden>
        {icon}
        {!!count && <span className="gv-side-nav__count" data-on-icon>{count}</span>}
      </span>
      <span className="gv-side-nav__text">
        <span className="gv-side-nav__label">{label}</span>
        {sub && <span className="gv-side-nav__sub">{sub}</span>}
      </span>
      {!!count && (
        <span className="gv-side-nav__count">
          <span aria-hidden>{count}</span>
          <span className="gv-side-nav__hidden">{countLabel ?? String(count)}</span>
        </span>
      )}
      {chevron && <ChevronRight aria-hidden size={16} className="gv-side-nav__chevron" />}
    </>
  );
}

export interface SideNavLinkProps extends RowContent {
  href: string;
  /** The page this link leads to is open. */
  isCurrent?: boolean;
}

/** A nav item that goes to a page. */
export function SideNavLink({href, isCurrent, ...content}: SideNavLinkProps) {
  const folded = useContext(Folded);
  return (
    <WithTooltip label={content.label} on={folded}>
      <Link className="gv-side-nav__row" href={href} aria-current={isCurrent ? 'page' : undefined}>
        <Content {...content} />
      </Link>
    </WithTooltip>
  );
}

export type SideNavButtonProps = RowContent & Omit<RACButtonProps, 'children' | 'className' | 'style'>;

/** A row that opens something (a menu, the notifications panel): put it first inside a MenuTrigger or DialogTrigger. */
export const SideNavButton = forwardRef<HTMLButtonElement, SideNavButtonProps>(
  function SideNavButton({icon, label, sub, count, countLabel, chevron, accent, ...rest}, ref) {
    const folded = useContext(Folded);
    return (
      <WithTooltip label={label} on={folded}>
        <RACButton {...rest} ref={ref} className="gv-side-nav__row">
          <Content {...{icon, label, sub, count, countLabel, chevron, accent}} />
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

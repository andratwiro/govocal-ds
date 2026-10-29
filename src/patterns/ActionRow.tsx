'use client';
import type {ReactNode} from 'react';
import {Link, type LinkProps} from 'react-aria-components/Link';
import {ChevronRight} from 'lucide-react';
import './ActionRow.css';

export interface ActionRowProps {
  /** What the row does ("Message participants"). */
  children: ReactNode;
  /** Where it leads. */
  href?: LinkProps['href'];
  onPress?: LinkProps['onPress'];
  /** A short count or state before the chevron ("3 new"). */
  badge?: ReactNode;
}

/** A next-action row (prototype `.pj-ba` in "Next actions"): a bordered row, label and chevron. Not in Figma yet. */
export function ActionRow({children, href, onPress, badge}: ActionRowProps) {
  return (
    <Link className="gv-action-row" href={href} onPress={onPress}>
      <span className="gv-action-row__label">{children}</span>
      {badge != null && <span className="gv-action-row__badge">{badge}</span>}
      <ChevronRight className="gv-action-row__chevron" aria-hidden size={16} />
    </Link>
  );
}

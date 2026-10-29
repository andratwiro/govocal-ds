'use client';
import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {ChevronRight} from 'lucide-react';
import {Sparkline} from '../components/gv/Chart';
import './StatCard.css';

export interface StatCardProps {
  /** What is counted ("Participants"). */
  label: string;
  /** The number, already formatted ("215"). */
  value: string;
  /** The trend under the number, oldest first. */
  series?: number[];
  /** The line under the trend ("Weekly, since 6 May"). */
  caption?: ReactNode;
  /** Opens the figure's detail (Audience). Without it the card is display only, with no chevron. */
  onPress?: () => void;
}

/**
 * A stat with its sparkline (prototype `.pj-aud`, "Collecting now"): label over a number, the Sparkline, a caption,
 * and a chevron when it opens a detail. Not in Figma yet.
 */
export function StatCard({label, value, series, caption, onPress}: StatCardProps) {
  const body = (
    <>
      <span className="gv-stat-card__head">
        <span className="gv-stat-card__text">
          <span className="gv-stat-card__label">{label}</span>
          <span className="gv-stat-card__value">{value}</span>
        </span>
        {onPress && <ChevronRight className="gv-stat-card__chevron" aria-hidden size={16} />}
      </span>
      {series && series.length > 1 && <Sparkline className="gv-stat-card__spark" values={series} label={label} height={34} grid={false} />}
      {caption && <span className="gv-stat-card__caption">{caption}</span>}
    </>
  );
  return onPress
    ? <Button className="gv-stat-card" data-pressable onPress={onPress}>{body}</Button>
    : <div className="gv-stat-card" role="group" aria-label={label}>{body}</div>;
}

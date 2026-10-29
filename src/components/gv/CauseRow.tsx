'use client';
import './CauseRow.css';

export interface CauseRowProps {
  /** The cause's title. */
  title: string;
  /** A short description of the cause. */
  description: string;
  /** The thumbnail image, shown in a 52×52 rounded square. */
  image?: string;
  /** Number of volunteers signed up. */
  volunteerCount: number;
  /** Percentage of the volunteer goal reached, 0–100. */
  percent: number;
  /**
   * Whether this is the last row in its list: drops the row divider.
   *
   * @default false
   */
  isLast?: boolean;
}

export function CauseRow({title, description, image, volunteerCount, percent, isLast = false}: CauseRowProps) {
  return (
    <div className="gv-cause-row" data-last={isLast || undefined}>
      <div className="gv-cause-row__thumb" aria-hidden="true">
        {image && <img src={image} alt="" />}
      </div>
      <div className="gv-cause-row__cause">
        <div className="gv-cause-row__title">{title}</div>
        <div className="gv-cause-row__desc">{description}</div>
        <div className="gv-cause-row__bar">
          <div className="gv-cause-row__fill" style={{width: `${percent}%`}} />
        </div>
      </div>
      <div className="gv-cause-row__volunteers">
        <div className="gv-cause-row__count">{volunteerCount}</div>
        <div className="gv-cause-row__word">{volunteerCount === 1 ? 'volunteer' : 'volunteers'}</div>
      </div>
    </div>
  );
}

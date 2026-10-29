import {useId, useState, type HTMLAttributes, type Key, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {ChevronRight} from 'lucide-react';
import type {ChartColor} from './Chart';
import {BarRow} from './BarRow';
import {LegendRow} from './LegendRow';
import {ReactionCounts, type ReactionCountsProps} from './ReactionCounts';
import {StatementRow} from './StatementRow';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import './Chart.css';
import './DashboardCard.css';

/** Figma "Dashboard card" · Type. Sets the spacing each variant uses between its parts. */
export type DashboardCardType =
  | 'statements'
  | 'visitors-over-time'
  | 'participation-over-time'
  | 'ai-summary'
  | 'topic-breakdown'
  | 'status-breakdown'
  | 'votes-over-time'
  | 'live-ranking'
  | 'demographic-age'
  | 'demographic-commute';

export interface DashboardCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  type?: DashboardCardType;
  /** Card title (Title type). Demographic cards have none: their label sits in the body. */
  title?: ReactNode;
  /** The grey line under the title ("By votes · updating live"). */
  subtitle?: ReactNode;
  /** An icon before the title (AI summary: lucide `Sparkles`). Decorative. */
  icon?: ReactNode;
  /** Header, inline end: a control for the whole card (Votes over time: Daily / Weekly). */
  action?: ReactNode;
  /**
   * The card's content: a LineChart, Sparkline, StatTile row or one of the Dashboard* lists below. With no data yet,
   * an EmptyState (`size="panel"`, `headingLevel="none"`): the card drops its gap so it sits under the title.
   */
  children?: ReactNode;
  /** Under the body: a ChartLegend. */
  legend?: ReactNode;
  /** The foot row, ends pushed apart (AI summary: "1 / 34" and Explore). */
  footer?: ReactNode;
  /** Heading level of the title. */
  headingLevel?: 2 | 3 | 4;
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/** A white dashboard tile with a header, a body and optional legend and footer (Figma "Dashboard card"). */
export function DashboardCard({
  type,
  title,
  subtitle,
  icon,
  action,
  children,
  legend,
  footer,
  headingLevel = 3,
  className,
  ...rest
}: DashboardCardProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const hasHeader = title != null || subtitle != null || action != null;
  return (
    <section
      {...rest}
      aria-labelledby={title != null ? id : rest['aria-labelledby']}
      className={cx('gv-dashboard-card', type && `gv-dashboard-card--${type}`, className)}>
      {hasHeader && (
        <div className="gv-dashboard-card__header">
          <div className="gv-dashboard-card__heading">
            {title != null && (
              <H id={id} className="gv-dashboard-card__title">
                {icon != null && <span className="gv-dashboard-card__icon" aria-hidden>{icon}</span>}
                {title}
              </H>
            )}
            {subtitle != null && <p className="gv-dashboard-card__subtitle">{subtitle}</p>}
          </div>
          {action != null && <div className="gv-dashboard-card__action">{action}</div>}
        </div>
      )}
      {children != null && <div className="gv-dashboard-card__body">{children}</div>}
      {legend != null && <div className="gv-dashboard-card__legend">{legend}</div>}
      {footer != null && <div className="gv-dashboard-card__footer">{footer}</div>}
    </section>
  );
}

/* ────────────── Body parts, built from Statement row, Bar row and Legend row (as Figma's instances are). ────────────── */

const pct = (n: number) => `${Math.max(0, Math.min(100, n))}%`;

export interface DashboardStatement {
  statement: ReactNode;
  /** Reactions, as counts or percentages: the bar shows their shares. */
  agree: number;
  disagree: number;
  pass: number;
}

/** Statements (Common Ground): each statement with its agree / disagree / pass bar and "% agree". */
export interface DashboardStatementsProps extends PlacementProps {items: DashboardStatement[]}

export function DashboardStatements({items, className, style}: DashboardStatementsProps) {
  return (
    <ul className={clsx('gv-dashboard-statements', className)} style={style}>
      {items.map((s, i) => {
        const total = s.agree + s.disagree + s.pass || 1;
        const share = (v: number) => Math.max(0, Math.min(100, (v / total) * 100));
        return (
          <li key={i}>
            <StatementRow
              statement={s.statement}
              agreePercent={share(s.agree)}
              disagreePercent={share(s.disagree)}
              passPercent={share(s.pass)}
              summary={`${Math.round(share(s.agree))}% agree`}
            />
          </li>
        );
      })}
    </ul>
  );
}

export interface DashboardBar {
  label: ReactNode;
  /** Share of the whole, 0–100: the bar's length. */
  percent: number;
  /** Shown after the percentage ("18% · 6"). */
  count?: number;
  color?: ChartColor;
}

/** Status breakdown: one Bar row per status (label, thin track, "percent · count"). */
export interface DashboardBarsProps extends PlacementProps {items: DashboardBar[]}

export function DashboardBars({items, className, style}: DashboardBarsProps) {
  return (
    <ul className={clsx('gv-dashboard-bars', className)} style={style}>
      {items.map((b, i) => (
        <li key={i}>
          <BarRow
            label={b.label}
            percent={Math.max(0, Math.min(100, b.percent))}
            value={`${Math.round(b.percent)}%${b.count != null ? ` · ${b.count.toLocaleString('en-GB')}` : ''}`}
            barColor={`--gv-chart-${b.color ?? 'bar'}`}
          />
        </li>
      ))}
    </ul>
  );
}

export interface DashboardRankingItem {
  title: ReactNode;
  votes: number;
}

/** Live ranking: options by votes, with rank, share bar (the leader in green) and count. */
export interface DashboardRankingProps extends PlacementProps {items: DashboardRankingItem[]; unit?: string}

export function DashboardRanking({items, unit = 'votes', className, style}: DashboardRankingProps) {
  const total = items.reduce((s, o) => s + o.votes, 0) || 1;
  const ranked = [...items].sort((x, y) => y.votes - x.votes);
  return (
    <ol className={clsx('gv-dashboard-ranking', className)} style={style}>
      {ranked.map((o, i) => {
        const share = Math.round((o.votes / total) * 100);
        return (
          <li key={i} className="gv-dashboard-ranking__row">
            <span className="gv-dashboard-ranking__rank" aria-hidden>#{i + 1}</span>
            <div className="gv-dashboard-ranking__main">
              <span className="gv-dashboard-ranking__title">{o.title}</span>
              <span className="gv-dashboard-ranking__track" aria-hidden>
                <span data-chart-color={i === 0 ? 'agree' : 'bar'} style={{inlineSize: pct(share)}} />
              </span>
            </div>
            <span className="gv-dashboard-ranking__value">
              {share}%<small>{o.votes.toLocaleString('en-GB')} {unit}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export interface DashboardTopic {
  id: Key;
  label: ReactNode;
  /** "34 inputs · 0 topics" */
  meta: ReactNode;
}

/** Topic breakdown: rows that open a topic view (React Aria Buttons with a chevron). */
export interface DashboardTopicsProps extends PlacementProps {items: DashboardTopic[]; onAction?: (id: Key) => void}

export function DashboardTopics({items, onAction, className, style}: DashboardTopicsProps) {
  return (
    <div className={clsx('gv-dashboard-topics', className)} style={style}>
      {items.map(t => (
        <Button key={t.id} className="gv-dashboard-topics__row" onPress={() => onAction?.(t.id)}>
          <span className="gv-dashboard-topics__label">{t.label}</span>
          <span className="gv-dashboard-topics__meta">{t.meta}</span>
          <ChevronRight className="gv-dashboard-topics__chevron" aria-hidden size={16} />
        </Button>
      ))}
    </div>
  );
}

export interface DashboardDemographicItem {
  label: ReactNode;
  percent: number;
  color: ChartColor;
}

export interface DashboardListItem {
  id: Key;
  /** The input's title. */
  title: ReactNode;
  /** Who and when, in words ("Anonymous · 11 months ago"). */
  meta?: ReactNode;
  /** Likes, dislikes and comments, under the meta (Reaction counts). */
  reactions?: ReactionCountsProps;
  /** At the end: the input's status, a Badge ("Viewed"). */
  status?: ReactNode;
}

/**
 * List (Most liked): the inputs that got the most traction, each its title, who and when, its reactions and its
 * status. Rows 11 apart over a hairline (prototype `.pj-mlrow`). Not in Figma.
 */
export interface DashboardListProps extends PlacementProps {items: DashboardListItem[]}

export function DashboardList({items, className, style}: DashboardListProps) {
  return (
    <ul className={clsx('gv-dashboard-list', className)} style={style}>
      {items.map(it => (
        <li key={it.id} className="gv-dashboard-list__row">
          <div className="gv-dashboard-list__main">
            <span className="gv-dashboard-list__title">{it.title}</span>
            {it.meta != null && <span className="gv-dashboard-list__meta">{it.meta}</span>}
            {it.reactions && (
              <span className="gv-dashboard-list__reactions">
                <ReactionCounts {...it.reactions} />
              </span>
            )}
          </div>
          {it.status != null && <div className="gv-dashboard-list__status">{it.status}</div>}
        </li>
      ))}
    </ul>
  );
}

/**
 * Demographic · age / commute: a labelled stacked bar over its legend rows. Hovering or focusing a row (or hovering a
 * segment) picks that share out: the other segments and rows dim (Not in Figma).
 */
export interface DashboardDemographicProps extends PlacementProps {label: ReactNode; items: DashboardDemographicItem[]}

export function DashboardDemographic({label, items, className, style}: DashboardDemographicProps) {
  const id = useId();
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className={clsx('gv-dashboard-demographic', className)} style={style}>
      <div id={id} className="gv-dashboard-demographic__label">{label}</div>
      <div className="gv-dashboard-demographic__bar" aria-hidden>
        {items.map((it, i) => (
          <span
            key={i}
            data-chart-color={it.color}
            data-dimmed={(picked != null && picked !== i) || undefined}
            style={{inlineSize: pct(it.percent)}}
            onPointerEnter={() => setPicked(i)}
            onPointerLeave={() => setPicked(null)}
          />
        ))}
      </div>
      <ul className="gv-dashboard-demographic__legend" aria-labelledby={id}>
        {items.map((it, i) => (
          <li key={i}>
            <LegendRow
              color={`--gv-chart-${it.color}`}
              label={it.label}
              value={`${Math.round(it.percent)}%`}
              isHighlighted={picked === i}
              isDimmed={picked != null && picked !== i}
              onHighlightChange={on => setPicked(on ? i : null)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

import {useId, useState, type HTMLAttributes, type Key, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import {ChevronRight} from 'lucide-react';
import type {ChartColor} from './Chart';
import {BarRow} from './BarRow';
import {LegendRow} from './LegendRow';
import {ReactionCounts, type ReactionCountsLabels, type ReactionCountsProps} from './ReactionCounts';
import {StatementRow, statementRowLabels, type StatementRowLabels} from './StatementRow';
import clsx from 'clsx';
import type {PlacementProps} from '../className';
import {useNumberFormatter, usePercentFormatter} from '../format';
import {mergeLabels, type CountLabel} from '../labels';
import './Chart.css';
import './DashboardCard.css';

/** Figma "Dashboard card" · Type: what the card shows. Sets the spacing each kind uses between its parts. */
export type DashboardCardKind =
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
  /** Which dashboard card this is; sets the spacing between its parts. */
  kind?: DashboardCardKind;
  /** Card title (Title type). Demographic cards have none: their label sits in the body. */
  title?: ReactNode;
  /** The grey line under the title ("By votes · updating live"). */
  subtitle?: ReactNode;
  /** An icon before the title (AI summary: lucide `Sparkles`). Decorative. */
  icon?: ReactNode;
  /** Header, inline end: a control for the whole card (Votes over time: Daily / Weekly). */
  actions?: ReactNode;
  /**
   * The card's content: a LineChart, Sparkline, StatTile row or one of the Dashboard* lists below. With no data yet,
   * an EmptyState (`layout="panel"`, `headingLevel="none"`): the card drops its gap so it sits under the title.
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
  kind,
  title,
  subtitle,
  icon,
  actions,
  children,
  legend,
  footer,
  headingLevel = 3,
  className,
  ...rest
}: DashboardCardProps) {
  const id = useId();
  const H = `h${headingLevel}` as const;
  const hasHeader = title != null || subtitle != null || actions != null;
  return (
    <section
      {...rest}
      aria-labelledby={title != null ? id : rest['aria-labelledby']}
      className={cx('gv-dashboard-card', kind && `gv-dashboard-card--${kind}`, className)}>
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
          {actions != null && <div className="gv-dashboard-card__action">{actions}</div>}
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
  /** The statement's text. */
  statement: ReactNode;
  /** Reactions, as counts or percentages: the bar shows their shares. */
  agree: number;
  /** Disagree reactions, as counts or percentages. */
  disagree: number;
  /** Pass reactions, as counts or percentages. */
  pass: number;
}

/** The words Dashboard statements says itself (docs/API.md rule 11), with the Statement row's, which it hands on. */
export interface DashboardStatementsLabels extends StatementRowLabels {
  /** Each row's caption, given the agree share as the locale writes it. */
  summary: (agreePercent: string) => string;
}

/** Dashboard statements' English words; a page passes its own over them with `labels`. */
export const dashboardStatementsLabels: DashboardStatementsLabels = {...statementRowLabels, summary: percent => `${percent} agree`};

/** Statements (Common Ground): each statement with its agree / disagree / pass bar and "% agree". */
export interface DashboardStatementsProps extends PlacementProps {
  /** The statements, one row each. */
  items: DashboardStatement[];
  /** Its own words ("% agree", the bar's), over `dashboardStatementsLabels`. */
  labels?: Partial<DashboardStatementsLabels>;
}

export function DashboardStatements({items, labels, className, style}: DashboardStatementsProps) {
  const l = mergeLabels(dashboardStatementsLabels, labels);
  const percent = usePercentFormatter();
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
              summary={l.summary(percent(share(s.agree)))}
              labels={l}
            />
          </li>
        );
      })}
    </ul>
  );
}

export interface DashboardBar {
  /** The bar's name, e.g. a status. */
  label: ReactNode;
  /** Share of the whole, 0–100: the bar's length. */
  percent: number;
  /** Shown after the percentage ("18% · 6"). */
  count?: number;
  /** The bar's colour. Defaults to the shared bar colour. */
  color?: ChartColor;
}

/** Status breakdown: one Bar row per status (label, thin track, "percent · count"). */
export interface DashboardBarsProps extends PlacementProps {
  /** The statuses, one bar each. */
  items: DashboardBar[];
}

export function DashboardBars({items, className, style}: DashboardBarsProps) {
  const percent = usePercentFormatter();
  const number = useNumberFormatter();
  return (
    <ul className={clsx('gv-dashboard-bars', className)} style={style}>
      {items.map((b, i) => (
        <li key={i}>
          <BarRow
            label={b.label}
            percent={Math.max(0, Math.min(100, b.percent))}
            value={`${percent(b.percent)}${b.count != null ? ` · ${number.format(b.count)}` : ''}`}
            barColor={b.color ?? 'bar'}
          />
        </li>
      ))}
    </ul>
  );
}

export interface DashboardRankingItem {
  /** The option's name. */
  title: ReactNode;
  /** What it counts (votes on the Live ranking), said with `labels.count`. */
  count: number;
}

/** The words Dashboard ranking says itself (docs/API.md rule 11). */
export interface DashboardRankingLabels {
  /** Each option's count with its word ("124 votes"). */
  count: CountLabel;
}

/** Dashboard ranking's English words; a page passes its own over them with `labels`. */
export const dashboardRankingLabels: DashboardRankingLabels = {count: (count, n) => (count === 1 ? `${n} vote` : `${n} votes`)};

/** Live ranking: options by their count, with rank, share bar (the leader in green) and count. */
export interface DashboardRankingProps extends PlacementProps {
  /** The options with their counts; the rows come out ranked by count. */
  items: DashboardRankingItem[];
  /** Its own words (each count with its word), over `dashboardRankingLabels`. */
  labels?: Partial<DashboardRankingLabels>;
}

export function DashboardRanking({items, labels, className, style}: DashboardRankingProps) {
  const l = mergeLabels(dashboardRankingLabels, labels);
  const total = items.reduce((s, o) => s + o.count, 0) || 1;
  const ranked = [...items].sort((x, y) => y.count - x.count);
  const percent = usePercentFormatter();
  const number = useNumberFormatter();
  return (
    <ol className={clsx('gv-dashboard-ranking', className)} style={style}>
      {ranked.map((o, i) => {
        const share = Math.round((o.count / total) * 100);
        return (
          <li key={i} className="gv-dashboard-ranking__row">
            <span className="gv-dashboard-ranking__rank" aria-hidden>#{number.format(i + 1)}</span>
            <div className="gv-dashboard-ranking__main">
              <span className="gv-dashboard-ranking__title">{o.title}</span>
              <span className="gv-dashboard-ranking__track" aria-hidden>
                <span data-chart-color={i === 0 ? 'agree' : 'bar'} style={{inlineSize: pct(share)}} />
              </span>
            </div>
            <span className="gv-dashboard-ranking__value">
              {percent(share)}<small>{l.count(o.count, number.format(o.count))}</small>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export interface DashboardTopic {
  /** The topic's key, passed to `onAction`. */
  id: Key;
  /** The topic's name. */
  label: ReactNode;
  /** "34 inputs · 0 topics" */
  meta: ReactNode;
}

/** Topic breakdown: rows that open a topic view (React Aria Buttons with a chevron). */
export interface DashboardTopicsProps extends PlacementProps {
  /** The topics, one row each. */
  items: DashboardTopic[];
  /** Fires with the topic's `id` when its row is pressed. */
  onAction?: (id: Key) => void;
}

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
  /** The group's name, e.g. an age band. */
  label: ReactNode;
  /** Its share of the whole, 0-100: the segment's length. */
  percent: number;
  /** The segment's colour, also the swatch on its row. */
  color: ChartColor;
}

export interface DashboardListItem {
  /** A stable key for the row. */
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
export interface DashboardListProps extends PlacementProps {
  /** The inputs, one row each. */
  items: DashboardListItem[];
  /** The reaction counts' words for every row (an item's own `reactions.labels` win), over `reactionCountsLabels`. */
  labels?: Partial<ReactionCountsLabels>;
}

export function DashboardList({items, labels, className, style}: DashboardListProps) {
  return (
    <ul className={clsx('gv-dashboard-list', className)} style={style}>
      {items.map(it => (
        <li key={it.id} className="gv-dashboard-list__row">
          <div className="gv-dashboard-list__main">
            <span className="gv-dashboard-list__title">{it.title}</span>
            {it.meta != null && <span className="gv-dashboard-list__meta">{it.meta}</span>}
            {it.reactions && (
              <span className="gv-dashboard-list__reactions">
                <ReactionCounts labels={labels} {...it.reactions} />
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
export interface DashboardDemographicProps extends PlacementProps {
  /** What is broken down, e.g. "Age". */
  label: ReactNode;
  /** The shares, one segment and legend row each. */
  items: DashboardDemographicItem[];
}

export function DashboardDemographic({label, items, className, style}: DashboardDemographicProps) {
  const id = useId();
  const [picked, setPicked] = useState<number | null>(null);
  const percent = usePercentFormatter();
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
              value={percent(it.percent)}
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

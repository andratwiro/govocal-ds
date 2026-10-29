'use client';
import {createContext, useCallback, useContext, useId, useMemo, useState, type CSSProperties, type ReactNode} from 'react';
import {
  Tabs as RACTabs,
  TabList as RACTabList,
  type TabListProps,
  type TabProps as RACTabProps,
  Tab as RACTab,
  type TabsProps,
  TabPanels as RACTabPanels,
  type TabPanelProps,
  TabPanel as RACTabPanel,
  SelectionIndicator,
  type TabPanelsProps
} from 'react-aria-components/Tabs';
import {ListBox, ListBoxItem, ListBoxSection, Header} from 'react-aria-components/ListBox';
import {VisuallyHidden} from 'react-aria-components/VisuallyHidden';
import {useLocale, type Key} from 'react-aria-components';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {clsx} from 'clsx';
import './Tabs.css';

/**
 * Tabs: a `TabList` of `Tab`s, then one `TabPanels` holding a `TabPanel` per tab (same `id`). `TabPanels` is
 * required: it is what a panel fading out is laid against, and what animates the height between panels. A
 * `TabPanel` outside it floats over the page while it fades, so in development the panel warns in the console.
 *
 * ```tsx
 * <Tabs defaultSelectedKey="all">
 *   <TabList aria-label="Reports"><Tab id="all" count={18}>All reports</Tab><Tab id="mine">Mine</Tab></TabList>
 *   <TabPanels>
 *     <TabPanel id="all">…</TabPanel>
 *     <TabPanel id="mine">…</TabPanel>
 *   </TabPanels>
 * </Tabs>
 * ```
 *
 * A `className` (or `style`) places the part; it is added to React Aria's own class, never instead of it.
 */
export function Tabs({className, ...props}: TabsProps) {
  return <RACTabs {...props} className={composeRenderProps(className, c => clsx('react-aria-Tabs gv-base-tabs', c))} />;
}

/** The row (or, `orientation="vertical"` on Tabs, the column) of `Tab`s. Name it with `aria-label`. */
export function TabList<T>({className, ...props}: TabListProps<T>) {
  return <RACTabList {...props} className={composeRenderProps(className, c => clsx('react-aria-TabList gv-base-tab-list', c))} />;
}

/** A status dot's meaning (a field language: `success` complete, `danger` missing, `warning` incomplete). */
export type TabStatus = 'success' | 'warning' | 'danger';

const STATUS_WORDS: Record<TabStatus, string> = {success: 'complete', warning: 'incomplete', danger: 'missing'};

export interface TabProps extends RACTabProps {
  /** A count after the label, in brackets: "All reports (18)". Formatted for the locale. */
  count?: number;
  /**
   * A dot before the label: a multilingual field's languages (green complete, red missing). The dot is colour only,
   * so the tab also says it in words to screen readers (`statusLabel`).
   */
  status?: TabStatus;
  /** What the status dot means, read after the label ("ES-ES, missing"). @default 'complete' | 'incomplete' | 'missing' */
  statusLabel?: string;
}

/**
 * One tab. An icon passed as the first child sits 7 before the label (16, as the Projects list); `count` and `status`
 * add the prototype's "(18)" and the language dot.
 */
export function Tab({count, status, statusLabel, className, ...props}: TabProps) {
  const {locale} = useLocale();
  return (
    <RACTab {...props} className={composeRenderProps(className, c => clsx('react-aria-Tab gv-base-tab', c))}>
      {composeRenderProps(props.children, children => (
        <>
          {status && <span className="gv-tab__status" data-status={status} aria-hidden />}
          {children}
          {count != null && <span className="gv-tab__count"> ({new Intl.NumberFormat(locale).format(count)})</span>}
          {status && <VisuallyHidden>, {statusLabel ?? STATUS_WORDS[status]}</VisuallyHidden>}
          <SelectionIndicator className="react-aria-SelectionIndicator gv-base-selection-indicator" />
        </>
      ))}
    </RACTab>
  );
}

// Whether a TabPanel sits inside TabPanels: the contract Tabs' JSDoc states, checked in development.
const InTabPanels = createContext(false);
const warned = new Set<string>();

/** Holds the `TabPanel`s, after the `TabList`. Required: see `Tabs`. */
export function TabPanels<T>({className, ...props}: TabPanelsProps<T>) {
  return (
    <InTabPanels.Provider value>
      <RACTabPanels {...props} className={clsx('react-aria-TabPanels gv-base-tab-panels', className)} />
    </InTabPanels.Provider>
  );
}

/** What a `Tab` shows (the same `id`); only the chosen one is drawn. Always inside `TabPanels`. */
export function TabPanel({className, ...props}: TabPanelProps) {
  const inPanels = useContext(InTabPanels);
  if (process.env.NODE_ENV !== 'production' && !inPanels && !warned.has(String(props.id))) {
    warned.add(String(props.id));
    console.warn(`TabPanel "${String(props.id)}" sits outside TabPanels. Wrap the panels in <TabPanels>: a panel fading ` +
      'out is laid against it, and floats over the page without it.');
  }
  return <RACTabPanel {...props} className={composeRenderProps(className, c => clsx('react-aria-TabPanel gv-base-tab-panel', c))} />;
}

/* ───────────── Grouped tabs: vertical tabs under group headings ─────────────
   React Aria's TabList holds tabs only (its keyboard delegate walks every node, so a heading inside would take
   focus). The grouped side list is therefore a single-select ListBox with sections, which skips its headings and
   names each group by its heading, driving the panel beside it. It looks and moves like the vertical Tabs: arrows
   walk the tabs (selection follows focus), Home and End jump, Tab leaves for the panel. */

interface GroupedTabsState {
  selectedKey: Key | undefined;
  select: (key: Key) => void;
  /** The DOM id of a tab's label, which names its panel. */
  labelId: (key: Key) => string;
}

const GroupedTabsContext = createContext<GroupedTabsState | null>(null);

function useGroupedTabs(part: string) {
  const state = useContext(GroupedTabsContext);
  if (!state) throw new Error(`${part} must sit inside GroupedTabs`);
  return state;
}

export interface GroupedTabsProps {
  /** The chosen tab (controlled). */
  selectedKey?: Key;
  /** The tab chosen first (uncontrolled). Pass this or `selectedKey`. */
  defaultSelectedKey?: Key;
  onSelectionChange?: (key: Key) => void;
  /** A GroupedTabList and one GroupedTabPanel per tab. */
  children: ReactNode;
  className?: string;
  /** Layout only. */
  style?: CSSProperties;
}

/** Vertical tabs grouped under headings (the Settings dialog's "Project" and "Inputs"). Not in Figma. */
export function GroupedTabs({selectedKey, defaultSelectedKey, onSelectionChange, children, className, style}: GroupedTabsProps) {
  const [own, setOwn] = useState<Key | undefined>(defaultSelectedKey);
  const current = selectedKey !== undefined ? selectedKey : own;
  const base = useId();
  const select = useCallback(
    (key: Key) => {
      if (selectedKey === undefined) setOwn(key);
      onSelectionChange?.(key);
    },
    [selectedKey, onSelectionChange]
  );
  const value = useMemo<GroupedTabsState>(
    () => ({selectedKey: current, select, labelId: key => `${base}-${String(key).replace(/[^\w-]/g, '_')}`}),
    [current, select, base]
  );
  return (
    <GroupedTabsContext.Provider value={value}>
      <div className={['react-aria-Tabs gv-base-tabs', 'gv-grouped-tabs', className].filter(Boolean).join(' ')} style={style} data-orientation="vertical">
        {children}
      </div>
    </GroupedTabsContext.Provider>
  );
}

export interface GroupedTabListProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** TabSections (or GroupedTabs between them). */
  children: ReactNode;
  className?: string;
  /** Layout only (the list's width beside the panel). */
  style?: CSSProperties;
}

/** The side list: TabSections of GroupedTabs. */
export function GroupedTabList({children, className, style, ...aria}: GroupedTabListProps) {
  const {selectedKey, select} = useGroupedTabs('GroupedTabList');
  return (
    <ListBox
      {...aria}
      className={['react-aria-TabList gv-base-tab-list', 'gv-grouped-tabs__list', className].filter(Boolean).join(' ')}
      style={style}
      data-orientation="vertical"
      selectionMode="single"
      selectionBehavior="replace"
      disallowEmptySelection
      shouldFocusWrap
      selectedKeys={selectedKey !== undefined ? [selectedKey] : []}
      onSelectionChange={keys => {
        if (keys === 'all') return;
        const [key] = keys;
        if (key !== undefined) select(key);
      }}>
      {children}
    </ListBox>
  );
}

export interface TabSectionProps {
  /** The group's heading ("Project"): plain text, never focused; it names the group. */
  title: ReactNode;
  children: ReactNode;
}

/** A group of tabs under its heading. */
export function TabSection({title, children}: TabSectionProps) {
  return (
    <ListBoxSection className="gv-grouped-tabs__section">
      <Header className="gv-grouped-tabs__heading">{title}</Header>
      {children}
    </ListBoxSection>
  );
}

export interface GroupedTabProps {
  id: Key;
  /** An icon (16, `aria-hidden`) and the label. */
  children: ReactNode;
  /** The label as text, for type-ahead, when the children aren't a plain string. */
  textValue?: string;
  isDisabled?: boolean;
}

/** One tab of the grouped side list. */
export function GroupedTab({id, children, textValue, isDisabled}: GroupedTabProps) {
  const {labelId} = useGroupedTabs('GroupedTab');
  return (
    <ListBoxItem
      id={id}
      textValue={textValue ?? (typeof children === 'string' ? children : undefined)}
      isDisabled={isDisabled}
      className="react-aria-Tab gv-base-tab gv-grouped-tab">
      <span id={labelId(id)} className="gv-grouped-tab__label">{children}</span>
    </ListBoxItem>
  );
}

export interface GroupedTabPanelProps {
  /** The tab it belongs to. */
  id: Key;
  children: ReactNode;
  className?: string;
  /** Layout only (the panel's padding in a dialog). */
  style?: CSSProperties;
}

/** What a GroupedTab shows; only the chosen tab's panel is drawn. Named by its tab's label. */
export function GroupedTabPanel({id, children, className, style}: GroupedTabPanelProps) {
  const {selectedKey, labelId} = useGroupedTabs('GroupedTabPanel');
  if (selectedKey !== id) return null;
  return (
    <div
      role="group"
      aria-labelledby={labelId(id)}
      className={['gv-grouped-tabs__panel', className].filter(Boolean).join(' ')}
      style={style}>
      {children}
    </div>
  );
}

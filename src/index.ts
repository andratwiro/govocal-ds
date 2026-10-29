/**
 * govocal-ds: the public entry point. Import every Component and Pattern from here, one name each:
 *
 *   import {Button, Modal, DataTable, SideNav} from 'govocal-ds';
 *   import 'govocal-ds/tokens.css'; // once, at the app's root
 *
 * React Aria's starter parts that stay public (ListBox, Popover, DialogTrigger, DatePicker, …) come from
 * 'govocal-ds/base': primitives, for what no Component covers yet. Each component imports its own CSS, so importing
 * a part is enough to paint it. Grouped as Storybook's tree: Components by group, then Patterns by place.
 * docs/API.md is the prop convention.
 */

// Components / Actions
export {Button, type ButtonProps} from './components/Button';
export {CompactButton, type CompactButtonProps} from './components/gv/CompactButton';
export {IconButton, type IconButtonProps} from './components/gv/IconButton';
export {
  MenuTrigger, Menu, MenuLoadMoreItem, MenuItem, MenuSection, SubmenuTrigger, type MenuTriggerProps,
  type MenuItemProps, type MenuProps, type MenuSectionProps, type MenuLoadMoreItemProps, type SubmenuTriggerProps
} from './components/Menu';
export {Separator, type SeparatorProps} from './components/Separator';
export {
  SegmentedControl, SegmentedControlItem, type SegmentedControlProps, type SegmentedControlItemProps
} from './components/gv/SegmentedControl';

// Components / Charts
export {BarRow, type BarRowProps} from './components/gv/BarRow';
export {
  ChartLegend, LineChart, Sparkline, type ChartColor, type ChartSeries, type ChartLegendItem,
  type ChartLegendProps, type LineChartProps, type SparklineProps
} from './components/gv/Chart';
export {
  DashboardCard, DashboardStatements, DashboardBars, DashboardRanking, DashboardTopics, DashboardList,
  DashboardDemographic, type DashboardCardKind, type DashboardCardProps, type DashboardStatement,
  type DashboardStatementsProps, type DashboardBar, type DashboardBarsProps, type DashboardRankingItem,
  type DashboardRankingProps, type DashboardTopic, type DashboardTopicsProps, type DashboardDemographicItem,
  type DashboardListItem, type DashboardListProps, type DashboardDemographicProps
} from './components/gv/DashboardCard';
export {LegendRow, type LegendRowProps} from './components/gv/LegendRow';
export {StatementRow, type StatementCounts, type StatementRowProps} from './components/gv/StatementRow';

// Components / Data display
export {Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps} from './components/gv/Avatar';
export {
  DataTable, DataTableHeader, DataTableColumn, DataTableBody, DataTableEmpty, DataTableRow, DataTableCell,
  DataTableText, DataTablePerson, DataTableStack, DataTableThumbnail, DataTableAssignee, DataTableTags,
  DataTableOptions, DataTableAddColumn, type DataTableAlign, type DataTableProps, type DataTableHeaderProps,
  type DataTableColumnProps, type DataTableBodyProps, type DataTableRowProps, type DataTableCellProps,
  type DataTableTextProps, type DataTablePersonProps, type DataTableStackProps, type DataTableThumbnailProps,
  type DataTableAssigneeProps, type DataTableTagsProps, type DataTableOptionsProps, type DataTableAddColumnProps,
  type DataTableEmptyProps, toKeySet
} from './components/gv/DataTable';
export {FileList, type FileListItemData, type FileListProps} from './components/gv/FileList';
export {
  Illustration, type IllustrationName, type IllustrationMotion, type IllustrationGroup, type IllustrationInfo,
  type IllustrationProps
} from './components/gv/Illustration';
export {
  ListHeader, type ListHeaderColumn, type ListHeaderSelectAll, type ListHeaderProps
} from './components/gv/ListHeader';
export {ListHeaderCell, type ListHeaderCellProps} from './components/gv/ListHeaderCell';
export {ListRow, type ListRowSelect, type ListRowProps} from './components/gv/ListRow';
export {
  PropertyList, PropertyListItem, type PropertyListProps, type PropertyListItemProps
} from './components/gv/PropertyList';
export {ReactionCounts, type ReactionCountsProps} from './components/gv/ReactionCounts';
export {StatRow, type StatRowProps} from './components/gv/StatRow';
export {StatTile, type StatTileLayout, type StatTileTrend, type StatTileProps} from './components/gv/StatTile';
export {
  TableToolbarHeading, TableToolbar, type TableToolbarHeadingProps, type TableToolbarProps
} from './components/gv/TableToolbar';

// Components / Forms
export {Checkbox, type CheckboxProps} from './components/gv/Checkbox';
export {CheckboxGroup, type CheckboxGroupProps} from './components/CheckboxGroup';
export {
  ChoiceCard, ChoiceCardCheckbox, ChoiceCardGroupHeading, type ChoiceCardProps, type ChoiceCardCheckboxProps,
  type ChoiceCardGroupHeadingProps
} from './components/gv/ChoiceCard';
export {
  DateRangeField, toDateRange, type DateRangeFieldProps, type DateRange, type DateRangeInput
} from './components/gv/DateRangeField';
export {DropZone, type DropZoneProps} from './components/gv/DropZone';
export {NumberField, type NumberFieldProps} from './components/NumberField';
export {OptionList, type OptionListItem, type OptionListProps} from './components/gv/OptionList';
export {RadioGroup, Radio, type RadioGroupProps, type RadioProps} from './components/RadioGroup';
export {RequiredMarker, type RequiredMarkerProps} from './components/gv/RequiredMarker';
export {RichTextEditor, type RichTextEditorProps} from './components/gv/RichTextEditor';
export {RichTextToolbar, type RichTextToolbarProps} from './components/gv/RichTextToolbar';
export {RichTextToolbarButton, type RichTextToolbarButtonProps} from './components/gv/RichTextToolbarButton';
export {SearchField, type SearchFieldProps} from './components/SearchField';
export {Select, SelectItem, type SelectProps, type SelectItemProps} from './components/Select';
export {Switch, type SwitchProps} from './components/Switch';
export {TagPicker, type TagPickerProps} from './components/gv/TagPicker';
export {TextField, TextArea, type TextFieldProps} from './components/TextField';
export {TitleField, type TitleFieldProps} from './components/gv/TitleField';

// Components / Layout & containers
export {AppProvider, type AppProviderProps} from './components/gv/AppProvider';
export {
  Card, CardSwitch, CardRadioGroup, CardRadio, type CardPill, type CardMenuItem, type CardIconAction, type CardProps
} from './components/gv/Card';
export {Divider, type DividerProps} from './components/gv/Divider';
export {PageHeader, type PageHeaderProps} from './components/gv/PageHeader';
export {Panel, type PanelProps} from './components/gv/Panel';
export {SectionLabel, type SectionLabelProps} from './components/gv/SectionLabel';
export {TileGrid, type TileGridProps} from './components/gv/TileGrid';

// Components / Navigation
export {Breadcrumbs, type BreadcrumbItem, type BreadcrumbsProps} from './components/gv/Breadcrumbs';
export {Link, type LinkProps} from './components/Link';
export {Pagination, type PageItem, type PaginationProps} from './components/gv/Pagination';
export {
  Tabs, TabList, Tab, TabPanels, TabPanel, GroupedTabs, GroupedTabList, TabSection, GroupedTab, GroupedTabPanel,
  type TabStatus, type TabProps, type GroupedTabsProps, type GroupedTabListProps, type TabSectionProps,
  type GroupedTabProps, type GroupedTabPanelProps
} from './components/Tabs';

// Components / Overlays
export {AlertDialog, type AlertDialogImpactRow, type AlertDialogProps} from './components/gv/AlertDialog';
export {Coachmark, type CoachmarkProps} from './components/gv/Coachmark';
export {HelpPopover, type HelpPopoverProps} from './components/gv/HelpPopover';
export {Modal, type ModalProps} from './components/gv/Modal';
export {
  SidePanel, SidePanelSection, SidePanelActions, SidePanelDecision, type SidePanelPosition, type SidePanelProps,
  type SidePanelSectionProps, type SidePanelAction, type SidePanelActionsProps, type SidePanelDecisionProps,
  SidePanelRecordHead, type SidePanelRecordHeadProps
} from './components/gv/SidePanel';
export {Tooltip, TooltipTrigger, type TooltipProps, type TooltipTriggerProps} from './components/Tooltip';

// Components / Status & feedback
export {Badge, type BadgeProps} from './components/gv/Badge';
export {Banner, type BannerTone, type BannerProps} from './components/gv/Banner';
export {EmptyState, type EmptyStateProps} from './components/gv/EmptyState';
export {NewDot, type NewDotProps} from './components/gv/NewDot';
export {ReviewStatus, type ReviewStatusProps} from './components/gv/ReviewStatus';
export {Skeleton, type SkeletonProps} from './components/gv/Skeleton';
export {StatusBadge, type StatusBadgeProps} from './components/gv/StatusBadge';
export {
  toast, ToastRegion, ToastRegionContext, queue, type ToastMessage, type ToastOptions, type ToastRegionProps
} from './components/Toast';

// Components / Text. Text is the system's (React Aria's Text underneath, so it still fills a slot such as
// slot="description"); Content.tsx's own Text stays the starter files' internal one.
export {Text, type TextProps, type TextKind, type TextColor} from './components/gv/Text';
export {VisuallyHidden, type VisuallyHiddenProps} from './components/gv/VisuallyHidden';

// Content: the slot-aware parts every component composes (a dialog's heading, a section's header, a shortcut).
export {
  Heading, Header, Keyboard, type HeadingProps, type HeaderProps, type KeyboardProps
} from './components/Content';

// Patterns / App shell
export {NotificationList, type NotificationItem, type NotificationListProps} from './patterns/NotificationList';
export {
  SideNav, SideNavGroup, SideNavHome, SideNavLink, SideNavButton, type SideNavProps, type SideNavGroupProps,
  type SideNavHomeProps, type SideNavLinkProps, type SideNavButtonProps
} from './patterns/SideNav';

// Patterns / Build tab
export {
  AccessRights, AccessRightsModal, ACCESS_WHO_VALUE, type AccessWho, type AccessRightsProps,
  type AccessRightsModalProps
} from './patterns/AccessRights';
export {
  NotificationRow, NotificationRowList, NotificationEmail, type NotificationRowProps, type NotificationRowListProps,
  type NotificationEmailProps
} from './patterns/NotificationRow';
export {
  ParticipantActionRow, ParticipantLimit, ParticipantActionList, type ParticipantActionRowProps,
  type ParticipantLimitProps, type ParticipantActionListProps
} from './patterns/ParticipantActionRow';
export {
  ViewOptionRow, ViewOptionList, type ViewOptionRowProps, type ViewOptionListProps
} from './patterns/ViewOptionRow';

// Patterns / Lists
export {FilterChips, type FilterChipsProps} from './patterns/FilterChips';
export {FilterMenu, type FilterFacet, type FilterValue, type FilterMenuProps} from './patterns/FilterMenu';
export {SelectionBar, type SelectionAction, type SelectionBarProps} from './patterns/SelectionBar';

// Patterns / Manage tab
export {
  CommentThread, CommentComposer, type ThreadComment, type ThreadTab, type ThreadTarget, type CommentThreadProps,
  type CommentComposerProps
} from './patterns/CommentThread';
export {
  OfficialUpdate, PostedOfficialUpdate, OfficialUpdateForm, BulkOfficialUpdate, type PostedUpdate,
  type OfficialUpdateDraft, type OfficialUpdateProps, type PostedOfficialUpdateProps, type OfficialUpdateFormProps,
  type BulkOfficialUpdateProps
} from './patterns/OfficialUpdate';

// Patterns / Pages & menu
export {SectionToggle, type SectionToggleProps} from './patterns/SectionToggle';

// Patterns / Participation methods
export {CommonGroundRow, type CommonGroundRowProps} from './patterns/CommonGroundRow';
export {ProposalsRow, type ProposalsRowProps} from './patterns/ProposalsRow';
export {VolunteeringRow, type VolunteeringRowProps} from './patterns/VolunteeringRow';
export {
  VoteProgress, type VoteProgressThresholdProps, type VoteProgressCountProps, type VoteProgressProps
} from './patterns/VoteProgress';
export {VotingRow, type VotingRowProps} from './patterns/VotingRow';

// Patterns / Project page
export {ActionRow, ActionRowList, type ActionRowProps, type ActionRowListProps} from './patterns/ActionRow';
export {PanelSection, type PanelSectionProps} from './patterns/PanelSection';
export {
  PhonePreview, PhoneHeader, PhoneImage, PhoneCard, PhoneCountdown, PhoneStage, type PhonePreviewAction,
  type PhonePreviewProps, type PhoneHeaderProps, type PhoneImageProps, type PhoneCardProps, type PhoneCountdownProps,
  type PhoneStageProps
} from './patterns/PhonePreview';
export {ProjectHeader, type ProjectHeaderMode, type ProjectHeaderProps} from './patterns/ProjectHeader';
export {SetupStep, type SetupStepProps} from './patterns/SetupStep';
export {StatCard, type StatCardProps} from './patterns/StatCard';

// Patterns / Project rail
export {PhaseTimeline, type TimelineStatus, type TimelinePhase, type PhaseTimelineProps} from './patterns/PhaseTimeline';
export {RailHeader, type RailHeaderProps} from './patterns/RailHeader';
export {RailPhase, type RailPhaseStatus, type RailPhaseProps} from './patterns/RailPhase';

// Placement: every part with a DOM root takes className and style; they place it (grid area, width, margin,
// alignment) and never paint it.
export type {PlacementProps} from './components/className';

// React Aria's value types the parts take and give back, so a page never rebuilds them by hand.
export type {DateValue, Key, RangeValue, Selection, SortDescriptor, TimeValue} from 'react-aria-components';

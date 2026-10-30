'use client';
import {useState, type CSSProperties, type ReactNode} from 'react';
import {clsx} from 'clsx';
import {
  Button,
  Dialog,
  DialogTrigger,
  Disclosure,
  DisclosurePanel,
  Heading,
  Link,
  Menu,
  MenuItem,
  MenuTrigger,
  type RadioGroupProps
} from 'react-aria-components';
import {Check, ChevronDown, ChevronRight, type LucideIcon} from 'lucide-react';
import {Popover} from '../Popover';
import {Tooltip, TooltipTrigger} from '../Tooltip';
import {Radio, RadioGroup, type RadioProps} from '../RadioGroup';
import {Switch, type SwitchProps} from '../Switch';
import {IconButton} from './IconButton';
import {Badge} from './Badge';
import {RequiredMarker, type RequiredMarkerLabels} from './RequiredMarker';
import {ReviewStatus, type ReviewStatusLabels, type ReviewStatusProps} from './ReviewStatus';
import {mergeLabels} from '../labels';
import './Card.css';

/** The words Card says itself (docs/API.md rule 11): the → button's name, plus the Required marker's and the review
 * status's words, which it hands on. */
export interface CardLabels extends RequiredMarkerLabels, ReviewStatusLabels {
  /** `control="open"`: the → button's name, given the title (empty when the title isn't plain text). */
  open: (title: string) => string;
}

/** Card's English words; a page passes its own over them with `labels`. */
export const cardLabels: CardLabels = {
  open: title => `Open ${title}`.trim(),
  required: 'Required',
  toReview: 'To review',
  toSet: 'To set',
  reviewed: 'Reviewed'
};

export interface CardPill {
  /** The pill's words. */
  label: string;
  /** A 14 lucide icon before the label (Figma "Badge · Icon=Yes"). */
  icon?: LucideIcon;
  /** Tints the pill as a chosen value (Badge `isSelected`). A reviewed card tints all its pills by itself. */
  isSelected?: boolean;
}

export interface CardMenuItem {
  /** The value's id, as `value` and `onChange` carry it. */
  id: string;
  /** The value's words. */
  label: string;
  /** A 16 lucide icon before the label (the input term menu: Idea, Option, Project…); the chosen one's pill shows it. */
  icon?: LucideIcon;
}

export interface CardIconAction {
  /** The lucide icon, drawn at 16. */
  icon: LucideIcon;
  /** The button's accessible name, e.g. "Add an attachment". */
  label: string;
  /** Fires when the button is pressed. */
  onPress?: () => void;
  /**
   * Nothing to do yet (Download volunteers before anyone signs up). The button stays focusable (`aria-disabled`) so
   * its `tooltip` can say why.
   */
  isDisabled?: boolean;
  /** Words shown on hover and focus; on a disabled action, why it is disabled ("Nobody has signed up yet"). */
  tooltip?: string;
}

export interface CardProps {
  /** The card's name, in Small type. It never truncates: the status and the pills give way first. */
  title?: ReactNode;
  /** A grey line under the title ("Reading the results of this phase"): a next action that says more. */
  description?: ReactNode;
  /**
   * A mark before the title: a setup step's dashed ring or check, a done action's tick. Decorative (`aria-hidden`):
   * say the same in the title or the status.
   */
  leading?: ReactNode;
  /**
   * The card's fill: `outlined` (a border, no fill: on a white panel, e.g. a phase's Build tab) or `filled` (the panel
   * fill and a subtle border: on the grey stage, e.g. Manage and Insights).
   *
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled';
  /**
   * A picture at the top of the card: an `<img>`, an Illustration, a tile. It runs edge to edge under the card's top
   * border, above the title; an `<img>` fills the width at 2:1 and is cropped to fit.
   */
  media?: ReactNode;
  /**
   * `row`: one header line, the body under it. `stacked`: the title line, then the body 24 below
   * (the choice cards: Survey placement, Survey options, Voting method).
   *
   * @default 'row'
   */
  layout?: 'row' | 'stacked';
  /** The "Required" marker (a dot + the word). */
  isRequired?: boolean;
  /**
   * Where the card's review stands: the Review status at the end of the title line. A `reviewed` card tints its pills
   * (Badge `isSelected`): the page sets it from `onExpandedChange` once the person has opened the card.
   */
  status?: ReviewStatusProps['status'];
  /** Grey words for the current value, e.g. "Not set". */
  summary?: string;
  /**
   * Summary pills, e.g. "6 questions", or "Idea" with a lightbulb. Hidden while the card is open. A `menu` card
   * without pills shows its chosen item as the pill.
   */
  pills?: CardPill[];
  /**
   * The header's chevron. `expand` opens the body in place (a Disclosure); open, it hides the pills, puts the chevron
   * in a filled square and takes a stronger border. `open` leads somewhere else (a → button at the end); `link` makes
   * the whole row one link (›, or `linkIcon`), as a next action or a "To set" row; `menu` drops a list to pick one
   * value from (Figma "Review · pill dropdown", the prototype's Sorting card); `pick` opens any `picker` under the row
   * (▾: Set area, Set topic tags). `placeholder` keeps the 28 box empty (Figma's "Empty" card).
   */
  control?: 'expand' | 'open' | 'link' | 'menu' | 'pick' | 'placeholder';
  /** `control="link"`: where the row leads. */
  href?: string;
  /** `control="link"`: the action's own icon at the end, in place of › (a report, a link, a sparkle). */
  linkIcon?: ReactNode;
  /** `control="pick"`: what opens under the row, as wide as it: an Option list, or a Menu with `pickerKind="menu"`. */
  picker?: ReactNode;
  /** `control="pick"`: what kind of picker. @default 'dialog' */
  pickerKind?: 'dialog' | 'menu';
  /** `control="menu"`: the values to pick from. */
  menuItems?: CardMenuItem[];
  /** `control="menu"`: the chosen value's id (controlled). */
  value?: string;
  /** `control="menu"`: the value chosen first (uncontrolled). */
  defaultValue?: string;
  /** `control="menu"`: called with the id of the value picked. */
  onChange?: (id: string) => void;
  /** What the → does (`control="open"`), or the whole row (`control="link"`). */
  onOpen?: () => void;
  /** Ghost icon buttons in the header (plus, upload, download, link, sparkles…). */
  iconActions?: CardIconAction[];
  /** Anything else at the end of the header: compact buttons, a CardSwitch. */
  actions?: ReactNode;
  /** The body. With `control="expand"` it shows only while the card is open. */
  children?: ReactNode;
  /** `control="expand"`: whether the body starts open (uncontrolled). */
  defaultExpanded?: boolean;
  /** `control="expand"`: whether the body is open (controlled). */
  isExpanded?: boolean;
  /** `control="expand"`: fires with the new open state when the person opens or closes the body. */
  onExpandedChange?: (isExpanded: boolean) => void;
  /** Its own words (the → button's name, Required, the review status), over `cardLabels`. */
  labels?: Partial<CardLabels>;
  /** Places the card (a grid area, a width); never paints it. */
  className?: string;
  /** Places the card; layout only. */
  style?: CSSProperties;
}

function Status({
  isRequired,
  status,
  summary,
  pills,
  labels
}: Pick<CardProps, 'isRequired' | 'status' | 'summary' | 'pills'> & {labels: CardLabels}) {
  const reviewed = status === 'reviewed';
  return (
    <>
      {isRequired && <RequiredMarker placement="card" labels={labels} />}
      {status && (
        <span className="gv-card__review">
          <ReviewStatus status={status} labels={labels} />
        </span>
      )}
      {summary && <span className="gv-card__summary">{summary}</span>}
      {pills && pills.length > 0 && (
        <span className="gv-card__pills">
          {pills.map(({label, icon: Icon, isSelected}) => (
            <Badge key={label} isSelected={isSelected || reviewed} icon={Icon && <Icon aria-hidden size={14} />}>
              {label}
            </Badge>
          ))}
        </span>
      )}
    </>
  );
}

/** The title, and the description under it when there is one. */
function TitleText({title, description}: Pick<CardProps, 'title' | 'description'>) {
  if (description == null) return <span className="gv-card__title">{title}</span>;
  return (
    <span className="gv-card__text">
      <span className="gv-card__title">{title}</span>
      <span className="gv-card__description">{description}</span>
    </span>
  );
}

function Trailing({iconActions, actions}: Pick<CardProps, 'iconActions' | 'actions'>) {
  if (!iconActions?.length && !actions) return null;
  return (
    <span className="gv-card__actions">
      {iconActions?.map(({icon: Icon, label, onPress, isDisabled, tooltip}) => {
        // A disabled button can't be hovered or focused, so one that explains itself stays focusable and does nothing.
        const button = (
          <IconButton
            key={label}
            aria-label={label}
            onPress={isDisabled ? undefined : onPress}
            isDisabled={isDisabled && !tooltip}
            aria-disabled={(isDisabled && Boolean(tooltip)) || undefined}>
            <Icon aria-hidden size={16} />
          </IconButton>
        );
        return tooltip ? (
          <TooltipTrigger key={label}>
            {button}
            <Tooltip>{tooltip}</Tooltip>
          </TooltipTrigger>
        ) : (
          button
        );
      })}
      {actions}
    </span>
  );
}

/**
 * Card: the one setup row and titled box. A title (never cut short) with an optional mark before it and a line under
 * it, a status line (Required, review status, summary, pills), a trailing control (expand, open, link, menu, pick,
 * icon buttons, compact buttons, a switch), an optional body and an optional `media` picture on top. It covers
 * Figma's 23 types, the Build tab's setup rows, Project details' steps and the next-action rows. `className` and
 * `style` place it; they never paint it.
 */
export function Card({
  title,
  description,
  leading,
  href,
  linkIcon,
  picker,
  pickerKind = 'dialog',
  variant = 'outlined',
  media,
  layout = 'row',
  isRequired,
  status: reviewStatus,
  summary,
  pills,
  control,
  onOpen,
  iconActions,
  actions,
  children,
  defaultExpanded,
  isExpanded,
  onExpandedChange,
  menuItems = [],
  value,
  defaultValue,
  onChange,
  labels,
  className,
  style
}: CardProps) {
  const l = mergeLabels(cardLabels, labels);
  const [innerKey, setInnerKey] = useState(defaultValue);
  const roomy = Boolean(actions) && layout === 'row';
  const status = <Status isRequired={isRequired} status={reviewStatus} summary={summary} pills={pills} labels={l} />;
  const root = {
    className: clsx('gv-card', className),
    style,
    'data-variant': variant,
    'data-media': media != null || undefined
  };
  const picture = media != null && <div className="gv-card__media">{media}</div>;
  const lead = leading != null && (
    <span className="gv-card__leading" aria-hidden>
      {leading}
    </span>
  );
  const text = <TitleText title={title} description={description} />;

  if (control === 'link') {
    return (
      <div {...root} data-control="link">
        {picture}
        <Link href={href} onPress={onOpen} className="gv-card__header gv-card__header--trigger">
          {lead}
          {text}
          {status}
          <span className="gv-card__chevron" aria-hidden>
            {linkIcon ?? <ChevronRight size={16} />}
          </span>
        </Link>
      </div>
    );
  }

  if (control === 'pick') {
    const header = (
      <Button className="gv-card__header gv-card__header--trigger">
        {lead}
        {text}
        {status}
        <span className="gv-card__chevron" aria-hidden>
          <ChevronDown size={16} />
        </span>
      </Button>
    );
    // The picker hangs under the row, as wide as it.
    const popover = (content: ReactNode) => (
      <Popover placement="bottom start" offset={6} showArrow={false} className="gv-card__popover gv-card__popover--pick">
        {content}
      </Popover>
    );
    return (
      <div {...root} data-control="pick">
        {picture}
        <Heading className="gv-card__heading">
          {pickerKind === 'menu' ? (
            <MenuTrigger>
              {header}
              {popover(picker)}
            </MenuTrigger>
          ) : (
            <DialogTrigger>
              {header}
              {popover(
                <Dialog aria-label={typeof title === 'string' ? title : undefined} className="gv-card__dialog">
                  {picker}
                </Dialog>
              )}
            </DialogTrigger>
          )}
        </Heading>
      </div>
    );
  }

  if (control === 'menu') {
    const current = value ?? innerKey;
    const chosen = menuItems.find(item => item.id === current);
    return (
      <div {...root}>
        {picture}
        <Heading className="gv-card__heading">
          <MenuTrigger>
            <Button className="gv-card__header gv-card__header--trigger">
              {lead}
              {text}
              <Status
                isRequired={isRequired}
                status={reviewStatus}
                summary={summary}
                pills={pills ?? (chosen ? [{label: chosen.label, icon: chosen.icon}] : undefined)}
                labels={l}
              />
              <span className="gv-card__chevron" aria-hidden>
                <ChevronDown size={16} />
              </span>
            </Button>
            <Popover placement="bottom end" offset={6} className="gv-card__popover">
              <Menu
                className="gv-card__menu"
                aria-label={typeof title === 'string' ? title : undefined}
                items={menuItems}
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={current ? [current] : []}
                onSelectionChange={keys => {
                  const [id] = keys === 'all' ? [] : [...keys];
                  if (id === undefined) return;
                  setInnerKey(String(id));
                  onChange?.(String(id));
                }}>
                {item => (
                  <MenuItem id={item.id} textValue={item.label} className="gv-card__menu-item">
                    {({isSelected}) => (
                      <>
                        <span className="gv-card__menu-label">
                          {item.icon && <item.icon aria-hidden size={16} />}
                          <span>{item.label}</span>
                        </span>
                        {isSelected && <Check aria-hidden size={16} strokeWidth={1.75} />}
                      </>
                    )}
                  </MenuItem>
                )}
              </Menu>
            </Popover>
          </MenuTrigger>
        </Heading>
      </div>
    );
  }

  if (control === 'expand') {
    return (
      <Disclosure
        {...root}
        defaultExpanded={defaultExpanded}
        isExpanded={isExpanded}
        onExpandedChange={onExpandedChange}>
        {picture}
        <Heading className="gv-card__heading">
          <Button slot="trigger" className="gv-card__header gv-card__header--trigger">
            {lead}
            {text}
            {status}
            <span className="gv-card__chevron" aria-hidden>
              <ChevronDown size={16} />
            </span>
          </Button>
        </Heading>
        <DisclosurePanel className="gv-card__panel">
          <div className="gv-card__body">{children}</div>
        </DisclosurePanel>
      </Disclosure>
    );
  }

  if (layout === 'stacked') {
    return (
      <section {...root} data-layout="stacked">
        {picture}
        <div className="gv-card__title-line">
          <Heading level={3} className="gv-card__title">
            {title}
          </Heading>
          {status}
          <Trailing iconActions={iconActions} actions={actions} />
        </div>
        {children}
      </section>
    );
  }

  return (
    <section {...root}>
      {picture}
      <div className="gv-card__header" data-roomy={roomy || undefined}>
        {lead}
        {description != null ? (
          <span className="gv-card__text">
            <Heading level={3} className="gv-card__title">
              {title}
            </Heading>
            <span className="gv-card__description">{description}</span>
          </span>
        ) : (
          <Heading level={3} className="gv-card__title">
            {title}
          </Heading>
        )}
        {status}
        <Trailing iconActions={iconActions} actions={actions} />
        {control === 'open' && (
          <IconButton aria-label={l.open(typeof title === 'string' ? title : '')} onPress={onOpen}>
            <ChevronRight aria-hidden size={16} />
          </IconButton>
        )}
        {control === 'placeholder' && <span className="gv-card__chevron" aria-hidden />}
      </div>
      {children !== undefined && <div className="gv-card__body">{children}</div>}
    </section>
  );
}

/**
 * The Card's on/off switch (Figma "Manage · Toggle", the prototype's `.pj-sw`): the design system's Switch at the
 * card's 26 × 16 size, with no visible label (give it an `aria-label`).
 */
export function CardSwitch(props: Omit<SwitchProps, 'children' | 'className' | 'description' | 'errorMessage'>) {
  return (
    <Switch {...props} className="react-aria-SwitchField gv-base-switch-field gv-card-switch">
      {null}
    </Switch>
  );
}

/**
 * The choice cards' radio list (Survey placement, Survey options, Voting method): the design system's RadioGroup.
 *
 * @deprecated Use Choice card (`ChoiceCard` in a `RadioGroup`): the same choices as bordered tiles, as the prototype
 *   draws them. Kept working until the back office's Reporting and Users pages move over.
 */
export function CardRadioGroup({
  orientation = 'vertical',
  children,
  ...props
}: Omit<RadioGroupProps, 'className'> & {orientation?: 'vertical' | 'horizontal'}) {
  return (
    <RadioGroup
      {...props}
      orientation={orientation}
      className={({defaultClassName}) => `${defaultClassName} gv-card__radios`}>
      {children as ReactNode}
    </RadioGroup>
  );
}

/**
 * One choice: the design system's Radio, with a title and an optional grey line under it.
 *
 * @deprecated Use `ChoiceCard`. Kept working until the back office's Reporting and Users pages move over.
 */
export function CardRadio({
  children,
  description,
  ...props
}: Omit<RadioProps, 'className' | 'children' | 'description'> & {
  /** The choice's title. */
  children: ReactNode;
  /** A grey line under the title. */
  description?: ReactNode;
}) {
  return (
    <Radio {...props} className={({defaultClassName}) => `${defaultClassName} gv-card__radio`}>
      <span className="gv-card__radio-text">
        <span className="gv-card__radio-title">{children}</span>
        {description && <span className="gv-card__radio-description">{description}</span>}
      </span>
    </Radio>
  );
}

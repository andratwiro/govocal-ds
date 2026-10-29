'use client';
import {useState, type ReactNode} from 'react';
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading,
  Menu,
  MenuItem,
  MenuTrigger,
  type RadioGroupProps
} from 'react-aria-components';
import {Check, ChevronDown, ChevronRight, type LucideIcon} from 'lucide-react';
import {Popover} from '../Popover';
import {Radio, RadioGroup, type RadioProps} from '../RadioGroup';
import {Switch, type SwitchProps} from '../Switch';
import {IconButton} from './IconButton';
import {Pill} from './Pill';
import {Required} from './Required';
import {ReviewNotice, type ReviewNoticeProps} from './ReviewNotice';
import './Card.css';

export interface CardPill {
  label: string;
  /** A 14 lucide icon before the label (Figma "Pill · Icon=Yes"). */
  icon?: LucideIcon;
}

export interface CardMenuItem {
  id: string;
  label: string;
}

export interface CardIconAction {
  icon: LucideIcon;
  /** The button's accessible name, e.g. "Add an attachment". */
  label: string;
  onPress?: () => void;
}

export interface CardProps {
  /** The card's name, in Small type. */
  title?: ReactNode;
  /**
   * Where the card sits: in a phase's Build panel (a border, no fill) or on Manage / Insights' grey stage
   * (panel fill, subtle border).
   *
   * @default 'build'
   */
  tone?: 'build' | 'manage';
  /**
   * `row`: one header line, the body under it. `stacked`: the title line, then the body 24 below
   * (the choice cards: Survey placement, Survey options, Voting method).
   *
   * @default 'row'
   */
  layout?: 'row' | 'stacked';
  /** The "Required" marker (a dot + the word). */
  isRequired?: boolean;
  /** The review notice at the end of the title line. */
  review?: ReviewNoticeProps['state'];
  /** Grey words for the current value, e.g. "Not set". */
  summary?: string;
  /**
   * Summary pills, e.g. "6 questions", or "Idea" with a lightbulb. Hidden while the card is open. A `menu` card
   * without pills shows its chosen item as the pill.
   */
  pills?: CardPill[];
  /**
   * The header's chevron. `expand` opens the body in place (a Disclosure); `open` leads somewhere else (→);
   * `menu` drops a list to pick one value from (Figma "Review · pill dropdown", the prototype's Sorting card).
   * `placeholder` keeps the 28 box empty (Figma's "Empty" card).
   */
  control?: 'expand' | 'open' | 'placeholder' | 'menu';
  /** `control="menu"`: the values to pick from. */
  menuItems?: CardMenuItem[];
  /** `control="menu"`: the chosen value's id (controlled), or the first one (uncontrolled). */
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (id: string) => void;
  /** What the → does (`control="open"`). */
  onOpen?: () => void;
  /** Ghost icon buttons in the header (plus, upload, download, link, sparkles…). */
  iconActions?: CardIconAction[];
  /** Anything else at the end of the header: compact buttons, a CardSwitch. */
  actions?: ReactNode;
  /** The body. With `control="expand"` it shows only while the card is open. */
  children?: ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

function Status({isRequired, review, summary, pills}: Pick<CardProps, 'isRequired' | 'review' | 'summary' | 'pills'>) {
  return (
    <>
      {isRequired && <Required placement="card" />}
      {review && (
        <span className="gv-card__review">
          <ReviewNotice state={review} />
        </span>
      )}
      {summary && <span className="gv-card__summary">{summary}</span>}
      {pills && pills.length > 0 && (
        <span className="gv-card__pills">
          {pills.map(({label, icon: Icon}) => (
            <Pill key={label} icon={Icon && <Icon aria-hidden size={14} />}>
              {label}
            </Pill>
          ))}
        </span>
      )}
    </>
  );
}

function Trailing({iconActions, actions}: Pick<CardProps, 'iconActions' | 'actions'>) {
  if (!iconActions?.length && !actions) return null;
  return (
    <span className="gv-card__actions">
      {iconActions?.map(({icon: Icon, label, onPress}) => (
        <IconButton key={label} aria-label={label} onPress={onPress}>
          <Icon aria-hidden size={16} />
        </IconButton>
      ))}
      {actions}
    </span>
  );
}

/**
 * Card: a titled box with a status line (Required, review notice, summary, pills), a control
 * (chevron, icon buttons, compact buttons, a switch) and an optional body. One card covers Figma's 23 types.
 */
export function Card({
  title,
  tone = 'build',
  layout = 'row',
  isRequired,
  review,
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
  selectedKey,
  defaultSelectedKey,
  onSelectionChange
}: CardProps) {
  const [innerKey, setInnerKey] = useState(defaultSelectedKey);
  const roomy = Boolean(actions) && layout === 'row';
  const status = <Status isRequired={isRequired} review={review} summary={summary} pills={pills} />;

  if (control === 'menu') {
    const current = selectedKey ?? innerKey;
    const chosen = menuItems.find(item => item.id === current);
    return (
      <div className="gv-card" data-tone={tone}>
        <Heading className="gv-card__heading">
          <MenuTrigger>
            <Button className="gv-card__header gv-card__header--trigger">
              <span className="gv-card__title">{title}</span>
              <Status
                isRequired={isRequired}
                review={review}
                summary={summary}
                pills={pills ?? (chosen ? [{label: chosen.label}] : undefined)}
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
                  onSelectionChange?.(String(id));
                }}>
                {item => (
                  <MenuItem id={item.id} textValue={item.label} className="gv-card__menu-item">
                    {({isSelected}) => (
                      <>
                        <span>{item.label}</span>
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
        className="gv-card"
        data-tone={tone}
        defaultExpanded={defaultExpanded}
        isExpanded={isExpanded}
        onExpandedChange={onExpandedChange}>
        <Heading className="gv-card__heading">
          <Button slot="trigger" className="gv-card__header gv-card__header--trigger">
            <span className="gv-card__title">{title}</span>
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
      <section className="gv-card" data-tone={tone} data-layout="stacked">
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
    <section className="gv-card" data-tone={tone}>
      <div className="gv-card__header" data-roomy={roomy || undefined}>
        <Heading level={3} className="gv-card__title">
          {title}
        </Heading>
        {status}
        <Trailing iconActions={iconActions} actions={actions} />
        {control === 'open' && (
          <IconButton aria-label={`Open ${typeof title === 'string' ? title : ''}`.trim()} onPress={onOpen}>
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
    <Switch {...props} className="react-aria-SwitchField gv-card-switch">
      {null}
    </Switch>
  );
}

/** The choice cards' radio list (Survey placement, Survey options, Voting method): the design system's RadioGroup. */
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

/** One choice: the design system's Radio, with a title and an optional grey line under it. */
export function CardRadio({
  children,
  description,
  ...props
}: Omit<RadioProps, 'className' | 'children' | 'description'> & {children: ReactNode; description?: ReactNode}) {
  return (
    <Radio {...props} className={({defaultClassName}) => `${defaultClassName} gv-card__radio`}>
      <span className="gv-card__radio-text">
        <span className="gv-card__radio-title">{children}</span>
        {description && <span className="gv-card__radio-description">{description}</span>}
      </span>
    </Radio>
  );
}

'use client';
import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Button as RACButton} from 'react-aria-components/Button';
import {Disclosure, DisclosurePanel} from 'react-aria-components/Disclosure';
import {DisclosureGroup} from 'react-aria-components/DisclosureGroup';
import {Heading} from 'react-aria-components/Heading';
import {ChevronRight, Info, Lock, Pencil, Shield, User, Users} from 'lucide-react';
import {Button} from '../components/Button';
import {Link} from '../components/Link';
import {RadioGroup} from '../components/RadioGroup';
import {Select, SelectItem} from '../components/Select';
import {Switch} from '../components/Switch';
import {AlertDialog} from '../components/gv/AlertDialog';
import {ChoiceCard} from '../components/gv/ChoiceCard';
import {Modal} from '../components/gv/Modal';
import {SectionLabel} from '../components/gv/SectionLabel';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './AccessRights.css';

export type AccessWho = 'anyone' | 'signin' | 'admins';

const WHO: Record<AccessWho, {icon: ReactNode; label: string; description: string}> = {
  anyone: {
    icon: <Users aria-hidden />,
    label: 'Anyone',
    description: 'No account needed'
  },
  signin: {
    icon: <Shield aria-hidden />,
    label: 'Require sign-in',
    description: 'Participants sign in with email.'
  },
  admins: {
    icon: <Lock aria-hidden />,
    label: 'Administrators and managers',
    description: 'Not open to participants'
  }
};

/** What an action's row says about who can take it (Participant action row's value). */
export const ACCESS_WHO_VALUE: Record<AccessWho, string> = {
  anyone: 'Anyone can participate',
  signin: 'Sign-in required',
  admins: 'Admins & managers only'
};

function useValue<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(defaultValue);
  return [
    value ?? inner,
    (next: T) => {
      setInner(next);
      onChange?.(next);
    }
  ] as const;
}

export interface AccessRightsProps extends PlacementProps {
  /** Set for this phase (editable), or following the platform's defaults (read-only until Override). */
  isOverriding?: boolean;
  defaultOverriding?: boolean;
  onOverridingChange?: (isOverriding: boolean) => void;
  /** Who can take the action. */
  who?: AccessWho;
  /** @default 'signin' */
  defaultWho?: AccessWho;
  onWhoChange?: (who: AccessWho) => void;
  /** The choices this action offers (some offer two). @default ['anyone', 'signin', 'admins'] */
  whoItems?: AccessWho[];
  /** Sign-in's security requirement: participants set a password. @default true */
  defaultRequirePassword?: boolean;
  /** The groups an action can be limited to; the first is "no restriction". */
  groups?: string[];
  /** The "platform defaults" link: where the defaults are set. */
  onPlatformDefaults?: () => void;
  /** "Customize error message" under Limit to groups. */
  onCustomizeError?: () => void;
  /** Which of Sign-in's settings start open. @default ['security', 'groups'] */
  defaultExpandedKeys?: Array<'security' | 'groups'>;
}

/**
 * Who can take one participant action (prototype `.pj-ap` inside the access modal): following the platform's defaults
 * (read-only, with Override) or set for this phase. Who can participate is three Choice cards; Require sign-in opens
 * its settings (Security requirements, Limit to groups), Administrators and managers says nothing else applies.
 * `AccessRightsModal` puts it in the modal each action's row opens. Not in Figma.
 */
export function AccessRights({
  isOverriding,
  defaultOverriding = false,
  onOverridingChange,
  who: whoProp,
  defaultWho = 'signin',
  onWhoChange,
  whoItems = ['anyone', 'signin', 'admins'],
  defaultRequirePassword = true,
  groups = ['All participants (no group restriction)'],
  onPlatformDefaults,
  onCustomizeError,
  defaultExpandedKeys = ['security', 'groups'],
  className,
  style
}: AccessRightsProps) {
  const [overriding, setOverriding] = useValue(isOverriding, defaultOverriding, onOverridingChange);
  const [who, setWho] = useValue(whoProp, defaultWho, onWhoChange);
  const readOnly = !overriding;
  // Override and Revert take away the button that was pressed: focus lands on what comes next (the chosen card, or
  // Override again) instead of falling to the page.
  const root = useRef<HTMLDivElement>(null);
  const was = useRef(overriding);
  useEffect(() => {
    if (was.current === overriding) return;
    was.current = overriding;
    const frame = requestAnimationFrame(() => {
      const el = root.current;
      if (!el || el.contains(document.activeElement)) return;
      const next = overriding
        ? el.querySelector<HTMLElement>('input[type="radio"]:checked') ??
          el.querySelector<HTMLElement>('input[type="radio"]')
        : el.querySelector<HTMLElement>('.gv-access-rights__head button');
      next?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [overriding]);
  return (
    <div ref={root} className={clsx('gv-access-rights', className)} style={style} data-overriding={overriding || undefined}>
      <div className="gv-access-rights__head">
        {overriding ? (
          <span className="gv-access-rights__status">Overriding platform defaults</span>
        ) : (
          <>
            <span className="gv-access-rights__status">
              Using{' '}
              <Link size="small" onPress={onPlatformDefaults}>
                platform defaults
              </Link>
            </span>
            <Button variant="secondary" size={32} onPress={() => setOverriding(true)}>
              <Pencil aria-hidden size={16} />
              Override
            </Button>
          </>
        )}
      </div>
      <div className="gv-access-rights__body" data-read-only={readOnly || undefined}>
        <SectionLabel icon={<User />}>Who can participate</SectionLabel>
        <RadioGroup
          aria-label="Who can participate"
          orientation="horizontal"
          value={who}
          onChange={v => setWho(v as AccessWho)}
          isReadOnly={readOnly}
          className="gv-access-rights__who">
          {whoItems.map(key => (
            <ChoiceCard key={key} value={key} media={WHO[key].icon} description={WHO[key].description}>
              {WHO[key].label}
            </ChoiceCard>
          ))}
        </RadioGroup>
        {who === 'admins' && (
          <p className="gv-access-rights__strip">
            <Info aria-hidden size={16} />
            Only administrators and managers can take this action. No other requirements apply.
          </p>
        )}
        {who === 'signin' && (
          <DisclosureGroup
            className="gv-access-rights__config"
            allowsMultipleExpanded
            defaultExpandedKeys={defaultExpandedKeys}>
            <Disclosure id="security" className="gv-access-rights__section">
              <Heading level={3} className="gv-access-rights__section-heading">
                <RACButton slot="trigger" className="gv-access-rights__section-trigger">
                  <ChevronRight aria-hidden size={16} className="gv-access-rights__chevron" />
                  <Shield aria-hidden size={16} />
                  Security requirements
                </RACButton>
              </Heading>
              <DisclosurePanel className="gv-access-rights__section-panel">
                <div className="gv-access-rights__toggle">
                  <Switch
                    defaultSelected={defaultRequirePassword}
                    isReadOnly={readOnly}
                    description="If enabled, users must set a password before participating. If disabled, users won't be asked to set a password.">
                    <Lock aria-hidden size={16} className="gv-access-rights__toggle-icon" />
                    Require user to set a password
                  </Switch>
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="groups" className="gv-access-rights__section">
              <Heading level={3} className="gv-access-rights__section-heading">
                <RACButton slot="trigger" className="gv-access-rights__section-trigger">
                  <ChevronRight aria-hidden size={16} className="gv-access-rights__chevron" />
                  <Users aria-hidden size={16} />
                  Limit to groups
                </RACButton>
              </Heading>
              <DisclosurePanel className="gv-access-rights__section-panel">
<div className="gv-access-rights__panel-body">
                <p className="gv-access-rights__lead">Participant must be in any one of the selected groups.</p>
                <Select aria-label="Groups" defaultValue="0" isDisabled={readOnly}>
                  {groups.map((g, i) => (
                    <SelectItem key={g} id={String(i)}>
                      {g}
                    </SelectItem>
                  ))}
                </Select>
                <Button variant="secondary" size={32} isDisabled={readOnly} onPress={onCustomizeError}>
                  <Pencil aria-hidden size={16} />
                  Customize error message
                </Button>
              </div>
</DisclosurePanel>
            </Disclosure>
          </DisclosureGroup>
        )}
      </div>
    </div>
  );
}

export interface AccessRightsModalProps extends AccessRightsProps {
  /** The question for this action ("Who can submit inputs?"). */
  title: string;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onSave?: () => void;
}

/**
 * The modal an action's row opens (one modal, eight openers): the question as its title, Access rights in the body,
 * Save changes at the foot; while overriding, Revert to platform defaults asks first (it discards what was set).
 */
export function AccessRightsModal({
  title,
  isOpen,
  defaultOpen,
  onOpenChange,
  onSave,
  isOverriding,
  defaultOverriding = false,
  onOverridingChange,
  ...rest
}: AccessRightsModalProps) {
  const [overriding, setOverriding] = useValue(isOverriding, defaultOverriding, onOverridingChange);
  const [reverting, setReverting] = useState(false);
  return (
    <>
      <Modal
        title={title}
        width="wide"
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        footer={
          <div className="gv-access-rights__footer">
            {overriding && (
              <Button variant="quiet" size={36} onPress={() => setReverting(true)}>
                Revert to platform defaults
              </Button>
            )}
            <Button size={36} onPress={onSave}>
              Save changes
            </Button>
          </div>
        }>
        <AccessRights {...rest} isOverriding={overriding} onOverridingChange={setOverriding} />
      </Modal>
      <AlertDialog
        isOpen={reverting}
        onOpenChange={setReverting}
        title="Revert to platform defaults"
        confirmLabel="Revert to defaults"
        onConfirm={() => {
          setOverriding(false);
          setReverting(false);
        }}>
        This action will follow the platform defaults again. The groups you set for it will be discarded and cannot be
        restored.
      </AlertDialog>
    </>
  );
}

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
import {AlertDialog, type AlertDialogLabels} from '../components/gv/AlertDialog';
import {ChoiceCard} from '../components/gv/ChoiceCard';
import {Modal, type ModalLabels} from '../components/gv/Modal';
import {SectionLabel} from '../components/gv/SectionLabel';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './AccessRights.css';

export type AccessWho = 'anyone' | 'signin' | 'admins';

/** The words Access rights says itself (docs/API.md rule 11). */
export interface AccessRightsLabels {
  /** The three choices, each with its line. */
  anyone: string;
  /** The line under "Anyone". */
  anyoneDescription: string;
  /** The "Require sign-in" choice's name. */
  signin: string;
  /** The line under "Require sign-in". */
  signinDescription: string;
  /** The "Administrators and managers" choice's name. */
  admins: string;
  /** The line under "Administrators and managers". */
  adminsDescription: string;
  /** The head: set for this phase, or following the defaults (given the link to them). */
  overriding: string;
  /** The head while following the defaults, given the link to them ("Using platform defaults"). */
  using: (link: ReactNode) => ReactNode;
  /** The link's words inside the head while following the defaults. */
  platformDefaults: string;
  /** The button that makes the rights editable for this phase. */
  override: string;
  /** The section label over the three choices, also the choices' accessible name. */
  whoCanParticipate: string;
  /** The line under Administrators and managers. */
  adminsOnly: string;
  /** Sign-in's settings. */
  security: string;
  /** The switch's name under Security requirements. */
  requirePassword: string;
  /** The line under the password switch. */
  requirePasswordDescription: string;
  /** The Limit to groups section's heading. */
  limitToGroups: string;
  /** The line over the groups list. */
  groupsLead: string;
  /** The groups list's name, and its first group when no `groups` are given. */
  groupPicker: string;
  /** The first group, meaning no restriction, when no `groups` are given. */
  allParticipants: string;
  /** The button under the groups list that customises the error message (see `onCustomizeError`). */
  customizeError: string;
}

/** Access rights' English words; a page passes its own over them with `labels`. */
export const accessRightsLabels: AccessRightsLabels = {
  anyone: 'Anyone',
  anyoneDescription: 'No account needed',
  signin: 'Require sign-in',
  signinDescription: 'Participants sign in with email.',
  admins: 'Administrators and managers',
  adminsDescription: 'Not open to participants',
  overriding: 'Overriding platform defaults',
  using: link => <>Using {link}</>,
  platformDefaults: 'platform defaults',
  override: 'Override',
  whoCanParticipate: 'Who can participate',
  adminsOnly: 'Only administrators and managers can take this action. No other requirements apply.',
  security: 'Security requirements',
  requirePassword: 'Require user to set a password',
  requirePasswordDescription:
    "If enabled, users must set a password before participating. If disabled, users won't be asked to set a password.",
  limitToGroups: 'Limit to groups',
  groupsLead: 'Participant must be in any one of the selected groups.',
  groupPicker: 'Groups',
  allParticipants: 'All participants (no group restriction)',
  customizeError: 'Customize error message'
};

const WHO_ICON: Record<AccessWho, ReactNode> = {
  anyone: <Users aria-hidden />,
  signin: <Shield aria-hidden />,
  admins: <Lock aria-hidden />
};

/**
 * What an action's row says about who can take it (Participant action row's value), in English: a page that speaks
 * another language passes its own words as the row's `value`.
 */
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
  /** Whether it starts set for this phase, when `isOverriding` is not given. @default false */
  defaultOverriding?: boolean;
  /** Fires when Override or Revert is pressed, with whether it is now set for this phase. */
  onOverridingChange?: (isOverriding: boolean) => void;
  /** Who can take the action. */
  who?: AccessWho;
  /** @default 'signin' */
  defaultWho?: AccessWho;
  /** Fires when the person picks who can take the action, with the choice. */
  onWhoChange?: (who: AccessWho) => void;
  /** The choices this action offers (some offer two). @default ['anyone', 'signin', 'admins'] */
  whoItems?: AccessWho[];
  /** Sign-in's security requirement: participants set a password. @default true */
  defaultRequirePassword?: boolean;
  /** The groups an action can be limited to; the first is "no restriction". @default [`labels.allParticipants`] */
  groups?: string[];
  /** The "platform defaults" link: where the defaults are set. */
  onPlatformDefaults?: () => void;
  /** "Customize error message" under Limit to groups. */
  onCustomizeError?: () => void;
  /** Which of Sign-in's settings start open. @default ['security', 'groups'] */
  defaultExpandedKeys?: Array<'security' | 'groups'>;
  /** Its own words (the choices, the head, Sign-in's settings), over `accessRightsLabels`. */
  labels?: Partial<AccessRightsLabels>;
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
  groups: groupsProp,
  onPlatformDefaults,
  onCustomizeError,
  defaultExpandedKeys = ['security', 'groups'],
  labels,
  className,
  style
}: AccessRightsProps) {
  const l = mergeLabels(accessRightsLabels, labels);
  const groups = groupsProp ?? [l.allParticipants];
  const whoWords: Record<AccessWho, [string, string]> = {
    anyone: [l.anyone, l.anyoneDescription],
    signin: [l.signin, l.signinDescription],
    admins: [l.admins, l.adminsDescription]
  };
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
          <span className="gv-access-rights__status">{l.overriding}</span>
        ) : (
          <>
            <span className="gv-access-rights__status">
              {l.using(
                <Link size="small" onPress={onPlatformDefaults}>
                  {l.platformDefaults}
                </Link>
              )}
            </span>
            <Button variant="secondary" size={32} onPress={() => setOverriding(true)}>
              <Pencil aria-hidden size={16} />
              {l.override}
            </Button>
          </>
        )}
      </div>
      <div className="gv-access-rights__body" data-read-only={readOnly || undefined}>
        <SectionLabel icon={<User />}>{l.whoCanParticipate}</SectionLabel>
        <RadioGroup
          aria-label={l.whoCanParticipate}
          orientation="horizontal"
          value={who}
          onChange={v => setWho(v as AccessWho)}
          isReadOnly={readOnly}
          className="gv-access-rights__who">
          {whoItems.map(key => (
            <ChoiceCard key={key} value={key} media={WHO_ICON[key]} description={whoWords[key][1]}>
              {whoWords[key][0]}
            </ChoiceCard>
          ))}
        </RadioGroup>
        {who === 'admins' && (
          <p className="gv-access-rights__strip">
            <Info aria-hidden size={16} />
            {l.adminsOnly}
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
                  {l.security}
                </RACButton>
              </Heading>
              <DisclosurePanel className="gv-access-rights__section-panel">
                <div className="gv-access-rights__toggle">
                  <Switch
                    defaultSelected={defaultRequirePassword}
                    isReadOnly={readOnly}
                    description={l.requirePasswordDescription}>
                    <Lock aria-hidden size={16} className="gv-access-rights__toggle-icon" />
                    {l.requirePassword}
                  </Switch>
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure id="groups" className="gv-access-rights__section">
              <Heading level={3} className="gv-access-rights__section-heading">
                <RACButton slot="trigger" className="gv-access-rights__section-trigger">
                  <ChevronRight aria-hidden size={16} className="gv-access-rights__chevron" />
                  <Users aria-hidden size={16} />
                  {l.limitToGroups}
                </RACButton>
              </Heading>
              <DisclosurePanel className="gv-access-rights__section-panel">
<div className="gv-access-rights__panel-body">
                <p className="gv-access-rights__lead">{l.groupsLead}</p>
                <Select aria-label={l.groupPicker} defaultValue="0" isDisabled={readOnly}>
                  {groups.map((g, i) => (
                    <SelectItem key={g} id={String(i)}>
                      {g}
                    </SelectItem>
                  ))}
                </Select>
                <Button variant="secondary" size={32} isDisabled={readOnly} onPress={onCustomizeError}>
                  <Pencil aria-hidden size={16} />
                  {l.customizeError}
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

/** The words Access rights modal says itself (docs/API.md rule 11), with Access rights', the Modal's × and the
 * revert confirm's Cancel, which it hands on. */
export interface AccessRightsModalLabels extends AccessRightsLabels, ModalLabels, Pick<AlertDialogLabels, 'cancel'> {
  /** The footer's buttons; `revert` also titles the confirm. */
  revert: string;
  /** The footer's save button. */
  save: string;
  /** The revert confirm's button and its words. */
  confirmRevert: string;
  /** The revert confirm's message. */
  revertBody: string;
}

/** Access rights modal's English words; a page passes its own over them with `labels`. */
export const accessRightsModalLabels: AccessRightsModalLabels = {
  ...accessRightsLabels,
  close: 'Close',
  cancel: 'Cancel',
  revert: 'Revert to platform defaults',
  save: 'Save changes',
  confirmRevert: 'Revert to defaults',
  revertBody:
    'This action will follow the platform defaults again. The groups you set for it will be discarded and cannot be restored.'
};

export interface AccessRightsModalProps extends Omit<AccessRightsProps, 'labels'> {
  /** The question for this action ("Who can submit inputs?"). */
  title: string;
  /** Whether the modal is open (controlled). */
  isOpen?: boolean;
  /** Whether the modal starts open, when `isOpen` is not given. */
  defaultOpen?: boolean;
  /** Fires when the modal opens or closes, with whether it is now open. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Fires when Save changes is pressed. */
  onSave?: () => void;
  /** Its own words (Save changes, the revert and its confirm, ×, and Access rights'), over `accessRightsModalLabels`. */
  labels?: Partial<AccessRightsModalLabels>;
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
  labels,
  ...rest
}: AccessRightsModalProps) {
  const l = mergeLabels(accessRightsModalLabels, labels);
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
        labels={l}
        footer={
          <div className="gv-access-rights__footer">
            {overriding && (
              <Button variant="quiet" size={36} onPress={() => setReverting(true)}>
                {l.revert}
              </Button>
            )}
            <Button size={36} onPress={onSave}>
              {l.save}
            </Button>
          </div>
        }>
        <AccessRights {...rest} isOverriding={overriding} onOverridingChange={setOverriding} labels={l} />
      </Modal>
      <AlertDialog
        isOpen={reverting}
        onOpenChange={setReverting}
        title={l.revert}
        confirmLabel={l.confirmRevert}
        labels={l}
        onConfirm={() => {
          setOverriding(false);
          setReverting(false);
        }}>
        {l.revertBody}
      </AlertDialog>
    </>
  );
}

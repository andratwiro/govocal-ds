import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {DialogTrigger} from 'react-aria-components/Dialog';
import {Button} from '../components/Button';
import {AccessRights, AccessRightsModal, ACCESS_WHO_VALUE, type AccessWho} from './AccessRights';
import {ParticipantActionList, ParticipantActionRow} from './ParticipantActionRow';

const meta: Meta<typeof AccessRights> = {
  title: 'Patterns/Build tab/Access rights',
  component: AccessRights,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 760, maxWidth: '100%'}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof AccessRights>;

/** Following the platform's defaults (read-only), then set for this phase: sign-in with its settings, anyone, administrators only. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-24)'}}>
      <AccessRights />
      <AccessRights defaultOverriding />
      <AccessRights defaultOverriding defaultWho="anyone" />
      <AccessRights defaultOverriding defaultWho="admins" />
    </div>
  )
};

/** The platform's defaults rule this action: everything shows but is read-only until Override. */
export const UsingDefaults: Story = {name: 'Using defaults'};

/** Set for this phase: the choices work; Require sign-in opens its settings. */
export const Override: Story = {args: {defaultOverriding: true}};

/** Require sign-in's settings, both open: a password, and limiting it to groups (with the error participants see). */
export const SecurityRequirements: Story = {
  name: 'Security requirements',
  args: {defaultOverriding: true, defaultWho: 'signin', groups: ['All participants (no group restriction)', 'Residents of the old town', 'Youth council']}
};

/** Two choices: an action that can't be open to anyone (Attending an event). */
export const TwoChoices: Story = {name: 'Two choices', args: {defaultOverriding: true, whoItems: ['signin', 'admins']}};

const QUESTION: Record<string, string> = {
  submit: 'Who can submit inputs?',
  comment: 'Who can comment on inputs?',
  react: 'Who can react to inputs?',
  event: 'Who can attend an event?'
};

const LABEL: Record<string, string> = {
  submit: 'Submitting inputs',
  comment: 'Commenting on inputs',
  react: 'Reacting to inputs',
  event: 'Attending an event'
};

function OpenersRender() {
  const [open, setOpen] = useState<string | null>(null);
  const [who, setWho] = useState<Record<string, AccessWho>>({submit: 'signin', comment: 'signin', react: 'signin', event: 'signin'});
  const [set, setSet] = useState<Record<string, boolean>>({});
  return (
    <>
      <div style={{width: 412}}>
        <ParticipantActionList>
          {Object.keys(LABEL).map(k => (
            <ParticipantActionRow key={k} value={ACCESS_WHO_VALUE[who[k]]} isDefault={!set[k]} isLocked={k === 'event'} onOpen={() => setOpen(k)}>
              {LABEL[k]}
            </ParticipantActionRow>
          ))}
        </ParticipantActionList>
      </div>
      {open && (
        <AccessRightsModal
          key={open}
          title={QUESTION[open]}
          isOpen
          onOpenChange={o => !o && setOpen(null)}
          whoItems={open === 'event' ? ['signin', 'admins'] : undefined}
          defaultOverriding={!!set[open]}
          onOverridingChange={v => setSet(s => ({...s, [open]: v}))}
          defaultWho={who[open]}
          onWhoChange={v => setWho(s => ({...s, [open]: v}))}
          onSave={() => setOpen(null)}
        />
      )}
    </>
  );
}

/**
 * One modal, eight openers: each action's row opens it with its own question. Override, choose, Save changes: the
 * row's value turns dark (set for this phase). Revert to platform defaults asks first.
 */
export const InTheModal: Story = {name: 'In the modal', render: () => <OpenersRender />};

/** The modal on its own, open. */
export const Modal: Story = {
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="secondary">Who can submit inputs?</Button>
      <AccessRightsModal title="Who can submit inputs?" defaultOverriding />
    </DialogTrigger>
  )
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import type {ReactNode} from 'react';
import {DialogTrigger} from 'react-aria-components';
import {Link as LinkIcon} from 'lucide-react';
import {Button} from '../Button';
import {Radio, RadioGroup} from '../RadioGroup';
import {TextField} from '../TextField';
import {Checkbox} from './Checkbox';
import {DropZone} from './DropZone';
import {Modal} from './Modal';

const figma = (id: string) => ({
  design: {type: 'figma', url: `https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=${id}`}
});

const meta: Meta<typeof Modal> = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    ...figma('5-513'),
    // Each open modal gets its own frame on the docs page.
    docs: {story: {inline: false, iframeHeight: 620}}
  }
};
export default meta;
type Story = StoryObj<typeof Modal>;

/** Story helper: a trigger button + the modal, open on load. */
function Open({label, open = true, children}: {label: string; open?: boolean; children: ReactNode}) {
  return (
    <DialogTrigger defaultOpen={open}>
      <Button variant="secondary">{label}</Button>
      {children}
    </DialogTrigger>
  );
}

const done = (
  <Button variant="secondary" slot="close">Done</Button>
);

function AttachmentsModal() {
  return (
    <Modal title="Attachments" footer={done}>
      <DropZone />
    </Modal>
  );
}

const people = [
  ['Maren Holt', 'maren.holt@riverside.example', 'Can edit'],
  ['Tobias Lind', 'tobias.lind@riverside.example', 'Can view'],
  ['Sofia Brandt', 'sofia.brandt@riverside.example', 'Can edit']
];

function ShareModal() {
  return (
    <Modal
      title="Share Green Corridors for Riverside"
      footer={
        <Button variant="secondary">
          <LinkIcon aria-hidden size={16} />
          Copy link
        </Button>
      }>
      <div style={{display: 'flex', gap: 8, alignItems: 'flex-end'}}>
        <div style={{flex: 1}}>
          <TextField label="Invite by email" placeholder="name@riverside.example" />
        </div>
        <Button>Invite</Button>
      </div>
      <ul style={{listStyle: 'none', margin: '16px 0 0', padding: 0}}>
        {people.map(([name, email, role]) => (
          <li
            key={email}
            style={{display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0',
              borderTop: '1px solid var(--gv-border-row)'}}>
            <span>
              <span style={{display: 'block', font: 'var(--gv-type-ui-strong)', color: 'var(--gv-text-primary)'}}>{name}</span>
              <span style={{display: 'block', font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)'}}>{email}</span>
            </span>
            <span style={{color: 'var(--gv-text-secondary)'}}>{role}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

function AccessModal() {
  return (
    <Modal
      title="Who can take part"
      footer={
        <>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button slot="close">Save</Button>
        </>
      }>
      <RadioGroup aria-label="Who can take part" defaultValue="registered">
        <Radio value="everyone" description="Anyone with the link, no account needed">Everyone</Radio>
        <Radio value="registered" description="People with a Riverside account">Registered users</Radio>
        <Radio value="groups" description="Only the groups you pick, e.g. Mill Road residents">Selected groups</Radio>
      </RadioGroup>
    </Modal>
  );
}

const inputs = [
  'Plant 200 street trees along Mill Road',
  'A green roof on the Riverside library',
  'Turn the old tram line into a walking path',
  'Rain gardens at every school gate',
  'Close Harbour Lane to cars on Sundays'
];

function InputManagerModal() {
  return (
    <Modal
      size="wide"
      title="Input manager"
      footer={
        <>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button slot="close">Move 3 inputs to Vote on proposals</Button>
        </>
      }>
      <p style={{margin: '0 0 12px', color: 'var(--gv-text-secondary)'}}>
        Pick the ideas from Collect ideas that go to the vote.
      </p>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {inputs.map((idea, i) => (
          <div key={idea} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderTop: '1px solid var(--gv-border-row)'}}>
            <Checkbox defaultSelected={i < 3}>{idea}</Checkbox>
            <span style={{color: 'var(--gv-text-tertiary)', font: 'var(--gv-type-small)'}}>{48 - i * 7} likes</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/** One trigger per modal: press one to open it. */
export const AllVariants: Story = {
  parameters: {docs: {story: {inline: true}}},
  render: () => (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      <Open label="Attachments" open={false}><AttachmentsModal /></Open>
      <Open label="Share" open={false}><ShareModal /></Open>
      <Open label="Access" open={false}><AccessModal /></Open>
      <Open label="Input manager" open={false}><InputManagerModal /></Open>
    </div>
  )
};

/** Modal (Figma's one variant): Attachments, a drop zone and Done. */
export const Attachments: Story = {
  render: () => <Open label="Attachments"><AttachmentsModal /></Open>
};

/** The prototype's Share modal. */
export const Share: Story = {
  render: () => <Open label="Share"><ShareModal /></Open>
};

/** The prototype's Access modal. */
export const Access: Story = {
  render: () => <Open label="Access"><AccessModal /></Open>
};

/** The prototype's Input manager: the wide modal. */
export const InputManager: Story = {
  name: 'Input manager',
  render: () => <Open label="Input manager"><InputManagerModal /></Open>
};

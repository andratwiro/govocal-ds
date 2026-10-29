import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';
import {useState, type ReactNode} from 'react';
import {DialogTrigger} from 'react-aria-components';
import {Link as LinkIcon, Settings, Paperclip, Tag, Sparkles} from 'lucide-react';
import {Button} from '../Button';
import {Radio, RadioGroup} from '../RadioGroup';
import {TextField} from '../TextField';
import {GroupedTabs, GroupedTabList, GroupedTab, GroupedTabPanel, TabSection} from '../Tabs';
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
      width="wide"
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

const settingsGroups = [
  {title: 'Project', tabs: [
    {id: 'general', icon: Settings, label: 'General information'},
    {id: 'resources', icon: Paperclip, label: 'Resources'}
  ]},
  {title: 'Inputs', tabs: [
    {id: 'tags', icon: Tag, label: 'Tags'},
    {id: 'perspectives', icon: Sparkles, label: 'Perspectives'}
  ]}
];

/**
 * The prototype's Settings dialog: a fixed height (640) so the side list and the panel each scroll on their own; the
 * side list groups its tabs under "Project" and "Inputs" (Tabs' grouped side list).
 */
function SideTabsModal() {
  return (
    <Modal title="Settings" width="wide" height="fixed" isFlush footer={<Button slot="close">Save</Button>}>
      <GroupedTabs defaultSelectedKey="general" style={{minHeight: 0}}>
        <GroupedTabList
          aria-label="Settings"
          style={{flex: '0 0 200px', padding: '8px', overflowY: 'auto', background: 'var(--gv-surface-secondary)',
            borderInlineEnd: '1px solid var(--gv-border-subtle)'}}>
          {settingsGroups.map(group => (
            <TabSection key={group.title} title={group.title}>
              {group.tabs.map(tab => (
                <GroupedTab key={tab.id} id={tab.id} textValue={tab.label}>
                  <tab.icon aria-hidden size={16} strokeWidth={1.75} />
                  {tab.label}
                </GroupedTab>
              ))}
            </TabSection>
          ))}
        </GroupedTabList>
        {settingsGroups.flatMap(group => group.tabs).map(tab => (
          <GroupedTabPanel key={tab.id} id={tab.id} style={{overflowY: 'auto', padding: '24px'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <p style={{margin: 0, font: 'var(--gv-type-body-strong)', color: 'var(--gv-text-primary)'}}>{tab.label}</p>
              <TextField label="Project name" defaultValue="Untitled project" />
            </div>
          </GroupedTabPanel>
        ))}
      </GroupedTabs>
    </Modal>
  );
}

/** A multi-step form modal ("Page 1 of 3"): the footer's Back/Next walk the pages, the last page's Next becomes Done. */
function PagedModal() {
  const pages = ['Add a title and description', 'Set the dates', 'Review and publish'];
  const [page, setPage] = useState(0);
  const last = page === pages.length - 1;
  return (
    <Modal
      title={pages[page]}
      footer={
        <>
          <span style={{marginInlineEnd: 'auto', color: 'var(--gv-text-secondary)', font: 'var(--gv-type-small)'}}>
            Page {page + 1} of {pages.length}
          </span>
          {page > 0 && <Button variant="secondary" onPress={() => setPage(p => p - 1)}>Back</Button>}
          {last
            ? <Button slot="close" onPress={() => setPage(0)}>Done</Button>
            : <Button onPress={() => setPage(p => p + 1)}>Next</Button>}
        </>
      }>
      {page === 0 && <TextField label="Title" placeholder="A renewed Araucano Park" />}
      {page === 1 && (
        <div style={{display: 'flex', gap: 8}}>
          <TextField label="Start date" placeholder="dd/mm/yyyy" />
          <TextField label="End date" placeholder="dd/mm/yyyy" />
        </div>
      )}
      {page === 2 && <p style={{margin: 0, color: 'var(--gv-text-secondary)'}}>Everything's ready. Publish when you are.</p>}
    </Modal>
  );
}

/** A tall body (Input manager's list, repeated): the shell holds at 640 and only the body scrolls. */
function FixedHeightModal() {
  return (
    <Modal
      title="Input manager"
      height="fixed"
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
        {[...inputs, ...inputs].map((idea, i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderTop: '1px solid var(--gv-border-row)'}}>
            <Checkbox defaultSelected={i < 3}>{idea}</Checkbox>
            <span style={{color: 'var(--gv-text-tertiary)', font: 'var(--gv-type-small)'}}>{48 - (i % inputs.length) * 7} likes</span>
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
      <Open label="With side tabs" open={false}><SideTabsModal /></Open>
      <Open label="Paged" open={false}><PagedModal /></Open>
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

/** `height="fixed"`: the shell holds at 640 and only the body scrolls (a long list, the Input manager). */
export const FixedHeight: Story = {
  name: 'Fixed height',
  render: () => <Open label="Fixed height"><FixedHeightModal /></Open>
};

/** A multi-step form: "Page 1 of 3" in the footer, Back/Next walk the pages. */
export const Paged: Story = {
  render: () => <Open label="Paged"><PagedModal /></Open>
};

/** The Settings dialog: a fixed height, the side list grouped under "Project" and "Inputs" (`GroupedTabs`). */
export const WithSideTabs: Story = {
  name: 'With side tabs',
  render: () => <Open label="With side tabs"><SideTabsModal /></Open>
};

/** The keyboard, proved by this story's play function (the Interactions panel): Enter on the button opens the modal
 * with focus on the dialog; Tab walks the ×, the body and the footer, and wraps round without leaving; Esc closes it
 * and puts focus back on the button. */
export const Keyboard: Story = {
  render: () => (
    <Open label="Add a phase" open={false}>
      <Modal title="Add a phase" footer={<>
        <Button variant="secondary" slot="close">Cancel</Button>
        <Button slot="close">Add phase</Button>
      </>}>
        <TextField label="Phase name" />
      </Modal>
    </Open>
  ),
  play: async ({canvasElement}) => {
    const trigger = within(canvasElement).getByRole('button', {name: 'Add a phase'});
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', {name: 'Add a phase'});
    await waitFor(() => expect(dialog).toHaveFocus());
    const close = within(dialog).getByRole('button', {name: 'Close'});
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole('textbox', {name: 'Phase name'})).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', {name: 'Cancel'})).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole('button', {name: 'Add phase'})).toHaveFocus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  }
};

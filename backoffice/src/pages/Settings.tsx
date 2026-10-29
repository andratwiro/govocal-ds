import {useId, useState} from 'react';
import {Button, Checkbox, CheckboxGroup, ChoiceCard, DropZone, FileList, type FileListItemData, NumberField, Panel,
  RadioGroup, SegmentedControl, SegmentedControlItem, Select, SelectItem, Switch, Tab, TabList, TabPanel, TabPanels,
  Tabs, TextArea, TextField, TitleField, ToastRegion} from 'govocal-ds';
import {ColorField} from 'govocal-ds/base';
import {APPROVERS, LOCALES, PLATFORM_NAME} from '../data-settings';
import {AreasTab, PoliciesTab, StatusesTab, TagsTab, toast} from './SettingsLists';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const TABS = [['general', 'General'], ['branding', 'Branding'], ['registration', 'Registration'], ['tags', 'Tags'],
  ['areas', 'Areas'], ['statuses', 'Statuses'], ['policies', 'Policies']] as const;

/** A form's Save, in its Panel's foot: off until something changes; the save says so in a Toast. */
function SaveButton({label, isDirty, onSave}: {label: string; isDirty: boolean; onSave: () => void}) {
  return (
    <Button variant="primary" size={32} aria-label={`Save ${label.toLowerCase()}`} isDisabled={!isDirty}
      onPress={() => { onSave(); toast(`${label} saved`); }}>Save</Button>
  );
}

/** A form's changed state: any change turns Save on; Save turns it off. */
function useDirty() {
  const [isDirty, setDirty] = useState(false);
  return {isDirty, touch: () => setDirty(true), onSave: () => setDirty(false)};
}

/** A setting that applies at once: a Switch, its change said in a Toast with Undo (docs/DECISIONS.md). */
function InstantSwitch({label, description, start}: {label: string; description: string; start: boolean}) {
  const [on, setOn] = useState(start);
  const change = (v: boolean) => {
    setOn(v);
    toast(`${label} turned ${v ? 'on' : 'off'}`, () => setOn(!v));
  };
  return <Switch isSelected={on} onChange={change} description={description}>{label}</Switch>;
}

function PlatformConfiguration() {
  const labelId = useId();
  const [languages, setLanguages] = useState<string[]>(LOCALES.map(l => l.id));
  const [locale, setLocale] = useState('en');
  const [names, setNames] = useState(PLATFORM_NAME);
  const [website, setWebsite] = useState('');
  const [population, setPopulation] = useState(100000);
  const {isDirty, touch, onSave} = useDirty();
  const active = LOCALES.filter(l => languages.includes(l.id));
  const current = active.find(l => l.id === locale) ?? active[0];

  return (
    <Panel title="Platform configuration" headingLevel={3}
      description="Choose how people will see your organization name, select the languages of your platform and link to your website."
      footer={<SaveButton label="Platform configuration" isDirty={isDirty} onSave={onSave} />}>
      <div className="bo-settings-fields">
        <div className="bo-settings-field">
          <div className="bo-settings-field-head">
            <span id={labelId} className="bo-settings-label">Name of city or organization</span>
            <SegmentedControl aria-label="Language of the name" selectionMode="single" disallowEmptySelection
              selectedKeys={current ? [current.id] : []} onSelectionChange={k => setLocale(String([...k][0]))}>
              {active.map(l => <SegmentedControlItem key={l.id} id={l.id} isUnread={!names[l.id]}>{l.code}</SegmentedControlItem>)}
            </SegmentedControl>
          </div>
          {current && (
            <TitleField aria-label={`Name of city or organization (${current.label})`} isRequired placeholder="Name of your platform"
              value={names[current.id]} onChange={v => { setNames(n => ({...n, [current.id]: v})); touch(); }} />
          )}
        </div>
        <CheckboxGroup label="Languages" value={languages}
          onChange={v => { if (v.length) { setLanguages(v); touch(); } }}>
          {LOCALES.map(l => <Checkbox key={l.id} value={l.id}>{l.label}</Checkbox>)}
        </CheckboxGroup>
        <TextField label="Website" type="url" placeholder="https://..." value={website}
          description="The link residents follow from the platform's footer to your own website."
          onChange={v => { setWebsite(v); touch(); }} />
        <NumberField label="Population" minValue={0} value={population}
          description="Used to show how many residents took part, as a share of everyone."
          onChange={v => { setPopulation(v); touch(); }} />
      </div>
    </Panel>
  );
}

function ContentModeration() {
  return (
    <Panel title="Content moderation" headingLevel={3} description="Applies at once to everything posted from now on.">
      <div className="bo-settings-switches">
        <InstantSwitch label="Profanity blocker" start
          description="Block input, proposals and comments containing the most commonly reported offensive words." />
        <InstantSwitch label="Detect inappropriate content" start
          description="Auto-detect inappropriate content posted on the platform." />
      </div>
    </Panel>
  );
}

function Statistics() {
  return (
    <Panel title="Statistics" headingLevel={3}>
      <InstantSwitch label="Exclude admins and managers from statistics" start={false}
        description="Leave out the participation and visits of admins and managers from statistics and graphs." />
    </Panel>
  );
}

const NAME_STYLES = {user: 'User', animal: 'Animal'} as const;

function UserNameDisplay() {
  const [style, setStyle] = useState<keyof typeof NAME_STYLES>('user');
  const change = (v: string) => {
    const was = style;
    setStyle(v as keyof typeof NAME_STYLES);
    toast(`Generated names now read as ${NAME_STYLES[v as keyof typeof NAME_STYLES].toLowerCase()} names`, () => setStyle(was));
  };
  return (
    <Panel title="User name display (for users with email confirmed only)" headingLevel={3}
      description="Choose how users without a name in their profile will appear on the platform. This happens when a phase's access rights are set to 'Email confirmation'. Upon participation, users can always update the name we generated for them.">
      <RadioGroup aria-label="User name display" value={style} onChange={change}>
        <ChoiceCard value="user" description="e.g. User 123456">User</ChoiceCard>
        <ChoiceCard value="animal" description="e.g. Elephant Cat">Animal</ChoiceCard>
      </RadioGroup>
    </Panel>
  );
}

function ProjectApproval() {
  const [approvers, setApprovers] = useState<string[]>([]);
  const {isDirty, touch, onSave} = useDirty();
  return (
    <Panel title="Project approval settings" headingLevel={3}
      description="Select which admins will receive notifications to approve projects. Folder managers are by default approvers for all projects within their folders."
      footer={<SaveButton label="Project approval settings" isDirty={isDirty} onSave={onSave} />}>
      <div className="bo-settings-fields">
        <Select label="Select approvers" selectionMode="multiple" placeholder="Choose admins" value={approvers}
          onChange={v => { setApprovers((v as string[]) ?? []); touch(); }}>
          {APPROVERS.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
        </Select>
      </div>
    </Panel>
  );
}

function General() {
  return (
    <div className="bo-settings-stack">
      <PlatformConfiguration />
      <ContentModeration />
      <Statistics />
      <UserNameDisplay />
      <ProjectApproval />
    </div>
  );
}

/** One image upload: the Drop zone, then the chosen file in a File list, removable. */
function ImageUpload({title, description, noun}: {title: string; description: string; noun: string}) {
  const [file, setFile] = useState<FileListItemData | null>(null);
  const take = (f: File | undefined) => {
    if (!f) return;
    setFile({id: f.name, name: f.name, meta: `${f.type.split('/')[1]?.toUpperCase() ?? 'Image'} · ${Math.max(1, Math.round(f.size / 1024))} KB`});
    toast(`${noun} uploaded`);
  };
  return (
    <Panel title={title} headingLevel={3} description={description}>
      <div className="bo-settings-fields">
        <FileList aria-label={title} items={file ? [file] : []} emptyLabel={`No ${noun.toLowerCase()} yet`}
          onDelete={() => { const was = file; setFile(null); toast(`${noun} removed`, () => setFile(was)); }} />
        <DropZone acceptedFileTypes={['image/*']} onSelect={files => take(files?.[0])}
          onDrop={async e => { const i = e.items.find(x => x.kind === 'file'); if (i && i.kind === 'file') take(await i.getFile()); }} />
      </div>
    </Panel>
  );
}

function Branding() {
  const {isDirty, touch, onSave} = useDirty();
  return (
    <div className="bo-settings-stack">
      <ImageUpload title="Platform logo" noun="Logo" description="Shown in the top bar of every page. A transparent PNG or SVG works best." />
      <ImageUpload title="Homepage banner" noun="Banner" description="The image behind the homepage's welcome message. At least 1440 × 480 pixels." />
      <Panel title="Colours" headingLevel={3} description="Buttons, links and highlights across the platform follow these colours."
        footer={<SaveButton label="Colours" isDirty={isDirty} onSave={onSave} />}>
        <div className="bo-settings-fields">
          <ColorField label="Main colour" defaultValue="#0B5563" onChange={touch} />
          <ColorField label="Secondary colour" defaultValue="#1B7D6E" onChange={touch} />
        </div>
      </Panel>
    </div>
  );
}

function Registration() {
  const {isDirty, touch, onSave} = useDirty();
  return (
    <div className="bo-settings-stack">
      <Panel title="Sign-up" headingLevel={3} description="What residents see and are asked when they create an account."
        footer={<SaveButton label="Sign-up" isDirty={isDirty} onSave={onSave} />}>
        <div className="bo-settings-fields">
          <TextArea label="Sign-up help text" defaultValue="Create an account to take part in Larkvale's projects." onChange={touch} />
          <Switch defaultSelected onChange={touch} description="Residents confirm their email address with a six-digit code.">Confirm email address</Switch>
          <Switch onChange={touch} description="Ask for first and last name when a resident signs up.">Ask for a full name</Switch>
        </div>
      </Panel>
    </div>
  );
}

export function Settings() {
  return (
    <Page title="Settings" description="Platform-wide settings for Larkvale participates.">
      <Tabs defaultSelectedKey="general">
        <TabList aria-label="Settings sections">{TABS.map(([id, label]) => <Tab key={id} id={id}>{label}</Tab>)}</TabList>
        <TabPanels>
          <TabPanel id="general"><SectionHeading>General</SectionHeading><General /></TabPanel>
          <TabPanel id="branding"><SectionHeading>Branding</SectionHeading><Branding /></TabPanel>
          <TabPanel id="registration"><SectionHeading>Registration</SectionHeading><Registration /></TabPanel>
          <TabPanel id="tags"><SectionHeading>Tags</SectionHeading><TagsTab /></TabPanel>
          <TabPanel id="areas"><SectionHeading>Areas</SectionHeading><AreasTab /></TabPanel>
          <TabPanel id="statuses"><SectionHeading>Statuses</SectionHeading><StatusesTab /></TabPanel>
          <TabPanel id="policies"><SectionHeading>Policies</SectionHeading><PoliciesTab /></TabPanel>
        </TabPanels>
      </Tabs>
      <ToastRegion />
    </Page>
  );
}

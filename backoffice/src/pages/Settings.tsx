import {useId, useState, type ReactNode} from 'react';
import {Button, Card, Checkbox, Divider, DropZone, NumberField, SegmentedControl, SegmentedControlItem, Select,
  SelectItem, Switch, Tab, TabList, TabPanel, TabPanels, Tabs, TextArea, TextField, TitleField} from 'govocal-ds';
import {CheckboxGroup, ColorField, Radio, RadioGroup} from 'govocal-ds/base';
import {APPROVERS, LOCALES, PLATFORM_NAME} from '../data-settings';
import {AreasTab, PoliciesTab, StatusesTab, TagsTab} from './SettingsLists';
import {Page} from './Page';
import {SectionHeading} from '../SectionHeading';

const TABS = [['general', 'General'], ['branding', 'Branding'], ['registration', 'Registration'], ['tags', 'Tags'],
  ['areas', 'Areas'], ['statuses', 'Statuses'], ['policies', 'Policies']] as const;

/** A form section in the prototype's way: a Card per theme, its help line, then the fields. */
function Section({title, help, children}: {title: string; help?: string; children: ReactNode}) {
  return (
    <Card title={title} layout="stacked">
      <div className="bo-settings-section">
        {help && <p className="bo-note bo-settings-help">{help}</p>}
        {children}
      </div>
    </Card>
  );
}

/** Save and what happened, under the fields it saves. */
function SaveRow({label, isDirty, saved, onSave}: {label: string; isDirty: boolean; saved: boolean; onSave: () => void}) {
  return (
    <>
      <Divider />
      <div className="bo-settings-actions">
        <Button variant="primary" aria-label={`Save ${label.toLowerCase()}`} isDisabled={!isDirty} onPress={onSave}>Save</Button>
        <span role="status" className="bo-note">{saved ? `${label} saved` : ''}</span>
      </div>
    </>
  );
}

/** A section's changed and saved state: any change turns Save on; Save turns it off and says so. */
function useSave() {
  const [isDirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  return {isDirty, saved, touch: () => { setDirty(true); setSaved(false); }, onSave: () => { setDirty(false); setSaved(true); }};
}

function PlatformConfiguration() {
  const labelId = useId();
  const [languages, setLanguages] = useState<string[]>(LOCALES.map(l => l.id));
  const [locale, setLocale] = useState('en');
  const [names, setNames] = useState(PLATFORM_NAME);
  const [website, setWebsite] = useState('');
  const [population, setPopulation] = useState(100000);
  const [isDirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const touch = () => { setDirty(true); setSaved(false); };
  const active = LOCALES.filter(l => languages.includes(l.id));
  const current = active.find(l => l.id === locale) ?? active[0];

  return (
    <Section title="Platform configuration"
      help="Choose how people will see your organization name, select the languages of your platform and link to your website.">
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
      <SaveRow label="Platform configuration" isDirty={isDirty} saved={saved} onSave={() => { setDirty(false); setSaved(true); }} />
    </Section>
  );
}

function ProjectApproval() {
  const [approvers, setApprovers] = useState<string[]>([]);
  const [isDirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Section title="Project approval settings"
      help="Select which admins will receive notifications to approve projects. Folder managers are by default approvers for all projects within their folders.">
      <div className="bo-settings-fields">
        <Select label="Select approvers" selectionMode="multiple" placeholder="Choose admins" value={approvers}
          onChange={v => { setApprovers((v as string[]) ?? []); setDirty(true); setSaved(false); }}>
          {APPROVERS.map(a => <SelectItem key={a} id={a}>{a}</SelectItem>)}
        </Select>
      </div>
      <SaveRow label="Project approval settings" isDirty={isDirty} saved={saved} onSave={() => { setDirty(false); setSaved(true); }} />
    </Section>
  );
}

function ContentModeration() {
  const {touch, ...save} = useSave();
  return (
    <Section title="Content moderation">
      <div className="bo-settings-switches">
        <Switch defaultSelected onChange={touch} description="Block input, proposals and comments containing the most commonly reported offensive words.">
          Profanity blocker
        </Switch>
        <Switch defaultSelected onChange={touch} description="Auto-detect inappropriate content posted on the platform.">
          Detect inappropriate content
        </Switch>
      </div>
      <SaveRow label="Content moderation" {...save} />
    </Section>
  );
}

function Statistics() {
  const {touch, ...save} = useSave();
  return (
    <Section title="Statistics">
      <Switch onChange={touch} description="Leave out the participation and visits of admins and managers from statistics and graphs.">
        Exclude admins and managers from statistics
      </Switch>
      <SaveRow label="Statistics" {...save} />
    </Section>
  );
}

function UserNameDisplay() {
  const {touch, ...save} = useSave();
  return (
    <Section title="User name display (for users with email confirmed only)"
      help="Choose how users without a name in their profile will appear on the platform. This happens when a phase's access rights are set to 'Email confirmation'. Upon participation, users can always update the name we generated for them.">
      <RadioGroup aria-label="User name display" defaultValue="user" onChange={touch}>
        <Radio value="user" description="e.g. User 123456">User</Radio>
        <Radio value="animal" description="e.g. Elephant Cat">Animal</Radio>
      </RadioGroup>
      <SaveRow label="User name display" {...save} />
    </Section>
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

function Branding() {
  const [logo, setLogo] = useState('');
  const [header, setHeader] = useState('');
  const pick = (set: (s: string) => void) => (files: FileList | null) => set(files?.[0]?.name ?? '');
  return (
    <div className="bo-settings-stack">
      <Section title="Platform logo" help="Shown in the top bar of every page. A transparent PNG or SVG works best.">
        <div className="bo-settings-fields">
          <DropZone acceptedFileTypes={['image/*']} onSelect={pick(setLogo)}
            onDrop={async e => { const f = e.items.find(i => i.kind === 'file'); if (f && f.kind === 'file') setLogo(f.name); }} />
          {logo && <p className="bo-note" role="status">Selected: {logo}</p>}
        </div>
      </Section>
      <Section title="Homepage banner" help="The image behind the homepage's welcome message. At least 1440 × 480 pixels.">
        <div className="bo-settings-fields">
          <DropZone acceptedFileTypes={['image/*']} onSelect={pick(setHeader)}
            onDrop={async e => { const f = e.items.find(i => i.kind === 'file'); if (f && f.kind === 'file') setHeader(f.name); }} />
          {header && <p className="bo-note" role="status">Selected: {header}</p>}
        </div>
      </Section>
      <Section title="Colours" help="Buttons, links and highlights across the platform follow these colours.">
        <div className="bo-settings-fields">
          <ColorField label="Main colour" defaultValue="#0B5563" />
          <ColorField label="Secondary colour" defaultValue="#1B7D6E" />
        </div>
      </Section>
    </div>
  );
}

function Registration() {
  const {touch, ...save} = useSave();
  return (
    <div className="bo-settings-stack">
      <Section title="Sign-up" help="What residents see and are asked when they create an account.">
        <div className="bo-settings-fields">
          <TextArea label="Sign-up help text" defaultValue="Create an account to take part in Larkvale's projects." onChange={touch} />
          <Switch defaultSelected onChange={touch} description="Residents confirm their email address with a six-digit code.">Confirm email address</Switch>
          <Switch onChange={touch} description="Ask for first and last name when a resident signs up.">Ask for a full name</Switch>
        </div>
        <SaveRow label="Sign-up" {...save} />
      </Section>
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
    </Page>
  );
}

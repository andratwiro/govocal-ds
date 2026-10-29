import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {Building2, CalendarDays, Folder, Menu, Paperclip, Settings, Sparkles, Tag} from 'lucide-react';
import {
  GroupedTab,
  GroupedTabList,
  GroupedTabPanel,
  GroupedTabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TabSection
} from '../Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  parameters: {layout: 'padded'},
  args: {onSelectionChange: fn()},
  tags: ['autodocs', 'not-in-figma']
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/* ── Invented data: the Audience page, the report list, the Projects list, a page's languages, the Settings dialog ── */

const panel = (text: string) => <p style={{margin: 0, font: 'var(--gv-type-ui)', color: 'var(--gv-text-secondary)'}}>{text}</p>;

const underline = (
  <Tabs defaultSelectedKey="participants">
    <TabList aria-label="Audience">
      <Tab id="participants">Participants</Tab>
      <Tab id="demographics">Demographics</Tab>
      <Tab id="traffic">Traffic</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="participants">{panel('Everyone who has taken part in this project.')}</TabPanel>
      <TabPanel id="demographics">{panel('Age, gender and where participants live.')}</TabPanel>
      <TabPanel id="traffic">{panel('Where visitors come from and what they use.')}</TabPanel>
    </TabPanels>
  </Tabs>
);

const withCount = (
  <Tabs defaultSelectedKey="all">
    <TabList aria-label="Reports">
      <Tab id="yours" count={11}>Your reports</Tab>
      <Tab id="all" count={18}>All reports</Tab>
      <Tab id="progress" count={10}>Progress reports</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="yours">{panel('The 11 reports you made.')}</TabPanel>
      <TabPanel id="all">{panel('Every report your team has built with the report builder.')}</TabPanel>
      <TabPanel id="progress">{panel('Reports that follow a project phase by phase.')}</TabPanel>
    </TabPanels>
  </Tabs>
);

const withIcons = (
  <Tabs defaultSelectedKey="projects">
    <TabList aria-label="Project views">
      <Tab id="projects"><Building2 aria-hidden size={16} strokeWidth={1.75} />Projects</Tab>
      <Tab id="folders"><Folder aria-hidden size={16} strokeWidth={1.75} />Folders</Tab>
      <Tab id="calendar"><CalendarDays aria-hidden size={16} strokeWidth={1.75} />Calendar</Tab>
      <Tab id="arrange"><Menu aria-hidden size={16} strokeWidth={1.75} />Arrange projects</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="projects">{panel('Every project on the platform.')}</TabPanel>
      <TabPanel id="folders">{panel('Projects grouped in folders.')}</TabPanel>
      <TabPanel id="calendar">{panel('Phases by date.')}</TabPanel>
      <TabPanel id="arrange">{panel('The order residents see on the home page.')}</TabPanel>
    </TabPanels>
  </Tabs>
);

const withStatusDots = (
  <Tabs defaultSelectedKey="es">
    <TabList aria-label="Language of the text">
      <Tab id="en" status="success">EN</Tab>
      <Tab id="es" status="danger">ES-ES</Tab>
      <Tab id="nl" status="danger">NL-BE</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="en">{panel('Add a short introduction here: tell residents what this project is about.')}</TabPanel>
      <TabPanel id="es">{panel('No Spanish text yet.')}</TabPanel>
      <TabPanel id="nl">{panel('No Dutch text yet.')}</TabPanel>
    </TabPanels>
  </Tabs>
);

const settingsPanel = (title: string, text: string) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
    <p style={{margin: 0, font: 'var(--gv-type-body-strong)', color: 'var(--gv-text-primary)'}}>{title}</p>
    {panel(text)}
  </div>
);

const vertical = (
  <Tabs orientation="vertical" defaultSelectedKey="general">
    <TabList aria-label="Settings" style={{flex: '0 0 200px'}}>
      <Tab id="general"><Settings aria-hidden size={16} strokeWidth={1.75} />General information</Tab>
      <Tab id="resources"><Paperclip aria-hidden size={16} strokeWidth={1.75} />Resources</Tab>
      <Tab id="tags"><Tag aria-hidden size={16} strokeWidth={1.75} />Tags</Tab>
      <Tab id="perspectives"><Sparkles aria-hidden size={16} strokeWidth={1.75} />Perspectives</Tab>
    </TabList>
    <TabPanels>
      <TabPanel id="general">{settingsPanel('General information', 'The project name, its address and its space.')}</TabPanel>
      <TabPanel id="resources">{settingsPanel('Resources', 'Files residents can download from the project page.')}</TabPanel>
      <TabPanel id="tags">{settingsPanel('Tags', 'The tags managers give inputs.')}</TabPanel>
      <TabPanel id="perspectives">{settingsPanel('Perspectives', 'The angles the AI summary reads inputs from.')}</TabPanel>
    </TabPanels>
  </Tabs>
);

function GroupedExample() {
  return (
    <GroupedTabs defaultSelectedKey="general">
      <GroupedTabList aria-label="Settings" style={{flex: '0 0 200px'}}>
        <TabSection title="Project">
          <GroupedTab id="general" textValue="General information"><Settings aria-hidden size={16} strokeWidth={1.75} />General information</GroupedTab>
          <GroupedTab id="resources" textValue="Resources"><Paperclip aria-hidden size={16} strokeWidth={1.75} />Resources</GroupedTab>
        </TabSection>
        <TabSection title="Inputs">
          <GroupedTab id="tags" textValue="Tags"><Tag aria-hidden size={16} strokeWidth={1.75} />Tags</GroupedTab>
          <GroupedTab id="perspectives" textValue="Perspectives"><Sparkles aria-hidden size={16} strokeWidth={1.75} />Perspectives</GroupedTab>
        </TabSection>
      </GroupedTabList>
      <GroupedTabPanel id="general">{settingsPanel('General information', 'The project name, its address and its space.')}</GroupedTabPanel>
      <GroupedTabPanel id="resources">{settingsPanel('Resources', 'Files residents can download from the project page.')}</GroupedTabPanel>
      <GroupedTabPanel id="tags">{settingsPanel('Tags', 'The tags managers give inputs.')}</GroupedTabPanel>
      <GroupedTabPanel id="perspectives">{settingsPanel('Perspectives', 'The angles the AI summary reads inputs from.')}</GroupedTabPanel>
    </GroupedTabs>
  );
}

const label = (text: string) => (
  <p style={{margin: '0 0 8px', font: 'var(--gv-type-small-strong)', color: 'var(--gv-text-tertiary)'}}>{text}</p>
);

/** Every look, top to bottom: underline, with counts, with icons, with status dots, then the side tabs, flat and grouped. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 32, width: 640}}>
      <div>{label('Underline')}{underline}</div>
      <div>{label('With count')}{withCount}</div>
      <div>{label('With icons')}{withIcons}</div>
      <div>{label('With status dots')}{withStatusDots}</div>
      <div>{label('Vertical')}{vertical}</div>
      <div>{label('Vertical with group headings')}<GroupedExample /></div>
    </div>
  )
};

/** The default look: UI type, the chosen tab strong on a 2px line (Audience: Participants / Demographics / Traffic). */
export const Underline: Story = {render: () => <div style={{width: 640}}>{underline}</div>};

/** `count` puts the prototype's "(18)" after the label (the report list). */
export const WithCount: Story = {name: 'With count', render: () => <div style={{width: 640}}>{withCount}</div>};

/** A 16 icon before each label (the Projects list). */
export const WithIcons: Story = {name: 'With icons', render: () => <div style={{width: 640}}>{withIcons}</div>};

/**
 * A multilingual field's languages (the content builder): `status` draws a dot, green complete, red missing. The dot
 * is colour only, so each tab also says it in words to screen readers ("ES-ES, missing").
 */
export const WithStatusDots: Story = {name: 'With status dots', render: () => <div style={{width: 640}}>{withStatusDots}</div>};

/** `orientation="vertical"`: a side list beside the panel, the chosen tab on the light grey. Arrow up and down move. */
export const Vertical: Story = {render: () => <div style={{width: 640}}>{vertical}</div>};

/**
 * The Settings dialog's side list, grouped under "Project" and "Inputs" (`GroupedTabs`). The headings never take focus:
 * arrows walk the tabs across groups, Home and End jump to the ends, Tab moves on to the panel. A screen reader hears
 * each tab with its group's name.
 */
export const VerticalWithGroupHeadings: Story = {
  name: 'Vertical with group headings',
  render: () => (
    <div style={{width: 640}}>
      <GroupedExample />
    </div>
  )
};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab reaches the chosen tab; → and ←
 * choose the next or previous tab and show its panel; End and Home jump to the last and first; Tab moves on into the
 * panel. */
export const Keyboard: Story = {
  render: () => <div style={{width: 640}}>{underline}</div>,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const participants = canvas.getByRole('tab', {name: 'Participants'});
    await userEvent.tab();
    await expect(participants).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const demographics = canvas.getByRole('tab', {name: 'Demographics'});
    await expect(demographics).toHaveFocus();
    await expect(demographics).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Age, gender and where participants live.');
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('tab', {name: 'Traffic'})).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Home}');
    await expect(participants).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('tab', {name: 'Traffic'})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  }
};

/**
 * Long translated words in a German interface (the Locale set to German, so the counts read "1.284"), in a 400
 * column: the tab row scrolls sideways once it outgrows the column (a tab never wraps or truncates), and a side list
 * grows to its longest tab. The page passes the words, the status words too (`labels`).
 */
export const LongGermanLabels: Story = {
  name: 'Long German labels',
  globals: {locale: 'de-DE'},
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 32, width: 400}}>
      <Tabs defaultSelectedKey="all">
        <TabList aria-label="Berichte">
          <Tab id="yours" count={11}>Ihre Berichte</Tab>
          <Tab id="all" count={1284}>Alle Beteiligungsberichte</Tab>
          <Tab id="progress" count={10}>Fortschrittsberichte</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="yours">{panel('Die 11 Berichte, die Sie erstellt haben.')}</TabPanel>
          <TabPanel id="all">{panel('Jeder Bericht, den Ihr Team mit dem Berichtsgenerator erstellt hat.')}</TabPanel>
          <TabPanel id="progress">{panel('Berichte, die einem Projekt Phase für Phase folgen.')}</TabPanel>
        </TabPanels>
      </Tabs>
      <Tabs orientation="vertical" defaultSelectedKey="general">
        <TabList aria-label="Einstellungen">
          <Tab id="general">Allgemein</Tab>
          <Tab id="access" status="danger" labels={{missing: 'fehlt'}}>Zugriffsberechtigungen und Sichtbarkeit</Tab>
          <Tab id="notifications">Benachrichtigungseinstellungen</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="general">{panel('Name, Beschreibung und Titelbild des Projekts.')}</TabPanel>
          <TabPanel id="access">{panel('Wer das Projekt sehen und daran teilnehmen kann.')}</TabPanel>
          <TabPanel id="notifications">{panel('Wann Teilnehmende eine E-Mail erhalten.')}</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
};

/** An Arabic interface: the first tab on the right, ← and → swap, the counts in brackets mirror. */
export const Arabic: Story = {
  globals: {locale: 'ar-SA'},
  render: () => (
    <div style={{width: 480}}>
      <Tabs defaultSelectedKey="all">
        <TabList aria-label="التقارير">
          <Tab id="yours" count={11}>تقاريرك</Tab>
          <Tab id="all" count={18}>كل التقارير</Tab>
          <Tab id="progress" count={10}>تقارير التقدم</Tab>
        </TabList>
        <TabPanels>
          <TabPanel id="yours">{panel('التقارير الأحد عشر التي أنشأتها.')}</TabPanel>
          <TabPanel id="all">{panel('كل تقرير أنشأه فريقك.')}</TabPanel>
          <TabPanel id="progress">{panel('تقارير تتابع المشروع مرحلة بمرحلة.')}</TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
};

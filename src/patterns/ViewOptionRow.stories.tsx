import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {Map as MapIcon} from 'lucide-react';
import {Button} from '../components/Button';
import {Link} from '../components/Link';
import {Card} from '../components/gv/Card';
import {ViewOptionList, ViewOptionRow} from './ViewOptionRow';

const meta: Meta<typeof ViewOptionRow> = {
  title: 'Patterns/Build tab/View option row',
  component: ViewOptionRow,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [
    Story => (
      <div style={{width: 412}}>
        <Story />
      </div>
    )
  ],
  args: {
    children: 'Map view',
    description:
      'Displays inputs as pins on a map. Best for: location-based consultations, urban planning, infrastructure feedback.',
    onMakeDefault: () => {}
  }
};
export default meta;
type Story = StoryObj<typeof ViewOptionRow>;

/* The three views, as the product words them; the links go to the phase's other cards. */
const VIEWS = [
  {
    key: 'list',
    label: 'List view',
    description:
      'Inputs are displayed as a scrollable feed, sorted by trending, reactions, comments, date, or activity. Best for: smaller consultations.'
  },
  {
    key: 'map',
    label: 'Map view',
    description: (
      <>
        Displays inputs as pins on a map. Best for: location-based consultations, urban planning, infrastructure
        feedback. Make sure you add a location field to the <Link onPress={() => {}}>Idea form</Link>.
      </>
    )
  },
  {
    key: 'perspectives',
    label: 'Perspectives view',
    description: (
      <>
        Participants explore the discussion via emerging topics. AI surfaces representative voices and bridges between
        perspectives if you enable the Perspectives toggle in the <Link onPress={() => {}}>Idea tags</Link>. Best for:
        large-scale consultations, finding common ground, avoiding echo chambers.
      </>
    )
  }
];

const configureMap = (
  <Button variant="secondary" size={36}>
    <MapIcon aria-hidden size={16} />
    Configure map
  </Button>
);

/** The view that is always on and the default, one off, one on with what it needs, and one on and the default. */
export const AllVariants: Story = {
  render: () => (
    <ViewOptionList>
      <ViewOptionRow isAlwaysOn isDefault description={VIEWS[0].description}>
        List view
      </ViewOptionRow>
      <ViewOptionRow description={VIEWS[2].description}>Perspectives view</ViewOptionRow>
      <ViewOptionRow defaultSelected description={VIEWS[1].description} options={configureMap}>
        Map view
      </ViewOptionRow>
      <ViewOptionRow defaultSelected isDefault description={VIEWS[1].description} options={configureMap}>
        Map view
      </ViewOptionRow>
    </ViewOptionList>
  )
};

/** List view: a check where the switch would be ("Always enabled"), and the default to begin with. */
export const Default: Story = {
  args: {children: 'List view', description: VIEWS[0].description, isAlwaysOn: true, isDefault: true}
};

/** Off: the switch off; Make default still turns it on. */
export const Off: Story = {};

/** Map view on: Configure map under its words, the full width. */
export const WithOptions: Story = {name: 'With options', args: {defaultSelected: true, options: configureMap}};

function InACardRender() {
  const [on, setOn] = useState<Record<string, boolean>>({list: true, map: false, perspectives: false});
  const [def, setDef] = useState('list');
  const others = VIEWS.filter(v => v.key !== 'list' && on[v.key]);
  return (
    <Card
      title="Available views"
      control="expand"
      defaultExpanded
      pills={
        others.length ? [{label: others[0].label + (others.length > 1 ? ` +${others.length - 1}` : '')}] : undefined
      }>
      <ViewOptionList>
        {VIEWS.map(v => (
          <ViewOptionRow
            key={v.key}
            description={v.description}
            isAlwaysOn={v.key === 'list'}
            isSelected={on[v.key]}
            onChange={next => {
              setOn(s => ({...s, [v.key]: next}));
              if (!next && def === v.key) setDef('list');
            }}
            isDefault={def === v.key}
            onMakeDefault={() => setDef(v.key)}
            options={v.key === 'map' ? configureMap : undefined}>
            {v.label}
          </ViewOptionRow>
        ))}
      </ViewOptionList>
    </Card>
  );
}

/**
 * An ideation phase's Available views card: one view is the default (List to begin with); making a view that is off
 * the default turns it on, and turning the default off hands it back to List. Closed, its pill names the first other
 * view on ("Map view +1").
 */
export const InACard: Story = {name: 'In a card', render: () => <InACardRender />};

/**
 * The keys a row takes: Tab reaches its switch and Space turns the view on and off; Tab goes on to Make default, and
 * Enter makes the view the default (its button turns to a pressed "Default"). Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: function Render(args) {
    const [isDefault, setDefault] = useState(false);
    return <ViewOptionRow {...args} description={undefined} isDefault={isDefault} onMakeDefault={() => setDefault(true)} />;
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const toggle = canvas.getByRole('switch', {name: 'Map view'});
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Make default Map view'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const isDefault = canvas.getByRole('button', {name: 'Default Map view'});
    await expect(isDefault).toHaveFocus();
    await expect(isDefault).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toBeChecked();
  }
};

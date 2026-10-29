import type {Meta, StoryObj} from '@storybook/react-vite';
import {TileGrid} from './TileGrid';
import {StatTile} from './StatTile';
import {Card} from './Card';
import {Panel} from './Panel';
import {PICTURES} from './story-images';

const meta: Meta<typeof TileGrid> = {
  title: 'Components/Layout & containers/Tile grid',
  component: TileGrid,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof TileGrid>;

const STATS = [
  {id: 'participants', label: 'Participants', value: '1,248'},
  {id: 'inputs', label: 'Inputs', value: '312'},
  {id: 'comments', label: 'Comments', value: '864'},
  {id: 'votes', label: 'Votes', value: '2,031'}
];

/** A row of Stat tiles: 160 at the least, 12 apart, stretching across the row. Narrow the window: they wrap. */
export const StatTiles: Story = {
  name: 'Stat tiles',
  args: {minTileWidth: 160, density: 'compact'},
  render: args => (
    <TileGrid {...args}>{STATS.map(s => <StatTile key={s.id} label={s.label} value={s.value} />)}</TileGrid>
  )
};

const PROJECTS = [
  {id: 'park', title: 'Green corridors for the riverside', picture: PICTURES.park},
  {id: 'trees', title: 'Street trees for Northgate', picture: PICTURES.streetTrees},
  {id: 'bikes', title: 'A safer bike lane to school', picture: PICTURES.bikeLane}
];

/** A gallery of cards in a list: 280 at the least; the columns keep their width, so three cards leave room. */
export const Gallery: Story = {
  args: {minTileWidth: 280, layout: 'gallery', elementType: 'ul', 'aria-label': 'Projects'},
  render: args => (
    <TileGrid {...args}>
      {PROJECTS.map(p => (
        <li key={p.id}><Card layout="stacked" title={p.title} media={<img src={p.picture} alt="" />} /></li>
      ))}
    </TileGrid>
  )
};

/** Panels side by side: 360 at the least, one column on a narrow screen. */
export const Panels: Story = {
  args: {minTileWidth: 360},
  render: args => (
    <TileGrid {...args}>
      <Panel title="Participation">Who took part, by week.</Panel>
      <Panel title="Demographics">Age and gender of the participants who said.</Panel>
    </TileGrid>
  )
};

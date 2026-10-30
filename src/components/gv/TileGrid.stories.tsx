import type {Meta, StoryObj} from '@storybook/react-vite';
import {TileGrid} from './TileGrid';
import {StatTile} from './StatTile';
import {Card} from './Card';
import {Panel} from './Panel';
import {PICTURES} from '../../stories/images';

const meta: Meta<typeof TileGrid> = {
  title: 'Components/Layout & containers/Tile grid',
  component: TileGrid,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
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

/** A row of Stat tiles: each at least 160px wide, 12px apart, stretching across the row. Narrow the window: they wrap. */
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

/**
 * A gallery of cards to pick from, marked as a list: each at least 280px wide. The columns keep their width, so when
 * there are fewer cards than columns the row isn't filled ("Row or gallery" shows the difference).
 */
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

/** Panels side by side: each at least 360px wide; when the grid is narrower than two (720px and the gap), they stack. */
export const Panels: Story = {
  args: {minTileWidth: 360},
  render: args => (
    <TileGrid {...args}>
      <Panel title="Participation">Who took part, by week.</Panel>
      <Panel title="Demographics">Age and gender of the participants who said.</Panel>
    </TileGrid>
  )
};

/**
 * The same two cards both ways. Row (the default): the cards share the row and stretch across it. Gallery: the
 * columns keep their width, so the room for a third card stays empty.
 */
export const RowOrGallery: Story = {
  name: 'Row or gallery',
  render: () => (
    <div style={{display: 'grid', gap: 24}}>
      {(['row', 'gallery'] as const).map(layout => (
        <TileGrid key={layout} minTileWidth={280} layout={layout} elementType="ul" aria-label={`Projects, ${layout}`}>
          {PROJECTS.slice(0, 2).map(p => (
            <li key={p.id}><Card layout="stacked" title={`${p.title} (${layout})`} media={<img src={p.picture} alt="" />} /></li>
          ))}
        </TileGrid>
      ))}
    </div>
  )
};

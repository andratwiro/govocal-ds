import {GridList, GridListItem} from './GridList';
import {Text} from 'react-aria-components/Text';
import {GridListSection, GridListHeader} from 'react-aria-components/GridList';
import {PICTURES} from '../stories/images';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof GridList> = {
  component: GridList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof GridList>;

// The story pictures (src/stories/images): invented flat illustrations, bundled, so no story loads from the web.
type Photo = {name: string; src: string; detail: string};
const PHOTOS: Photo[] = [
  {name: 'Riverside park', src: PICTURES.park, detail: 'SVG • 2/3/2024'},
  {name: 'Street trees', src: PICTURES.streetTrees, detail: 'SVG • 1/10/2022'},
  {name: 'Bike lane', src: PICTURES.bikeLane, detail: 'SVG • 8/28/2021'},
  {name: 'Mural', src: PICTURES.mural, detail: 'SVG • 3/15/2025'},
  {name: 'Library', src: PICTURES.library, detail: 'SVG • 5/30/2023'},
  {name: 'Street lights', src: PICTURES.lights, detail: 'SVG • 7/3/2021'}
];

const Item = ({photo}: {photo: Photo}) => (
  <GridListItem textValue={photo.name}>
    <img src={photo.src} alt="" width={600} height={400} />
    <Text className="react-aria-Text gv-base-text">{photo.name}</Text>
    <Text className="react-aria-Text gv-base-text" slot="description">{photo.detail}</Text>
  </GridListItem>
);

export const Example: Story = args => (
  <GridList {...args} style={{width: 800, maxWidth: 'calc(100vw - 80px)'}} aria-label="Photos">
    {PHOTOS.map(p => <Item key={p.name} photo={p} />)}
  </GridList>
);

Example.args = {
  onAction: undefined,
  selectionMode: 'multiple',
  layout: 'grid'
};

export const Sections: Story = args => (
  <GridList {...args} style={{width: 800, maxWidth: 'calc(100vw - 80px)'}} aria-label="Photos">
    <GridListSection className="react-aria-GridListSection gv-base-grid-list-section">
      <GridListHeader className="react-aria-GridListHeader gv-base-grid-list-header">Green spaces</GridListHeader>
      {PHOTOS.slice(0, 3).map(p => <Item key={p.name} photo={p} />)}
    </GridListSection>
    <GridListSection className="react-aria-GridListSection gv-base-grid-list-section">
      <GridListHeader className="react-aria-GridListHeader gv-base-grid-list-header">Public buildings and streets</GridListHeader>
      {PHOTOS.slice(3).map(p => <Item key={p.name} photo={p} />)}
    </GridListSection>
  </GridList>
);

Sections.args = {
  onAction: undefined,
  selectionMode: 'multiple',
  layout: 'grid'
};

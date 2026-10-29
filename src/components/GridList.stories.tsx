import {GridList, GridListItem} from './GridList';
import {Text} from 'react-aria-components/Text';
import {GridListSection, GridListHeader} from 'react-aria-components/GridList';
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

export const Example: Story = args => (
  <GridList {...args} style={{width: 800, maxWidth: 'calc(100vw - 80px)'}} aria-label="Photos">
    <GridListItem textValue="Desert Sunset">
      <img
        src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={400}
      />
      <Text className="react-aria-Text gv-base-text">Desert Sunset</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">PNG • 2/3/2024</Text>
    </GridListItem>
    <GridListItem textValue="Hiking Trail">
      <img
        src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={900}
      />
      <Text className="react-aria-Text gv-base-text">Hiking Trail</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 1/10/2022</Text>
    </GridListItem>
    <GridListItem textValue="Lion">
      <img
        src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={899}
      />
      <Text className="react-aria-Text gv-base-text">Lion</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 8/28/2021</Text>
    </GridListItem>
    <GridListItem textValue="Mountain Sunrise">
      <img
        src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={900}
      />
      <Text className="react-aria-Text gv-base-text">Mountain Sunrise</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">PNG • 3/15/2015</Text>
    </GridListItem>
    <GridListItem textValue="Giraffe tongue">
      <img
        src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={900}
      />
      <Text className="react-aria-Text gv-base-text">Giraffe tongue</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">PNG • 11/27/2019</Text>
    </GridListItem>
    <GridListItem textValue="Golden Hour">
      <img
        src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={402}
      />
      <Text className="react-aria-Text gv-base-text">Golden Hour</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">WEBP • 7/24/2024</Text>
    </GridListItem>
    <GridListItem textValue="Architecture">
      <img
        src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D"
        width={600}
        height={900}
      />
      <Text className="react-aria-Text gv-base-text">Architecture</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">PNG • 12/24/2016</Text>
    </GridListItem>
    <GridListItem textValue="Peeking leopard">
      <img
        src="https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={400}
      />
      <Text className="react-aria-Text gv-base-text">Peeking leopard</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 3/2/2016</Text>
    </GridListItem>
    <GridListItem textValue="Roofs">
      <img
        src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D"
        width={600}
        height={900}
      />
      <Text className="react-aria-Text gv-base-text">Roofs</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 4/24/2025</Text>
    </GridListItem>
    <GridListItem textValue="Half Dome Deer">
      <img
        src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={600}
        height={990}
      />
      <Text className="react-aria-Text gv-base-text">Half Dome Deer</Text>
      <Text className="react-aria-Text gv-base-text" slot="description">DNG • 8/28/2018</Text>
    </GridListItem>
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
      <GridListHeader className="react-aria-GridListHeader gv-base-grid-list-header">Fruit</GridListHeader>
      <GridListItem textValue="Apple">
        <img
          src="https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={400}
        />
        <Text className="react-aria-Text gv-base-text">Apple</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">PNG • 9/2/2021</Text>
      </GridListItem>
      <GridListItem textValue="Peach">
        <img
          src="https://images.unsplash.com/photo-1642372849486-f88b963cb734?q=80&w=2858&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={900}
        />
        <Text className="react-aria-Text gv-base-text">Peach</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 1/16/2022</Text>
      </GridListItem>
      <GridListItem textValue="Blueberry">
        <img
          src="https://images.unsplash.com/photo-1606757389667-45c2024f9fa4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={900}
        />
        <Text className="react-aria-Text gv-base-text">Blueberry</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">JPEG • 11/30/2020</Text>
      </GridListItem>
    </GridListSection>
    <GridListSection className="react-aria-GridListSection gv-base-grid-list-section">
      <GridListHeader className="react-aria-GridListHeader gv-base-grid-list-header">Vegetables</GridListHeader>
      <GridListItem textValue="Broccoli">
        <img
          src="https://images.unsplash.com/photo-1685504445355-0e7bdf90d415?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={900}
        />
        <Text className="react-aria-Text gv-base-text">Broccoli</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">PNG • 5/30/2023</Text>
      </GridListItem>
      <GridListItem textValue="Brussels Sprouts">
        <img
          src="https://images.unsplash.com/photo-1685504507286-dc290728c01a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={900}
        />
        <Text className="react-aria-Text gv-base-text">Brussels Sprouts</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">PNG • 7/3/2021</Text>
      </GridListItem>
      <GridListItem textValue="Peas">
        <img
          src="https://images.unsplash.com/photo-1587411768345-867e228218c8?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          width={600}
          height={900}
        />
        <Text className="react-aria-Text gv-base-text">Peas</Text>
        <Text className="react-aria-Text gv-base-text" slot="description">PNG • 4/20/2020</Text>
      </GridListItem>
    </GridListSection>
  </GridList>
);

Sections.args = {
  onAction: undefined,
  selectionMode: 'multiple',
  layout: 'grid'
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {Grid, GridItem} from './Grid';
import {Panel} from './Panel';
import {TextField} from '../TextField';

const meta: Meta<typeof Grid> = {
  title: 'Components/Layout & containers/Grid',
  component: Grid,
  subcomponents: {GridItem},
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'},
  argTypes: {
    gap: {control: 'select', options: ['0', '8', '12', '16', '24', '32']}
  }
};
export default meta;
type Story = StoryObj<typeof Grid>;

/** A list beside its detail: named areas, the detail a fixed 360 and the list the rest, 16 apart. */
export const ListAndDetail: Story = {
  name: 'List and detail',
  args: {columns: 'minmax(0, 1fr) 360px', areas: ['head head', 'list detail'], gap: '16'},
  render: args => (
    <Grid {...args}>
      <GridItem area="head"><Panel title="Inputs">312 inputs in this phase.</Panel></GridItem>
      <GridItem area="list"><Panel title="All inputs">The list of inputs.</Panel></GridItem>
      <GridItem area="detail" elementType="aside" aria-label="Selected input">
        <Panel title="Bike lane on Main Street">The input that is open.</Panel>
      </GridItem>
    </Grid>
  )
};

/** A form in two equal columns; a field that needs the room spans both (`columnSpan="all"`). */
export const TwoColumnForm: Story = {
  name: 'Two-column form',
  args: {columns: 2, columnGap: '24', rowGap: '16', elementType: 'form', 'aria-label': 'Project details'},
  render: args => (
    <Grid {...args}>
      <TextField label="First name" />
      <TextField label="Last name" />
      <GridItem columnSpan="all"><TextField label="Email" type="email" /></GridItem>
    </Grid>
  )
};

/** Spans on a count of columns: a wide panel over two of three, a narrow one beside it, a full row under them. */
export const Spans: Story = {
  args: {columns: 3, gap: '16'},
  render: args => (
    <Grid {...args}>
      <GridItem columnSpan={2}><Panel title="Participation">Who took part, by week.</Panel></GridItem>
      <Panel title="Totals">1,248 participants.</Panel>
      <GridItem columnSpan="all"><Panel title="Demographics">Age and gender of the participants who said.</Panel></GridItem>
    </Grid>
  )
};

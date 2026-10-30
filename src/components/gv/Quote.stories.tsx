import type {Meta, StoryObj} from '@storybook/react-vite';
import {Quote} from './Quote';
import {Avatar} from './Avatar';
import {Grid} from './Grid';

const meta: Meta<typeof Quote> = {
  title: 'Components/Data display/Quote',
  component: Quote,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'},
  args: {
    tag: 'Heat and shade',
    words: 'From June there is no shade at all between the tram and my door. Two trees on Elm Street would change my summer.',
    author: 'Resident A',
    meta: 'North Quarter · 31 reactions · Translated from German',
    avatar: <Avatar initials="RA" size={28} />
  },
  decorators: [Story => <div style={{maxInlineSize: 280}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof Quote>;

/** A card: the tag, the words, then the person. */
export const Default: Story = {};

/** Plain: a rule at the start, for one quote in running text. */
export const Plain: Story = {args: {variant: 'plain'}};

/** Only the words and a name: no tag, no face, no meta. */
export const Minimal: Story = {args: {tag: undefined, avatar: undefined, meta: undefined}};

/** Three in a row: the people line up at the foot whatever the length of the words. */
export const InARow: Story = {
  name: 'In a row',
  decorators: [Story => <div style={{maxInlineSize: 720}}><Story /></div>],
  render: args => (
    <Grid columns={3} gap="10">
      <Quote {...args} />
      <Quote tag="Routes to school" words="Our children walk to school along Canal Road in full sun." author="Resident B"
        meta="Old Harbour · 24 reactions" avatar={<Avatar initials="RB" size={28} />} />
      <Quote tag="Parking and deliveries" words="Plant on the corners, not in the loading bay." author="Resident C"
        meta="Millbrook · 18 reactions" avatar={<Avatar initials="RC" size={28} />} />
    </Grid>
  )
};

/** In French: the page passes the language's own quotation marks through `labels`. */
export const Translated: Story = {
  args: {tag: 'Chaleur et ombre', words: 'Dès juin, il n’y a plus d’ombre entre le tram et ma porte.', author: 'Résidente A',
    meta: 'Quartier nord · 31 réactions', labels: {quoted: w => `« ${w} »`}}
};

/** Right to left: the rule and the face at the right. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: args => (
    <Grid gap="16">
      <Quote {...args} />
      <Quote {...args} variant="plain" />
    </Grid>
  )
};

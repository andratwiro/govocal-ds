import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {MethodCard, type MethodCardProps} from './MethodCard';
import {Illustration} from '../components/gv/Illustration';

const meta: Meta<typeof MethodCard> = {
  title: 'Patterns/Project page/Method card',
  component: MethodCard,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  decorators: [Story => <div style={{width: 324}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof MethodCard>;

/* The prototype's method picker ("New participation method", Gather input). */
const IDEATION: MethodCardProps = {
  title: 'Ideation and geo mapping',
  description: 'Invite participants to share input on any topic, discuss it in public and place it on a map.',
  media: <Illustration name="ideation-map" size={320} height={168} motion="hover" />,
  features: [{label: 'Map pins'}, {label: 'Reactions and comments'}, {label: 'Grouped into themes'}]
};

const SURVEY: MethodCardProps = {
  title: 'Survey',
  description: "Understand your users' needs and thinking via a wide range of private question types.",
  media: <Illustration name="survey-pages" size={320} height={168} motion="hover" />,
  features: [{label: 'Surveys can run in parallel with other methods', isHighlighted: true}, {label: 'Drop a pin'},
    {label: 'Rating and sentiment scales'}]
};

const PROPOSALS: MethodCardProps = {
  title: 'Proposals and petitions',
  description: 'Participants put forward proposals; each one needs enough votes before its deadline.',
  media: <Illustration name="proposal-threshold" size={320} height={168} motion="hover" />,
  features: [{label: 'Vote threshold'}, {label: 'Deadline'}]
};

const ANNOTATION: MethodCardProps = {
  title: 'Document annotation',
  description: 'Participants comment on a draft document, passage by passage.',
  media: <Illustration name="document-annotation" size={320} height={168} motion="hover" />,
  features: [{label: 'Inline comments'}]
};

/** The picker's grid: two cards a row, 16 apart. Each card is a button that creates the phase. */
export const AllVariants: Story = {
  decorators: [Story => <div style={{width: 664}}><Story /></div>],
  render: () => (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
      {[IDEATION, SURVEY, PROPOSALS, ANNOTATION].map(m => <MethodCard key={m.title} {...m} onPress={() => {}} />)}
    </div>
  )
};

export const Default: Story = {args: {...IDEATION, onPress: fn()}};

/** One feature that sets the method apart takes the teal chip (Badge `isSelected`). */
export const Highlighted: Story = {args: {...SURVEY, onPress: fn()}};

/** No picture yet: the name, the line and the chips. */
export const WithoutMedia: Story = {name: 'Without media', args: {...ANNOTATION, media: undefined, onPress: fn()}};

/** A method this platform's plan doesn't include: greyed and inert. */
export const Disabled: Story = {args: {...PROPOSALS, isDisabled: true}};

/** Right to left: the name, the line and the chips start at the right. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: {...IDEATION, onPress: fn()}};

/** The keyboard: Tab reaches the card, named by the method; Enter creates the phase. */
export const Keyboard: Story = {
  args: {...IDEATION, onPress: fn()},
  play: async ({args, canvasElement}) => {
    const card = within(canvasElement).getByRole('button', {name: 'Ideation and geo mapping'});
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  }
};

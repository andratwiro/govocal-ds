import {expect, userEvent, within} from 'storybook/test';
import {Lightbulb, Vote, MessageSquareText, Sparkles} from 'lucide-react';
import {RadioGroup} from '../RadioGroup';
import {CheckboxGroup} from '../CheckboxGroup';
import {NumberField} from '../NumberField';
import {ChoiceCard, ChoiceCardCheckbox, ChoiceCardGroupHeading} from './ChoiceCard';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof ChoiceCard> = {
  title: 'Components/Forms/Choice card',
  component: ChoiceCard,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'padded'}
};

export default meta;
type Story = StoryObj<typeof ChoiceCard>;

/** Default, hovered (point at the second tile), selected, disabled. */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 360}}>
      <RadioGroup aria-label="Report type" defaultValue="participation">
        <ChoiceCard value="participation" description="A snapshot of who took part and how.">
          Participation report
        </ChoiceCard>
        <ChoiceCard value="hovered" description="Point at this tile.">
          Hovered (default look until you point at it)
        </ChoiceCard>
        <ChoiceCard value="disabled" isDisabled description="Needs at least one phase to compare.">
          Comparison report
        </ChoiceCard>
      </RadioGroup>
    </div>
  )
};

export const WithIcon: Story = {
  name: 'With icon',
  render: () => (
    <div style={{width: 360}}>
      <RadioGroup aria-label="Participation method" defaultValue="ideation">
        <ChoiceCard value="ideation" media={<Lightbulb aria-hidden />} description="Collect and discuss ideas.">
          Ideation
        </ChoiceCard>
        <ChoiceCard value="voting" media={<Vote aria-hidden />} description="Let people choose between options.">
          Voting
        </ChoiceCard>
      </RadioGroup>
    </div>
  )
};

/** The method's revealed content shows only while its tile is chosen (Budget allocation → Min / Max). */
export const WithRevealedContent: Story = {
  name: 'With revealed content',
  render: () => (
    <div style={{width: 360}}>
      <RadioGroup aria-label="Voting method" defaultValue="budget">
        <ChoiceCard
          value="budget"
          media={<Sparkles aria-hidden />}
          description="Participants spend a budget across options."
          revealed={
            <>
              <NumberField label="Minimum" prefix="€" defaultValue={0} />
              <NumberField label="Maximum" prefix="€" defaultValue={1000} />
            </>
          }>
          Budget allocation
        </ChoiceCard>
        <ChoiceCard value="multiple" media={<MessageSquareText aria-hidden />} description="Pick a fixed number of options.">
          Multiple votes
        </ChoiceCard>
      </RadioGroup>
    </div>
  )
};

/** The Create report checklist: checkbox tiles grouped under Section labels ("Project context", "Phases"). */
export const CheckboxGroupWithGroupHeadings: Story = {
  name: 'Checkbox group with group headings',
  render: () => (
    <div style={{width: 360, display: 'flex', flexDirection: 'column', gap: 4}}>
      <CheckboxGroup aria-label="Report contents" defaultValue={['overview', 'build']}>
        <ChoiceCardGroupHeading>Project context</ChoiceCardGroupHeading>
        <ChoiceCardCheckbox value="overview" description="Title, description and cover image.">
          Project overview
        </ChoiceCardCheckbox>
        <ChoiceCardGroupHeading>Phases</ChoiceCardGroupHeading>
        <ChoiceCardCheckbox value="build" description="Dates, participant counts and attachments.">
          Build phase
        </ChoiceCardCheckbox>
        <ChoiceCardCheckbox value="manage" description="Ideas received, reviewed and implemented.">
          Manage phase
        </ChoiceCardCheckbox>
      </CheckboxGroup>
    </div>
  )
};

/** A long list keeps scrolling while its footer (e.g. "Create report") stays in place. */
export const LongList: Story = {
  name: 'Long list',
  render: () => (
    <div
      style={{
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--gv-border-control)',
        borderRadius: 'var(--gv-radius-12)'
      }}>
      <div style={{padding: 16, maxHeight: 220, overflowY: 'auto'}}>
        <RadioGroup aria-label="Phase" defaultValue="phase-1">
          {Array.from({length: 8}, (_, i) => (
            <ChoiceCard key={i} value={`phase-${i + 1}`}>
              Phase {i + 1}
            </ChoiceCard>
          ))}
        </RadioGroup>
      </div>
      <div
        style={{
          padding: 12,
          borderTop: '1px solid var(--gv-border-control)',
          font: 'var(--gv-type-ui-strong)',
          color: 'var(--gv-text-primary)'
        }}>
        Create report
      </div>
    </div>
  )
};

/** The keyboard on checkbox tiles, proved by this story's play function: each tile is its own Tab stop and Space
 * ticks or unticks it. (Radio tiles are one stop with the arrow keys: `e2e/forms.spec.ts`.) */
export const Keyboard: Story = {
  render: () => (
    <div style={{width: 360}}>
      <CheckboxGroup aria-label="Report contents" defaultValue={['overview']}>
        <ChoiceCardCheckbox value="overview" description="Title, description and cover image.">Project overview</ChoiceCardCheckbox>
        <ChoiceCardCheckbox value="build" description="Dates, participant counts and attachments.">Build phase</ChoiceCardCheckbox>
      </CheckboxGroup>
    </div>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('checkbox', {name: /Project overview/});
    const build = canvas.getByRole('checkbox', {name: /Build phase/});
    await userEvent.tab();
    await expect(overview).toHaveFocus();
    await userEvent.tab();
    await expect(build).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(build).toBeChecked();
    await expect(overview).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(build).not.toBeChecked();
  }
};
/** A layout drawn in a thumbnail: one, two or three columns. */
const Columns = ({count}: {count: number}) => (
  <svg viewBox="0 0 64 40" aria-hidden>
    {Array.from({length: count}, (_, i) => {
      const w = (64 - 4 * (count + 1)) / count;
      return <rect key={i} x={4 + i * (w + 4)} y={4} width={w} height={32} rx={2} fill="currentColor" />;
    })}
  </svg>
);

/** `layout="thumbnail"`: the media alone fills the tile, for choices a picture says best (a block's layout). The title
 * stays each tile's name, read by screen readers but not shown; the play function checks it. */
export const Thumbnails: Story = {
  render: () => (
    <RadioGroup aria-label="Layout" defaultValue="one" orientation="horizontal">
      <ChoiceCard value="one" layout="thumbnail" media={<Columns count={1} />}>One column</ChoiceCard>
      <ChoiceCard value="two" layout="thumbnail" media={<Columns count={2} />}>Two columns</ChoiceCard>
      <ChoiceCard value="three" layout="thumbnail" media={<Columns count={3} />}>Three columns</ChoiceCard>
    </RadioGroup>
  ),
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const two = canvas.getByRole('radio', {name: 'Two columns'});
    await expect(canvas.getByText('Two columns').getBoundingClientRect().width).toBeLessThanOrEqual(1);
    await userEvent.click(two.closest('label') ?? two);
    await expect(two).toBeChecked();
  }
};

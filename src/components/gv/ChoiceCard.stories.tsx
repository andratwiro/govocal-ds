import {Lightbulb, Vote, MessageSquareText, Sparkles} from 'lucide-react';
import {RadioGroup} from '../RadioGroup';
import {CheckboxGroup} from '../CheckboxGroup';
import {NumberField} from '../NumberField';
import {ChoiceCard, ChoiceCardCheckbox, ChoiceCardGroupHeading} from './ChoiceCard';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof ChoiceCard> = {
  title: 'Components/Forms/Choice card',
  component: ChoiceCard,
  tags: ['autodocs', 'not-in-figma'],
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

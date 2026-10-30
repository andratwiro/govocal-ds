import type {Meta, StoryObj} from '@storybook/react-vite';
import {PhonePhaseCard} from './PhonePhaseCard';
import {PhoneCountdown, PhoneHeader, PhonePreview, PhoneStage} from './PhonePreview';
import {Skeleton} from '../components/gv/Skeleton';

const meta: Meta<typeof PhonePhaseCard> = {
  title: 'Patterns/Project page/Phone phase card',
  component: PhonePhaseCard,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  decorators: [Story => <div style={{width: 303, padding: 16, background: 'var(--gv-surface-app)'}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof PhonePhaseCard>;

export const Default: Story = {
  args: {number: 3, title: 'Shortlist proposals', dates: '28 Sep 2026 – 18 Oct 2026',
    children: 'Back the proposals you want the city to take forward.'}
};

/** No description yet: two skeleton lines hold its place, as the prototype's preview draws them. */
export const NoDescription: Story = {
  name: 'No description',
  args: {number: 3, title: 'Shortlist proposals', dates: '28 Sep 2026 – 18 Oct 2026',
    children: <><Skeleton /><Skeleton width="70%" /></>}
};

/** No number: a phase shown on its own (a project with one phase). */
export const WithoutNumber: Story = {name: 'Without number', args: {title: 'Community vote', dates: '19 Oct – 16 Nov 2026'}};

/** On the phone: first on the grey screen, the countdown pinned at the foot. */
export const InThePhone: Story = {
  name: 'In the phone',
  decorators: [Story => <div style={{width: 520, height: 760}}><Story /></div>],
  render: () => (
    <PhoneStage caption="What residents see while the phase is open">
      <PhonePreview aria-label="What residents see" header={<PhoneHeader />} surface="grey"
        footer={<PhoneCountdown cta="Add a proposal">2 weeks left</PhoneCountdown>}>
        <PhonePhaseCard number={3} title="Shortlist proposals" dates="28 Sep 2026 – 18 Oct 2026">
          <Skeleton /><Skeleton width="70%" />
        </PhonePhaseCard>
      </PhonePreview>
    </PhoneStage>
  )
};

/** Right to left: the number leads at the right. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: {...Default.args}};

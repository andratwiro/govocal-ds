import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {Card} from '../components/gv/Card';
import {ParticipantActionList, ParticipantActionRow, ParticipantLimit} from './ParticipantActionRow';

const meta: Meta<typeof ParticipantActionRow> = {
  title: 'Patterns/Build tab/Participant action row',
  component: ParticipantActionRow,
  tags: ['autodocs', 'not-in-figma'],
  decorators: [Story => <div style={{width: 412}}><Story /></div>],
  args: {children: 'Submitting inputs', value: 'Anyone can participate', onOpen: () => {}}
};
export default meta;
type Story = StoryObj<typeof ParticipantActionRow>;

/** On with the platform default, set for this phase, off, Reacting with its limit (Limited), Disliking, and a locked action. */
export const AllVariants: Story = {
  render: () => (
    <ParticipantActionList>
      <ParticipantActionRow value="Anyone can participate" onOpen={() => {}}>Submitting inputs</ParticipantActionRow>
      <ParticipantActionRow value="Admins & managers only" isDefault={false} onOpen={() => {}}>Commenting on inputs</ParticipantActionRow>
      <ParticipantActionRow
        value="Sign-in required"
        onOpen={() => {}}
        options={<ParticipantLimit defaultLimit="limited" />}>
        Reacting to inputs
      </ParticipantActionRow>
      <ParticipantActionRow defaultSelected={false}>Disliking</ParticipantActionRow>
      <ParticipantActionRow value="Sign-in required" defaultSelected={false} onOpen={() => {}}>Voting</ParticipantActionRow>
      <ParticipantActionRow value="Sign-in required" isLocked onOpen={() => {}}>Attending an event</ParticipantActionRow>
    </ParticipantActionList>
  )
};

/** On: who can take it, in grey while it is the platform's default; the row opens Access rights. Off: no value, no way in. */
export const On: Story = {
  render: args => (
    <ParticipantActionList>
      <ParticipantActionRow {...args} />
      <ParticipantActionRow {...args} defaultSelected={false}>Commenting on inputs</ParticipantActionRow>
    </ParticipantActionList>
  )
};

/** Set for this phase: the value turns dark ("Sign-in required" where the platform lets anyone). */
export const SignInRequired: Story = {name: 'Sign-in required', args: {value: 'Sign-in required', isDefault: false}};

/**
 * Reacting's settings hang under it while it is on, in the label column: reactions per participant; Limited reveals the
 * maximum. Disliking follows as a plain switch row, its switch in the switch column.
 */
export const Limited: Story = {
  args: {children: 'Reacting to inputs', value: 'Sign-in required', options: <ParticipantLimit defaultLimit="limited" />},
  render: args => (
    <ParticipantActionList>
      <ParticipantActionRow {...args} />
      <ParticipantActionRow defaultSelected={false}>Disliking</ParticipantActionRow>
    </ParticipantActionList>
  )
};

/** An action the phase can't turn off: a check where the switch would be; who can take it still opens. */
export const Locked: Story = {args: {children: 'Attending an event', value: 'Sign-in required', isLocked: true}};

function InACardRender() {
  const [on, setOn] = useState({submit: true, comment: true, react: true});
  const short = [on.submit && 'Submit', on.comment && 'Comment', on.react && 'React'].filter(Boolean) as string[];
  const toggle = (k: keyof typeof on) => (v: boolean) => setOn(s => ({...s, [k]: v}));
  return (
    <Card
      title="Participant actions"
      control="expand"
      defaultExpanded
      pills={short.length ? [{label: short[0] + (short.length > 1 ? ` +${short.length - 1}` : '')}] : undefined}>
      <ParticipantActionList>
        <ParticipantActionRow value="Sign-in required" isSelected={on.submit} onChange={toggle('submit')} onOpen={() => {}}>Submitting inputs</ParticipantActionRow>
        <ParticipantActionRow value="Sign-in required" isSelected={on.comment} onChange={toggle('comment')} onOpen={() => {}}>Commenting on inputs</ParticipantActionRow>
        <ParticipantActionRow
          value="Sign-in required"
          isSelected={on.react}
          onChange={toggle('react')}
          onOpen={() => {}}
          options={<ParticipantLimit />}>
          Reacting to inputs
        </ParticipantActionRow>
        {on.react && <ParticipantActionRow defaultSelected={false}>Disliking</ParticipantActionRow>}
        <ParticipantActionRow value="Sign-in required" isLocked onOpen={() => {}}>Attending an event</ParticipantActionRow>
      </ParticipantActionList>
    </Card>
  );
}

/** An ideation phase's Participant actions card; closed, its pill names the first action on and counts the rest ("Submit +2"). */
export const InACard: Story = {name: 'In a card', render: () => <InACardRender />};

/**
 * The keys a row takes: Tab reaches its switch, Space turns the action off and on; Tab goes on to the row while the
 * action is on, and Enter opens who can take it. Try the keys here; an automated test presses them too (the Interactions panel).
 */
export const Keyboard: Story = {
  render: function Render(args) {
    const [opened, setOpened] = useState(false);
    return (
      <>
        <ParticipantActionRow {...args} onOpen={() => setOpened(true)} />
        <span role="status">{opened ? 'Access rights open' : 'Setup'}</span>
      </>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    const toggle = canvas.getByRole('switch', {name: 'Submitting inputs'});
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
    await expect(canvas.queryByRole('button', {name: 'Edit access for Submitting inputs'})).toBeNull();
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Edit access for Submitting inputs'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('Access rights open');
  }
};

/** Participant limit, controlled: the page holds the choice and the maximum (`limit`, `max`, `onChange`). Clearing the
 * maximum is not a change: the page never gets `NaN`, and the field shows the last maximum again. */
export const LimitControlled: Story = {
  name: 'Limit controlled',
  render: function Render() {
    const [value, setValue] = useState<{limit: 'unlimited' | 'limited'; max: number}>({limit: 'unlimited', max: 5});
    return (
      <>
        <ParticipantLimit limit={value.limit} max={value.max} onChange={(limit, max) => setValue({limit, max})} />
        <p role="status">{`${value.limit}, ${value.max}`}</p>
      </>
    );
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', {name: 'Limited'}));
    await expect(canvas.getByRole('status')).toHaveTextContent('limited, 5');
    const max = canvas.getByRole('textbox', {name: 'Maximum reactions'});
    await userEvent.clear(max);
    await userEvent.tab();
    await expect(canvas.getByRole('status')).toHaveTextContent('limited, 5');
    await expect(max).toHaveValue('5');
    await userEvent.clear(max);
    await userEvent.type(max, '3');
    await userEvent.tab();
    await expect(canvas.getByRole('status')).toHaveTextContent('limited, 3');
  }
};

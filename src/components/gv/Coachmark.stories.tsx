import {useRef, useState} from 'react';
import {Coachmark} from './Coachmark';
import {Button} from '../Button';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {expect, screen, userEvent, waitFor, within} from 'storybook/test';

const meta: Meta<typeof Coachmark> = {
  title: 'Components/Overlays/Coachmark',
  component: Coachmark,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma', 'status:draft']
};

export default meta;
type Story = StoryFn<typeof Coachmark>;

export const AllVariants: Story = () => {
  const rightRef = useRef<HTMLSpanElement>(null);
  const bottomRef = useRef<HTMLSpanElement>(null);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(true);
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 440, padding: '120px 40px 220px'}}>
      <div>
        <span ref={rightRef} style={{display: 'inline-block'}}>
          <Button onPress={() => setRightOpen(true)}>Phase rail</Button>
        </span>
        <Coachmark
          triggerRef={rightRef}
          placement="right"
          isOpen={rightOpen}
          onOpenChange={setRightOpen}
          title="Follow the phases here"
          onDismiss={() => setRightOpen(false)}
          onSkip={() => setRightOpen(false)}>
          Each phase shows its status and how many days are left.
        </Coachmark>
      </div>
      <div>
        <span ref={bottomRef} style={{display: 'inline-block'}}>
          <Button onPress={() => setBottomOpen(true)}>Add an idea</Button>
        </span>
        <Coachmark
          triggerRef={bottomRef}
          placement="bottom"
          isOpen={bottomOpen}
          onOpenChange={setBottomOpen}
          title="Residents start here"
          onDismiss={() => setBottomOpen(false)}
          onSkip={() => setBottomOpen(false)}>
          This button opens the same form residents use to submit an idea.
        </Coachmark>
      </div>
    </div>
  );
};

export const Example: Story = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isOpen, setOpen] = useState(true);
  return (
    <div style={{padding: 120}}>
      <span ref={ref} style={{display: 'inline-block'}}>
        <Button onPress={() => setOpen(true)}>Publish project</Button>
      </span>
      <Coachmark
        triggerRef={ref}
        isOpen={isOpen}
        onOpenChange={setOpen}
        title="Ready when you are"
        onDismiss={() => setOpen(false)}
        onSkip={() => setOpen(false)}>
        Publishing makes "Green Corridors for Riverside" visible to residents. You can still
        change who can see and open it afterwards.
      </Coachmark>
    </div>
  );
};

/** The keyboard, proved by this story's play function (the Interactions panel): once open, focus is in the coachmark;
 * Tab walks ×, Skip and Got it and stays inside; Enter on Got it closes it and focus goes back; Esc closes it too; the
 * × skips. The bubble is a dialog named by its title. */
export const Keyboard: Story = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [said, setSaid] = useState('');
  return (
    <div style={{padding: 120, display: 'grid', gap: 12, justifyItems: 'start'}}>
      <span ref={ref} style={{display: 'inline-block'}}>
        <Button onPress={() => setOpen(true)}>Publish project</Button>
      </span>
      <Coachmark triggerRef={ref} isOpen={isOpen} onOpenChange={setOpen} title="Ready when you are"
        onDismiss={() => { setSaid('Got it'); setOpen(false); }} onSkip={() => { setSaid('Skipped'); setOpen(false); }}>
        Publishing makes the project visible to residents.
      </Coachmark>
      <output>{said}</output>
    </div>
  );
};
// React Aria's popover adds two hidden Dismiss buttons for screen readers; the × is the one Tab reaches.
const closeButton = (coachmark: HTMLElement) =>
  within(coachmark).getAllByRole('button', {name: 'Dismiss'}).find(b => b.classList.contains('gv-coachmark__x'));

Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', {name: 'Publish project'});
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  const coachmark = await screen.findByRole('dialog', {name: 'Ready when you are'});
  await waitFor(() => expect(coachmark).toHaveFocus());
  await userEvent.tab();
  await expect(closeButton(coachmark)).toHaveFocus();
  await userEvent.tab();
  await expect(within(coachmark).getByRole('button', {name: 'Skip'})).toHaveFocus();
  await userEvent.tab();
  const gotIt = within(coachmark).getByRole('button', {name: 'Got it'});
  await expect(gotIt).toHaveFocus();
  await userEvent.tab();
  await expect(closeButton(coachmark)).toHaveFocus();
  await userEvent.tab({shift: true});
  await expect(gotIt).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await expect(canvas.getByText('Got it')).toBeInTheDocument();
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await screen.findByRole('dialog');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  // The × skips: it calls onSkip only, never onDismiss ("Got it").
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.keyboard('{Enter}');
  await screen.findByRole('dialog');
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await expect(canvas.getByText('Skipped')).toBeInTheDocument();
};

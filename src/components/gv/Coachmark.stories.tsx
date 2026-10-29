import {useRef, useState} from 'react';
import {Coachmark} from './Coachmark';
import {Button} from '../Button';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof Coachmark> = {
  title: 'Components/Overlays/Coachmark',
  component: Coachmark,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs', 'not-in-figma']
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

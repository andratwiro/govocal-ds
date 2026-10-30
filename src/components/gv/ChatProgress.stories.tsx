import {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChatProgress, type ChatProgressStep} from './ChatProgress';

const meta: Meta<typeof ChatProgress> = {
  title: 'Components/AI/Chat progress',
  component: ChatProgress,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof ChatProgress>;

const STEPS: ChatProgressStep[] = [
  {id: 'read', label: 'Reading the 6 projects across 3 spaces', status: 'done'},
  {id: 'count', label: 'Counting identifiable participants', status: 'done'},
  {id: 'write', label: 'Writing 8 sections'},
];

/** No steps: one row, a teal spinner and "Thinking…". */
export const Thinking: Story = {};

/** A generate run: done steps keep their tick, the running one spins. */
export const Steps: Story = {args: {steps: STEPS}};

/** Every step done: the trace stays above the answer. */
export const Done: Story = {
  args: {status: 'done', steps: [...STEPS.slice(0, 2), {id: 'write', label: 'Writing 8 sections', status: 'done'},
    {id: 'draw', label: 'Drawing 11 charts', status: 'done'}]}
};

/** Stopped: the step that was running gets a stop mark. */
export const Stopped: Story = {args: {status: 'stopped', steps: STEPS}};

/** Rows arrive one by one and tick off, as a page drives them. */
export const Running: Story = {
  render: () => {
    const all = ['Reading the 6 projects across 3 spaces', 'Counting identifiable participants', 'Writing 8 sections',
      'Drawing 11 charts'];
    const [n, setN] = useState(1);
    useEffect(() => {
      const t = setInterval(() => setN(v => (v > all.length ? 1 : v + 1)), 900);
      return () => clearInterval(t);
    }, [all.length]);
    const steps = all.slice(0, Math.min(n, all.length)).map((label, i) => ({
      id: String(i), label, status: i < n - 1 ? 'done' as const : 'running' as const
    }));
    return <ChatProgress steps={steps} status={n > all.length ? 'done' : 'running'} />;
  }
};

/** Right to left: the marks at the start edge. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, args: {steps: STEPS}};

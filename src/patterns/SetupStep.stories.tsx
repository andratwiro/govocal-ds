import type {Meta, StoryObj} from '@storybook/react-vite';
import {SetupStep} from './SetupStep';

const meta: Meta<typeof SetupStep> = {
  title: 'Patterns/Project page/Setup step',
  component: SetupStep,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-874'}
  },
  decorators: [Story => <div style={{width: 296}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SetupStep>;

const cardText = 'Shown wherever Green Corridors for Riverside is listed: homepage, folders, spaces and pages.';

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <SetupStep action="open" title="Settings" />
      <SetupStep action="expand" title="Set project card">{cardText}</SetupStep>
      <SetupStep action="open" title="Edit project page" isDone />
      <SetupStep action="expand" title="Set area" isDone defaultExpanded>
        Riverside North, Old Harbour
      </SetupStep>
    </div>
  )
};

/** Action=Open */
export const Open: Story = {
  args: {action: 'open', title: 'Settings'},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-19'}}
};

/** Action=Expand */
export const Expand: Story = {
  args: {action: 'expand', title: 'Set project card', children: cardText},
  parameters: {design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-37'}}
};

/** Not in Figma (the prototype's PJP_CHK, 7 Oct): a done step, its dashed ring filled with a tick. */
export const Done: Story = {
  args: {action: 'expand', title: 'Set area', isDone: true, defaultExpanded: true, children: 'Riverside North, Old Harbour'}
};

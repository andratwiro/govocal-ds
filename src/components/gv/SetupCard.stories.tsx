import type {Meta, StoryObj} from '@storybook/react-vite';
import {SetupCard} from './SetupCard';

const meta: Meta<typeof SetupCard> = {
  title: 'Components/Setup card',
  component: SetupCard,
  tags: ['autodocs'],
  parameters: {
    design: {type: 'figma', url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-874'}
  },
  decorators: [Story => <div style={{width: 296}}><Story /></div>]
};
export default meta;
type Story = StoryObj<typeof SetupCard>;

const cardText = 'Shown wherever Green Corridors for Riverside is listed: homepage, folders, spaces and pages.';

export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <SetupCard action="open" title="Settings" />
      <SetupCard action="expand" title="Set project card">{cardText}</SetupCard>
      <SetupCard action="open" title="Edit project page" isDone />
      <SetupCard action="expand" title="Set area" isDone defaultExpanded>
        Riverside North, Old Harbour
      </SetupCard>
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

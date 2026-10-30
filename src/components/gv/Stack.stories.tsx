import type {Meta, StoryObj} from '@storybook/react-vite';
import {Stack} from './Stack';
import {Inline} from './Inline';
import {Panel} from './Panel';
import {PageHeader} from './PageHeader';
import {Button} from '../Button';
import {TextField} from '../TextField';

const meta: Meta<typeof Stack> = {
  title: 'Components/Layout & containers/Stack',
  component: Stack,
  tags: ['autodocs', 'not-in-figma', 'status:candidate'],
  parameters: {layout: 'padded'},
  argTypes: {
    gap: {control: 'select', options: ['0', '4', '8', '12', '16', '24', '32', '48']},
    padding: {control: 'select', options: [undefined, '0', '8', '16', '24']}
  }
};
export default meta;
type Story = StoryObj<typeof Stack>;

/** A page's column: the header, then its panels, 8 apart as the back office lays them out. No CSS. */
export const PageColumn: Story = {
  name: 'Page column',
  args: {gap: '8'},
  render: args => (
    <Stack {...args}>
      <PageHeader title="Projects" description="Every project on the platform, by its status." />
      <Panel title="Drafts">Two projects not yet published.</Panel>
      <Panel title="Published">Eleven projects open to participants.</Panel>
    </Stack>
  )
};

/** A form's fields, 16 apart, and its buttons in an Inline at the end. */
export const FormFields: Story = {
  name: 'Form fields',
  args: {gap: '16', padding: '24', elementType: 'form', 'aria-label': 'New project'},
  render: args => (
    <Stack {...args} style={{maxWidth: 420}}>
      <TextField label="Title" />
      <TextField label="Slug" description="The end of the project's web address." />
      <Inline gap="8" justifyContent="end">
        <Button variant="secondary">Cancel</Button>
        <Button>Create project</Button>
      </Inline>
    </Stack>
  )
};

/** `alignItems` keeps each child at its own width instead of the stack's: here at the start. */
export const Aligned: Story = {
  args: {gap: '12', alignItems: 'start'},
  render: args => (
    <Stack {...args}>
      <Button variant="secondary">Add a phase</Button>
      <Button variant="secondary">Add a folder</Button>
    </Stack>
  )
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState, type FormEvent} from 'react';
import {Button} from '../../components/Button';
import {CheckboxGroup} from '../../components/CheckboxGroup';
import {Form} from '../../components/Form';
import {NumberField} from '../../components/NumberField';
import {Radio, RadioGroup} from '../../components/RadioGroup';
import {SearchField} from '../../components/SearchField';
import {Select, SelectItem} from '../../components/Select';
import {Switch} from '../../components/Switch';
import {TextArea, TextField} from '../../components/TextField';
import {Banner} from '../../components/gv/Banner';
import {Checkbox} from '../../components/gv/Checkbox';
import {ChoiceCard} from '../../components/gv/ChoiceCard';
import {DateRangeField} from '../../components/gv/DateRangeField';
import {TileGrid} from '../../components/gv/TileGrid';
import {TitleField} from '../../components/gv/TitleField';

/**
 * Form validation, a recipe: every field in its invalid state, and a form that checks itself on submit and moves focus
 * to the first field to fix. Fields take React Aria's validation: `isRequired`, `type="email"` or `validate` to
 * check, `errorMessage` for the words (a string, or a function of what failed), `isInvalid` to set it from outside
 * (a server's answer, react-hook-form: docs/CONSUMING.md). A recipe, not a component: copy the markup. Not in Figma.
 */
const meta: Meta<typeof Form> = {
  title: 'Patterns/Recipes/Form validation',
  component: Form,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof Form>;

const FOLDERS = [
  {id: 'parks', name: 'Parks and green space'},
  {id: 'mobility', name: 'Mobility'},
  {id: 'housing', name: 'Housing'}
];

/**
 * Every field the system has, invalid, with its message: set from outside with `isInvalid` and
 * `validationBehavior="aria"`, as a page does with a server's answer. Date range field decides for itself (an end
 * before the start). Option list, Tag picker, Rich text editor and Drop zone have no invalid state yet.
 */
export const AllInvalid: Story = {
  name: 'All fields · invalid',
  render: () => (
    <Form validationBehavior="aria" aria-label="Every field, invalid">
      <TileGrid minTileWidth={360} layout="gallery">
        <TitleField aria-label="Project title" isRequired isInvalid errorMessage="Name the project." />
        <TextField label="Title" isRequired isInvalid errorMessage="Give the project a title." />
        <TextArea label="Description" isInvalid errorMessage="Say in a sentence what the project is about." />
        <NumberField label="Participants" defaultValue={0} isInvalid errorMessage="At least 1 participant." />
        <SearchField label="Find a project" defaultValue="gr" isInvalid errorMessage="Type at least 3 letters." />
        <Select label="Folder" items={FOLDERS} isRequired isInvalid errorMessage="Pick a folder.">
          {item => <SelectItem id={item.id}>{item.name}</SelectItem>}
        </Select>
        <Checkbox isRequired isInvalid errorMessage="Accept the terms to publish.">I accept the terms</Checkbox>
        <Switch isInvalid errorMessage="This phase needs its notification on.">Send a notification</Switch>
        <RadioGroup label="Visibility" isRequired isInvalid errorMessage="Choose who can see the project.">
          <Radio value="public">Everyone</Radio>
          <Radio value="groups">Selected groups</Radio>
          <Radio value="admins">Admins only</Radio>
        </RadioGroup>
        <CheckboxGroup label="Topics" isRequired isInvalid errorMessage="Pick at least one topic.">
          <Checkbox value="nature">Nature</Checkbox>
          <Checkbox value="transport">Transport</Checkbox>
        </CheckboxGroup>
        <RadioGroup label="Participation method" isRequired isInvalid errorMessage="Choose how people take part.">
          <ChoiceCard value="ideation" description="Collect ideas and comments.">Ideation</ChoiceCard>
          <ChoiceCard value="voting" description="Let people vote on options.">Voting</ChoiceCard>
        </RadioGroup>
        <DateRangeField label="Dates" defaultValue={{start: '2026-11-10', end: '2026-11-02'}} />
      </TileGrid>
    </Form>
  )
};

function SubmitToValidateForm() {
  const [saved, setSaved] = useState<string | null>(null);
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(String(new FormData(e.currentTarget).get('title')));
  };
  return (
    <TileGrid minTileWidth={360} layout="gallery">
      <Form onSubmit={save} aria-label="New project">
        <TextField name="title" label="Title" isRequired errorMessage="Give the project a title." />
        <TextField name="email" type="email" label="Contact email" isRequired
          errorMessage={v => v.validationDetails.valueMissing ? 'Add a contact email.'
            : 'That is not an email address: name@example.org.'} />
        <NumberField name="participants" label="Participants" isRequired validate={n => n < 1 ? 'At least 1.' : null}
          errorMessage={v => v.validationDetails.valueMissing ? 'How many people can take part?'
            : v.validationErrors.join(' ')} />
        <Select name="folder" label="Folder" items={FOLDERS} isRequired errorMessage="Pick a folder.">
          {item => <SelectItem id={item.id}>{item.name}</SelectItem>}
        </Select>
        <RadioGroup name="visibility" label="Visibility" isRequired errorMessage="Choose who can see the project.">
          <Radio value="public">Everyone</Radio>
          <Radio value="admins">Admins only</Radio>
        </RadioGroup>
        <Checkbox name="terms" isRequired errorMessage="Accept the terms to publish.">I accept the terms</Checkbox>
        <Button type="submit">Save</Button>
        <div role="status">
          {saved !== null && <Banner tone="success" title="Saved">{`“${saved}” is ready to publish.`}</Banner>}
        </div>
      </Form>
    </TileGrid>
  );
}

/**
 * React Aria's own validation, nothing else: `isRequired`, `type="email"` and a `validate` function on the fields, a
 * submit button. Save with something missing: every field to fix shows its message, and focus moves to the first one; fix it
 * and save again, and focus moves to the next. The page's `onSubmit` runs only once all of them pass.
 */
export const SubmitToValidate: Story = {
  name: 'Submit to validate',
  render: () => <SubmitToValidateForm />
};

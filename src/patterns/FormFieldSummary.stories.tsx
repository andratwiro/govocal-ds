import type {Meta, StoryObj} from '@storybook/react-vite';
import {Lightbulb} from 'lucide-react';
import {Button} from '../components/Button';
import {Card} from '../components/gv/Card';
import './FormFieldSummary.css';

/**
 * A recipe, not a component (NAMING: a pattern used on one page): a form's questions at a glance, in a phase's Idea
 * form or Proposal form card, with Edit form under them. Copy the markup and FormFieldSummary.css into the page; it
 * becomes a component when a second page needs it. Not in Figma.
 */
const meta: Meta = {
  title: 'Patterns/Build tab/Form field summary',
  tags: ['autodocs', 'not-in-figma'],
  decorators: [
    Story => (
      <div style={{width: 584, maxWidth: '100%'}}>
        <Story />
      </div>
    )
  ]
};
export default meta;
type Story = StoryObj;

interface Question {
  name: string;
  /** The question's type as the form builder names it ("Short answer"). */
  type: string;
  isRequired?: boolean;
}

/* The default idea form, as the product words it. */
const IDEA_FORM: Question[] = [
  {name: 'Title', type: 'Short answer', isRequired: true},
  {name: 'Description', type: 'Long answer', isRequired: true},
  {name: 'Images', type: 'Image upload'},
  {name: 'Attachments', type: 'File upload'},
  {name: 'Tags', type: 'Tags'},
  {name: 'Location', type: 'Location'}
];

/* An idea form with questions of its own: past six, the rest is counted. */
const LONG_FORM: Question[] = [
  ...IDEA_FORM.slice(0, 2),
  {
    name: 'What would make the parks and public spaces in your neighbourhood better for everyone who uses them?',
    type: 'Long answer',
    isRequired: true
  },
  {name: 'Which of these would your idea help most?', type: 'Multiple choice'},
  {name: 'How often do you visit a park?', type: 'Single choice'},
  {name: 'How much would it cost?', type: 'Number'},
  ...IDEA_FORM.slice(2)
];

const MAX = 6;

/** The recipe: copy this and FormFieldSummary.css. */
function FormFieldSummary({questions, onEdit}: {questions: Question[]; onEdit?: () => void}) {
  return (
    <div className="gv-form-summary">
      <ol className="gv-form-summary__list">
        {questions.slice(0, MAX).map((q, i) => (
          <li key={q.name} className="gv-form-summary__question">
            <span className="gv-form-summary__number" aria-hidden>
              {i + 1}
            </span>
            {/* One line each: a long question ends in …, its whole text on hover. */}
            <span className="gv-form-summary__name" title={q.name}>
              {q.name}
            </span>
            <span className="gv-form-summary__type">{q.isRequired ? `${q.type} · Required` : q.type}</span>
          </li>
        ))}
        {questions.length > MAX && (
          <li className="gv-form-summary__question gv-form-summary__more">{questions.length - MAX} more</li>
        )}
      </ol>
      <Button variant="secondary" size={36} onPress={onEdit}>
        Edit form
      </Button>
    </div>
  );
}

/** The default idea form, then one with questions of its own (a long one ends in …; past six, "4 more"). */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-32)'}}>
      <FormFieldSummary questions={IDEA_FORM} />
      <FormFieldSummary questions={LONG_FORM} />
    </div>
  )
};

/** The form a new ideation phase starts with: six questions, two required. */
export const Default: Story = {render: () => <FormFieldSummary questions={IDEA_FORM} />};

/** Questions of its own: one line each, and past six the rest is counted ("4 more"); the whole form is in Edit form. */
export const WithMore: Story = {name: 'With more', render: () => <FormFieldSummary questions={LONG_FORM} />};

/**
 * In an ideation phase's Idea form card, reviewed, under the input term card ("Idea"). Closed, the card counts the
 * questions ("6 questions").
 */
export const InACard: Story = {
  name: 'In a card',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--gv-space-16)'}}>
      <Card
        title="What should an input be called?"
        status="reviewed"
        pills={[{label: 'Idea', icon: Lightbulb}]}
        control="expand"
      />
      <Card
        title="Idea form"
        status="reviewed"
        pills={[{label: `${IDEA_FORM.length} questions`}]}
        control="expand"
        defaultExpanded>
        <FormFieldSummary questions={IDEA_FORM} />
      </Card>
    </div>
  )
};

import {TextField} from '../TextField';
import type {Meta, StoryObj} from '@storybook/react-vite';

const meta: Meta<typeof TextField> = {
  title: 'Components/Forms/Text field',
  component: TextField,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=4-224'
    }
  },
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter your full name'
  }
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {label: 'Name'}
};

/** The project slug: a fixed, un-editable prefix inside the field. */
export const WithPrefix: Story = {
  name: 'With prefix',
  args: {
    label: 'Project URL',
    prefix: 'internal.govocal.com/en/projects/',
    placeholder: 'green-corridors',
    defaultValue: 'green-corridors'
  }
};

/** A live "N/max" count under the field (Add a statement, Recipients). */
export const WithCounter: Story = {
  name: 'With counter',
  args: {
    label: 'Statement',
    maxLength: 140,
    showCounter: true,
    defaultValue: 'More cycle paths along the river.'
  }
};

/** Help text beside the count: the help takes the row, the count keeps its end. */
export const WithCounterAndHelp: Story = {
  name: 'With counter and help',
  args: {
    label: 'Statement',
    maxLength: 140,
    showCounter: true,
    description: 'One sentence participants can agree or disagree with.',
    defaultValue: 'More cycle paths along the river.'
  }
};

export const ReadOnly: Story = {
  name: 'Read only',
  args: {label: 'Project URL', isReadOnly: true, defaultValue: 'green-corridors'}
};

/**
 * Long translated words: German runs about a third longer than English and builds long compounds. The label wraps,
 * the help text wraps beside the count and breaks a long compound rather than running under it, and the typed text
 * scrolls inside the field. The page passes the words; the system never translates.
 */
export const LongGermanLabels: Story = {
  name: 'Long German labels',
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  args: {
    label: 'Einverständniserklärung zur Datenverarbeitung der Gemeindeverwaltung',
    placeholder: 'Geben Sie Ihren vollständigen Namen einschließlich aller Vornamen ein',
    description: 'Bürgerbeteiligungsplattformnutzungsbedingungen: Ihr Name erscheint neben Ihren Beiträgen.',
    maxLength: 140,
    showCounter: true,
    defaultValue: 'Fahrradstraßenverbindung entlang des Flussufers'
  }
};

/** An Arabic interface: the label, the text and the count run right to left, the count at the field's left end. */
export const Arabic: Story = {
  globals: {locale: 'ar-SA'},
  decorators: [Story => <div style={{width: 320}}><Story /></div>],
  args: {
    label: 'الاسم الكامل',
    placeholder: 'أدخل اسمك الكامل',
    description: 'يظهر اسمك بجانب أفكارك وتعليقاتك.',
    maxLength: 140,
    showCounter: true,
    defaultValue: 'مسارات للدراجات على طول النهر'
  }
};

import type {Meta, StoryObj} from '@storybook/react-vite';
import {DraftsBar} from './DraftsBar';

const meta: Meta<typeof DraftsBar> = {
  title: 'Patterns/Drafts bar',
  component: DraftsBar,
  tags: ['autodocs']
};
export default meta;
type Story = StoryObj<typeof DraftsBar>;

export const Default: Story = {args: {count: 6, onShow: () => {}, onHistory: () => {}, onClose: () => {}}};

export const OneDraft: Story = {args: {count: 1, onShow: () => {}, onHistory: () => {}, onClose: () => {}}};

/** Without onClose the bar can't be dismissed. */
export const NotDismissable: Story = {args: {count: 3, onShow: () => {}, onHistory: () => {}}};

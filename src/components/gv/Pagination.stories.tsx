import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {Pagination} from './Pagination';

function Pager({start, pages, label}: {start: number; pages: number; label?: string}) {
  const [page, setPage] = useState(start);
  return <Pagination page={page} pageCount={pages} onPageChange={setPage} aria-label={label} />;
}

const meta: Meta<typeof Pagination> = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma']
};
export default meta;
type Story = StoryObj<typeof Pagination>;

/** On the first page, in the middle, on the last page, and a short list with every page shown. */
export const AllVariants: Story = {
  name: 'AllVariants',
  render: () => (
    <div style={{display: 'grid', gap: 16, justifyItems: 'end'}}>
      <Pager start={1} pages={12} label="First page" />
      <Pager start={6} pages={12} label="A middle page" />
      <Pager start={12} pages={12} label="Last page" />
      <Pager start={2} pages={4} label="Few pages" />
    </div>
  )
};

/** Page 1 of 12: ‹ is disabled; the first five pages, an ellipsis, the last page. */
export const First: Story = {render: () => <Pager start={1} pages={12} />};

/** A middle page: an ellipsis on each side of the current page and its neighbours. Seven slots, so the pager keeps
 * its width as you walk it. */
export const Middle: Story = {render: () => <Pager start={6} pages={12} />};

/** The last page: › is disabled. Pressing › onto the last page moves focus to the current page, not to nowhere. */
export const Last: Story = {render: () => <Pager start={12} pages={12} />};

/** Seven pages or fewer: all of them, no ellipsis. */
export const FewPages: Story = {name: 'Few pages', render: () => <Pager start={2} pages={4} />};

/** One page: both arrows disabled. A page may also leave the pager out. */
export const OnePage: Story = {name: 'One page', render: () => <Pager start={1} pages={1} />};

/** Right to left (Arabic): pages run from the right, ‹ › point the reading way. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}, render: () => <Pager start={6} pages={12} />};

/** The keyboard, proved by this story's play function (the Interactions panel): Tab walks ‹, the pages and ›; Enter or
 * Space presses one; pressing ‹ onto the first page moves focus to that page, not to the disabled ‹. */
export const Keyboard: Story = {
  render: () => <Pager start={2} pages={4} label="Idea pages" />,
  play: async ({canvasElement}) => {
    const pager = within(within(canvasElement).getByRole('navigation', {name: 'Idea pages'}));
    await userEvent.tab();
    const previous = pager.getByRole('button', {name: 'Previous page'});
    await expect(previous).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const first = pager.getByRole('button', {name: 'Page 1'});
    await expect(first).toHaveAttribute('aria-current', 'page');
    await expect(previous).toBeDisabled();
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.tab();
    const second = pager.getByRole('button', {name: 'Page 2'});
    await expect(second).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(second).toHaveAttribute('aria-current', 'page');
  }
};

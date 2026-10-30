import {Tree, TreeItem} from './Tree';
import type {Meta, StoryFn} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';
import {Panel} from './gv/Panel';

const meta: Meta<typeof Tree> = {
  component: Tree,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof Tree>;

export const Example: Story = args => (
  <Tree aria-label="Files" {...args}>
    <TreeItem title="Documents">
      <TreeItem title="Project">
        <TreeItem title="Weekly Report" />
      </TreeItem>
    </TreeItem>
    <TreeItem title="Photos">
      <TreeItem title="Image 1" />
      <TreeItem title="Image 2" />
    </TreeItem>
  </Tree>
);

Example.args = {
  style: {height: '300px'},
  defaultExpandedKeys: ['documents', 'photos', 'project']
};

/** `isFlush` inside a Panel (the report's outline): no frame of its own, the panel's full width; `trailing` puts a
 * row's page number at its end. The play function checks both. */
export const FlushWithPageNumbers: Story = () => (
  <div style={{width: 280}}>
    <Panel title="Outline" headingLevel={3} isFlush>
      <Tree aria-label="Report outline" isFlush defaultExpandedKeys={['results']}>
        <TreeItem id="intro" title="Introduction" trailing="1" />
        <TreeItem id="results" title="Results" trailing="2">
          <TreeItem id="votes" title="Votes per idea" />
          <TreeItem id="who" title="Who took part" />
        </TreeItem>
        <TreeItem id="next" title="Next steps" trailing="4" />
      </Tree>
    </Panel>
  </div>
);
FlushWithPageNumbers.storyName = 'Flush, with page numbers';
FlushWithPageNumbers.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findAllByRole('row');
  const tree = canvas.getByRole('treegrid', {name: 'Report outline'});
  await expect(getComputedStyle(tree).borderTopWidth).toBe('0px');
  const panel = canvas.getByRole('region', {name: 'Outline'});
  await expect(tree.getBoundingClientRect().width).toBeGreaterThan(panel.getBoundingClientRect().width - 4);
  // React Aria fills the tree after its first render.
  const row = await canvas.findByRole('row', {name: /Results/});
  const page = within(row).getByText('2');
  await expect(row.getBoundingClientRect().right - page.getBoundingClientRect().right).toBeLessThan(16);
};

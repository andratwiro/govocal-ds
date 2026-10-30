import {useState} from 'react';
import {expect, userEvent, within} from 'storybook/test';
import {ListRow} from './ListRow';
import {PICTURES} from '../../stories/images';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRow> = {
  title: 'Components/Data display/List row',
  component: ListRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-885'
    }
  },
  tags: ['autodocs', 'status:candidate']
};

export default meta;
type Story = StoryFn<typeof ListRow>;

const THUMB = PICTURES.streetTrees;

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's three variants: Marks=Warning · Image=No, Marks=None · Image=No, Marks=None · Image=Yes. */
export const AllVariants: Story = () => (
  <Frame>
    <ListRow
      title="Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet."
      status="Viewed"
      hasWarning
    />
    <ListRow title="Build rain gardens along the north district so the street stops flooding after every heavy storm." status="Rejected" />
    <ListRow
      title="More street trees along the canal would make the whole walk far nicer in summer: shade, birdsong, somewhere to sit. The stretch between the two bridges is completely bare right now and gets unbearably hot."
      status="Under consideration"
      thumbnail={THUMB}
    />
  </Frame>
);

export const WarningNoImage: Story = () => (
  <Frame>
    <ListRow title="Organise open-air cinema nights on Linden Avenue in summer." status="Viewed" hasWarning />
  </Frame>
);
WarningNoImage.storyName = 'Warning · without image';

export const NoneNoImage: Story = () => (
  <Frame>
    <ListRow title="Build rain gardens along the north district." status="Rejected" />
  </Frame>
);
NoneNoImage.storyName = 'None · without image';

export const NoneWithImage: Story = () => (
  <Frame>
    <ListRow title="More street trees along the canal would cool the area." status="Under consideration" thumbnail={THUMB} />
  </Frame>
);
NoneWithImage.storyName = 'None · with image';

/**
 * Not in Figma: the prototype's Manage table puts a checkbox in the leading slot. It shows on
 * hover, on keyboard focus and once checked; a checked row is tinted.
 */
export const Selectable: Story = () => {
  const [picked, setPicked] = useState<Set<number>>(new Set([1]));
  const toggle = (i: number) => (on: boolean) =>
    setPicked(p => {
      const n = new Set(p);
      if (on) n.add(i);
      else n.delete(i);
      return n;
    });
  const rows = [
    ['Add charging points for e-bikes and e-scooters on the ring road.', 'Proposed'],
    ['Create a safe school route from the ring road with crossing guards in the morning.', 'Accepted'],
    ['Give the old market road a car-free Sunday once a month so children can play in the street safely.', 'Implemented']
  ];
  return (
    <Frame>
      {rows.map(([title, status], i) => (
        <ListRow key={i} title={title} status={status} select={{isSelected: picked.has(i), onChange: toggle(i)}} />
      ))}
    </Frame>
  );
};

/** The keyboard: Tab moves from one row's checkbox to the next (each shows when focused), Space ticks it. */
export const Keyboard: Story = () => {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const titles = ['Add charging points for e-bikes on the ring road', 'Create a safe school route'];
  return (
    <Frame>
      {titles.map(title => (
        <ListRow key={title} title={title} status="Proposed" select={{
          isSelected: picked.has(title),
          'aria-label': `Select: ${title}`,
          onChange: on => setPicked(p => {
            const n = new Set(p);
            if (on) n.add(title);
            else n.delete(title);
            return n;
          })
        }} />
      ))}
    </Frame>
  );
};
Keyboard.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const first = canvas.getByRole('checkbox', {name: 'Select: Add charging points for e-bikes on the ring road'});
  const second = canvas.getByRole('checkbox', {name: 'Select: Create a safe school route'});
  await userEvent.tab();
  await expect(first).toHaveFocus();
  await userEvent.keyboard(' ');
  await expect(first).toBeChecked();
  await userEvent.tab();
  await expect(second).toHaveFocus();
  await expect(second).not.toBeChecked();
  await userEvent.keyboard(' ');
  await expect(second).toBeChecked();
  await userEvent.keyboard(' ');
  await expect(second).not.toBeChecked();
};

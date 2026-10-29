import {useState} from 'react';
import {ListRow} from './ListRow';
import type {Meta, StoryFn} from '@storybook/react-vite';

const meta: Meta<typeof ListRow> = {
  title: 'Components/List row',
  component: ListRow,
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/OkMTJrzoV6em7gkqribtjA/Go-Vocal-Design-System?node-id=14-885'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ListRow>;

const THUMB = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=64&auto=format&fit=crop';

const Frame = ({children}: {children: React.ReactNode}) => (
  <div style={{width: 764, background: 'var(--gv-surface-panel)'}}>{children}</div>
);

/** Figma's three variants: Marks=Warning · Image=No, Marks=None · Image=No, Marks=None · Image=Yes. */
export const AllVariants: Story = () => (
  <Frame>
    <ListRow
      title="Organise open-air cinema nights on Linden Avenue in summer. It would be a great way for neighbours to meet."
      status="Viewed"
      warning
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
    <ListRow title="Organise open-air cinema nights on Linden Avenue in summer." status="Viewed" warning />
  </Frame>
);

export const NoneNoImage: Story = () => (
  <Frame>
    <ListRow title="Build rain gardens along the north district." status="Rejected" />
  </Frame>
);

export const NoneWithImage: Story = () => (
  <Frame>
    <ListRow title="More street trees along the canal would cool the area." status="Under consideration" thumbnail={THUMB} />
  </Frame>
);

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

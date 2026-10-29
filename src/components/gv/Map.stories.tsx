import type {Meta, StoryObj} from '@storybook/react-vite';
import {useMemo, useState, type ReactNode} from 'react';
import type {Key} from 'react-aria-components';
import {List, Map as MapIcon} from 'lucide-react';
import {Button} from '../Button';
import {SearchField} from '../SearchField';
import {Map, MapCard, MapChip, MapLegend, MapOverlay, type LatLng} from './Map';
import {Banner} from './Banner';
import {Panel} from './Panel';
import {SegmentedControl, SegmentedControlItem} from './SegmentedControl';
import {TableToolbar} from './TableToolbar';
import {DataTable, DataTableBody, DataTableCell, DataTableColumn, DataTableHeader, DataTableRow, DataTableStack} from './DataTable';
import {CENTRE_PIN, MAP_CENTRE, MAP_IDEAS, MAP_PINS, NEAR_CENTRE, STATUS_LEGEND, ideaCounts, toPins, type IdeaPin, type MapIdea} from './story-data/places';

const meta: Meta<typeof Map> = {
  title: 'Components/Data display/Map',
  component: Map,
  tags: ['autodocs', 'not-in-figma'],
  parameters: {layout: 'padded'}
};
export default meta;
type Story = StoryObj<typeof Map>;

/** The map's box in a story: the Map fills the height it is given. */
const Frame = ({children, width = 760, height = 560}: {children: ReactNode; width?: number; height?: number}) => (
  <div style={{width, maxWidth: '100%', height}}>{children}</div>
);
const FULL = {height: '100%'};
const card = (pin: IdeaPin) => (
  <MapCard title={pin.idea.title} status={pin.idea.status} details={ideaCounts(pin.idea)} location={pin.idea.place?.where} />
);
const withoutPlace = MAP_IDEAS.filter(i => !i.place).length;
const ADD_NOTE = 'As an admin, you can click on the map to add your input, even if this phase is not active.';

/** 120 ideas on a town's map (OpenFreeMap's tiles): press a pin for its card, Tab to the pins and walk them with the arrows. */
export const Default: Story = {
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={14} renderCard={card} style={FULL} />
    </Frame>
  )
};

/** An open pin: larger, in the accent, with its card above it (title, status · likes · comments, where). Esc closes it. */
export const Selected: Story = {
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={15} defaultSelectedKey={CENTRE_PIN.id}
        renderCard={card} style={FULL} />
    </Frame>
  )
};

/** A list row under the pointer marks its pin hot (near black, raised): hover the rows. */
export const Hovered: Story = {
  render: function Render() {
    const rows = NEAR_CENTRE.slice(0, 6);
    const [hot, setHot] = useState<Key | null>(rows[2].id);
    return (
      <div style={{display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, width: 1000, maxWidth: '100%', height: 520}}>
        <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={14} hoveredKey={hot}
          onHoverChange={setHot} renderCard={card} style={FULL} />
        <DataTable aria-label="Ideas" density="compact">
          <DataTableHeader>
            <DataTableColumn isRowHeader>Idea</DataTableColumn>
          </DataTableHeader>
          <DataTableBody>
            {rows.map(p => (
              <DataTableRow key={p.id} id={p.id} textValue={p.label} onHoverChange={h => setHot(h ? p.id : null)}>
                <DataTableCell><DataTableStack sub={p.idea.status}>{p.label}</DataTableStack></DataTableCell>
              </DataTableRow>
            ))}
          </DataTableBody>
        </DataTable>
      </div>
    );
  }
};

/** Pins that crowd each other fold into a count; pressing one zooms in on it. The open and hot pins stay apart. */
export const Clustered: Story = {
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={13} isClustered renderCard={card} style={FULL} />
    </Frame>
  )
};

/** Pins in a tone per status, and the legend that says what each colour means (bottom end, above the credits). */
export const WithALegend: Story = {
  name: 'With a legend',
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={toPins(MAP_IDEAS, true)} center={MAP_CENTRE} zoom={14} renderCard={card} style={FULL}>
        <MapOverlay placement="bottom-end"><MapLegend title="Status" items={STATUS_LEGEND} /></MapOverlay>
      </Map>
    </Frame>
  )
};

/** What isn't on the map: a chip at the bottom start counts the items without a place. As a button it can list them. */
export const WithoutALocation: Story = {
  name: 'Without a location',
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={14} renderCard={card} style={FULL}>
        <MapOverlay placement="bottom-start"><MapChip>{withoutPlace} ideas without a location</MapChip></MapOverlay>
      </Map>
    </Frame>
  )
};

/**
 * An admin adds an input where they click (Enter on the focused map adds it at the centre). The Banner sits over the
 * map at the top start, clear of the zoom buttons. A click while a card is open closes the card first.
 */
export const AddingAnInput: Story = {
  name: 'Adding an input',
  render: function Render() {
    const [added, setAdded] = useState<MapIdea[]>([]);
    const [open, setOpen] = useState<Key | null>(null);
    const add = ({lat, lng}: LatLng) => {
      const idea: MapIdea = {id: `new-${added.length + 1}`, title: 'New idea', status: 'Draft', likes: 0, comments: 0,
        place: {lat, lng, where: `${lat.toFixed(4)}, ${lng.toFixed(4)}`}};
      setAdded(a => [...a, idea]);
      setOpen(idea.id);
    };
    const pins = useMemo(() => [...MAP_PINS, ...toPins(added)], [added]);
    return (
      <Frame>
        <Map aria-label="Ideas on the map" items={pins} center={MAP_CENTRE} zoom={14} selectedKey={open} onSelectionChange={setOpen}
          onMapPress={add} style={FULL}
          renderCard={p => p.idea.status === 'Draft'
            ? <MapCard title="Add an idea here" location={p.idea.place?.where} actions={<Button>Continue</Button>} />
            : card(p)}>
          <MapOverlay placement="top-start"><Banner tone="info">{ADD_NOTE}</Banner></MapOverlay>
          <MapOverlay placement="bottom-start"><MapChip>{withoutPlace} ideas without a location</MapChip></MapOverlay>
        </Map>
      </Frame>
    );
  }
};

/** Not interactive: a picture of the map (no moving, no zoom buttons, pins not pressable), e.g. the phone preview. */
export const NotInteractive: Story = {
  name: 'Not interactive',
  render: () => (
    <Frame width={360} height={240}>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={13} isInteractive={false} style={FULL} />
    </Frame>
  )
};

/** Right to left: the overlays, zoom buttons and credits swap sides; the map and its arrow keys stay as they are. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => (
    <Frame>
      <Map aria-label="Ideas on the map" items={MAP_PINS} center={MAP_CENTRE} zoom={15} defaultSelectedKey={CENTRE_PIN.id}
        renderCard={card} style={FULL}>
        <MapOverlay placement="top-start"><Banner tone="info">{ADD_NOTE}</Banner></MapOverlay>
        <MapOverlay placement="bottom-start"><MapChip>{withoutPlace} ideas without a location</MapChip></MapOverlay>
      </Map>
    </Frame>
  )
};

/**
 * The recipe for a phase's Manage tab (the prototype's map view, a one-off: the page keeps its own copy). The toolbar's
 * List / Map switch; in Map, the map beside a narrow list of the same ideas. One open idea for both (the map's
 * `selectedKey`, the table's `openKey`), a hovered row marks its pin, a pin under the pointer reports back. The chip
 * counts the ideas the map can't show; the Banner says an admin can add one by clicking.
 */
export const InTheManageTab: Story = {
  name: 'In the Manage tab',
  render: function Render() {
    const [view, setView] = useState<'list' | 'map'>('map');
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState<Key | null>(null);
    const [hot, setHot] = useState<Key | null>(null);
    const shown = MAP_IDEAS.filter(i => i.title.toLowerCase().includes(query.trim().toLowerCase()));
    const pins = useMemo(() => toPins(shown), [query]); // eslint-disable-line react-hooks/exhaustive-deps
    const missing = shown.length - pins.length;
    const meta = (i: MapIdea) => [i.status, ...ideaCounts(i), ...(i.place ? [] : ['No location'])].join(' · ');
    const list = (
      <DataTable aria-label="Ideas" density="compact" onRowAction={key => setOpen(k => (k === key ? null : key))} openKey={open}>
        <DataTableHeader>
          <DataTableColumn isRowHeader>Idea</DataTableColumn>
        </DataTableHeader>
        <DataTableBody>
          {shown.map(i => (
            <DataTableRow key={i.id} id={i.id} textValue={i.title} onHoverChange={h => setHot(h ? i.id : null)}>
              <DataTableCell><DataTableStack sub={meta(i)}>{i.title}</DataTableStack></DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    );
    return (
      <div style={{width: 1200, maxWidth: '100%'}}>
        <Panel title="Collect ideas" flush toolbar={(
          <TableToolbar heading={`${shown.length} ideas`}>
            <SegmentedControl size="small" aria-label="View" disallowEmptySelection selectedKeys={[view]}
              onSelectionChange={k => setView([...k][0] as 'list' | 'map')}>
              <SegmentedControlItem id="list"><List aria-hidden />List</SegmentedControlItem>
              <SegmentedControlItem id="map"><MapIcon aria-hidden />Map</SegmentedControlItem>
            </SegmentedControl>
            <SearchField isCollapsible aria-label="Search ideas" placeholder="Search" value={query} onChange={setQuery} />
          </TableToolbar>
        )}>
          {view === 'list' ? list : (
            <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 400px)', height: 640}}>
              <Map aria-label="Ideas on the map" items={pins} center={MAP_CENTRE} zoom={14} selectedKey={open} onSelectionChange={setOpen}
                hoveredKey={hot} onHoverChange={setHot} onMapPress={() => {}} renderCard={card}
                style={FULL}>
                <MapOverlay placement="top-start"><Banner tone="info">{ADD_NOTE}</Banner></MapOverlay>
                {missing > 0 && <MapOverlay placement="bottom-start"><MapChip>{missing} ideas without a location</MapChip></MapOverlay>}
              </Map>
              <div style={{overflow: 'auto', height: '100%'}}>{list}</div>
            </div>
          )}
        </Panel>
      </div>
    );
  }
};

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';
import {ZoomBar} from './ZoomBar';

const meta: Meta<typeof ZoomBar> = {
  title: 'Components/Layout & containers/Zoom bar',
  component: ZoomBar,
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'centered'},
  args: {zoom: 83, onZoomChange: fn(), fitZoom: 100, page: 3, pageCount: 12}
};
export default meta;
type Story = StoryObj<typeof ZoomBar>;

/** The whole bar: − 83% + · Fit · Page 3 of 12. */
export const Default: Story = {};

/** Already at the fit zoom: Fit is off. */
export const AtFit: Story = {name: 'At fit', args: {zoom: 100, fitZoom: 100}};

/** At the lowest step − is off; at the highest, +. */
export const AtTheEnds: Story = {
  name: 'At the ends',
  render: args => (
    <div style={{display: 'grid', gap: 'var(--gv-space-12)', justifyItems: 'center'}}>
      <ZoomBar {...args} zoom={50} />
      <ZoomBar {...args} zoom={200} />
    </div>
  )
};

/** Zoom only: no Fit, no page line (a phone preview's stage). */
export const ZoomOnly: Story = {name: 'Zoom only', args: {fitZoom: undefined, page: undefined, pageCount: undefined}};

/** Off while the report generates. */
export const Disabled: Story = {args: {isDisabled: true}};

/** In German: the percentage and the words from the page (`labels`), the numbers in the locale. */
export const Translated: Story = {
  args: {
    zoom: 83, pageCount: 1284,
    labels: {toolbar: 'Zoom und Seiten', zoomOut: 'Verkleinern', zoomIn: 'Vergrößern', fit: 'Einpassen',
      page: (p, c) => `Seite ${p} von ${c}`, zoom: v => `Zoom ${v}`}
  },
  globals: {locale: 'de-DE'}
};

/** Right to left: − at the start (the right), the page line at the end. */
export const RightToLeft: Story = {name: 'Right to left', globals: {direction: 'rtl'}};

/** Live: − and + step through the zoom steps, Fit jumps to the fit zoom. */
export const Live: Story = {
  render: args => {
    const [zoom, setZoom] = useState(83);
    return <ZoomBar {...args} zoom={zoom} onZoomChange={setZoom} />;
  }
};

/** One Tab stop; the arrow keys move between the buttons; Enter presses. */
export const Keyboard: Story = {
  render: Live.render,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Zoom out'})).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', {name: 'Zoom in'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('100%')).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', {name: 'Fit'})).toBeDisabled();
  }
};

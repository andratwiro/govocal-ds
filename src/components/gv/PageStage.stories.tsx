import {useState, type ReactNode} from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {Plus} from 'lucide-react';
import {PageStage, PageStageSheet} from './PageStage';
import {ZoomBar} from './ZoomBar';
import {Button} from '../Button';
import {EmptyState} from './EmptyState';
import {Skeleton} from './Skeleton';
import {Stack} from './Stack';
import {Text} from './Text';

const meta: Meta<typeof PageStage> = {
  title: 'Components/Layout & containers/Page stage',
  component: PageStage,
  subcomponents: {PageStageSheet},
  tags: ['autodocs', 'not-in-figma', 'status:draft'],
  parameters: {layout: 'fullscreen'}
};
export default meta;
type Story = StoryObj<typeof PageStage>;

const TITLE = 'Moving the city 2026';

/** A stage needs a height from its place in the page; here, a fixed one. */
const Frame = ({children}: {children: ReactNode}) => <div style={{blockSize: 640}}>{children}</div>;

const Cover = () => (
  <Stack gap="16">
    <Text elementType="h1" kind="document-display" color="primary">{TITLE}</Text>
    <Text elementType="p" kind="document-lead" color="secondary">What 3,600 residents told us about their streets</Text>
  </Stack>
);

const Section = ({n, title}: {n: string; title: string}) => (
  <Stack gap="12">
    <Text kind="body" color="secondary">{n}</Text>
    <Text elementType="h2" kind="document-heading" color="primary">{title}</Text>
    <Text elementType="p" kind="document-body">
      3,600 identifiable participants took part across 6 projects. Accessibility and greenery recur most often in the
      Town centre renewal surveys, and 4 upcoming events are scheduled across the 2 Green Streets projects.
    </Text>
  </Stack>
);

/** A report's pages with a live Zoom bar: − and + step the zoom, Fit fills the width, the page line follows the scroll. */
export const Default: Story = {
  render: () => {
    const [zoom, setZoom] = useState(83);
    const [fit, setFit] = useState<number>();
    const [page, setPage] = useState(1);
    return (
      <Frame>
        <PageStage zoom={zoom} onFitZoomChange={setFit} onPageChange={setPage}
          zoomBar={<ZoomBar zoom={zoom} onZoomChange={setZoom} fitZoom={fit} page={page} pageCount={3} />}>
          <PageStageSheet pageNumber={1} isCover><Cover /></PageStageSheet>
          <PageStageSheet pageNumber={2} footer={TITLE}><Section n="01" title="Executive summary" /></PageStageSheet>
          <PageStageSheet pageNumber={3} footer={TITLE}><Section n="02" title="Who took part" /></PageStageSheet>
        </PageStage>
      </Frame>
    );
  }
};

/** Zoomed out to half: the sheets scale, the stage's padding and the bar don't. */
export const ZoomedOut: Story = {
  name: 'Zoomed out',
  render: () => (
    <Frame>
      <PageStage zoom={50} zoomBar={<ZoomBar zoom={50} onZoomChange={() => {}} page={1} pageCount={3} />}>
        <PageStageSheet pageNumber={1} isCover><Cover /></PageStageSheet>
        <PageStageSheet pageNumber={2} footer={TITLE}><Section n="01" title="Executive summary" /></PageStageSheet>
        <PageStageSheet pageNumber={3} footer={TITLE}><Section n="02" title="Who took part" /></PageStageSheet>
      </PageStage>
    </Frame>
  )
};

/** Slides: 16:9 sheets with narrower margins, for a presentation export. */
export const Slides: Story = {
  render: () => (
    <Frame>
      <PageStage zoom={67}>
        <PageStageSheet format="slide" pageNumber={1} isCover><Cover /></PageStageSheet>
        <PageStageSheet format="slide" pageNumber={2} footer={TITLE}><Section n="01" title="Executive summary" /></PageStageSheet>
      </PageStage>
    </Frame>
  )
};

/** An empty report: one page with an Empty state and Add widget, never a blank stage. */
export const EmptyPage: Story = {
  name: 'Empty page',
  render: () => (
    <Frame>
      <PageStage zoom={83}>
        <PageStageSheet pageNumber={1}>
          <EmptyState title="No widgets in this report yet" icon={<Plus aria-hidden size={24} />} headingLevel={2}
            description="Choose a widget from the library, or ask the assistant to generate a first version."
            actions={<Button variant="primary" size={32}><Plus aria-hidden size={16} />Add widget</Button>} />
        </PageStageSheet>
      </PageStage>
    </Frame>
  )
};

/** Generating: a busy sheet of Skeleton lines while the assistant writes the first version; the bar is off. */
export const Generating: Story = {
  render: () => (
    <Frame>
      <PageStage zoom={83} zoomBar={<ZoomBar zoom={83} onZoomChange={() => {}} isDisabled />}>
        <PageStageSheet isBusy aria-label="Generating the report">
          <Stack gap="12">
            <Skeleton width="40%" height={16} />
            <Skeleton width="70%" height={32} />
            <Skeleton width="100%" />
            <Skeleton width="90%" />
            <Skeleton width="100%" height={160} variant="block" />
            <Skeleton width="60%" />
          </Stack>
        </PageStageSheet>
      </PageStage>
    </Frame>
  )
};

/** Right to left: the footer's title at the start (the right), the number at the end. */
export const RightToLeft: Story = {
  name: 'Right to left',
  globals: {direction: 'rtl'},
  render: () => (
    <Frame>
      <PageStage zoom={67} zoomBar={<ZoomBar zoom={67} onZoomChange={() => {}} fitZoom={83} page={2} pageCount={2} />}>
        <PageStageSheet pageNumber={1} isCover><Cover /></PageStageSheet>
        <PageStageSheet pageNumber={2} footer={TITLE}><Section n="01" title="Executive summary" /></PageStageSheet>
      </PageStage>
    </Frame>
  )
};

/** Tab reaches the stage (a scrolling region), then the Zoom bar's first button. */
export const Keyboard: Story = {
  render: Default.render,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('region', {name: 'Pages'})).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', {name: 'Zoom out'})).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('67%')).toBeVisible();
  }
};

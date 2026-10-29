import {useState} from 'react';
import {Pause, Play} from 'lucide-react';
import {Illustration, illustrations, cycleSeconds} from './Illustration';
import {illustrationNames} from '../../illustrations/names';
import {Button} from '../Button';
import type {Meta, StoryObj} from '@storybook/react-vite';

// Not in Figma: the drawings come from the prototype and the designer owns them. Each is a file in
// src/illustrations/; the gallery is Foundations/Illustrations.
const meta: Meta<typeof Illustration> = {
  title: 'Components/Data display/Illustration',
  component: Illustration,
  parameters: {layout: 'centered'},
  tags: ['autodocs', 'not-in-figma'],
  argTypes: {
    name: {control: 'select', options: illustrationNames},
    motion: {control: 'inline-radio', options: ['auto', 'once', 'loop', 'hover', 'still']}
  },
  args: {name: 'ideation-map', motion: 'auto'}
};

export default meta;
type Story = StoryObj<typeof Illustration>;

const caption = {font: 'var(--gv-type-small)', color: 'var(--gv-text-secondary)', margin: '8px 0 0'} as const;

/** Every illustration at its first intended size, still (each motion has its own story). */
export const AllVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', maxWidth: 1100}}>
      {illustrations.map(i => (
        <figure key={i.name} style={{margin: 0}}>
          <Illustration name={i.name} size={i.sizes[0]} motion="still" />
          <figcaption style={caption}>{i.name}</figcaption>
        </figure>
      ))}
    </div>
  )
};

/**
 * The default. Plays once it is on screen and rests on its still within 5 s; a story longer than that (every method
 * scene) rests until hovered, so nothing moves unbidden for more than 5 s.
 */
export const Auto: Story = {args: {motion: 'auto'}};

/** One run of the story, then the still. */
export const Once: Story = {args: {motion: 'once'}};

/** Plays until paused: only next to a pause control, as here (WCAG 2.2.2). */
export const Loop: Story = {
  render: args => {
    const [paused, setPaused] = useState(false);
    return (
      <div style={{display: 'grid', justifyItems: 'start', gap: 12}}>
        <Illustration {...args} motion="loop" paused={paused} />
        <Button variant="secondary" onPress={() => setPaused(p => !p)}>
          {paused ? <Play size={16} aria-hidden /> : <Pause size={16} aria-hidden />}
          {paused ? 'Play' : 'Pause'}
        </Button>
      </div>
    );
  }
};

/**
 * Still until the pointer is over the card around it (`data-illustration-host`) or focus is inside it; each hover
 * starts the story again. The method picker's cards: the cover at rest, the story on hover.
 */
export const Hover: Story = {
  render: args => (
    <button
      type="button"
      data-illustration-host
      style={{
        display: 'grid',
        gap: 12,
        padding: 0,
        width: 320,
        textAlign: 'start',
        font: 'var(--gv-type-ui-strong)',
        color: 'var(--gv-text-primary)',
        background: 'var(--gv-surface-panel)',
        border: '1px solid var(--gv-border-default)',
        borderRadius: 'var(--gv-radius-12)',
        overflow: 'hidden',
        cursor: 'pointer'
      }}>
      <Illustration {...args} motion="hover" size={320} height={168} />
      <span style={{padding: '0 16px 16px'}}>Ideation and geo mapping</span>
    </button>
  )
};

export const Still: Story = {args: {motion: 'still'}};

/** The intended widths of each drawing (its `data-sizes`). */
export const Sizes: Story = {
  render: () => (
    <div style={{display: 'grid', gap: 32}}>
      {illustrations.map(i => (
        <div key={i.name} style={{display: 'flex', gap: 24, alignItems: 'flex-end'}}>
          {i.sizes.map(w => (
            <figure key={w} style={{margin: 0}}>
              <Illustration name={i.name} size={w} motion="still" />
              <figcaption style={caption}>
                {i.name} · {w}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  )
};

/** A method scene cropped to its cover band, as the method picker's card shows it at rest: 320 × 168. */
export const Cover: Story = {
  args: {name: 'survey-pages', motion: 'still', size: 320, height: 168}
};

/** Says something the text around it doesn't: then it is an image with a name. Without `alt` it is decoration. */
export const WithAlt: Story = {
  name: 'With alt',
  args: {
    name: 'proposal-threshold',
    motion: 'still',
    alt: 'A proposal with 128 of 300 votes and 34 days left to reach its threshold'
  }
};

/** How long each story runs, from the loop motion token. */
export const Timings: Story = {
  render: () => (
    <table style={{font: 'var(--gv-type-ui)', color: 'var(--gv-text-primary)', borderCollapse: 'collapse'}}>
      <tbody>
        {illustrations.map(i => (
          <tr key={i.name}>
            <td style={{padding: '4px 16px 4px 0'}}>{i.name}</td>
            <td style={{padding: '4px 16px 4px 0', color: 'var(--gv-text-secondary)'}}>
              {i.loops ? `${i.loops} loops · ${+cycleSeconds(i).toFixed(2)} s` : 'still'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
};

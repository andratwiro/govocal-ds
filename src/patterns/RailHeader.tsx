'use client';
import {PanelLeft, Plus} from 'lucide-react';
import {Heading} from 'react-aria-components/Heading';
import type {ReactNode} from 'react';
import {IconButton} from '../components/gv/IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import {mergeLabels} from '../components/labels';
import './RailHeader.css';

/** The words Rail header says itself (docs/API.md rule 11): its buttons' names. */
export interface RailHeaderLabels {
  /** The + button's name. */
  add: string;
  /** The hide-panel button's name. */
  togglePanel: string;
}

/** Rail header's English words; a page passes its own over them with `labels`. */
export const railHeaderLabels: RailHeaderLabels = {add: 'Add a phase', togglePanel: 'Hide the participation rail'};

export interface RailHeaderProps extends PlacementProps {
  /** Section title, e.g. "Participation". */
  title: ReactNode;
  /**
   * The title's heading level, so people can jump to the rail. A page owns its h1.
   *
   * @default 2
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Called when the add (+) action is pressed. Omit to hide the action. */
  onAdd?: () => void;
  /**
   * Called when the hide-panel action is pressed. Omit to hide it. Not in
   * Figma: the prototype puts it before the +.
   */
  onTogglePanel?: () => void;
  /** Its own words (the + and hide-panel buttons' names), over `railHeaderLabels`. */
  labels?: Partial<RailHeaderLabels>;
}

/**
 * The rail's header row: 18 tall (Figma), its 28 buttons hanging 5 above and
 * below and 6 past the right edge so their icons line up with the rail.
 */
export function RailHeader({
  title,
  headingLevel = 2,
  onAdd,
  onTogglePanel,
  labels,
  className,
  style
}: RailHeaderProps) {
  const l = mergeLabels(railHeaderLabels, labels);
  return (
    <div className={clsx('gv-rail-header', className)} style={style}>
      <Heading level={headingLevel} className="gv-rail-header__title">
        {title}
      </Heading>
      {(onAdd || onTogglePanel) && (
        <div className="gv-rail-header__actions">
          {onTogglePanel && (
            <IconButton onPress={onTogglePanel} aria-label={l.togglePanel}>
              <PanelLeft aria-hidden size={16} strokeWidth={1.75} />
            </IconButton>
          )}
          {onAdd && (
            <IconButton emphasis="strong" onPress={onAdd} aria-label={l.add}>
              <Plus aria-hidden size={16} strokeWidth={1.75} />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}

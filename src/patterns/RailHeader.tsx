'use client';
import {PanelLeft, Plus} from 'lucide-react';
import type {ReactNode} from 'react';
import {IconButton} from '../components/gv/IconButton';
import clsx from 'clsx';
import type {PlacementProps} from '../components/className';
import './RailHeader.css';

export interface RailHeaderProps extends PlacementProps {
  /** Section title, e.g. "Participation". */
  title: ReactNode;
  /** Called when the add (+) action is pressed. Omit to hide the action. */
  onAdd?: () => void;
  /** Accessible label for the add action. */
  addLabel?: string;
  /**
   * Called when the hide-panel action is pressed. Omit to hide it. Not in
   * Figma: the prototype puts it before the +.
   */
  onTogglePanel?: () => void;
  /** Accessible label for the hide-panel action. */
  togglePanelLabel?: string;
}

/**
 * The rail's header row: 18 tall (Figma), its 28 buttons hanging 5 above and
 * below and 6 past the right edge so their icons line up with the rail.
 */
export function RailHeader({
  title,
  onAdd,
  addLabel = 'Add',
  onTogglePanel,
  togglePanelLabel = 'Hide panel',
  className,
  style
}: RailHeaderProps) {
  return (
    <div className={clsx('gv-rail-header', className)} style={style}>
      <div className="gv-rail-header__title">{title}</div>
      {(onAdd || onTogglePanel) && (
        <div className="gv-rail-header__actions">
          {onTogglePanel && (
            <IconButton onPress={onTogglePanel} aria-label={togglePanelLabel}>
              <PanelLeft aria-hidden size={16} strokeWidth={1.75} />
            </IconButton>
          )}
          {onAdd && (
            <IconButton emphasis="strong" onPress={onAdd} aria-label={addLabel}>
              <Plus aria-hidden size={16} strokeWidth={1.75} />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}

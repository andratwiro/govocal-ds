'use client';
import {Plus} from 'lucide-react';
import type {ReactNode} from 'react';
import {IconButton} from './IconButton';
import './RailHeader.css';

export interface RailHeaderProps {
  /** Section title, e.g. "Participation". */
  title: ReactNode;
  /** Called when the add (+) action is pressed. Omit to hide the action. */
  onAdd?: () => void;
  /** Accessible label for the add action. */
  addLabel?: string;
}

export function RailHeader({title, onAdd, addLabel = 'Add'}: RailHeaderProps) {
  return (
    <div className="gv-rail-header">
      <div className="gv-rail-header__title">{title}</div>
      {onAdd && (
        <div className="gv-rail-header__actions">
          <IconButton tone="strong" onPress={onAdd} aria-label={addLabel}>
            <Plus aria-hidden size={16} />
          </IconButton>
        </div>
      )}
    </div>
  );
}

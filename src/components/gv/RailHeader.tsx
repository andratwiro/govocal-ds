'use client';
import {Button} from 'react-aria-components';
import {Plus} from 'lucide-react';
import type {ReactNode} from 'react';
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
          <Button className="gv-rail-header__icon-btn" onPress={onAdd} aria-label={addLabel}>
            <Plus aria-hidden size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';
import {useId, type ReactNode} from 'react';
import {Button} from 'react-aria-components/Button';
import clsx from 'clsx';
import {Badge} from '../components/gv/Badge';
import type {PlacementProps} from '../components/className';
import './MethodCard.css';

export interface MethodCardFeature {
  /** The feature's words ("Map pins", "Reactions and comments"). */
  label: string;
  /** The feature that sets this method apart ("Surveys can run in parallel with other methods"): a teal chip. */
  isHighlighted?: boolean;
}

export interface MethodCardProps extends PlacementProps {
  /** The method's name ("Ideation and geo mapping", "Survey"). Names the card. */
  title: string;
  /** One or two lines on what the method does. Read after the name. */
  description?: ReactNode;
  /** The picture on top: an `Illustration` of the method, which moves while the card is hovered or focused. */
  media?: ReactNode;
  /** What the method brings, as chips under the description. */
  features?: MethodCardFeature[];
  /** Creates a phase with this method. */
  onPress?: () => void;
  /** A method that can't be added here (not in the plan): greyed and inert. */
  isDisabled?: boolean;
}

/**
 * A participation method to start a phase with (the prototype's "New participation method" picker): a picture, the
 * method's name, a line on what it does and its feature chips. The whole card is one button; pressing it creates the
 * phase. An action, not a choice: nothing stays selected. Not in Figma.
 */
export function MethodCard({title, description, media, features, onPress, isDisabled, className, style}: MethodCardProps) {
  const id = useId();
  return (
    <Button
      className={clsx('gv-method-card', className)}
      style={style}
      onPress={onPress}
      isDisabled={isDisabled}
      aria-labelledby={`${id}-title`}
      aria-describedby={description != null ? `${id}-description` : undefined}
      data-illustration-host>
      {media != null && (
        <span className="gv-method-card__media" aria-hidden>
          {media}
        </span>
      )}
      <span className="gv-method-card__body">
        <span className="gv-method-card__title" id={`${id}-title`}>
          {title}
        </span>
        {description != null && (
          <span className="gv-method-card__description" id={`${id}-description`}>
            {description}
          </span>
        )}
        {features != null && features.length > 0 && (
          <span className="gv-method-card__features">
            {features.map(f => (
              <Badge key={f.label} isSelected={f.isHighlighted}>
                {f.label}
              </Badge>
            ))}
          </span>
        )}
      </span>
    </Button>
  );
}

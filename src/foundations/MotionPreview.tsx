import type {CSSProperties} from 'react';
import './MotionPreview.css';

// The Motion page's preview for a duration token (storybook-design-token's Animation presenter wants a whole
// `animation` value, not a duration): a bar that fills over the token when its row is hovered, on the token itself,
// so it follows reduced motion like everything else. The loop token pulses instead.
export function MotionDurationPreview({token}: {token: {name: string}}) {
  return (
    <div className="gv-motion-preview" data-loop={token.name.endsWith('-loop') || undefined} aria-hidden="true"
      style={{'--gv-motion-preview-duration': `var(${token.name})`} as CSSProperties}>
      <div className="gv-motion-preview__track"><div className="gv-motion-preview__bar" /></div>
    </div>
  );
}

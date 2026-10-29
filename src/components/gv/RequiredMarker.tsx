import './RequiredMarker.css';

export interface RequiredMarkerProps {
  /** Figma `Placement`: Card sits in a card's footer row, Field sits beside a form field. */
  placement?: 'card' | 'field';
}

/** Required marker (Figma node 14:878): a small dot + "Required" label. Display-only. */
export function RequiredMarker({placement = 'field'}: RequiredMarkerProps) {
  return (
    <span className="gv-required" data-placement={placement}>
      <span className="gv-required-dot" aria-hidden="true" />
      Required
    </span>
  );
}

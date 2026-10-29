import './Required.css';

export interface RequiredProps {
  /** Figma `Placement`: Card sits in a card's footer row, Field sits beside a form field. */
  placement?: 'card' | 'field';
}

/** Tali's Required (Figma node 14:878): a small dot + "Required" label. Display-only. */
export function Required({placement = 'field'}: RequiredProps) {
  return (
    <span className="gv-required" data-placement={placement}>
      <span className="gv-required-dot" aria-hidden="true" />
      Required
    </span>
  );
}

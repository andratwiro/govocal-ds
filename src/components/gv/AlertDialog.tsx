'use client';
import {type ReactNode, useState} from 'react';
import {Heading} from 'react-aria-components';
import {TriangleAlert, CircleMinus, CircleAlert, CircleCheck, type LucideIcon} from 'lucide-react';
import {Dialog} from 'react-aria-components/Dialog';
import {Modal as StarterModal} from '../Modal';
import {Button} from '../Button';
import {TextField} from '../TextField';
import './AlertDialog.css';

const IMPACT_ICON: Record<'danger' | 'caution' | 'safe', LucideIcon> = {
  danger: CircleMinus,
  caution: CircleAlert,
  safe: CircleCheck
};

export interface AlertDialogImpactRow {
  tone: 'danger' | 'caution' | 'safe';
  title: string;
  description: string;
}

export interface AlertDialogProps {
  /**
   * `danger` shows the warning-triangle icon badge and a danger confirm button. `neutral` shows
   * neither (a plain confirm, e.g. "Download the results (PDF)").
   *
   * @default 'neutral'
   */
  tone?: 'neutral' | 'danger';
  /** Overrides the tone's icon badge; `null` hides it even for `tone="danger"`. */
  icon?: ReactNode | null;
  /** The question, e.g. "Reset all participation data?". */
  title: string;
  /** The consequence, in words. */
  children: ReactNode;
  /** Rows before the confirm: a tone icon, a title and a description (the Edit form warning). */
  impact?: AlertDialogImpactRow[];
  /**
   * Type-to-confirm: the confirm button stays disabled until this exact text is typed. Only for
   * confirms that lose data for good (§C).
   */
  confirmText?: {
    /** "Type **Reset** to confirm" — the word to type, read out after "Type " and before " to confirm". */
    match: string;
    placeholder?: string;
  };
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Close on a click outside, same as Esc (both act as Cancel). @default true */
  isDismissable?: boolean;
}

/**
 * A destructive or high-stakes confirm: `role="alertdialog"`, no ×, Esc acts as Cancel, focus
 * starts on Cancel (§C). Not Modal: the shell, icon badge and type-to-confirm are its own, and it
 * never carries a head or a toolbar footer.
 */
export function AlertDialog({
  tone = 'neutral',
  icon,
  title,
  children,
  impact,
  confirmText,
  cancelLabel = 'Cancel',
  confirmLabel,
  onCancel,
  onConfirm,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = true
}: AlertDialogProps) {
  const [typed, setTyped] = useState('');
  const confirmBlocked = confirmText != null && typed !== confirmText.match;
  const resolvedIcon = icon === null ? null : (icon ?? (tone === 'danger' ? <TriangleAlert aria-hidden size={24} strokeWidth={1.75} /> : null));

  return (
    <StarterModal isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange} isDismissable={isDismissable}>
      <Dialog role="alertdialog" className="gv-alert-dialog">
        {resolvedIcon && (
          <div className="gv-alert-dialog__icon" data-tone={tone}>
            {resolvedIcon}
          </div>
        )}
        <Heading slot="title" className="gv-alert-dialog__title">
          {title}
        </Heading>
        <div className="gv-alert-dialog__body">{children}</div>
        {impact && impact.length > 0 && (
          <ul className="gv-alert-dialog__impact">
            {impact.map(row => {
              const RowIcon = IMPACT_ICON[row.tone];
              return (
                <li key={row.title} className="gv-alert-dialog__impact-row" data-tone={row.tone}>
                  <RowIcon aria-hidden size={18} strokeWidth={1.75} className="gv-alert-dialog__impact-icon" />
                  <span>
                    <span className="gv-alert-dialog__impact-title">{row.title}</span>
                    <span className="gv-alert-dialog__impact-description">{row.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {confirmText && (
          <div className="gv-alert-dialog__confirm-text">
            <p className="gv-alert-dialog__confirm-label">
              Type <strong>{confirmText.match}</strong> to confirm
            </p>
            <TextField
              aria-label={`Type ${confirmText.match} to confirm`}
              value={typed}
              onChange={setTyped}
              placeholder={confirmText.placeholder}
              autoFocus
            />
          </div>
        )}
        <div className="gv-alert-dialog__footer">
          <Button variant="quiet" slot="close" autoFocus={tone === 'danger' && !confirmText} onPress={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            tone={tone === 'danger' ? 'danger' : undefined}
            slot="close"
            isDisabled={confirmBlocked}
            onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </StarterModal>
  );
}

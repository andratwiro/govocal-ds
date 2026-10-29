'use client';
import {type ReactNode, useContext, useRef, useState} from 'react';
import {Heading, OverlayTriggerStateContext} from 'react-aria-components';
import {TriangleAlert, CircleMinus, CircleAlert, CircleCheck, type LucideIcon} from 'lucide-react';
import {Dialog} from '../Dialog';
import {Modal as StarterModal} from '../Modal';
import {Button} from '../Button';
import {TextField} from '../TextField';
import './AlertDialog.css';

const IMPACT_ICON: Record<AlertDialogImpactRow['tone'], LucideIcon> = {
  danger: CircleMinus,
  warning: CircleAlert,
  success: CircleCheck
};

export interface AlertDialogImpactRow {
  /** What the change does to the data: `danger` loses it, `warning` may skew it, `success` leaves it be. */
  tone: 'danger' | 'warning' | 'success';
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
  /** @default 'Cancel' */
  cancelLabel?: string;
  /** The confirm button's words: the action, e.g. "Delete input" (never "OK" or "Yes"). */
  confirmLabel: string;
  /** Called when it closes without a confirm: Cancel, Esc, or a click outside. Then it closes. */
  onCancel?: () => void;
  /** Called by the confirm button. Then it closes, as Cancel does. */
  onConfirm: () => void;
  /** Whether it shows (controlled). Pair it with `onOpenChange`; inside a `DialogTrigger`, leave both out. */
  isOpen?: boolean;
  /** Whether it shows first (uncontrolled). */
  defaultOpen?: boolean;
  /** Called with `false` whenever it closes: after `onConfirm` or `onCancel`. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Close on a click outside, same as Esc (both act as Cancel). @default true */
  isDismissable?: boolean;
}

/**
 * Alert dialog: a destructive or high-stakes confirm, `role="alertdialog"`, with no ×.
 *
 * - **Both buttons close it.** Confirm calls `onConfirm`, Cancel (or Esc, or a click outside) calls `onCancel`; then
 *   it closes and `onOpenChange(false)` follows. A confirm that may fail and must stay open controls `isOpen` and
 *   keeps it `true` in `onOpenChange` until the work is done.
 * - **Focus** starts on Cancel for `tone="danger"`, on the text field for type-to-confirm (`confirmText`), and on the
 *   dialog itself otherwise (Tab reaches Cancel first). It goes back to what opened it when it closes.
 * - **Opening:** control it with `isOpen` / `onOpenChange` (a row's Delete, a Selection bar action), or put it in a
 *   `DialogTrigger` beside its button.
 * - It takes no `className`: it sits centred over the page. Not Modal: the shell, icon badge and type-to-confirm are
 *   its own, and it never carries a head or a toolbar footer.
 *
 * ```tsx
 * <AlertDialog tone="danger" title="Delete this input?" confirmLabel="Delete input"
 *   isOpen={toDelete !== null} onOpenChange={open => !open && setToDelete(null)} onConfirm={deleteIt}>
 *   The input and its comments will be deleted. This cannot be undone.
 * </AlertDialog>
 * ```
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
  // Set by Confirm while it closes the dialog: every other close is a Cancel.
  const confirming = useRef(false);
  // Open state: the page's (isOpen), its own (defaultOpen, or nothing around it), or the DialogTrigger's around it.
  // The modal always gets it as isOpen, so every close passes through `change`, the trigger's included.
  const trigger = useContext(OverlayTriggerStateContext);
  const [own, setOwn] = useState(Boolean(defaultOpen));
  const byTrigger = isOpen === undefined && defaultOpen === undefined && trigger != null;
  const shown = isOpen ?? (byTrigger ? trigger.isOpen : own);
  const change = (open: boolean) => {
    if (!open && !confirming.current) onCancel?.();
    if (byTrigger) trigger.setOpen(open);
    else if (isOpen === undefined) setOwn(open);
    onOpenChange?.(open);
  };
  const confirmBlocked = confirmText != null && typed !== confirmText.match;
  const resolvedIcon = icon === null ? null : (icon ?? (tone === 'danger' ? <TriangleAlert aria-hidden size={24} strokeWidth={1.75} /> : null));

  return (
    <StarterModal isOpen={shown} onOpenChange={change} isDismissable={isDismissable}>
      <Dialog role="alertdialog" className="gv-alert-dialog">
        {({close}) => (
          <>
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
              <Button variant="quiet" autoFocus={tone === 'danger' && !confirmText} onPress={close}>
                {cancelLabel}
              </Button>
              <Button
                variant="primary"
                tone={tone === 'danger' ? 'danger' : undefined}
                isDisabled={confirmBlocked}
                onPress={() => {
                  confirming.current = true;
                  onConfirm();
                  close();
                  confirming.current = false;
                }}>
                {confirmLabel}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </StarterModal>
  );
}

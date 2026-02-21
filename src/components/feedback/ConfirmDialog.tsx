import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  loading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) => {
  const buttonVariant = variant === 'danger' ? 'danger' : variant === 'warning' ? 'primary' : 'primary';

  const iconColor = {
    danger: 'bg-error-50 text-error-500',
    primary: 'bg-primary-50 text-primary-500',
    warning: 'bg-warning-50 text-warning-500',
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className={`w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center mx-auto mb-4`}>
          {variant === 'danger' ? (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-semibold text-neutral-600 mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={buttonVariant} size="md" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

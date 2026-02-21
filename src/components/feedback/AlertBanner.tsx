import type { ReactNode } from 'react';
import { useState } from 'react';
import { MdClose, MdInfo, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  message: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: ReactNode }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: <MdInfo className="w-5 h-5 text-blue-500" />,
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-700',
    icon: <MdCheckCircle className="w-5 h-5 text-success-500" />,
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-700',
    icon: <MdWarning className="w-5 h-5 text-warning-500" />,
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    text: 'text-error-500',
    icon: <MdError className="w-5 h-5 text-error-500" />,
  },
};

const AlertBanner = ({
  variant = 'info',
  message,
  dismissible = true,
  action,
  className = '',
}: AlertBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const styles = variantStyles[variant];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border
        ${styles.bg} ${styles.border} ${styles.text}
        ${className}
      `}
    >
      <span className="flex-shrink-0">{styles.icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="flex-shrink-0 text-sm font-semibold underline underline-offset-2 hover:no-underline"
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        >
          <MdClose className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;

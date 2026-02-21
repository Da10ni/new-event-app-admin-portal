import type { ReactNode } from 'react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
          <span className="text-neutral-300 text-3xl">{icon}</span>
        </div>
      )}
      <h3 className="text-base font-semibold text-neutral-600 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-400 text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

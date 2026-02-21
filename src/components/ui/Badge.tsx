import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-neutral-100', text: 'text-neutral-500', dot: 'bg-neutral-400' },
  primary: { bg: 'bg-primary-50', text: 'text-primary-600', dot: 'bg-primary-500' },
  success: { bg: 'bg-success-50', text: 'text-success-600', dot: 'bg-success-500' },
  warning: { bg: 'bg-warning-50', text: 'text-warning-600', dot: 'bg-warning-500' },
  error: { bg: 'bg-error-50', text: 'text-error-500', dot: 'bg-error-500' },
  info: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
};

const Badge = ({
  children,
  variant = 'default',
  dot = false,
  className = '',
}: BadgeProps) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
        text-xs font-medium ${styles.bg} ${styles.text}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;

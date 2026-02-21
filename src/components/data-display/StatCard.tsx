import type { ReactNode } from 'react';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

type StatVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  variant?: StatVariant;
  className?: string;
}

const barColors: Record<StatVariant, string> = {
  default: 'bg-neutral-400',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-blue-500',
};

const iconBgColors: Record<StatVariant, string> = {
  default: 'bg-neutral-100',
  primary: 'bg-primary-50',
  success: 'bg-success-50',
  warning: 'bg-warning-50',
  error: 'bg-error-50',
  info: 'bg-blue-50',
};

const iconTextColors: Record<StatVariant, string> = {
  default: 'text-neutral-400',
  primary: 'text-primary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  info: 'text-blue-500',
};

const StatCard = ({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  className = '',
}: StatCardProps) => {
  return (
    <div className={`stat-card ${className}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${barColors[variant]}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-600 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.direction === 'up' ? (
                <MdTrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <MdTrendingDown className="w-4 h-4 text-error-500" />
              )}
              <span
                className={`text-xs font-semibold ${
                  trend.direction === 'up' ? 'text-success-500' : 'text-error-500'
                }`}
              >
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-neutral-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColors[variant]}`}
          >
            <span className={iconTextColors[variant]}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

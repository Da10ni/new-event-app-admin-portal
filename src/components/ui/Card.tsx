import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({
  title,
  subtitle,
  action,
  className = '',
}: CardHeaderProps) => {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-neutral-600">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return <div className={`mt-4 ${className}`}>{children}</div>;
};

const Card = ({ children, className = '', padding = true }: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-card overflow-hidden
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;

export default Card;

import type { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const FormSection = ({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) => {
  return (
    <div
      className={`border border-neutral-200 rounded-xl p-6 ${className}`}
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-neutral-600">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;

import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

const FormField = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}: FormFieldProps) => {
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-neutral-600 mb-1.5">
        {label}
        {required && <span className="text-error-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      {helpText && !error && (
        <p className="mt-1 text-xs text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

export default FormField;

import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconPosition = 'left', className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-600 mb-1.5"
          >
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full border rounded-lg px-4 py-2.5 text-sm text-neutral-600
              placeholder-neutral-300 transition-all
              focus:outline-none focus:ring-2 focus:border-transparent
              ${error
                ? 'border-error-500 focus:ring-error-500'
                : 'border-neutral-200 focus:ring-primary-500'
              }
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${props.disabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'}
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300">
              {icon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-xs text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

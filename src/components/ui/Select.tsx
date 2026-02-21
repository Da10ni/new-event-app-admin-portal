import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-600 mb-1.5"
          >
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full border rounded-lg px-4 py-2.5 text-sm text-neutral-600
            bg-white transition-all appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:border-transparent
            ${error
              ? 'border-error-500 focus:ring-error-500'
              : 'border-neutral-200 focus:ring-primary-500'
            }
            ${props.disabled ? 'bg-neutral-50 cursor-not-allowed' : ''}
            bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23717171%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
            bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]
            pr-10
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

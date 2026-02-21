import type { MouseEvent } from 'react';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MdSearch, MdClose, MdKeyboardArrowDown, MdCheck } from 'react-icons/md';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  multiple = false,
  disabled = false,
  className = '',
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedValues.includes(o.value)),
    [options, selectedValues]
  );

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : [];
        if (current.includes(optionValue)) {
          onChange(current.filter((v) => v !== optionValue));
        } else {
          onChange([...current, optionValue]);
        }
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearch('');
      }
    },
    [multiple, value, onChange]
  );

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
    setSearch('');
  };

  const handleRemoveTag = (optionValue: string, e: MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  const hasValue = selectedValues.length > 0;

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-600 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        className={`
          relative flex items-center flex-wrap gap-1.5 min-h-[42px] border rounded-lg px-3 py-2 cursor-pointer
          transition-all
          ${disabled ? 'bg-neutral-50 cursor-not-allowed' : 'bg-white'}
          ${error ? 'border-error-500' : isOpen ? 'border-primary-500 ring-2 ring-primary-500' : 'border-neutral-200 hover:border-neutral-300'}
        `}
      >
        {/* Tags (multiple mode) */}
        {multiple &&
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs font-medium"
            >
              {opt.label}
              <button
                onClick={(e) => handleRemoveTag(opt.value, e)}
                className="hover:text-primary-800"
              >
                <MdClose className="w-3 h-3" />
              </button>
            </span>
          ))}

        {/* Placeholder / Single Value */}
        {!multiple && hasValue && (
          <span className="text-sm text-neutral-600">{selectedOptions[0]?.label}</span>
        )}
        {!hasValue && !isOpen && (
          <span className="text-sm text-neutral-300">{placeholder}</span>
        )}

        {/* Icons */}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          {hasValue && !disabled && (
            <button
              onClick={handleClear}
              className="p-0.5 text-neutral-300 hover:text-neutral-500"
            >
              <MdClose className="w-4 h-4" />
            </button>
          )}
          <MdKeyboardArrowDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-dropdown border border-neutral-100 overflow-hidden animate-fade-in"
          style={{ width: containerRef.current?.offsetWidth }}
        >
          {/* Search input */}
          <div className="p-2 border-b border-neutral-100">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-neutral-300"
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-neutral-400 text-center">
                No results found
              </p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${isSelected ? 'text-primary-500 bg-primary-50' : 'text-neutral-500 hover:bg-neutral-50'}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <MdCheck className="w-4 h-4" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;

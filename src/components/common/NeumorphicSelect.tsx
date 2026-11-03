import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface NeumorphicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  helperText?: string;
}

export const NeumorphicSelect = React.forwardRef<HTMLSelectElement, NeumorphicSelectProps>(
  ({ label, error, options, helperText, className = '', id, required, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold mb-1.5 text-day-muted dark:text-night-muted uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            required={required}
            className={`
              neu-input appearance-none pr-10 font-medium cursor-pointer
              ${error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1C2534] text-day-text dark:text-night-text">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-day-muted dark:text-night-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-day-muted dark:text-night-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

NeumorphicSelect.displayName = 'NeumorphicSelect';


import React from 'react';

interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const NeumorphicInput = React.forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ label, error, icon, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold mb-1.5 text-day-muted dark:text-night-muted uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-day-muted dark:text-night-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`
              neu-input font-medium
              ${icon ? 'pl-11' : 'pl-4'}
              ${error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          />
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

NeumorphicInput.displayName = 'NeumorphicInput';


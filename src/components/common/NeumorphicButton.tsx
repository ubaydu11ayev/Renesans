import React from 'react';
import { Loader2 } from 'lucide-react';

interface NeumorphicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'pressed';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-9 px-3.5 text-xs rounded-xl gap-1.5',
    md: 'h-11 px-5 text-sm rounded-[14px] gap-2',
    lg: 'h-14 px-6 text-base rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary: 'neu-btn-primary font-semibold',
    secondary: 'neu-btn font-medium text-day-text dark:text-night-text',
    danger: 'neu-btn bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20',
    ghost: 'hover:bg-black/5 dark:hover:bg-white/5 text-day-muted dark:text-night-muted border-none shadow-none',
    pressed: 'neu-btn-pressed font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer outline-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};


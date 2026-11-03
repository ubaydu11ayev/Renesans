import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface NeumorphicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const NeumorphicModal: React.FC<NeumorphicModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col
          bg-[#E9EDF2] dark:bg-[#1C2534] rounded-[24px]
          neu-card overflow-hidden z-10 border border-white/50 dark:border-white/10
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/5 dark:border-white/5">
          <h3 className="text-lg font-bold text-day-text dark:text-night-text tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="neu-icon-btn w-9 h-9 rounded-xl text-day-muted dark:text-night-muted hover:text-red-500"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

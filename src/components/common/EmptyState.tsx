import React from 'react';
import { FolderOpen } from 'lucide-react';
import { NeumorphicButton } from './NeumorphicButton';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[22px]
        neu-surface border border-dashed border-day-border dark:border-night-border
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-2xl neu-card flex items-center justify-center text-day-accent dark:text-night-accent mb-4">
        {icon || <FolderOpen className="w-8 h-8 opacity-80" />}
      </div>
      <h4 className="text-base sm:text-lg font-bold text-day-text dark:text-night-text mb-1">
        {title}
      </h4>
      <p className="text-sm text-day-muted dark:text-night-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <NeumorphicButton variant="primary" onClick={onAction}>
          {actionText}
        </NeumorphicButton>
      )}
    </div>
  );
};


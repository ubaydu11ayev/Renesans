import React from 'react';
import { NeumorphicModal } from './NeumorphicModal';
import { NeumorphicButton } from './NeumorphicButton';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <NeumorphicModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-2xl neu-surface flex-shrink-0 ${isDanger ? 'text-red-500' : 'text-amber-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-day-muted dark:text-night-muted leading-relaxed pt-1">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
          <NeumorphicButton variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </NeumorphicButton>
          <NeumorphicButton
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </NeumorphicButton>
        </div>
      </div>
    </NeumorphicModal>
  );
};


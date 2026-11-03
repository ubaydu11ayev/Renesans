import React from 'react';
import { NeumorphicModal } from './NeumorphicModal';
import { NeumorphicButton } from './NeumorphicButton';
import { Payment } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, isOpen, onClose }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'naqd': return 'Naqd pul';
      case 'karta': return 'Plastik karta (Humo/UzCard)';
      case 'bank_otkazmasi': return 'Bank o‘tkazmasi';
      default: return method;
    }
  };

  return (
    <NeumorphicModal isOpen={isOpen} onClose={onClose} title="To‘lov kvitansiyasi (Chek)" maxWidth="md">
      <div id="printable-receipt" className="space-y-6">
        {/* Official Header */}
        <div className="text-center pb-4 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-black text-2xl tracking-tight text-day-accent dark:text-night-accent">
              Renessans
            </span>
          </div>
          <p className="text-xs font-semibold tracking-wide uppercase text-day-muted dark:text-night-muted">
            O‘quv markazi boshqaruv tizimi
          </p>
          <div className="mt-2 text-[11px] text-day-muted dark:text-night-muted">
            Yuridik shaxs: <strong className="text-day-text dark:text-night-text">“Sardoba language stars” MCHJ</strong>
          </div>
          <div className="mt-1 text-xs font-mono font-bold text-day-text dark:text-night-text">
            Chek № {payment.receiptNumber}
          </div>
        </div>

        {/* Status Callout */}
        <div className="p-3.5 rounded-xl neu-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">To‘lov qabul qilindi</p>
              <p className="text-[11px] text-day-muted dark:text-night-muted">{formatDateTime(payment.createdAt)}</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {payment.status === 'muvaffaqiyatli' ? 'TASDIQLANGAN' : 'BEKOR QILINGAN'}
          </span>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">O‘quvchi:</span>
            <span className="font-semibold text-day-text dark:text-night-text text-right">{payment.studentName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">Kurs va Guruh:</span>
            <span className="font-medium text-day-text dark:text-night-text text-right">{payment.courseName} — {payment.groupName}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">O‘quv davri (oy):</span>
            <span className="font-medium text-day-text dark:text-night-text">{payment.billingMonth}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">Hisoblangan summa:</span>
            <span className="font-medium text-day-text dark:text-night-text">{formatCurrency(payment.billedAmount)}</span>
          </div>

          {payment.discountAmount > 0 && (
            <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5 text-amber-600 dark:text-amber-400">
              <span>Chegirma {payment.discountReason ? `(${payment.discountReason})` : ''}:</span>
              <span className="font-medium">- {formatCurrency(payment.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">To‘lov usuli:</span>
            <span className="font-medium text-day-text dark:text-night-text">{getMethodName(payment.paymentMethod)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-black/5 dark:border-white/5">
            <span className="text-day-muted dark:text-night-muted">Qabul qildi:</span>
            <span className="font-medium text-day-text dark:text-night-text">{payment.receivedByName}</span>
          </div>

          {/* Grand total paid */}
          <div className="flex justify-between items-center pt-2 text-base font-bold">
            <span className="text-day-text dark:text-night-text">To‘langan summa:</span>
            <span className="text-xl text-day-accent dark:text-night-accent font-extrabold">
              {formatCurrency(payment.paidAmount)}
            </span>
          </div>
        </div>

        {/* Security badge and official verification */}
        <div className="pt-2 text-center text-[11px] text-day-muted dark:text-night-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-day-accent dark:text-night-accent" />
          <span>Ushbu chek elektron ravishda tasdiqlangan va rasmiy hisoblanadi.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
          <NeumorphicButton variant="secondary" onClick={onClose}>
            Yopish
          </NeumorphicButton>
          <NeumorphicButton variant="primary" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Chop etish
          </NeumorphicButton>
        </div>
      </div>
    </NeumorphicModal>
  );
};


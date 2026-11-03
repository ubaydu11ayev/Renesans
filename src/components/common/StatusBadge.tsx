import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, UserCheck, UserX, MinusCircle } from 'lucide-react';

export type StatusType =
  | 'tolangan'
  | 'qisman'
  | 'qarzdor'
  | 'ortiqcha'
  | 'faol'
  | 'rejalashtirilgan'
  | 'yakunlangan'
  | 'muzlatilgan'
  | 'ketgan'
  | 'keldi'
  | 'kelmadi'
  | 'kechikdi'
  | 'sababli';

interface StatusBadgeProps {
  status: StatusType | string;
  customLabel?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel, className = '' }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'tolangan':
    case 'to‘langan':
    case 'muvaffaqiyatli':
      return (
        <span className={`neu-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{customLabel || 'To‘langan'}</span>
        </span>
      );

    case 'qisman':
    case 'qisman to‘langan':
      return (
        <span className={`neu-badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{customLabel || 'Qisman to‘langan'}</span>
        </span>
      );

    case 'qarzdor':
    case 'xato':
    case 'bekor_qilingan':
      return (
        <span className={`neu-badge bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{customLabel || (normalized === 'bekor_qilingan' ? 'Bekor qilingan' : 'Qarzdor')}</span>
        </span>
      );

    case 'ortiqcha':
    case 'ortiqcha to‘lov':
      return (
        <span className={`neu-badge bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{customLabel || 'Ortiqcha to‘lov'}</span>
        </span>
      );

    case 'faol':
      return (
        <span className={`neu-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 ${className}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{customLabel || 'Faol'}</span>
        </span>
      );

    case 'rejalashtirilgan':
      return (
        <span className={`neu-badge bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 ${className}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{customLabel || 'Rejalashtirilgan'}</span>
        </span>
      );

    case 'yakunlangan':
      return (
        <span className={`neu-badge bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{customLabel || 'Yakunlangan'}</span>
        </span>
      );

    case 'muzlatilgan':
      return (
        <span className={`neu-badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ${className}`}>
          <MinusCircle className="w-3.5 h-3.5" />
          <span>{customLabel || 'Muzlatilgan'}</span>
        </span>
      );

    case 'ketgan':
      return (
        <span className={`neu-badge bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 ${className}`}>
          <UserX className="w-3.5 h-3.5" />
          <span>{customLabel || 'Ketgan'}</span>
        </span>
      );

    case 'keldi':
      return (
        <span className={`neu-badge bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 ${className}`}>
          <UserCheck className="w-3.5 h-3.5" />
          <span>{customLabel || 'Keldi'}</span>
        </span>
      );

    case 'kelmadi':
      return (
        <span className={`neu-badge bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 ${className}`}>
          <UserX className="w-3.5 h-3.5" />
          <span>{customLabel || 'Kelmadi'}</span>
        </span>
      );

    case 'kechikdi':
      return (
        <span className={`neu-badge bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 ${className}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{customLabel || 'Kechikdi'}</span>
        </span>
      );

    case 'sababli':
      return (
        <span className={`neu-badge bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/25 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{customLabel || 'Sababli'}</span>
        </span>
      );

    default:
      return (
        <span className={`neu-badge bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 ${className}`}>
          <span>{customLabel || status}</span>
        </span>
      );
  }
};


import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { formatDateTime } from '../../utils/formatters';
import { History, Search, ShieldCheck } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useData();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.userName.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.targetEntity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Amallar tarixi (Audit jurnali)
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Xavfsizlik va shaffoflik uchun tizimdagi barcha muhim o‘zgarishlar tarixi
        </p>
      </div>

      {/* Search */}
      <NeumorphicCard className="p-4 sm:p-5">
        <NeumorphicInput
          placeholder="Amal, foydalanuvchi yoki tafsilot bo‘yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </NeumorphicCard>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <NeumorphicCard className="p-8 text-center text-xs text-day-muted dark:text-night-muted">
          Hozircha audit yozuvlari mavjud emas.
        </NeumorphicCard>
      ) : (
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">Vaqt (Asia/Tashkent)</th>
                  <th className="py-4 px-4">Foydalanuvchi</th>
                  <th className="py-4 px-4">Amal turi</th>
                  <th className="py-4 px-4">Obyekt</th>
                  <th className="py-4 px-5">Tafsilotlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 font-mono text-day-muted dark:text-night-muted whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-day-text dark:text-night-text">{log.userName}</span>
                      <span className="ml-1 text-[10px] text-day-muted dark:text-night-muted uppercase">({log.userRole})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg neu-surface font-bold text-day-accent dark:text-night-accent">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-day-muted dark:text-night-muted">
                      {log.targetEntity}
                    </td>
                    <td className="py-3 px-5 text-day-text dark:text-night-text leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};


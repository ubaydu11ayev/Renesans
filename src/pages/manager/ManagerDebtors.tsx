import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, exportToCSV } from '../../utils/formatters';
import { AlertCircle, Search, Download, DollarSign, Phone } from 'lucide-react';

interface ManagerDebtorsProps {
  onOpenPaymentModal: () => void;
}

export const ManagerDebtors: React.FC<ManagerDebtorsProps> = ({ onOpenPaymentModal }) => {
  const { students, groups, courses, getStudentDebtForMonth } = useData();

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Debtors list
  const debtors = students
    .filter(s => s.status === 'faol')
    .map(student => {
      const debt = getStudentDebtForMonth(student.id, currentMonth);
      return { student, debt };
    })
    .filter(item => item.debt > 0)
    .filter(item => {
      const matchSearch =
        item.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        item.student.phone.toLowerCase().includes(search.toLowerCase());
      const matchGroup = selectedGroup
        ? item.student.enrollments.some(e => e.isActive && e.groupId === selectedGroup)
        : true;
      return matchSearch && matchGroup;
    })
    .sort((a, b) => b.debt - a.debt);

  const totalDebtSum = debtors.reduce((acc, curr) => acc + curr.debt, 0);

  const handleExportCSV = () => {
    const headers = ['O‘quvchi F.I.Sh.', 'Telefon', 'Ota-ona telefoni', 'Guruhlari', 'Qarzdorlik summasi (so‘m)'];
    const rows = debtors.map(d => [
      d.student.fullName,
      d.student.phone,
      d.student.parentPhone || '',
      d.student.enrollments.filter(e => e.isActive).map(e => e.groupName).join(', '),
      d.debt,
    ]);
    exportToCSV(`Renessans_Qarzdorlar_${currentMonth}`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Qarzdorlik nazorati ({debtors.length})
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Joriy oy ({currentMonth}) bo‘yicha to‘lovi kechikkan o‘quvchilar ro‘yxati
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NeumorphicButton
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Eksport
          </NeumorphicButton>
        </div>
      </div>

      {/* Total Debt Banner */}
      <div className="p-5 rounded-2xl neu-card bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl neu-surface flex items-center justify-center text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Jami undirilishi lozim bo‘lgan summa:
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {formatCurrency(totalDebtSum)}
            </div>
          </div>
        </div>
        <NeumorphicButton
          variant="primary"
          size="md"
          icon={<DollarSign className="w-4 h-4" />}
          onClick={onOpenPaymentModal}
        >
          To‘lov qabul qilish
        </NeumorphicButton>
      </div>

      {/* Filters */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NeumorphicInput
            placeholder="O‘quvchi ismi yoki telefoni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />

          <NeumorphicSelect
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={[
              { value: '', label: 'Barcha guruhlar' },
              ...groups.map(g => ({ value: g.id, label: g.name })),
            ]}
          />
        </div>
      </NeumorphicCard>

      {/* Debtors Table */}
      {debtors.length === 0 ? (
        <EmptyState
          title="Qarzdorlar mavjud emas"
          description="Ajoyib! Barcha o‘quvchilar ushbu oy uchun to‘lovlarni to‘liq amalga oshirishgan."
        />
      ) : (
        <NeumorphicCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5">O‘quvchi</th>
                  <th className="py-4 px-4">Telefon</th>
                  <th className="py-4 px-4">Ota-ona telefoni</th>
                  <th className="py-4 px-4">Guruhlari</th>
                  <th className="py-4 px-4">Qarz miqdori</th>
                  <th className="py-4 px-5 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {debtors.map((item) => (
                  <tr key={item.student.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-day-text dark:text-night-text">
                      {item.student.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-day-text dark:text-night-text">
                      <a href={`tel:${item.student.phone}`} className="hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3 text-day-muted" />
                        {item.student.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-day-muted dark:text-night-muted">
                      {item.student.parentPhone ? (
                        <a href={`tel:${item.student.parentPhone}`} className="hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3 text-day-muted" />
                          {item.student.parentPhone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-day-muted dark:text-night-muted">
                      {item.student.enrollments.filter(e => e.isActive).map(e => e.groupName).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.debt)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <NeumorphicButton
                        variant="primary"
                        size="sm"
                        onClick={onOpenPaymentModal}
                      >
                        To‘lov olish
                      </NeumorphicButton>
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


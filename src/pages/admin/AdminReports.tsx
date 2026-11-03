import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { formatCurrency, exportToCSV, exportToExcel } from '../../utils/formatters';
import { BarChart3, Download, Filter, TrendingUp, AlertCircle, DollarSign, Calendar, FileSpreadsheet } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { courses, groups, teachers, students, payments } = useData();

  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [reportType, setReportType] = useState<'kurs' | 'guruh' | 'oqituvchi'>('guruh');

  // Compute breakdown by groups
  const groupStats = groups
    .filter(g => {
      const matchCourse = selectedCourseId ? g.courseId === selectedCourseId : true;
      const matchTeacher = selectedTeacherId ? g.teacherId === selectedTeacherId : true;
      return matchCourse && matchTeacher;
    })
    .map(group => {
      // Billed
      let billed = 0;
      let activeStudentsInGroup = 0;

      students.forEach(st => {
        if (st.status === 'faol') {
          const en = st.enrollments.find(e => e.groupId === group.id && e.isActive);
          if (en) {
            activeStudentsInGroup++;
            billed += Math.max(0, group.monthlyPrice - (en.customDiscount || 0));
          }
        }
      });

      // Paid
      const paid = payments
        .filter(p => p.groupId === group.id && p.billingMonth === selectedMonth && p.status === 'muvaffaqiyatli')
        .reduce((sum, p) => sum + p.paidAmount, 0);

      const debt = Math.max(0, billed - paid);
      const collectionRate = billed > 0 ? Math.round((paid / billed) * 100) : (paid > 0 ? 100 : 0);

      return {
        group,
        activeStudentsInGroup,
        billed,
        paid,
        debt,
        collectionRate,
      };
    });

  // Totals
  const totalBilled = groupStats.reduce((acc, curr) => acc + curr.billed, 0);
  const totalPaid = groupStats.reduce((acc, curr) => acc + curr.paid, 0);
  const totalDebt = groupStats.reduce((acc, curr) => acc + curr.debt, 0);
  const overallRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  const handleExportExcel = () => {
    const headers = [
      'Guruh nomi',
      'Kurs yo‘nalishi',
      'O‘qituvchi',
      'O‘quvchilar soni',
      'Hisoblangan summa (so‘m)',
      'Kelib tushgan to‘lov (so‘m)',
      'Qarzdorlik (so‘m)',
      'To‘lov ko‘rsatkichi',
    ];
    const rows = groupStats.map(s => [
      s.group.name,
      s.group.courseName,
      s.group.teacherName,
      s.activeStudentsInGroup,
      formatCurrency(s.billed),
      formatCurrency(s.paid),
      formatCurrency(s.debt),
      `${s.collectionRate}%`,
    ]);
    exportToExcel(
      `Renessans_Hisobot_${selectedMonth}`,
      headers,
      rows,
      `“Renessans” O‘quv Markazi — ${selectedMonth} oyi moliyaviy hisoboti`
    );
  };

  const handleExportCSV = () => {
    const headers = ['Guruh', 'Kurs', 'O‘qituvchi', 'O‘quvchilar soni', 'Hisoblangan (so‘m)', 'Kelib tushgan (so‘m)', 'Qarzdorlik (so‘m)', 'Yig‘ilish foizi'];
    const rows = groupStats.map(s => [
      s.group.name,
      s.group.courseName,
      s.group.teacherName,
      s.activeStudentsInGroup,
      s.billed,
      s.paid,
      s.debt,
      `${s.collectionRate}%`,
    ]);
    exportToCSV(`Renessans_Hisobot_${selectedMonth}`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
            Moliyaviy va tahliliy hisobotlar
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
            Guruhlar, kurslar va o‘qituvchilar kesimida to‘lovlar tahlili
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={handleExportExcel}
          >
            Excel jadval (.xls)
          </NeumorphicButton>
          <NeumorphicButton
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            CSV
          </NeumorphicButton>
        </div>
      </div>

      {/* Filter bar */}
      <NeumorphicCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeumorphicInput
            label="Hisobot oyi"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />

          <NeumorphicSelect
            label="Kurs bo‘yicha filtr"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            options={[
              { value: '', label: 'Barcha kurslar' },
              ...courses.map(c => ({ value: c.id, label: c.name })),
            ]}
          />

          <NeumorphicSelect
            label="O‘qituvchi bo‘yicha filtr"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            options={[
              { value: '', label: 'Barcha o‘qituvchilar' },
              ...teachers.map(t => ({ value: t.id, label: t.fullName })),
            ]}
          />
        </div>
      </NeumorphicCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NeumorphicCard className="p-5">
          <span className="text-xs font-bold text-day-muted dark:text-night-muted uppercase">
            Jami hisoblangan
          </span>
          <div className="text-2xl font-black text-day-text dark:text-night-text mt-1.5">
            {formatCurrency(totalBilled)}
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Kutilayotgan reja
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
            Kelib tushgan tushum
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Haqiqiy to‘lovlar
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase">
            Jami qarzdorlik
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5">
            {formatCurrency(totalDebt)}
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Undirilmagan summa
          </p>
        </NeumorphicCard>

        <NeumorphicCard className="p-5">
          <span className="text-xs font-bold text-day-accent dark:text-night-accent uppercase">
            Yig‘ilish ko‘rsatkichi
          </span>
          <div className="text-2xl font-black text-day-accent dark:text-night-accent mt-1.5">
            {overallRate}%
          </div>
          <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
            Moliya ijrosi
          </p>
        </NeumorphicCard>
      </div>

      {/* Detailed Table */}
      <NeumorphicCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Guruh nomi</th>
                <th className="py-4 px-4">Kurs & O‘qituvchi</th>
                <th className="py-4 px-4">Faol o‘quvchilar</th>
                <th className="py-4 px-4">Hisoblangan</th>
                <th className="py-4 px-4">Kelib tushgan</th>
                <th className="py-4 px-4">Qarzdorlik</th>
                <th className="py-4 px-5 text-right">Ijro foizi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
              {groupStats.map((item) => (
                <tr key={item.group.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5 font-bold text-day-text dark:text-night-text">
                    {item.group.name}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-day-text dark:text-night-text">{item.group.courseName}</div>
                    <div className="text-day-muted dark:text-night-muted">{item.group.teacherName}</div>
                  </td>
                  <td className="py-3.5 px-4 text-day-text dark:text-night-text">
                    {item.activeStudentsInGroup} ta
                  </td>
                  <td className="py-3.5 px-4 text-day-text dark:text-night-text">
                    {formatCurrency(item.billed)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.paid)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(item.debt)}
                  </td>
                  <td className="py-3.5 px-5 text-right font-black">
                    <span className={`px-2.5 py-1 rounded-xl neu-surface text-xs ${
                      item.collectionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : item.collectionRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.collectionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  );
};


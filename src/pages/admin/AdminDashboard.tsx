import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Users,
  Layers,
  TrendingUp,
  AlertCircle,
  Calendar,
  CreditCard,
  BookOpen,
  ArrowUpRight,
  DollarSign,
  Plus,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { Payment } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenPaymentModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenPaymentModal,
}) => {
  const {
    students,
    groups,
    teachers,
    courses,
    payments,
    getFinancialSummaryForMonth,
    getGroupStudentCount,
  } = useData();

  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const financialStats = getFinancialSummaryForMonth(currentMonth);

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  // Active counts
  const activeStudentsCount = students.filter(s => s.status === 'faol').length;
  const activeGroupsCount = groups.filter(g => g.status === 'faol').length;

  // Debtors calculation
  const debtorsList = students
    .filter(s => s.status === 'faol')
    .map(s => {
      let billed = 0;
      s.enrollments.forEach(en => {
        if (en.isActive) {
          const grp = groups.find(g => g.id === en.groupId);
          if (grp && grp.status === 'faol') {
            billed += Math.max(0, grp.monthlyPrice - (en.customDiscount || 0));
          }
        }
      });
      const paid = payments
        .filter(p => p.studentId === s.id && p.billingMonth === currentMonth && p.status === 'muvaffaqiyatli')
        .reduce((sum, p) => sum + p.paidAmount, 0);

      const debt = Math.max(0, billed - paid);
      return { student: s, billed, paid, debt };
    })
    .filter(item => item.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  // Today's lessons
  const dayOfWeekToday = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const todayLessons = groups
    .filter(g => g.status === 'faol')
    .flatMap(g =>
      g.schedule
        .filter(s => s.dayOfWeek === dayOfWeekToday)
        .map(s => ({ group: g, schedule: s }))
    )
    .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  // Recent payments (last 5)
  const recentPayments = payments
    .filter(p => p.status === 'muvaffaqiyatli')
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <NeumorphicCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full neu-surface text-day-accent dark:text-night-accent">
                Boshqaruv Markazi
              </span>
              <span className="text-xs text-day-muted dark:text-night-muted font-medium">
                {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-day-text dark:text-night-text tracking-tight mt-1">
              Xush kelibsiz, Administrator!
            </h2>
            <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted mt-0.5">
              “Sardoba language stars” MCHJ • O‘quv markazi faoliyatining boshqaruv paneli
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NeumorphicButton
              variant="secondary"
              size="md"
              icon={<Users className="w-4 h-4" />}
              onClick={onOpenAddStudent}
            >
              O‘quvchi qo‘shish
            </NeumorphicButton>
            <NeumorphicButton
              variant="primary"
              size="md"
              icon={<DollarSign className="w-4 h-4" />}
              onClick={onOpenPaymentModal}
            >
              To‘lov qabul qilish
            </NeumorphicButton>
          </div>
        </div>
      </NeumorphicCard>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Faol o'quvchilar */}
        <NeumorphicCard
          hoverable
          onClick={() => onNavigate('students')}
          className="relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-day-muted dark:text-night-muted">
                Faol o‘quvchilar
              </p>
              <h3 className="text-3xl font-black text-day-text dark:text-night-text mt-2">
                {activeStudentsCount}
              </h3>
              <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                Jami ro‘yxatda: {students.length} ta
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </NeumorphicCard>

        {/* Metric 2: Faol guruhlar */}
        <NeumorphicCard
          hoverable
          onClick={() => onNavigate('groups')}
          className="relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-day-muted dark:text-night-muted">
                Faol guruhlar
              </p>
              <h3 className="text-3xl font-black text-day-text dark:text-night-text mt-2">
                {activeGroupsCount}
              </h3>
              <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                Jami guruhlar: {groups.length} ta
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl neu-surface flex items-center justify-center text-indigo-500">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </NeumorphicCard>

        {/* Metric 3: Joriy oy tushumi */}
        <NeumorphicCard
          hoverable
          onClick={() => onNavigate('payments')}
          className="relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Kelib tushgan to‘lov
              </p>
              <div className="flex items-baseline gap-1 mt-2 whitespace-nowrap overflow-hidden">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-day-text dark:text-night-text tracking-tight">
                  {formatNumber(financialStats.paidAmount)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-day-muted dark:text-night-muted">
                  so‘m
                </span>
              </div>
              <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                Joriy oy tushumi
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl neu-surface flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </NeumorphicCard>

        {/* Metric 4: Qarzdorlik */}
        <NeumorphicCard
          hoverable
          onClick={() => onNavigate('payments')}
          className="relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Qarzdorlik
              </p>
              <div className="flex items-baseline gap-1 mt-2 whitespace-nowrap overflow-hidden">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatNumber(financialStats.debtAmount)}
                </span>
                <span className="text-xs sm:text-sm font-bold text-rose-500/80">
                  so‘m
                </span>
              </div>
              <p className="text-xs text-day-muted dark:text-night-muted mt-1">
                {debtorsList.length} ta o‘quvchida qarz bor
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl neu-surface flex items-center justify-center text-rose-500">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Secondary Financial Comparison Row (Hisoblangan vs Kelib tushgan vs Qarzdorlik) */}
      <NeumorphicCard className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
              Moliyaviy taqsimot ko‘rsatkichi ({currentMonth})
            </h4>
            <p className="text-xs text-day-muted dark:text-night-muted">
              O‘lchov birligi: O‘zbekiston so‘mi (UZS). Tizimdagi real hisob-kitoblar.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full neu-surface text-day-muted dark:text-night-muted">
            Davr: {currentMonth}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl neu-surface">
            <span className="text-xs font-semibold text-day-muted dark:text-night-muted uppercase">1. Hisoblangan to‘lov</span>
            <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap overflow-hidden">
              <span className="text-lg sm:text-xl font-black text-day-text dark:text-night-text">
                {formatNumber(financialStats.billedAmount)}
              </span>
              <span className="text-xs font-bold text-day-muted dark:text-night-muted">so‘m</span>
            </div>
            <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
              Guruh narxlari va chegirmalar asosida kutilayotgan summa
            </p>
          </div>

          <div className="p-5 rounded-2xl neu-surface border-l-4 border-emerald-500">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">2. Kelib tushgan to‘lov</span>
            <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap overflow-hidden">
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                {formatNumber(financialStats.paidAmount)}
              </span>
              <span className="text-xs font-bold text-emerald-500/80">so‘m</span>
            </div>
            <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
              Kassaga qabul qilingan haqiqiy to‘lovlar
            </p>
          </div>

          <div className="p-5 rounded-2xl neu-surface border-l-4 border-rose-500">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase">3. Qolgan qarzdorlik</span>
            <div className="flex items-baseline gap-1 mt-1.5 whitespace-nowrap overflow-hidden">
              <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                {formatNumber(financialStats.debtAmount)}
              </span>
              <span className="text-xs font-bold text-rose-500/80">so‘m</span>
            </div>
            <p className="text-[11px] text-day-muted dark:text-night-muted mt-1">
              To‘lanishi lozim bo‘lgan qoldiq summa
            </p>
          </div>
        </div>

        {/* Visual Progress Ratio */}
        {financialStats.billedAmount > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-day-muted dark:text-night-muted">To‘lov yig‘ilish foizi:</span>
              <span className="text-day-accent dark:text-night-accent">
                {Math.min(100, Math.round((financialStats.paidAmount / financialStats.billedAmount) * 100))}%
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full neu-tab-active overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-day-accent to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((financialStats.paidAmount / financialStats.billedAmount) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </NeumorphicCard>

      {/* Grid: Bugungi darslar & Oxirgi to'lovlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bugungi darslar */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                  Bugungi darslar jadvali
                </h4>
                <p className="text-xs text-day-muted dark:text-night-muted">
                  Bugun rejalashtirilgan barcha mashg‘ulotlar
                </p>
              </div>
            </div>
            <NeumorphicButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('schedule')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Jadval
            </NeumorphicButton>
          </div>

          {todayLessons.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl">
              <Calendar className="w-8 h-8 mx-auto text-day-muted dark:text-night-muted opacity-50 mb-2" />
              <p className="text-sm font-semibold text-day-text dark:text-night-text">
                Bugun darslar mavjud emas
              </p>
              <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                Dam olish kuni yoki dars jadvali kiritilmagan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayLessons.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 hover:translate-x-1 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-day-accent/10 text-day-accent dark:text-night-accent">
                      {item.schedule.startTime} - {item.schedule.endTime}
                    </span>
                    <div>
                      <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                        {item.group.name}
                      </h5>
                      <p className="text-xs text-day-muted dark:text-night-muted">
                        {item.group.teacherName} • {item.schedule.room}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md neu-tab-active text-day-muted dark:text-night-muted">
                    {getGroupStudentCount(item.group.id)} o‘quvchi
                  </span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>

        {/* Oxirgi to'lovlar */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-emerald-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                  Oxirgi qabul qilingan to‘lovlar
                </h4>
                <p className="text-xs text-day-muted dark:text-night-muted">
                  Kassaga kelib tushgan so‘nggi to‘lovlar
                </p>
              </div>
            </div>
            <NeumorphicButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('payments')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Barchasi
            </NeumorphicButton>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl">
              <CreditCard className="w-8 h-8 mx-auto text-day-muted dark:text-night-muted opacity-50 mb-2" />
              <p className="text-sm font-semibold text-day-text dark:text-night-text">
                Hali to‘lovlar qabul qilinmagan
              </p>
              <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                Birinchi to‘lovni qabul qilish uchun "To‘lov qabul qilish" tugmasini bosing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                      {p.studentName}
                    </h5>
                    <p className="text-xs text-day-muted dark:text-night-muted">
                      {p.groupName} • {formatDate(p.paymentDate)} • {p.receiptNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.paidAmount)}
                    </span>
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted dark:text-night-muted hover:text-day-accent"
                      title="Chekni ko‘rish"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>
      </div>

      {/* E'tibor talab qiladigan qarzdorliklar */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                E’tibor talab qiladigan qarzdorliklar
              </h4>
              <p className="text-xs text-day-muted dark:text-night-muted">
                {currentMonth} oyida to‘lovi to‘liq amalga oshirilmagan o‘quvchilar
              </p>
            </div>
          </div>
        </div>

        {debtorsList.length === 0 ? (
          <div className="p-8 text-center neu-surface rounded-2xl">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Qarzdorliklar mavjud emas
            </p>
            <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
              Barcha faol o‘quvchilar to‘lovlarini o‘z vaqtida amalga oshirgan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-xs text-day-muted dark:text-night-muted uppercase">
                  <th className="pb-3 pl-2">O‘quvchi</th>
                  <th className="pb-3">Telefon</th>
                  <th className="pb-3">Hisoblangan</th>
                  <th className="pb-3">To‘langan</th>
                  <th className="pb-3">Qarzdorlik</th>
                  <th className="pb-3 pr-2 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {debtorsList.slice(0, 5).map((d) => (
                  <tr key={d.student.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-2">
                      <div className="font-bold text-day-text dark:text-night-text">
                        {d.student.fullName}
                      </div>
                      <div className="text-xs text-day-muted dark:text-night-muted">
                        {d.student.enrollments.filter(e => e.isActive).map(e => e.groupName).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 text-day-muted dark:text-night-muted">
                      {d.student.phone || 'Kiritilmagan'}
                    </td>
                    <td className="py-3 text-day-text dark:text-night-text">
                      {formatCurrency(d.billed) }
                    </td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(d.paid)}
                    </td>
                    <td className="py-3 text-rose-600 dark:text-rose-400 font-bold">
                      {formatCurrency(d.debt)}
                    </td>
                    <td className="py-3 pr-2 text-right">
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
        )}
      </NeumorphicCard>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceiptPayment)}
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />
    </div>
  );
};


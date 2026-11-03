import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ReceiptModal } from '../../components/common/ReceiptModal';
import { formatCurrency, formatNumber, formatDate, formatDateTime } from '../../utils/formatters';
import { Payment } from '../../types';
import {
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  UserPlus,
  DollarSign,
  Users,
  Eye,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  PhoneCall,
  Sparkles,
  PhoneForwarded,
  Layers,
} from 'lucide-react';

interface ManagerDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAddStudent: () => void;
  onOpenPaymentModal: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenPaymentModal,
}) => {
  const {
    groups,
    students,
    payments,
    leads,
    communications,
    getGroupStudentCount,
    getStudentDebtForMonth,
  } = useData();

  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const dayOfWeekToday = new Date().getDay() === 0 ? 7 : new Date().getDay();

  // 1. Today's lessons
  const todayLessons = groups
    .filter(g => g.status === 'faol')
    .flatMap(g =>
      g.schedule
        .filter(s => s.dayOfWeek === dayOfWeekToday)
        .map(s => ({ group: g, schedule: s }))
    )
    .sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));

  // 2. Payments received today
  const paymentsToday = payments.filter(
    p => p.paymentDate === todayStr && p.status === 'muvaffaqiyatli'
  );
  const totalPaidToday = paymentsToday.reduce((sum, p) => sum + p.paidAmount, 0);

  // 3. Debtors list
  const debtorsList = students
    .filter(s => s.status === 'faol')
    .map(s => ({
      student: s,
      debt: getStudentDebtForMonth(s.id, currentMonth),
    }))
    .filter(item => item.debt > 0)
    .sort((a, b) => b.debt - a.debt);

  // 4. Students due for payment (all active students with debt)
  const duePaymentStudents = debtorsList.slice(0, 5);

  // 5. CRM Leads pending follow-up / trial lessons
  const newLeads = leads.filter(l => l.stage === 'yangi' || l.stage === 'aloqada');
  const trialLeads = leads.filter(l => l.stage === 'sinov_darsi');

  // 6. Parent follow-ups for today
  const todayCommunications = communications.filter(
    c => c.nextFollowUpDate === todayStr || c.resultStatus === 'kutilmoqda'
  ).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <div className="p-6 rounded-[24px] neu-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full neu-surface text-day-accent dark:text-night-accent">
              Menejer Operatsion Markazi
            </span>
            <span className="text-xs text-day-muted dark:text-night-muted font-medium">
              {formatDate(todayStr)}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-day-text dark:text-night-text mt-1">
            Menejer Ish Stoli
          </h3>
          <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted mt-0.5">
            “Sardoba language stars” MCHJ • Ota-onalar muloqoti, to‘lovlar va davomat nazorati
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <NeumorphicButton
            variant="secondary"
            size="md"
            icon={<PhoneCall className="w-4 h-4 text-emerald-500" />}
            onClick={() => onNavigate('communications')}
          >
            Ota-onalar bilan aloqa
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

      {/* Today's KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Faol o‘quvchilar */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 rounded-3xl neu-card cursor-pointer hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-day-accent dark:text-night-accent uppercase tracking-wider">
              Faol o‘quvchilar
            </span>
            <div className="w-8 h-8 rounded-xl neu-surface flex items-center justify-center text-day-accent">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-day-text dark:text-night-text mt-2">
            {students.filter(s => s.status === 'faol').length} nafar
          </div>
          <p className="text-[10px] text-day-muted dark:text-night-muted mt-1">
            Jami o‘quvchilar
          </p>
        </div>

        {/* 2. Faol guruhlar */}
        <div
          onClick={() => onNavigate('groups')}
          className="p-5 rounded-3xl neu-card cursor-pointer hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Faol guruhlar
            </span>
            <div className="w-8 h-8 rounded-xl neu-surface flex items-center justify-center text-indigo-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-day-text dark:text-night-text mt-2">
            {groups.filter(g => g.status === 'faol').length} ta
          </div>
          <p className="text-[10px] text-day-muted dark:text-night-muted mt-1">
            Dars o‘tilayotgan
          </p>
        </div>

        {/* 3. Bugungi darslar */}
        <div
          onClick={() => onNavigate('schedule')}
          className="p-5 rounded-3xl neu-card cursor-pointer hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-day-muted dark:text-night-muted uppercase tracking-wider">
              Bugungi darslar
            </span>
            <div className="w-8 h-8 rounded-xl neu-surface flex items-center justify-center text-day-accent">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-day-text dark:text-night-text mt-2">
            {todayLessons.length} ta
          </div>
          <p className="text-[10px] text-day-muted dark:text-night-muted mt-1">
            Xonalar bo‘yicha jadval
          </p>
        </div>

        {/* 4. Bugungi tushum */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-5 rounded-3xl neu-card cursor-pointer hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Bugungi tushum
            </span>
            <div className="w-8 h-8 rounded-xl neu-surface flex items-center justify-center text-emerald-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-2 whitespace-nowrap overflow-hidden">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatNumber(totalPaidToday)}
            </span>
            <span className="text-xs font-bold text-emerald-500/80">so‘m</span>
          </div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            {paymentsToday.length} ta chek
          </p>
        </div>

        {/* 5. Qarzdorlar */}
        <div
          onClick={() => onNavigate('debtors')}
          className="p-5 rounded-3xl neu-card cursor-pointer hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Qarzdorlar
            </span>
            <div className="w-8 h-8 rounded-xl neu-surface flex items-center justify-center text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {debtorsList.length} ta
          </div>
          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">
            Muddati kelgan to‘lovlar
          </p>
        </div>
      </div>

      {/* Guruhlar & Ota-onalar bilan aloqa Bloki */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faol guruhlar holati */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
                <Layers className="w-5 h-5 text-day-accent" />
                Faol guruhlar va darslar
              </h4>
              <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                Markazdagi ta’lim guruhlari holati
              </p>
            </div>
            <NeumorphicButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('groups')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Barcha guruhlar ({groups.length})
            </NeumorphicButton>
          </div>

          {groups.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
              Hozircha guruhlar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 4).map(group => (
                <div
                  key={group.id}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-day-text dark:text-night-text">
                      {group.name}
                    </div>
                    <div className="text-day-muted dark:text-night-muted flex items-center gap-2 mt-0.5">
                      <span>{group.courseName}</span>
                      <span>•</span>
                      <span>{group.teacherName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-day-accent/10 text-day-accent dark:text-night-accent">
                      {group.room}
                    </span>
                    <button
                      onClick={() => onNavigate('groups')}
                      className="neu-icon-btn w-8 h-8 rounded-lg text-day-muted hover:text-day-accent"
                      title="Guruhni ochish"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>

        {/* Ota-onalar bilan aloqa eslatmalari */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-500" />
                Ota-onalar bilan qayta aloqa eslatmalari
              </h4>
              <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
                Bugun qo‘ng‘iroq qilinishi kerak bo‘lgan ota-onalar
              </p>
            </div>
            <NeumorphicButton
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('communications')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Aloqa jurnali
            </NeumorphicButton>
          </div>

          {todayCommunications.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
              Bugunga rejalashtirilgan kechiktirilgan qo‘ng‘iroqlar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {todayCommunications.map(comm => (
                <div
                  key={comm.id}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-day-text dark:text-night-text">
                      {comm.studentName}
                    </div>
                    <div className="text-day-muted dark:text-night-muted flex items-center gap-2 mt-0.5">
                      <a
                        href={`tel:${comm.parentPhone}`}
                        className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        📞 {comm.parentPhone}
                      </a>
                    </div>
                    <p className="text-[11px] text-day-muted dark:text-night-muted mt-1 italic line-clamp-1">
                      “{comm.discussionNotes}”
                    </p>
                  </div>

                  <span className="px-2 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    Kutilmoqda
                  </span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>
      </div>

      {/* Grid: Bugungi darslar & Bugun qabul qilingan to'lovlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bugungi darslar */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-day-accent dark:text-night-accent" />
              Bugungi darslar jadvali
            </h4>
            <span className="text-xs font-bold text-day-muted dark:text-night-muted">
              {todayLessons.length} ta mashg‘ulot
            </span>
          </div>

          {todayLessons.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
              Bugun rejalashtirilgan darslar mavjud emas.
            </div>
          ) : (
            <div className="space-y-3">
              {todayLessons.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 hover:translate-x-1 transition-transform"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-day-accent dark:text-night-accent">
                      {item.schedule.startTime} - {item.schedule.endTime} • {item.schedule.room}
                    </span>
                    <h5 className="font-bold text-sm text-day-text dark:text-night-text mt-0.5">
                      {item.group.name}
                    </h5>
                    <p className="text-xs text-day-muted dark:text-night-muted">
                      {item.group.teacherName}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl neu-tab-active text-day-muted dark:text-night-muted">
                    {getGroupStudentCount(item.group.id)} o‘quvchi
                  </span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicCard>

        {/* Bugun qabul qilingan to'lovlar */}
        <NeumorphicCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Bugun qabul qilingan to‘lovlar ({paymentsToday.length})
            </h4>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalPaidToday)}
            </span>
          </div>

          {paymentsToday.length === 0 ? (
            <div className="p-8 text-center neu-surface rounded-2xl text-xs text-day-muted dark:text-night-muted">
              Bugun hali to‘lovlar qabul qilinmadi.
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsToday.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl neu-surface flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-day-text dark:text-night-text text-sm">
                      {p.studentName}
                    </div>
                    <div className="text-day-muted dark:text-night-muted">
                      {p.groupName} • {p.receiptNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
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

      {/* To'lov muddati kelgan o'quvchilar va Qarzdorlar */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              To‘lov muddati kelgan qarzdor o‘quvchilar
            </h4>
            <p className="text-xs text-day-muted dark:text-night-muted mt-0.5">
              Qo‘ng‘iroq qilish va to‘lovni eslatish uchun tezkor ro‘yxat
            </p>
          </div>
          <NeumorphicButton
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('debtors')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Barcha qarzdorlar
          </NeumorphicButton>
        </div>

        {duePaymentStudents.length === 0 ? (
          <div className="p-8 text-center neu-surface rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Barcha to‘lovlar amalga oshirilgan, qarzdorliklar mavjud emas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-black/5 dark:border-white/5 text-xs text-day-muted dark:text-night-muted uppercase">
                <tr>
                  <th className="pb-3 pl-2">O‘quvchi</th>
                  <th className="pb-3">Telefon</th>
                  <th className="pb-3">Ota-ona telefoni</th>
                  <th className="pb-3">Guruhlari</th>
                  <th className="pb-3">Qarzdorlik</th>
                  <th className="pb-3 pr-2 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {duePaymentStudents.map((item) => (
                  <tr key={item.student.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 pl-2 font-bold text-day-text dark:text-night-text">
                      {item.student.fullName}
                    </td>
                    <td className="py-3 text-day-text dark:text-night-text font-mono text-xs">
                      {item.student.phone}
                    </td>
                    <td className="py-3 text-day-muted dark:text-night-muted font-mono text-xs">
                      {item.student.parentPhone ? (
                        <a
                          href={`tel:${item.student.parentPhone}`}
                          className="font-bold text-day-accent hover:underline flex items-center gap-1"
                        >
                          📞 {item.student.parentPhone}
                        </a>
                      ) : (
                        'Kiritilmagan'
                      )}
                    </td>
                    <td className="py-3 text-xs text-day-muted dark:text-night-muted">
                      {item.student.enrollments.filter(e => e.isActive).map(e => e.groupName).join(', ')}
                    </td>
                    <td className="py-3 font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(item.debt)}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <NeumorphicButton
                          variant="secondary"
                          size="sm"
                          icon={<PhoneCall className="w-3.5 h-3.5" />}
                          onClick={() => onNavigate('communications')}
                        >
                          Eslatma
                        </NeumorphicButton>
                        <NeumorphicButton
                          variant="primary"
                          size="sm"
                          onClick={onOpenPaymentModal}
                        >
                          To‘lov olish
                        </NeumorphicButton>
                      </div>
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

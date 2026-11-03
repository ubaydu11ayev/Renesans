import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NeumorphicCard } from '../../components/common/NeumorphicCard';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { NeumorphicInput } from '../../components/common/NeumorphicInput';
import { NeumorphicSelect } from '../../components/common/NeumorphicSelect';
import { Save, Database, Download, CheckCircle2, ShieldCheck, DoorOpen } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    courses,
    teachers,
    groups,
    students,
    payments,
    attendanceRecords,
    rooms,
  } = useData();

  const [brandName, setBrandName] = useState(settings.brandName);
  const [officialEntityName, setOfficialEntityName] = useState(settings.officialEntityName);
  const [prorateRule, setProrateRule] = useState(settings.prorateRule);
  const [currency, setCurrency] = useState(settings.currency);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      brandName,
      officialEntityName,
      prorateRule,
      currency,
      academicYear,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      settings,
      courses,
      teachers,
      groups,
      students,
      payments,
      attendanceRecords,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Renessans_Server_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-xl font-black text-day-text dark:text-night-text tracking-tight">
          Tizim sozlamalari
        </h3>
        <p className="text-xs sm:text-sm text-day-muted dark:text-night-muted">
          Markaz brendi, yuridik ma’lumotlar, moliyaviy hisob-kitob qoidalari va server xavfsizligi
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <NeumorphicCard className="p-6">
        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <NeumorphicInput
              label="Brend nomi"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />

            <NeumorphicInput
              label="Rasmiy yuridik shaxs nomi (Hujjat va cheklar uchun)"
              value={officialEntityName}
              onChange={(e) => setOfficialEntityName(e.target.value)}
              helperText="Kvitansiya va rasmiy hujjatlarda ko‘rsatiladi"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <NeumorphicSelect
              label="Qisman oy hisobi qoidasi (Pro-rata)"
              value={prorateRule}
              onChange={(e) => setProrateRule(e.target.value as any)}
              options={[
                { value: 'calendar_days', label: 'Kalendar kunlari bo‘yicha' },
                { value: 'lessons_count', label: 'O‘tilgan darslar soni bo‘yicha' },
                { value: 'fixed_half', label: '15-sanagacha to‘liq, keyin yarmi' },
              ]}
              helperText="O‘quvchi oy o‘rtasida qo‘shilganda qo‘llaniladi"
            />

            <NeumorphicInput
              label="Valyuta belgisi"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />

            <NeumorphicInput
              label="O‘quv yili"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-3">
            <NeumorphicButton type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Sozlamalarni saqlash
            </NeumorphicButton>
          </div>
        </form>
      </NeumorphicCard>

      {/* Auditoriyalar va Xonalar Ro'yxati Card */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
                Dars auditoriyalari ({rooms.length} ta xona)
              </h4>
              <p className="text-xs text-day-muted dark:text-night-muted">
                Standart 1-xonadan 7-xonagacha auditoriyalar va qo‘shilgan yangi xonalar
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
          {rooms.map((r) => (
            <div key={r.id} className="p-3 rounded-2xl neu-surface text-center">
              <p className="font-bold text-sm text-day-text dark:text-night-text">{r.name}</p>
              <p className="text-[11px] text-day-muted dark:text-night-muted mt-0.5">{r.capacity} o‘rin</p>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Server & Data Backup Card */}
      <NeumorphicCard className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl neu-surface flex items-center justify-center text-day-accent dark:text-night-accent">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-day-text dark:text-night-text">
              Server Ma’lumotlar Bazasi va Zaxira Nusxasi
            </h4>
            <p className="text-xs text-day-muted dark:text-night-muted">
              Barcha ma’lumotlar serverda xavfsiz JSON/SQLite formatida doimiy saqlanadi
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl neu-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h5 className="font-bold text-sm text-day-text dark:text-night-text">
                Server Zaxira Faylini Yuklab Olish (Backup)
              </h5>
            </div>
            <p className="text-xs text-day-muted dark:text-night-muted leading-relaxed">
              Barcha o‘quvchilar, guruhlar, kurslar, o‘qituvchilar va to‘lovlar tarixining to‘liq nusxasini 1-bosishda arxivlang.
            </p>
          </div>

          <NeumorphicButton
            variant="primary"
            size="md"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportJSON}
          >
            Zaxira nusxasi (JSON)
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
};

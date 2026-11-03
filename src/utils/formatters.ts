import { Group, LessonSchedule } from '../types';

/**
 * Format integer sum to Uzbek currency representation, e.g. "320 000 so‘m"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 so‘m';
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts} so‘m`;
}

/**
 * Format integer number with space separators, e.g. "1 130 000" (without "so‘m" suffix)
 */
export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Format ISO date string or Date object to DD.MM.YYYY
 */
export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Format ISO datetime string to DD.MM.YYYY, HH:mm
 */
export function formatDateTime(dateTimeStr: string | undefined): string {
  if (!dateTimeStr) return '—';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${mins}`;
  } catch {
    return dateTimeStr;
  }
}

export const UZ_DAYS = [
  { id: 1, name: 'Dushanba', short: 'Dush' },
  { id: 2, name: 'Seshanba', short: 'Sesh' },
  { id: 3, name: 'Chorshanba', short: 'Chor' },
  { id: 4, name: 'Payshanba', short: 'Pay' },
  { id: 5, name: 'Juma', short: 'Jum' },
  { id: 6, name: 'Shanba', short: 'Shan' },
  { id: 7, name: 'Yakshanba', short: 'Yak' },
];

export const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

/**
 * Checks for timetable conflicts:
 * 1. Room conflict: same room, same day, overlapping time
 * 2. Teacher conflict: same teacher, same day, overlapping time
 */
export interface ConflictCheckResult {
  hasConflict: boolean;
  type?: 'room' | 'teacher';
  message?: string;
  conflictingGroup?: string;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function timesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

export function checkScheduleConflict(
  allGroups: Group[],
  currentGroupId: string | null,
  teacherId: string,
  newScheduleItems: LessonSchedule[]
): ConflictCheckResult {
  for (const item of newScheduleItems) {
    for (const group of allGroups) {
      if (group.id === currentGroupId || group.status === 'yakunlangan') continue;

      for (const existingSched of group.schedule) {
        if (existingSched.dayOfWeek === item.dayOfWeek) {
          // Check time overlap
          if (timesOverlap(item.startTime, item.endTime, existingSched.startTime, existingSched.endTime)) {
            // Room conflict
            if (item.room.trim().toLowerCase() === existingSched.room.trim().toLowerCase()) {
              return {
                hasConflict: true,
                type: 'room',
                conflictingGroup: group.name,
                message: `Xona to‘qnashuvi! "${item.room}" xonasi ${item.dayName} kuni soat ${existingSched.startTime}-${existingSched.endTime} da "${group.name}" guruhi tomonidan band qilingan.`,
              };
            }
            // Teacher conflict
            if (group.teacherId === teacherId) {
              return {
                hasConflict: true,
                type: 'teacher',
                conflictingGroup: group.name,
                message: `O‘qituvchi band! ${item.dayName} kuni soat ${existingSched.startTime}-${existingSched.endTime} da o‘qituvchining "${group.name}" guruhida darsi mavjud.`,
              };
            }
          }
        }
      }
    }
  }

  return { hasConflict: false };
}

/**
 * CSV Exporter with BOM for UTF-8 Excel support (preserving o‘, g‘ etc)
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processCell = (cell: string | number) => {
    let str = cell === null || cell === undefined ? '' : String(cell);
    str = str.replace(/"/g, '""');
    if (str.search(/("|,|\n)/g) >= 0) {
      str = `"${str}"`;
    }
    return str;
  };

  const csvContent = '\uFEFF' + [
    headers.map(processCell).join(','),
    ...rows.map(row => row.map(processCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Microsoft Excel Exporter (.xls HTML format with UTF-8 BOM, cell borders, styles)
 * Opens cleanly in Microsoft Excel as a formatted table without column splitting issues.
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  reportTitle?: string
) {
  const headerHtml = headers
    .map(
      h =>
        `<th style="background-color:#4361EE;color:#FFFFFF;font-weight:bold;padding:10px 14px;border:1px solid #CCCCCC;text-align:left;">${h}</th>`
    )
    .join('');

  const rowsHtml = rows
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const cells = row
        .map(
          cell =>
            `<td style="padding:8px 12px;border:1px solid #E2E8F0;font-size:13px;">${
              cell === null || cell === undefined ? '' : String(cell)
            }</td>`
        )
        .join('');
      return `<tr style="background-color:${bg};">${cells}</tr>`;
    })
    .join('');

  const excelTemplate = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${filename.slice(0, 31).replace(/[:\\\/\?\*\[\]]/g, '_')}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Segoe UI, Arial, sans-serif; }
    table { border-collapse: collapse; width: 100%; }
    th { font-size: 13px; }
    td { font-size: 12px; }
  </style>
</head>
<body>
  ${
    reportTitle
      ? `<h2 style="font-family: Calibri, sans-serif; color: #171E2B; margin-bottom: 6px;">${reportTitle}</h2>`
      : ''
  }
  <p style="font-size: 11px; color: #64748B; margin-bottom: 12px;">“Sardoba language stars” MCHJ - Renessans o‘quv markazi rasmiy hisoboti. Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
  <table border="1">
    <thead>
      <tr>${headerHtml}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;

  const blob = new Blob([excelTemplate], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


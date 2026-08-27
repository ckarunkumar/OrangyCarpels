import { ProjectTimesheetItem } from '../components/features/TimesheetsView';

export interface ExportEntry {
  sno: string;
  date: string;
  dayLabel: string;
  description: string;
  task: string;
  hours: number;
  isBillable?: boolean;
  resourceName?: string;
}

const formatMonthName = (monthStr: string) => {
  const [y, m] = monthStr.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Exports timesheet data to a structured CSV / Excel spreadsheet.
 */
export function exportTimesheetToExcel(
  project: ProjectTimesheetItem,
  month: string,
  entries: ExportEntry[],
  totalHours: number
) {
  const monthName = formatMonthName(month);
  const isHourly = project.billingType === 'T&M' || project.billingType === 'Hourly Rate (T&M)';

  const rows: string[][] = [
    ['ORANGYY DESIGN — MONTHLY TIMESHEET REPORT'],
    [''],
    ['Project Name', project.projectName, 'Project ID', project.id],
    ['Client', project.client, 'Month / Period', monthName],
    ['Billing Type', project.billingType, ...(isHourly ? ['Budget Hours', `${project.budgetHours || 0} hrs`] : [])],
    ['Total Hours', `${totalHours} hrs`],
    [''],
    ['SNO', 'Date', 'Day', 'Task', 'Description', 'Resource Name', 'Hours Logged'],
  ];

  entries.forEach((e) => {
    rows.push([
      e.sno,
      e.date,
      e.dayLabel,
      `"${(e.task || '').replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      `"${(e.resourceName || '').replace(/"/g, '""')}"`,
      String(e.hours || 0),
    ]);
  });

  rows.push(['']);
  rows.push(['', '', '', '', 'TOTAL HOURS', '', String(totalHours)]);
  rows.push(['', '', '', '', 'EXPORTED AT', '', new Date().toLocaleString()]);

  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Timesheet_${project.projectName.replace(/\s+/g, '_')}_${month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and triggers browser print for a clean studio PDF report.
 */
export function exportTimesheetToPDF(
  project: ProjectTimesheetItem,
  month: string,
  entries: ExportEntry[],
  totalHours: number
) {
  const monthName = formatMonthName(month);
  const isHourly = project.billingType === 'T&M' || project.billingType === 'Hourly Rate (T&M)';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export printable PDF.');
    return;
  }

  const rowsHtml = entries
    .map(
      (e) => `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
        <td style="padding: 6px 8px; font-family: monospace; font-weight: 600;">${e.sno}</td>
        <td style="padding: 6px 8px;">${e.dayLabel}</td>
        <td style="padding: 6px 8px; font-weight: 500;">${e.task || '—'}</td>
        <td style="padding: 6px 8px; color: #374151;">${e.description || '—'}</td>
        <td style="padding: 6px 8px; color: #4b5563; font-weight: 500;">${e.resourceName || '—'}</td>
        <td style="padding: 6px 8px; text-align: right; font-family: monospace; font-weight: 700;">${e.hours || 0}h</td>
      </tr>`
    )
    .join('');

  const logoUrl = `${window.location.origin}/orangyy-design-logo.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Timesheet - ${project.projectName} (${monthName})</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; margin: 0; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #FF5C00; padding-bottom: 12px; margin-bottom: 16px; }
          .logo-img { height: 42px; width: auto; object-fit: contain; display: block; }
          .grid-meta { display: grid; grid-template-columns: repeat(${isHourly ? 5 : 4}, 1fr); gap: 10px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; }
          .meta-item label { display: block; font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; }
          .meta-item span { font-weight: 600; color: #111827; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background: #f3f4f6; text-align: left; padding: 7px 8px; font-size: 10px; font-weight: 700; color: #4b5563; text-transform: uppercase; border-bottom: 1px solid #d1d5db; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${logoUrl}" alt="orangyy design." class="logo-img" />
          </div>
          <div style="text-align: right;">
            <div style="font-size: 15px; font-weight: 700; color: #111827;">${project.projectName}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Project ID: <span style="font-family: monospace; font-weight: 600;">${project.id}</span></div>
          </div>
        </div>

        <div class="grid-meta">
          <div class="meta-item"><label>Client</label><span>${project.client}</span></div>
          <div class="meta-item"><label>Period</label><span>${monthName}</span></div>
          <div class="meta-item"><label>Billing Model</label><span>${project.billingType}</span></div>
          ${isHourly ? `<div class="meta-item"><label>Budget Hours</label><span style="color: #4b5563; font-weight: 700;">${project.budgetHours || 0} hrs</span></div>` : ''}
          <div class="meta-item"><label>Logged Hours</label><span style="color: #FF5C00; font-weight: 700;">${totalHours} hrs</span></div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">SNO</th>
              <th style="width: 15%;">Date</th>
              <th style="width: 20%;">Task</th>
              <th style="width: 32%;">Description</th>
              <th style="width: 18%;">Resource Name</th>
              <th style="width: 10%; text-align: right;">Hours</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e7eb; padding-top: 14px; margin-top: 12px;">
          <div style="font-size: 10.5px; color: #6b7280; font-weight: 500;">
            Time Sheet Generated on ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} via Orangyy Carpels
          </div>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 700;">
            Total Hours: <span style="color: #FF5C00; font-family: monospace;">${totalHours} hrs</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

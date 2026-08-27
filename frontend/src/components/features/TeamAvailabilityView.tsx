import { Users, Calendar } from 'lucide-react';

interface Props {
  attendance: any;
  holidays: any[];
}

export default function TeamAvailabilityView({ attendance, holidays }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-brand-orange" /> Studio Availability Matrix</span>
          <span className="text-[10px] font-mono text-studio-muted font-semibold">{attendance?.employees?.length || 0} members</span>
        </div>
        <div className="divide-y divide-studio-border bg-white">
          {attendance?.employees?.length ? (
            attendance.employees.map((e: any) => (
              <div key={e.employeeId} className="px-5 py-3 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12.5px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text shrink-0">{e.employeeId}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-studio-text truncate">{e.fullName}</p>
                    <p className="text-[11px] text-studio-muted truncate">{e.designation} • {e.department}</p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 shrink-0">
                  In Studio
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[12px] text-studio-muted">No team members loaded.</div>
          )}
        </div>
      </div>

      <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
        <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-orange" /> Published Holidays</span>
          <span className="text-[10px] font-mono text-studio-muted font-semibold">{holidays.length} listed</span>
        </div>
        <div className="divide-y divide-studio-border bg-white">
          {holidays.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-studio-muted">No published holidays for this year.</div>
          ) : (
            holidays.map((h) => (
              <div key={h.id} className="px-4 py-3 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12px]">
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-studio-text truncate block">{h.name}</span>
                  <span className="text-[10px] font-mono text-studio-muted">{h.date}</span>
                </div>
                <span
                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    h.type === 'Mandatory'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {h.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

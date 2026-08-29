import { Calendar } from 'lucide-react';

interface Props {
  holidays: any[];
}

const getDayName = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
};

const groupByMonth = (list: any[]) => {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const groups: { month: string; items: any[] }[] = [];
  for (const h of sorted) {
    const d = new Date(h.date + 'T00:00:00');
    const month = isNaN(d.getTime()) ? 'Other' : d.toLocaleDateString('en-US', { month: 'long' });
    const existing = groups.find((g) => g.month === month);
    if (existing) existing.items.push(h);
    else groups.push({ month, items: [h] });
  }
  return groups;
};

export default function TeamAvailabilityView({ holidays }: Props) {
  const grouped = groupByMonth(holidays);

  return (
    <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider flex justify-between items-center">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-orange" /> Published Studio Holidays</span>
        <span className="text-[10px] font-mono text-studio-muted font-semibold">{holidays.length} holidays</span>
      </div>

      {holidays.length === 0 ? (
        <div className="p-8 text-center text-[12px] text-studio-muted">No published holidays for this calendar year.</div>
      ) : (
        <div className="divide-y divide-studio-border">
          {grouped.map(({ month, items }) => (
            <div key={month} className="bg-white">
              <div className="bg-slate-50/70 px-5 py-1.5 border-b border-studio-border/60 text-[11px] font-bold text-studio-muted uppercase tracking-wider flex justify-between items-center">
                <span>{month}</span>
                <span className="font-mono text-[10px] text-studio-muted/80">{items.length} {items.length === 1 ? 'holiday' : 'holidays'}</span>
              </div>
              <div className="divide-y divide-studio-border/40">
                {items.map((h) => (
                  <div key={h.id} className="px-5 py-2.5 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12.5px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text shrink-0">{h.date}</span>
                      <span className="text-[11px] font-semibold text-studio-muted px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60 min-w-16 text-center shrink-0">{getDayName(h.date)}</span>
                      <span className="font-semibold text-studio-text truncate">{h.name}</span>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${h.type === 'Mandatory' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>{h.type === 'Mandatory' ? 'Mandatory Holiday' : 'Optional Holiday (OH)'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

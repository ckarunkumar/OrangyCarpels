import { User } from 'lucide-react';
import { User as AuthUser } from '../../context/AuthContext';

export interface DailyEntry {
  id?: number; sno: string; date: string; dayLabel: string; description: string; task: string;
  hours: number; isBillable?: boolean; isWeekend?: boolean; resourceName?: string;
  employeeId?: string; isOwner?: boolean; isReadOnly?: boolean;
}

export interface DateGroupItem {
  date: string; sno: string; dayLabel: string; isWeekend: boolean;
  items: { entry: DailyEntry; idx: number }[];
}

interface Props {
  group: DateGroupItem;
  isLocked: boolean;
  isSA: boolean;
  isPM: boolean;
  isEmp: boolean;
  user: AuthUser | null;
  availableServices?: string[];
  onEntryChange: (idx: number, field: keyof DailyEntry, val: any) => void;
}

export default function ProjectTimesheetGridRow({
  group, isLocked, isSA, isPM, isEmp, user, availableServices = [], onEntryChange,
}: Props) {
  return (
    <div className={`px-5 py-2 grid grid-cols-12 gap-3 text-[12px] items-start transition-colors ${group.isWeekend ? 'bg-red-50/20' : 'hover:bg-studio-hover/30'}`}>
      <div className={`col-span-1 pt-1.5 font-mono font-bold ${group.isWeekend ? 'text-red-500' : 'text-studio-text'}`}>{group.sno}</div>
      <div className={`col-span-2 pt-1.5 font-medium ${group.isWeekend ? 'text-red-500 font-semibold' : 'text-studio-text'}`}>
        <div>{group.dayLabel}</div>
        {group.items.length > 1 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-brand-orange/10 text-brand-orange mt-0.5">
            {group.items.length} logs
          </span>
        )}
      </div>
      <div className="col-span-9 divide-y divide-studio-border/50">
        {group.items.map(({ entry, idx }, itemIdx) => {
          const isEntryLocked = isLocked || !!entry.isReadOnly || (!isSA && !isPM && entry.isOwner === false);
          const isOther = !!entry.isReadOnly || entry.isOwner === false;
          const resName = entry.resourceName || (isEmp ? user?.fullName : '') || '—';
          return (
            <div key={entry.id || `${group.date}-${itemIdx}`} className={`grid grid-cols-9 gap-3 items-start ${itemIdx > 0 ? 'pt-2 mt-1.5' : ''}`}>
              <div className="col-span-4">
                <textarea
                  rows={2}
                  disabled={isEntryLocked}
                  placeholder={isEntryLocked ? (isOther ? 'No description logged' : 'No description') : 'Type here line by line...'}
                  value={entry.description}
                  onChange={(e) => onEntryChange(idx, 'description', e.target.value)}
                  className={`w-full px-2.5 py-1.5 border border-studio-border rounded text-[12px] leading-relaxed bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 placeholder:text-studio-muted/50 resize-y ${isOther ? 'border-dashed' : ''}`}
                />
              </div>
              <div className="col-span-2 pt-0.5">
                {availableServices.length > 0 ? (
                  <select
                    disabled={isEntryLocked}
                    value={entry.task}
                    onChange={(e) => onEntryChange(idx, 'task', e.target.value)}
                    className={`w-full px-2 py-1.5 border border-studio-border rounded text-[12px] bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 ${isOther ? 'border-dashed' : ''}`}
                  >
                    <option value="">-- Select Service --</option>
                    {availableServices.map((svc) => (
                      <option key={svc} value={svc}>{svc}</option>
                    ))}
                    {entry.task && !availableServices.includes(entry.task) && (
                      <option value={entry.task}>{entry.task}</option>
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={isEntryLocked}
                    placeholder={isEntryLocked ? '-' : 'Service / Task...'}
                    value={entry.task}
                    onChange={(e) => onEntryChange(idx, 'task', e.target.value)}
                    className={`w-full px-2.5 py-1.5 border border-studio-border rounded text-[12px] bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 placeholder:text-studio-muted/50 ${isOther ? 'border-dashed' : ''}`}
                  />
                )}
              </div>
              <div className="col-span-2 pt-1.5 flex items-center justify-between gap-1 text-[11px] font-medium text-studio-text min-w-0 pr-1">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <User className={`w-3.5 h-3.5 shrink-0 ${isOther ? 'text-blue-500' : 'text-studio-muted'}`} />
                  <span className="truncate">{resName}</span>
                </div>
                {isOther && <span className="shrink-0 text-[8.5px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200 font-semibold uppercase">Read Only</span>}
              </div>
              <div className="col-span-1 text-right pt-0.5">
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  disabled={isEntryLocked}
                  value={entry.hours === 0 ? '' : entry.hours}
                  placeholder="00hr"
                  onChange={(e) => onEntryChange(idx, 'hours', Number(e.target.value) || 0)}
                  className={`w-16 text-right px-2 py-1.5 border border-studio-border rounded font-mono text-[12px] bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 ${isOther ? 'border-dashed' : ''}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

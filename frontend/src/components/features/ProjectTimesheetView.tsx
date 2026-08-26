import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Send, CheckCircle, RotateCcw, Lock, ChevronDown } from 'lucide-react';
import { UserRole } from '../ui/Layout';
import { ProjectTimesheetItem } from './TimesheetsView';
import SlideToActionDrawer, { TimesheetActionType } from './SlideToActionDrawer';
import BillingBadge from '../ui/BillingBadge';
import Breadcrumbs from '../ui/Breadcrumbs';
import MonthYearPicker from '../ui/MonthYearPicker';

interface DailyEntry {
  id?: number; sno: string; date: string; dayLabel: string;
  description: string; task: string; hours: number; isBillable?: boolean; isWeekend?: boolean;
}

interface ProjectTimesheetViewProps {
  project: ProjectTimesheetItem; month?: string; activeRole?: UserRole;
  onBack: (successMsg?: string) => void; onRefresh: () => void;
}

export default function ProjectTimesheetView({ project, month = '2026-08', activeRole, onBack, onRefresh }: ProjectTimesheetViewProps) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [status, setStatus] = useState<string>('Draft');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pendingAction, setPendingAction] = useState<TimesheetActionType | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isEmp = activeRole === 'Employee';
  const isPM = activeRole === 'Project Manager';
  const isSA = activeRole === 'Super Admin';
  const isLocked = (isEmp && status !== 'Draft') || (isPM && (status === 'Approved' || status === 'PM_Approved'));

  const fetchEntries = () => {
    setLoading(true);
    fetch(`/api/timesheets/daily-entries?projectId=${project.id}&month=${currentMonth}`)
      .then((res) => res.json())
      .then((data) => { setEntries(data.entries || []); setStatus(data.status || 'Draft'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEntries(); }, [project.id, currentMonth]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setStatusMenuOpen(false); };
    if (statusMenuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [statusMenuOpen]);

  const handleEntryChange = (idx: number, field: keyof DailyEntry, val: any) => {
    if (isLocked) return;
    const updated = [...entries]; updated[idx] = { ...updated[idx], [field]: val };
    setEntries(updated);
  };

  const handleSave = async () => {
    if (isLocked) return;
    setActionLoading(true);
    try {
      await fetch('/api/timesheets/daily-entries/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, month: currentMonth, entries }),
      });
      setSaveMsg('Saved successfully!'); setTimeout(() => setSaveMsg(''), 2500); onRefresh();
    } finally { setActionLoading(false); }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const endpoint = pendingAction === 'Submit' ? 'submit' : pendingAction === 'Approve' ? 'approve' : 'reopen';
      const body = pendingAction === 'Submit' ? { projectId: project.id, month: currentMonth, entries } : { projectId: project.id, month: currentMonth };
      await fetch(`/api/timesheets/daily-entries/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const msg = pendingAction === 'Submit' ? 'Time Sheet submited sucessfully for PM Approvel' :
                  pendingAction === 'Approve' ? (isPM ? 'Time Sheet approved successfully & forwarded to Super Admin' : 'Time Sheet approved successfully (Final Approval)') :
                  'Time Sheet reopened successfully and returned to Employee for rework';
      setPendingAction(null); onRefresh(); onBack(msg);
    } finally { setActionLoading(false); }
  };

  const totalHours = entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);
  const isHourly = project.billingType === 'T&M' || project.billingType === 'Hourly Rate (T&M)';
  const showSubmit = status === 'Draft';
  const showApproveReopen = (isPM && status === 'Submitted') || (isSA && status !== 'Draft');
  const hasDropdown = showSubmit || showApproveReopen;

  return (
    <>
      {pendingAction && (
        <SlideToActionDrawer open={!!pendingAction} actionType={pendingAction} project={project} month={currentMonth} totalHours={totalHours} billableHours={totalHours} isPM={isPM} submitting={actionLoading} onClose={() => setPendingAction(null)} onConfirm={handleConfirmAction} />
      )}

      <div className="w-full flex-1 flex flex-col h-[calc(100vh-8.5rem)] justify-between space-y-3 pb-0">
        <Breadcrumbs items={[{ label: 'Time Sheet', onClick: () => onBack() }, { label: project.projectName }]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-studio-border pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => onBack()} className="p-1 rounded hover:bg-studio-sidebar text-studio-muted hover:text-studio-text transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[18px] font-bold text-studio-text">{project.projectName}</h2>
              <BillingBadge type={project.billingType} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isHourly && (
              <div className="flex items-center gap-2 text-[11px] font-mono text-studio-muted">
                <span>{totalHours}/{project.budgetHours}h</span>
                <div className="w-24 h-1.5 bg-studio-sidebar rounded-full overflow-hidden border border-studio-border"><div className="h-full bg-brand-orange" style={{ width: `${Math.min(100, Math.round((totalHours / (project.budgetHours || 1)) * 100))}%` }} /></div>
                <span className="font-bold text-brand-orange">{Math.min(100, Math.round((totalHours / (project.budgetHours || 1)) * 100))}%</span>
              </div>
            )}
            <MonthYearPicker value={currentMonth} onChange={setCurrentMonth} />

            {/* Status Dropdown Button */}
            <div ref={menuRef} className="relative">
              {hasDropdown ? (
                <button type="button" onClick={() => setStatusMenuOpen((v) => !v)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11.5px] font-bold shadow-2xs transition-all cursor-pointer ${status === 'Draft' ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' : status === 'Submitted' ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100' : status === 'PM_Approved' ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100' : 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'}`}>
                  <span>{status === 'PM_Approved' ? 'PM Approved' : status}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-75" />
                </button>
              ) : (
                <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : status === 'PM_Approved' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {status === 'PM_Approved' ? 'PM Approved' : status}
                </span>
              )}

              {statusMenuOpen && hasDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-studio-border rounded-lg shadow-xl py-1 z-50 w-36 text-[12px] animate-in fade-in slide-in-from-top-1">
                  {showSubmit && (
                    <button type="button" onClick={() => { setStatusMenuOpen(false); setPendingAction('Submit'); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-brand-orange hover:bg-orange-50 font-semibold transition-colors cursor-pointer"><Send className="w-3.5 h-3.5" /> Submit</button>
                  )}
                  {showApproveReopen && (<>
                    <button type="button" onClick={() => { setStatusMenuOpen(false); setPendingAction('Approve'); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-green-700 hover:bg-green-50 font-semibold transition-colors cursor-pointer"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> Approve</button>
                    <button type="button" onClick={() => { setStatusMenuOpen(false); setPendingAction('ReOpen'); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-amber-700 hover:bg-amber-50 font-semibold transition-colors border-t border-studio-border/50 cursor-pointer"><RotateCcw className="w-3.5 h-3.5 text-amber-600" /> ReOpen</button>
                  </>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-studio-border rounded-lg overflow-hidden shadow-sm flex flex-col flex-1 min-h-0">
          <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider grid grid-cols-12 gap-3 items-center sticky top-0 z-10 shadow-2xs shrink-0">
            <div className="col-span-1">SNO</div><div className="col-span-2">DATE</div><div className="col-span-6">DESCRIPTION</div><div className="col-span-2">TASK</div><div className="col-span-1 text-right">TIME</div>
          </div>

          <div className="divide-y divide-studio-border bg-white flex-1 overflow-y-auto min-h-0">
            {loading ? <div className="p-8 text-center text-[12px] text-studio-muted">Loading full month records...</div> : entries.map((entry, idx) => {
              const isWeekend = entry.isWeekend || entry.dayLabel.includes('Sat') || entry.dayLabel.includes('Sun');
              return (
                <div key={idx} className={`px-5 py-2 grid grid-cols-12 gap-3 text-[12px] items-start transition-colors ${isWeekend ? 'bg-red-50/20' : 'hover:bg-studio-hover/30'}`}>
                  <div className={`col-span-1 pt-2 font-mono font-bold ${isWeekend ? 'text-red-500' : 'text-studio-text'}`}>{entry.sno}</div>
                  <div className={`col-span-2 pt-2 font-medium ${isWeekend ? 'text-red-500 font-semibold' : 'text-studio-text'}`}>{entry.dayLabel}</div>
                  <div className="col-span-6">
                    <textarea rows={2} disabled={isLocked} placeholder={isLocked ? 'No description' : 'Type here line by line...'} value={entry.description} onChange={(e) => handleEntryChange(idx, 'description', e.target.value)} className="w-full px-2.5 py-1.5 border border-studio-border rounded text-[12px] leading-relaxed bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 placeholder:text-studio-muted/50 resize-y" />
                  </div>
                  <div className="col-span-2 pt-0.5">
                    <input type="text" disabled={isLocked} placeholder={isLocked ? '-' : 'Type here...'} value={entry.task} onChange={(e) => handleEntryChange(idx, 'task', e.target.value)} className="w-full px-2.5 py-1.5 border border-studio-border rounded text-[12px] bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90 placeholder:text-studio-muted/50" />
                  </div>
                  <div className="col-span-1 text-right pt-0.5">
                    <input type="number" min={0} max={24} step={0.5} disabled={isLocked} value={entry.hours === 0 ? '' : entry.hours} placeholder="00hr" onChange={(e) => handleEntryChange(idx, 'hours', Number(e.target.value) || 0)} className="w-16 text-right px-2 py-1.5 border border-studio-border rounded font-mono text-[12px] bg-white focus:outline-none focus:border-brand-orange disabled:bg-studio-sidebar/30 disabled:text-studio-muted/90" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-studio-sidebar border-t border-studio-border px-5 py-2.5 flex justify-between items-center text-[12px] shadow-xs shrink-0">
            <div className="flex items-center gap-2">
              {isLocked && (<span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1.5 text-[11px]"><Lock className="w-3 h-3" /> Locked for edits ({status === 'PM_Approved' ? 'PM Approved' : status}).</span>)}
            </div>
            <div className="font-bold text-studio-text">Monthly Total: <span className="font-mono text-brand-orange text-[15px]">{totalHours} hrs</span></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 shrink-0">
          <div className="text-[11.5px] text-studio-muted flex items-center gap-1.5">
            {saveMsg && <span className="text-green-600 font-semibold">{saveMsg}</span>}
          </div>

          <div className="flex items-center gap-2">
            {!isLocked && (
              <button onClick={handleSave} disabled={actionLoading} className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 shadow-sm cursor-pointer">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

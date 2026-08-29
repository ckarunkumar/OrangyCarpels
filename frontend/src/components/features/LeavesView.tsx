import { useState, useEffect } from 'react';
import { Plus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { UserRole } from '../ui/Layout';
import Breadcrumbs from '../ui/Breadcrumbs';
import LeaveApplyDrawer from './LeaveApplyDrawer';
import LeaveApprovalDrawer from './LeaveApprovalDrawer';
import TeamAvailabilityView from './TeamAvailabilityView';

const LEAVE_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

export default function LeavesView({ activeRole }: { activeRole: UserRole }) {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'approvals'>('dashboard');
  const [balance, setBalance] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [compOffs, setCompOffs] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [openApply, setOpenApply] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ item: any; type: 'leave' | 'compoff' } | null>(null);

  const loadData = (year: number = selectedYear) => {
    fetch(`/api/leaves/balance?year=${year}`).then((r) => r.json()).then(setBalance).catch(() => {});
    fetch('/api/leaves/requests').then((r) => r.json()).then((d) => Array.isArray(d) && setRequests(d)).catch(() => {});
    fetch('/api/leaves/compoff').then((r) => r.json()).then((d) => Array.isArray(d) && setCompOffs(d)).catch(() => {});
    fetch(`/api/leaves/holidays?year=${year}&published=true`).then((r) => r.json()).then((d) => Array.isArray(d) && setHolidays(d)).catch(() => {});
  };

  useEffect(() => { loadData(selectedYear); }, [selectedYear]);

  const pendingLeaves = requests.filter((r) => r.status?.startsWith('Pending'));
  const pendingCompOffs = compOffs.filter((c) => c.status?.startsWith('Pending'));
  const totalPending = pendingLeaves.length + pendingCompOffs.length;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      <LeaveApplyDrawer open={openApply} onClose={() => setOpenApply(false)} onApplied={() => loadData(selectedYear)} balanceData={balance} selectedYear={selectedYear} publishedHolidays={holidays} />
      <LeaveApprovalDrawer open={!!reviewItem} item={reviewItem?.item} type={reviewItem?.type || 'leave'} onClose={() => setReviewItem(null)} onProcessed={() => loadData(selectedYear)} />

      <Breadcrumbs items={[{ label: 'Leaves & Calendar' }]} />

      <div className="flex justify-between items-center border-b border-studio-border pb-3">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Leaves & Calendar</h2>
          <p className="text-[12px] text-studio-muted">Manage time-off requests, WFH quotas, and published studio calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-2.5 py-1.5 border border-studio-border rounded bg-white text-[12px] font-semibold text-studio-text focus:outline-none focus:border-brand-orange shadow-2xs">
            {LEAVE_YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
          <button type="button" onClick={() => setOpenApply(true)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Apply
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-studio-border flex gap-6 text-[13px] font-medium">
        <button onClick={() => setActiveTab('dashboard')} className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'border-brand-orange text-brand-orange font-bold' : 'border-transparent text-studio-muted hover:text-studio-text'}`}>
          <Clock className="w-4 h-4" /> My Leaves
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'calendar' ? 'border-brand-orange text-brand-orange font-bold' : 'border-transparent text-studio-muted hover:text-studio-text'}`}>
          <Calendar className="w-4 h-4" /> Holiday Calendar
        </button>
        {(activeRole === 'Super Admin' || activeRole === 'Project Manager') && (
          <button onClick={() => setActiveTab('approvals')} className={`pb-2.5 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'approvals' ? 'border-brand-orange text-brand-orange font-bold' : 'border-transparent text-studio-muted hover:text-studio-text'}`}>
            <CheckCircle2 className="w-4 h-4" /> Approvals
            {totalPending > 0 && <span className="px-1.5 py-0.2 rounded-full bg-brand-orange text-white text-[10px] font-bold">{totalPending}</span>}
          </button>
        )}
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-studio-muted uppercase tracking-wider block truncate">Casual (CL)</span>
              <div className="text-[18px] font-bold text-studio-text mt-0.5 font-mono">{balance?.casualRemaining ?? 12} <span className="text-[10.5px] text-studio-muted font-normal">/ {balance?.casualQuota ?? 12}d</span></div>
            </div>
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-studio-muted uppercase tracking-wider block truncate">Sick (SL)</span>
              <div className="text-[18px] font-bold text-studio-text mt-0.5 font-mono">{balance?.sickRemaining ?? 12} <span className="text-[10.5px] text-studio-muted font-normal">/ {balance?.sickQuota ?? 12}d</span></div>
            </div>
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-studio-muted uppercase tracking-wider block truncate">Earned (EL)</span>
              <div className="text-[18px] font-bold text-studio-text mt-0.5 font-mono">{balance?.earnedRemaining ?? 15} <span className="text-[10.5px] text-studio-muted font-normal">/ {balance?.earnedQuota ?? 15}d</span></div>
            </div>
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block truncate">Comp-Off</span>
              <div className="text-[18px] font-bold text-brand-orange mt-0.5 font-mono">{balance?.compOffBalance ?? 0} <span className="text-[10.5px] text-studio-muted font-normal">days</span></div>
            </div>
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block truncate">WFH (Monthly)</span>
              <div className="text-[18px] font-bold text-blue-600 mt-0.5 font-mono">{balance?.wfhRemainingThisMonth ?? 2} <span className="text-[10.5px] text-studio-muted font-normal">left</span></div>
            </div>
            <div className="bg-white border border-studio-border rounded-lg p-3 shadow-sm">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block truncate">Optional (OH)</span>
              <div className="text-[18px] font-bold text-purple-600 mt-0.5 font-mono">{balance?.optionalHolidaysRemaining ?? 2} <span className="text-[10.5px] text-studio-muted font-normal">/ {balance?.optionalHolidaysQuota ?? 2}</span></div>
            </div>
          </div>

          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider flex justify-between items-center">
              <span>My Applications & Requests</span>
              <span className="text-[10px] font-mono text-studio-muted font-semibold">{requests.length} records</span>
            </div>
            <div className="divide-y divide-studio-border bg-white">
              {requests.length === 0 ? (
                <div className="p-8 text-center text-[12px] text-studio-muted">No applications submitted yet. Click "+ Apply" to submit time-off or WFH.</div>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12.5px]">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text">{r.startDate}{r.startDate !== r.endDate ? ` → ${r.endDate}` : ''}</span>
                      <span className="font-semibold text-studio-text">{r.leaveType}</span>
                      <span className="text-[11px] text-studio-muted">({r.daysCount}d {r.isHalfDay ? `• ${r.halfDaySession}` : ''})</span>
                      <span className="text-studio-muted italic text-[11.5px] truncate max-w-xs sm:max-w-md">"{r.reason}"</span>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${r.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : r.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{r.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Holiday Calendar */}
      {activeTab === 'calendar' && (
        <TeamAvailabilityView holidays={holidays} />
      )}

      {/* Tab 3: Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider">Pending Leave & WFH Approvals ({pendingLeaves.length})</div>
            <div className="divide-y divide-studio-border bg-white">
              {pendingLeaves.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-studio-muted">No pending leave requests requiring review.</div>
              ) : (
                pendingLeaves.map((r) => (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12.5px]">
                    <div>
                      <span className="font-semibold text-studio-text">{r.employeeName}</span> — <span className="font-semibold text-brand-orange">{r.leaveType}</span> ({r.daysCount}d) • <span className="text-studio-muted font-mono text-[11px]">{r.startDate}</span>
                      <p className="text-[11px] text-studio-muted italic mt-0.5">"{r.reason}"</p>
                    </div>
                    <button type="button" onClick={() => setReviewItem({ item: r, type: 'leave' })} className="px-3 py-1 bg-brand-orange text-white rounded text-[11px] font-semibold hover:bg-opacity-90 cursor-pointer shadow-sm">Review</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="bg-studio-sidebar border-b border-studio-border px-5 py-2.5 text-[10px] font-bold text-studio-muted uppercase tracking-wider">Pending Comp-Off Overtime Claims ({pendingCompOffs.length})</div>
            <div className="divide-y divide-studio-border bg-white">
              {pendingCompOffs.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-studio-muted">No pending comp-off claims requiring authorization.</div>
              ) : (
                pendingCompOffs.map((c) => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-studio-hover/40 transition-colors text-[12.5px]">
                    <div>
                      <span className="font-semibold text-studio-text">{c.employeeName}</span> — <span className="font-semibold text-brand-orange">+{c.daysCredit} Day Comp-Off</span> ({c.hoursWorked}h on {c.workedDate})
                      <p className="text-[11px] text-studio-muted italic mt-0.5">"{c.reason}"</p>
                    </div>
                    <button type="button" onClick={() => setReviewItem({ item: c, type: 'compoff' })} className="px-3 py-1 bg-brand-orange text-white rounded text-[11px] font-semibold hover:bg-opacity-90 cursor-pointer shadow-sm">Review</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

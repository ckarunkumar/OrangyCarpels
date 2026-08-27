import React, { useState } from 'react';
import { X, Clock, AlertCircle, Send, Award, Home, Star, Calendar } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
  balanceData: any;
  publishedHolidays?: Array<{ date: string; name: string; type: string }>;
}

type ApplyMode = 'leave' | 'wfh' | 'oh' | 'compoff';

export default function LeaveApplyDrawer({ open, onClose, onApplied, balanceData, publishedHolidays = [] }: Props) {
  const [applyMode, setApplyMode] = useState<ApplyMode>('leave');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'First Half' | 'Second Half'>('First Half');
  const [hoursWorked, setHoursWorked] = useState('8');
  const [daysCredit, setDaysCredit] = useState<'1.0' | '0.5'>('1.0');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const optionalHolidaysList = publishedHolidays.filter((h) => h.type === 'Optional');

  const getQuotaDisplay = () => {
    if (!balanceData) return '';
    if (applyMode === 'wfh') return `${balanceData.wfhRemainingThisMonth ?? 2} days remaining this month`;
    if (applyMode === 'oh') return `${balanceData.optionalHolidaysRemaining ?? 2} optional holidays available`;
    if (applyMode === 'compoff') return `Current balance: ${balanceData.compOffBalance ?? 0} days`;
    if (leaveType === 'Casual Leave') return `${balanceData.casualRemaining ?? 12} days available`;
    if (leaveType === 'Sick Leave') return `${balanceData.sickRemaining ?? 12} days available`;
    if (leaveType === 'Earned Leave') return `${balanceData.earnedRemaining ?? 15} days available`;
    if (leaveType === 'Comp-off') return `${balanceData.compOffBalance ?? 0} days available`;
    return 'Active quota applied';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please provide a reason or deliverable notes.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (applyMode === 'compoff') {
        const res = await fetch('/api/leaves/compoff/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workedDate: startDate, hoursWorked: Number(hoursWorked) || 8, daysCredit: Number(daysCredit), reason: reason.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit comp-off claim.');
      } else {
        const targetType = applyMode === 'wfh' ? 'Work From Home' : applyMode === 'oh' ? 'Optional Holiday' : leaveType;
        const res = await fetch('/api/leaves/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leaveType: targetType, startDate, endDate: isHalfDay || applyMode === 'oh' ? startDate : endDate, isHalfDay, halfDaySession: isHalfDay ? halfDaySession : null, reason: reason.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit application.');
      }
      onApplied();
      onClose();
    } catch (err: any) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-studio-border flex flex-col justify-between">
          <div className="p-6 border-b border-studio-border flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-studio-text">Apply Time-Off & Remote</h3>
              <p className="text-[12px] text-studio-muted mt-0.5">Submit leave, WFH, optional holiday, or claim comp-off</p>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-hover"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-[12px]">
            {error && (<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-[11px]"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" /><span>{error}</span></div>)}

            {/* Unified Mode Selection Buttons */}
            <div>
              <label className="block text-[10.5px] font-bold text-studio-muted uppercase mb-1.5">Select Application Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setApplyMode('leave')} className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'leave' ? 'bg-orange-50 border-brand-orange text-brand-orange font-bold shadow-2xs' : 'bg-white border-studio-border text-studio-text hover:bg-studio-hover'}`}><Calendar className="w-4 h-4" /><span>Leave</span></button>
                <button type="button" onClick={() => setApplyMode('wfh')} className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'wfh' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-2xs' : 'bg-white border-studio-border text-studio-text hover:bg-studio-hover'}`}><Home className="w-4 h-4 text-blue-600" /><span>Work From Home</span></button>
                <button type="button" onClick={() => setApplyMode('oh')} className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'oh' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold shadow-2xs' : 'bg-white border-studio-border text-studio-text hover:bg-studio-hover'}`}><Star className="w-4 h-4 text-purple-600" /><span>Optional Holiday</span></button>
                <button type="button" onClick={() => setApplyMode('compoff')} className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'compoff' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-2xs' : 'bg-white border-studio-border text-studio-text hover:bg-studio-hover'}`}><Award className="w-4 h-4 text-emerald-600" /><span>Claim Comp-Off</span></button>
              </div>
            </div>

            {/* Quota Summary Box */}
            <div className="p-2.5 bg-studio-sidebar border border-studio-border rounded-lg flex items-center justify-between text-[11px]">
              <span className="font-semibold text-studio-muted">Live Quota:</span>
              <span className="font-bold text-studio-text font-mono">{getQuotaDisplay()}</span>
            </div>

            {applyMode === 'leave' && (
              <div>
                <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Leave Category</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg bg-white text-studio-text focus:outline-none focus:border-brand-orange">
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Earned Leave">Earned Leave (EL)</option>
                  <option value="Comp-off">Use Comp-Off Credit</option>
                </select>
              </div>
            )}

            {applyMode === 'oh' && (
              <div>
                <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Select Published Optional Holiday</label>
                {optionalHolidaysList.length > 0 ? (
                  <select value={startDate} onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value); }} className="w-full px-3 py-2 border border-studio-border rounded-lg bg-white text-studio-text focus:outline-none focus:border-brand-orange">
                    {optionalHolidaysList.map((oh) => (<option key={oh.date} value={oh.date}>{oh.name} ({oh.date})</option>))}
                  </select>
                ) : (
                  <p className="text-studio-muted text-[11px]">No optional holidays published for the selected year.</p>
                )}
              </div>
            )}

            {applyMode !== 'oh' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">{applyMode === 'compoff' ? 'Worked Date' : 'Start Date'}</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">{applyMode === 'compoff' ? 'Hours Worked' : 'End Date'}</label>
                  {applyMode === 'compoff' ? (
                    <input type="number" min={1} max={24} value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text font-mono focus:outline-none focus:border-brand-orange" required />
                  ) : (
                    <input type="date" value={endDate} disabled={isHalfDay} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange disabled:bg-slate-50 disabled:text-studio-muted" required />
                  )}
                </div>
              </div>
            )}

            {applyMode === 'leave' && (
              <div className="p-3 bg-studio-sidebar border border-studio-border rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold text-studio-text flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-orange" /> Half-Day Leave (0.5 Days)</span>
                  <input type="checkbox" checked={isHalfDay} onChange={(e) => setIsHalfDay(e.target.checked)} className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer" />
                </div>
                {isHalfDay && (
                  <div className="flex gap-2 pt-1">
                    {(['First Half', 'Second Half'] as const).map((s) => (
                      <button key={s} type="button" onClick={() => setHalfDaySession(s)} className={`flex-1 py-1 px-2 rounded text-[11px] font-semibold border transition-all cursor-pointer ${halfDaySession === s ? 'bg-orange-50 border-brand-orange text-brand-orange' : 'bg-white border-studio-border text-studio-muted'}`}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {applyMode === 'compoff' && (
              <div>
                <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Credit Claim</label>
                <select value={daysCredit} onChange={(e) => setDaysCredit(e.target.value as any)} className="w-full px-3 py-2 border border-studio-border rounded-lg bg-white text-studio-text focus:outline-none focus:border-brand-orange font-medium">
                  <option value="1.0">1.0 Day (Full Day Credit)</option>
                  <option value="0.5">0.5 Day (Half Day Credit)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">{applyMode === 'compoff' ? 'Deliverables & Overtime Context' : 'Reason / Notes'}</label>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={applyMode === 'compoff' ? 'Project deliverables completed during weekend/overtime...' : 'Provide context or reason for this request...'} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange resize-none" required />
            </div>
          </form>

          <div className="p-4 border-t border-studio-border flex justify-end gap-2 bg-studio-sidebar/40">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-studio-border rounded-lg text-[12px] font-medium text-studio-muted hover:bg-white transition-colors cursor-pointer">Cancel</button>
            <button type="submit" onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-[12px] font-bold hover:bg-opacity-95 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : applyMode === 'compoff' ? 'Submit Claim' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

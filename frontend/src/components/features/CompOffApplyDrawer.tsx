import React, { useState } from 'react';
import { X, Award, AlertCircle, Send } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export default function CompOffApplyDrawer({ open, onClose, onApplied }: Props) {
  const [workedDate, setWorkedDate] = useState(new Date().toISOString().slice(0, 10));
  const [hoursWorked, setHoursWorked] = useState('8');
  const [daysCredit, setDaysCredit] = useState<'1.0' | '0.5'>('1.0');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Please describe the client/project overtime delivered.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/leaves/compoff/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workedDate, hoursWorked: Number(hoursWorked) || 8, daysCredit: Number(daysCredit), reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit comp-off request.');
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-orange border border-orange-200 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-studio-text">Claim Compensatory Off</h3>
                <p className="text-[12px] text-studio-muted">Request credit for overtime or weekend delivery</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-hover"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-[12px]">
            {error && (<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-[11px]"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" /><span>{error}</span></div>)}

            <div>
              <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Weekend / Holiday Date Worked</label>
              <input type="date" value={workedDate} onChange={(e) => setWorkedDate(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Hours Logged</label>
                <input type="number" min={1} max={24} value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange font-mono" required />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Credit Claim</label>
                <select value={daysCredit} onChange={(e) => setDaysCredit(e.target.value as any)} className="w-full px-3 py-2 border border-studio-border rounded-lg bg-white text-studio-text focus:outline-none focus:border-brand-orange font-medium">
                  <option value="1.0">1.0 Day (Full Day)</option>
                  <option value="0.5">0.5 Day (Half Day)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-studio-sidebar border border-studio-border rounded-lg text-[11px] text-studio-muted space-y-1">
              <span className="font-bold text-studio-text block">Two-Step Approval Rule:</span>
              <p>1. Project Manager endorses overtime deliverables.</p>
              <p>2. Super Admin grants final authorization $\rightarrow$ +{daysCredit} day added to your Comp-Off balance.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-studio-muted uppercase mb-1">Deliverables & Overtime Reason</label>
              <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="State project name, tasks completed, and why weekend/holiday hours were required..." className="w-full px-3 py-2 border border-studio-border rounded-lg text-studio-text focus:outline-none focus:border-brand-orange resize-none" required />
            </div>
          </form>

          <div className="p-4 border-t border-studio-border flex justify-end gap-2 bg-studio-sidebar/40">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-studio-border rounded-lg text-[12px] font-medium text-studio-muted hover:bg-white transition-colors cursor-pointer">Cancel</button>
            <button type="submit" onClick={handleSubmit} disabled={submitting} className="px-4 py-2 bg-brand-orange text-white rounded-lg text-[12px] font-bold hover:bg-opacity-95 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

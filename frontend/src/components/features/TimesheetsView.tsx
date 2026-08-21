import { useState, useEffect, useRef } from 'react';
import { UserRole } from '../ui/Layout';
import { Save, Send, CheckCircle, Calendar, Plus, Trash, Cloud, CloudOff } from 'lucide-react';
import { SkeletonGrid } from '../ui/Skeleton';

interface TimesheetsViewProps {
  activeRole: UserRole;
}

interface TimesheetRow {
  id: number;
  client: string;
  project: string;
  task: string;
  hours: number[]; // Mon-Sun (7 days)
  billable: boolean;
}

export default function TimesheetsView({ activeRole }: TimesheetsViewProps) {
  const weekStart = '2026-08-17'; // Hardcoded for this phase context
  const [status, setStatus] = useState<'Draft' | 'Submitted' | 'Approved'>('Draft');
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save states
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const initialLoadedRef = useRef(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchTimesheet = () => {
    setLoading(true);
    initialLoadedRef.current = false;
    fetch(`/api/timesheets?weekStart=${weekStart}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch timesheet data');
        return res.json();
      })
      .then((data) => {
        setRows(data.rows || []);
        setStatus(data.status || 'Draft');
        setError(null);
        setTimeout(() => {
          initialLoadedRef.current = true;
          setAutoSaveStatus('idle');
        }, 150);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Error loading timesheet values. Make sure server is running.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimesheet();
  }, [activeRole]);

  // Debounced auto-save hook
  useEffect(() => {
    if (!initialLoadedRef.current) return;
    if (status !== 'Draft' || isLockedForEditing) return;

    setAutoSaveStatus('saving');
    const delayDebounce = setTimeout(() => {
      fetch('/api/timesheets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, rows }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Save draft failed');
          setAutoSaveStatus('saved');
        })
        .catch(() => {
          setAutoSaveStatus('error');
        });
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [rows]);

  const handleHourChange = (rowId: number, dayIdx: number, val: string) => {
    const numVal = Math.min(24, Math.max(0, Number(val) || 0));
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          const newHours = [...row.hours];
          newHours[dayIdx] = numVal;
          return { ...row, hours: newHours };
        }
        return row;
      })
    );
  };

  const addRow = () => {
    const newRow: TimesheetRow = {
      id: Date.now(),
      client: 'Select Client',
      project: 'Select Project',
      task: 'General Task',
      hours: [0, 0, 0, 0, 0, 0, 0],
      billable: true,
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSave = () => {
    setAutoSaveStatus('saving');
    fetch('/api/timesheets/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, rows }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save timesheet');
        setAutoSaveStatus('saved');
        fetchTimesheet();
      })
      .catch((err) => {
        setAutoSaveStatus('error');
        alert(`Error: ${err.message}`);
      });
  };

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit your weekly timesheet? This will lock edits.')) {
      fetch('/api/timesheets/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, rows }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to submit timesheet');
          fetchTimesheet();
        })
        .catch((err) => {
          alert(`Error: ${err.message}`);
        });
    }
  };

  const handleApprovalAction = (action: 'approve' | 'reject') => {
    fetch('/api/timesheets/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, action }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update approval status');
        fetchTimesheet();
      })
      .catch((err) => {
        alert(`Error: ${err.message}`);
      });
  };

  const totalWeeklyHours = rows.reduce(
    (sum, row) => sum + row.hours.reduce((s, h) => s + h, 0),
    0
  );

  const getStatusColor = () => {
    if (status === 'Approved') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'Submitted') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const isLockedForEditing =
    loading ||
    (status === 'Submitted' && activeRole === 'Employee') ||
    (status === 'Approved' && activeRole !== 'Super Admin');

  // Renders the auto-save indicator layout
  const renderAutoSaveIndicator = () => {
    if (status !== 'Draft' || isLockedForEditing) return null;
    if (autoSaveStatus === 'saving') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-studio-muted font-medium animate-pulse">
          <Cloud className="w-3.5 h-3.5 text-brand-blue" /> Saving...
        </span>
      );
    }
    if (autoSaveStatus === 'saved') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-green-600 font-semibold">
          <Cloud className="w-3.5 h-3.5 text-green-500" /> Saved
        </span>
      );
    }
    if (autoSaveStatus === 'error') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-red-600 font-semibold animate-bounce">
          <CloudOff className="w-3.5 h-3.5 text-red-500" /> Save failed
        </span>
      );
    }
    return null;
  };

  if (loading && rows.length === 0) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center border-b border-studio-border pb-3">
          <div>
            <h2 className="text-[20px] font-bold text-studio-text">Weekly Timesheet</h2>
            <p className="text-[12px] text-studio-muted">Loading timesheet records...</p>
          </div>
        </div>
        <SkeletonGrid />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center border-b border-studio-border pb-3">
        <div className="flex items-baseline gap-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Weekly Timesheet</h2>
            <p className="text-[12px] text-studio-muted">Log and submit hours worked against projects</p>
          </div>
          {renderAutoSaveIndicator()}
        </div>
        <div className="flex items-center gap-2">
          {/* Week Date Picker Mock */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-studio-border bg-white rounded text-[12px] text-studio-text font-medium">
            <Calendar className="w-3.5 h-3.5 text-studio-muted" />
            Aug 17, 2026 - Aug 23, 2026
          </div>
          {/* Timesheet status Indicator */}
          <div className={`px-2.5 py-1 rounded border text-[11px] font-semibold ${getStatusColor()}`}>
            {status}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded text-[12px] font-medium">
          {error}
        </div>
      )}

      {/* Grid Container */}
      <div className="bg-white border border-studio-border rounded-lg overflow-hidden">
        {/* Table Headings */}
        <div className="bg-studio-sidebar border-b border-studio-border py-2 px-4 text-[10px] font-bold text-studio-muted uppercase tracking-wider grid grid-cols-12 gap-2 items-center">
          <div className="col-span-3">Project / Client / Task</div>
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-7 grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map((day) => (
              <span key={day} className="font-semibold text-[10px]">{day}</span>
            ))}
          </div>
          <div className="col-span-1 text-right">Total</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-studio-border">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-studio-muted">
              No project rows. Click "Add Row" below to log hours.
            </div>
          ) : (
            rows.map((row) => {
              const rowTotal = row.hours.reduce((sumVal, hr) => sumVal + hr, 0);
              return (
                <div
                  key={row.id}
                  className="py-2 px-4 grid grid-cols-12 gap-2 items-center text-[12px] hover:bg-studio-bg/30 transition-colors"
                >
                  <div className="col-span-3 min-w-0 pr-2">
                    {/* Inline edit details or labels */}
                    <input
                      type="text"
                      value={row.project}
                      disabled={isLockedForEditing}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRows(rows.map((r) => (r.id === row.id ? { ...r, project: val } : r)));
                      }}
                      className="w-full font-bold text-studio-text truncate bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:bg-studio-hover/40 rounded px-1 -mx-1"
                    />
                    <div className="flex gap-1 items-center mt-0.5">
                      <input
                        type="text"
                        value={row.client}
                        disabled={isLockedForEditing}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows(rows.map((r) => (r.id === row.id ? { ...r, client: val } : r)));
                        }}
                        className="text-[10px] text-studio-muted truncate bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:bg-studio-hover/40 rounded px-1"
                      />
                      <span className="text-[10px] text-studio-muted">•</span>
                      <input
                        type="text"
                        value={row.task}
                        disabled={isLockedForEditing}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows(rows.map((r) => (r.id === row.id ? { ...r, task: val } : r)));
                        }}
                        className="text-[10px] text-studio-muted truncate bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:bg-studio-hover/40 rounded px-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      disabled={isLockedForEditing}
                      onClick={() => {
                        setRows(rows.map((r) => (r.id === row.id ? { ...r, billable: !r.billable } : r)));
                      }}
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase transition-colors ${
                        row.billable
                          ? 'border-brand-orange/30 bg-orange-50 text-brand-orange'
                          : 'border-studio-border bg-studio-sidebar text-studio-muted'
                      }`}
                    >
                      {row.billable ? 'Bill' : 'Non-Bill'}
                    </button>
                  </div>
                  <div className="col-span-7 grid grid-cols-7 gap-1">
                    {row.hours.map((hoursValue, idx) => (
                      <input
                        key={idx}
                        type="number"
                        min="0"
                        max="24"
                        value={hoursValue || ''}
                        disabled={isLockedForEditing}
                        onChange={(e) => handleHourChange(row.id, idx, e.target.value)}
                        placeholder="0"
                        className={`w-full text-center py-1 border border-studio-border rounded bg-studio-bg/20 text-[13px] focus:outline-none focus:border-brand-blue focus:bg-white text-studio-text ${
                          isLockedForEditing ? 'opacity-60 cursor-not-allowed bg-studio-hover' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="col-span-1 text-right flex items-center justify-end gap-2">
                    <span className="font-bold text-studio-text text-[13px]">{rowTotal}h</span>
                    <button
                      onClick={() => deleteRow(row.id)}
                      disabled={isLockedForEditing}
                      className={`p-1 hover:text-brand-red text-studio-muted hover:bg-red-50 rounded transition-colors ${
                        isLockedForEditing ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''
                      }`}
                      title="Remove Row"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Footer / Summary */}
        <div className="bg-studio-sidebar border-t border-studio-border py-3 px-4 flex justify-between items-center">
          <button
            onClick={addRow}
            disabled={isLockedForEditing}
            className={`flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold bg-white border border-studio-border rounded hover:bg-studio-hover transition-colors ${
              isLockedForEditing ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-studio-muted" /> Add Row
          </button>
          <div className="text-[13px] text-studio-text font-bold">
            Weekly Aggregate: <span className="text-brand-orange text-[14px]">{totalWeeklyHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <div className="text-[11px] text-studio-muted">
          {isLockedForEditing
            ? 'Access Locked: Inputs are read-only.'
            : 'Changes save automatically as a draft. Click Submit when complete.'}
        </div>
        <div className="flex gap-2">
          {status === 'Draft' && !isLockedForEditing && (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-studio-border bg-white rounded text-[12px] font-semibold hover:bg-studio-hover transition-colors text-studio-text"
              >
                <Save className="w-4 h-4 text-studio-muted" /> Force Save
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 transition-colors"
              >
                <Send className="w-4 h-4" /> Submit Weekly Sheet
              </button>
            </>
          )}

          {status === 'Submitted' && activeRole !== 'Employee' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprovalAction('reject')}
                disabled={loading}
                className="px-4 py-2 border border-studio-border bg-white rounded text-[12px] font-semibold hover:bg-studio-hover transition-colors text-studio-text"
              >
                Reject & Re-open
              </button>
              <button
                onClick={() => handleApprovalAction('approve')}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded text-[12px] font-semibold hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Approve & Close
              </button>
            </div>
          )}

          {status === 'Approved' && activeRole === 'Super Admin' && (
            <button
              onClick={() => handleApprovalAction('reject')}
              disabled={loading}
              className="px-4 py-2 bg-brand-orange bg-opacity-10 text-brand-orange border border-brand-orange border-opacity-35 rounded text-[12px] font-semibold hover:bg-opacity-20 transition-colors"
            >
              Super Admin Override: Unlock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

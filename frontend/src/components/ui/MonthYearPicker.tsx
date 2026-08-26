import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthYearPickerProps {
  value: string; // 'YYYY-MM' e.g. '2026-08'
  onChange: (value: string) => void;
  className?: string;
}

export default function MonthYearPicker({ value, onChange, className = '' }: MonthYearPickerProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM
  const parts = (value || '2026-08').split('-');
  const selectedYear = parseInt(parts[0], 10) || new Date().getFullYear();
  const selectedMonth = parseInt(parts[1], 10) || (new Date().getMonth() + 1);

  const [viewYear, setViewYear] = useState(selectedYear);

  useEffect(() => {
    const p = (value || '').split('-');
    const y = parseInt(p[0], 10);
    if (y) setViewYear(y);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    let m = selectedMonth - 1;
    let y = selectedYear;
    if (m < 1) { m = 12; y -= 1; }
    onChange(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    let m = selectedMonth + 1;
    let y = selectedYear;
    if (m > 12) { m = 1; y += 1; }
    onChange(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleSelectMonth = (monthIndex: number) => {
    const m = monthIndex + 1;
    onChange(`${viewYear}-${String(m).padStart(2, '0')}`);
    setOpen(false);
  };

  const handleJumpToCurrent = () => {
    const now = new Date();
    onChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    setViewYear(now.getFullYear());
    setOpen(false);
  };

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  return (
    <div ref={popoverRef} className={`relative inline-block ${className}`}>
      {/* Control Pill */}
      <div className="flex items-center bg-white border border-studio-border hover:border-brand-orange/50 rounded-lg shadow-2xs transition-all overflow-hidden">
        <button
          type="button"
          onClick={handlePrevMonth}
          title="Previous Month"
          className="px-2 py-1.5 hover:bg-studio-sidebar text-studio-muted hover:text-studio-text transition-colors border-r border-studio-border/60 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-studio-text hover:bg-studio-sidebar/50 transition-colors cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
          <span>{FULL_MONTHS[selectedMonth - 1] || 'Select'} {selectedYear}</span>
          <ChevronDown className={`w-3 h-3 text-studio-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleNextMonth}
          title="Next Month"
          className="px-2 py-1.5 hover:bg-studio-sidebar text-studio-muted hover:text-studio-text transition-colors border-l border-studio-border/60 cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modern Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-64 bg-white border border-studio-border rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1">
          {/* Year Navigation */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-studio-border">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1 rounded-md hover:bg-studio-sidebar text-studio-muted hover:text-studio-text transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-[13px] text-studio-text tracking-wide">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1 rounded-md hover:bg-studio-sidebar text-studio-muted hover:text-studio-text transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {MONTH_NAMES.map((name, idx) => {
              const isSelected = selectedYear === viewYear && selectedMonth === (idx + 1);
              const isCurrent = currentYear === viewYear && currentMonthIdx === idx;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-1.5 text-[11.5px] font-semibold rounded-md transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-brand-orange text-white shadow-xs'
                      : isCurrent
                      ? 'bg-orange-50 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange hover:text-white'
                      : 'text-studio-text hover:bg-studio-sidebar hover:text-brand-orange'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2 border-t border-studio-border flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleJumpToCurrent}
              className="font-semibold text-brand-orange hover:underline cursor-pointer"
            >
              Current Month
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-studio-muted hover:text-studio-text font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

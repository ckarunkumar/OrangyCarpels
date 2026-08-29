import { Award, Home, Star, Calendar } from 'lucide-react';

export type ApplyMode = 'leave' | 'wfh' | 'oh' | 'compoff';

interface Props {
  applyMode: ApplyMode;
  setApplyMode: (mode: ApplyMode) => void;
}

export default function ApplyTypeSelector({ applyMode, setApplyMode }: Props) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-studio-muted uppercase mb-1">Application Type</label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setApplyMode('leave')} className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'leave' ? 'bg-orange-50 border-brand-orange text-brand-orange font-bold' : 'bg-white border-studio-border text-studio-text'}`}>
          <Calendar className="w-3.5 h-3.5" /><span>Leave</span>
        </button>
        <button type="button" onClick={() => setApplyMode('wfh')} className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'wfh' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-studio-border text-studio-text'}`}>
          <Home className="w-3.5 h-3.5 text-blue-600" /><span>WFH</span>
        </button>
        <button type="button" onClick={() => setApplyMode('oh')} className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'oh' ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold' : 'bg-white border-studio-border text-studio-text'}`}>
          <Star className="w-3.5 h-3.5 text-purple-600" /><span>Optional Holiday</span>
        </button>
        <button type="button" onClick={() => setApplyMode('compoff')} className={`p-2 rounded border text-left flex items-center gap-2 transition-all cursor-pointer ${applyMode === 'compoff' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-white border-studio-border text-studio-text'}`}>
          <Award className="w-3.5 h-3.5 text-emerald-600" /><span>Comp-Off</span>
        </button>
      </div>
    </div>
  );
}

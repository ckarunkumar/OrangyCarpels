import { X, Mail, Phone, MapPin, Pencil, GraduationCap, Briefcase, Calendar, Heart, Shield, Users, Globe } from 'lucide-react';
import { Employee } from './EmployeeDrawer';

interface EmployeeDetailDrawerProps {
  open: boolean;
  employee: Employee | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}

export default function EmployeeDetailDrawer({
  open,
  employee,
  isAdmin,
  onClose,
  onEdit,
}: EmployeeDetailDrawerProps) {
  if (!employee) return null;

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-[460px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-studio-border shrink-0">
          <div>
            <h3 className="text-[14px] font-bold text-studio-text">Employee Profile</h3>
            <p className="text-[11px] text-studio-muted font-mono">{employee.employeeId || `EMP-00${employee.id}`}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(employee); }}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-orange bg-orange-50 border border-brand-orange/30 rounded hover:bg-orange-100 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit Profile
              </button>
            )}
            <button type="button" onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center text-studio-muted hover:bg-studio-bg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Header Overview */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-studio-border">
            <div className="w-13 h-13 rounded-full bg-studio-sidebar flex items-center justify-center text-[18px] font-bold text-studio-muted border border-studio-border shrink-0 shadow-sm">
              {employee.fullName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-studio-text truncate">{employee.fullName}</h3>
              <p className="text-[11px] text-studio-muted truncate">{employee.designation} • {employee.department}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-studio-sidebar border border-studio-border text-studio-text">
                  {employee.employeeId || `EMP-00${employee.id}`}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${
                  employee.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : employee.role === 'Project Manager' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {employee.role}
                </span>
                <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${
                  employee.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-[12px] border-b border-studio-border pb-3">
            <h4 className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Contact & Emails</h4>
            <div className="grid grid-cols-1 gap-1.5">
              <div className="flex items-center gap-2 text-studio-muted">
                <Mail className="w-3.5 h-3.5 text-brand-blue shrink-0" />
                <span className="text-studio-muted text-[11px] w-24 shrink-0">Office Email:</span>
                <span className="text-studio-text font-medium truncate">{employee.email}</span>
              </div>
              {employee.personalEmail && (
                <div className="flex items-center gap-2 text-studio-muted">
                  <Mail className="w-3.5 h-3.5 text-studio-muted shrink-0" />
                  <span className="text-studio-muted text-[11px] w-24 shrink-0">Personal:</span>
                  <span className="text-studio-text truncate">{employee.personalEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-studio-muted">
                <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-studio-muted text-[11px] w-24 shrink-0">Mobile:</span>
                <span className="text-studio-text font-medium">{employee.phone}</span>
              </div>
              {employee.secondaryPhone && (
                <div className="flex items-center gap-2 text-studio-muted">
                  <Phone className="w-3.5 h-3.5 text-studio-muted shrink-0" />
                  <span className="text-studio-muted text-[11px] w-24 shrink-0">Second Phone:</span>
                  <span className="text-studio-text">{employee.secondaryPhone}</span>
                </div>
              )}
              {employee.permanentAddress && (
                <div className="flex items-start gap-2 text-studio-muted pt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-studio-muted text-[11px] w-24 shrink-0">Address:</span>
                  <span className="text-studio-text leading-relaxed whitespace-pre-wrap">{employee.permanentAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal & Family Details */}
          <div className="space-y-2 text-[12px] border-b border-studio-border pb-3">
            <h4 className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Personal & Family</h4>
            <div className="grid grid-cols-2 gap-2 bg-studio-sidebar border border-studio-border rounded p-2.5">
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">DOB</span>
                <span className="text-studio-text font-medium flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-studio-muted" /> {employee.dob || '—'}
                </span>
              </div>
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">Blood Group</span>
                <span className="text-brand-orange font-bold flex items-center gap-1 mt-0.5">
                  <Heart className="w-3 h-3 text-brand-orange" /> {employee.bloodGroup || '—'}
                </span>
              </div>
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">Father / Guardian</span>
                <span className="text-studio-text font-medium flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-studio-muted" /> {employee.guardianName || '—'}
                </span>
              </div>
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">Mother's Name</span>
                <span className="text-studio-text font-medium flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-studio-muted" /> {employee.motherName || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Identity & Legal Information */}
          <div className="space-y-2 text-[12px]">
            <h4 className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Government IDs & Social</h4>
            <div className="grid grid-cols-2 gap-2 bg-studio-sidebar border border-studio-border rounded p-2.5">
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">AADHAAR Number</span>
                <span className="text-studio-text font-mono font-medium flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-blue-600" /> {employee.aadhaarNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-studio-muted text-[10px] uppercase font-bold block">PAN Number</span>
                <span className="text-studio-text font-mono font-bold flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-green-600" /> {employee.panNumber || '—'}
                </span>
              </div>
              {employee.linkedInUrl && (
                <div className="col-span-2 pt-1 border-t border-studio-border/60">
                  <span className="text-studio-muted text-[10px] uppercase font-bold block">LinkedIn Profile</span>
                  <a href={employee.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline font-medium text-[11px] flex items-center gap-1 mt-0.5 truncate">
                    <Globe className="w-3 h-3 shrink-0" /> {employee.linkedInUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Education & Experience if present */}
          {employee.education && employee.education.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-studio-border">
              <h4 className="text-[10px] uppercase font-bold text-studio-muted tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Education
              </h4>
              <div className="space-y-1.5">
                {employee.education.map((edu, idx) => (
                  <div key={idx} className="text-[11px] bg-studio-sidebar p-2 rounded border border-studio-border">
                    <p className="font-bold text-studio-text">{edu.degree}</p>
                    <p className="text-[10px] text-studio-muted">{edu.school} ({edu.year})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {employee.experience && employee.experience.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-studio-border">
              <h4 className="text-[10px] uppercase font-bold text-studio-muted tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Experience
              </h4>
              <div className="space-y-1.5">
                {employee.experience.map((exp, idx) => (
                  <div key={idx} className="text-[11px] bg-studio-sidebar p-2 rounded border border-studio-border">
                    <p className="font-bold text-studio-text">{exp.role}</p>
                    <p className="text-[10px] text-studio-muted">{exp.company} — <i>{exp.period}</i></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

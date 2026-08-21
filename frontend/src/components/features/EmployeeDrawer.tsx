import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface Employee {
  id: number;
  employeeId?: string;
  fullName: string;
  dob?: string;
  designation: string;
  department: string;
  email: string;
  personalEmail?: string;
  phone: string;
  secondaryPhone?: string;
  permanentAddress?: string;
  guardianName?: string;
  motherName?: string;
  bloodGroup?: string;
  linkedInUrl?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'Project Manager' | 'Employee';
  location?: string;
  avatar?: string | null;
  education?: Array<{ degree: string; school: string; year: string }>;
  experience?: Array<{ company: string; role: string; period: string }>;
}

type FormState = {
  employeeId: string;
  fullName: string;
  dob: string;
  designation: string;
  department: string;
  email: string;
  personalEmail: string;
  phone: string;
  secondaryPhone: string;
  permanentAddress: string;
  guardianName: string;
  motherName: string;
  bloodGroup: string;
  linkedInUrl: string;
  aadhaarNumber: string;
  panNumber: string;
  status: 'Active' | 'Inactive';
  role: 'Super Admin' | 'Project Manager' | 'Employee';
};

const EMPTY_FORM: FormState = {
  employeeId: '',
  fullName: '',
  dob: '',
  designation: '',
  department: '',
  email: '',
  personalEmail: '',
  phone: '',
  secondaryPhone: '',
  permanentAddress: '',
  guardianName: '',
  motherName: '',
  bloodGroup: '',
  linkedInUrl: '',
  aadhaarNumber: '',
  panNumber: '',
  status: 'Active',
  role: 'Employee',
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

interface EmployeeDrawerProps {
  open: boolean;
  mode: 'add' | 'edit';
  employee: Employee | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EmployeeDrawer({ open, mode, employee, onClose, onSaved }: EmployeeDrawerProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setErrors({});
      setServerError(null);
      if (mode === 'edit' && employee) {
        setForm({
          employeeId: employee.employeeId || '',
          fullName: employee.fullName,
          dob: employee.dob || '',
          designation: employee.designation,
          department: employee.department,
          email: employee.email,
          personalEmail: employee.personalEmail || '',
          phone: employee.phone,
          secondaryPhone: employee.secondaryPhone || '',
          permanentAddress: employee.permanentAddress || '',
          guardianName: employee.guardianName || '',
          motherName: employee.motherName || '',
          bloodGroup: employee.bloodGroup || '',
          linkedInUrl: employee.linkedInUrl || '',
          aadhaarNumber: employee.aadhaarNumber || '',
          panNumber: employee.panNumber || '',
          status: employee.status,
          role: employee.role,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [open, mode, employee]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Office email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email';
    }
    if (!form.phone.trim()) errs.phone = 'Mobile number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError(null);

    const payload = {
      employeeId: form.employeeId.trim() || undefined,
      fullName: form.fullName.trim(),
      dob: form.dob.trim(),
      designation: form.designation.trim() || 'Team Member',
      department: form.department.trim() || 'General',
      email: form.email.trim(),
      personalEmail: form.personalEmail.trim(),
      phone: form.phone.trim(),
      secondaryPhone: form.secondaryPhone.trim(),
      permanentAddress: form.permanentAddress.trim(),
      guardianName: form.guardianName.trim(),
      motherName: form.motherName.trim(),
      bloodGroup: form.bloodGroup,
      linkedInUrl: form.linkedInUrl.trim(),
      aadhaarNumber: form.aadhaarNumber.trim(),
      panNumber: form.panNumber.trim().toUpperCase(),
      status: form.status,
      role: form.role,
    };

    try {
      const url = mode === 'edit' ? `/api/employees/${employee!.id}` : '/api/employees';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save employee profile.');
      onSaved();
      onClose();
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (hasErr?: boolean) =>
    `w-full px-3 py-1.5 border rounded text-[12px] text-studio-text bg-white transition-colors focus:outline-none ${
      hasErr ? 'border-red-400 focus:border-red-500' : 'border-studio-border focus:border-brand-orange'
    }`;

  const labelCls = "block text-[11px] font-medium text-studio-muted mb-1";

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
      <div className={`fixed top-0 right-0 z-50 h-full w-full max-w-4xl bg-white shadow-xl flex flex-col transition-transform duration-250 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Clean Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b border-studio-border/70 shrink-0">
          <div>
            <h3 className="text-[16px] font-semibold text-studio-text tracking-tight">{mode === 'edit' ? 'Edit Employee' : 'New Employee'}</h3>
            <p className="text-[11px] text-studio-muted mt-0.5">{mode === 'edit' ? `Editing: ${employee?.fullName} (${employee?.employeeId || employee?.id})` : 'Enter employee information below'}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-studio-muted hover:bg-studio-sidebar transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean 3-Column Form */}
        <form id="employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-5">
          {serverError && <div className="mb-4 p-2.5 bg-red-50 text-red-700 rounded text-[11px] font-medium">{serverError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>Employee ID</label>
                <input type="text" placeholder="EMP-001" value={form.employeeId} onChange={set('employeeId')} className={`${inputCls()} font-mono`} />
              </div>
              <div>
                <label className={labelCls}>Full Name *</label>
                <input ref={firstInputRef} type="text" placeholder="e.g. Maya Lin" value={form.fullName} onChange={set('fullName')} className={inputCls(!!errors.fullName)} />
                {errors.fullName && <p className="text-[10px] text-red-500 mt-0.5">{errors.fullName}</p>}
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input type="date" value={form.dob} onChange={set('dob')} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>Blood Group</label>
                <select value={form.bloodGroup} onChange={set('bloodGroup')} className={inputCls()}>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                </select>
              </div>
              <div>
                <label className={labelCls}>AADHAAR Number</label>
                <input type="text" placeholder="12-digit Aadhaar" maxLength={16} value={form.aadhaarNumber} onChange={set('aadhaarNumber')} className={`${inputCls()} font-mono`} />
              </div>
              <div>
                <label className={labelCls}>PAN Number</label>
                <input type="text" placeholder="ABCDE1234F" maxLength={10} value={form.panNumber} onChange={set('panNumber')} className={`${inputCls()} font-mono uppercase`} />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>Office Email Address *</label>
                <input type="email" placeholder="name@orangy.studio" value={form.email} onChange={set('email')} className={inputCls(!!errors.email)} />
                {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>Personal Email Address</label>
                <input type="email" placeholder="personal@gmail.com" value={form.personalEmail} onChange={set('personalEmail')} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>Mobile Number *</label>
                <input type="tel" placeholder="+91 99999 00000" value={form.phone} onChange={set('phone')} className={inputCls(!!errors.phone)} />
                {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
              </div>
              <div>
                <label className={labelCls}>Second Phone Number</label>
                <input type="tel" placeholder="+91 88888 00000" value={form.secondaryPhone} onChange={set('secondaryPhone')} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>LinkedIn Profile Link</label>
                <input type="url" placeholder="https://linkedin.com/in/username" value={form.linkedInUrl} onChange={set('linkedInUrl')} className={inputCls()} />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3.5">
              <div>
                <label className={labelCls}>Father's / Guardian Name</label>
                <input type="text" placeholder="Guardian Full Name" value={form.guardianName} onChange={set('guardianName')} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>Mother's Name</label>
                <input type="text" placeholder="Mother Full Name" value={form.motherName} onChange={set('motherName')} className={inputCls()} />
              </div>
              <div>
                <label className={labelCls}>Permanent Address</label>
                <textarea rows={2} placeholder="House no, Street, Landmark, City, PIN" value={form.permanentAddress} onChange={set('permanentAddress')} className={`${inputCls()} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Designation</label>
                  <input type="text" placeholder="Lead Designer" value={form.designation} onChange={set('designation')} className={inputCls()} />
                </div>
                <div>
                  <label className={labelCls}>Department</label>
                  <input type="text" placeholder="Brand & Identity" value={form.department} onChange={set('department')} className={inputCls()} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={set('status')} className={inputCls()}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <select value={form.role} onChange={set('role')} className={inputCls()}>
                    <option value="Employee">Employee</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Clean Footer */}
        <div className="shrink-0 px-7 py-3.5 border-t border-studio-border/70 flex items-center justify-end gap-2.5">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-[12px] font-medium text-studio-muted hover:text-studio-text transition-colors">
            Cancel
          </button>
          <button type="submit" form="employee-form" disabled={saving} className="px-4 py-1.5 text-[12px] font-semibold text-white bg-brand-orange rounded hover:bg-opacity-95 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>
      </div>
    </>
  );
}

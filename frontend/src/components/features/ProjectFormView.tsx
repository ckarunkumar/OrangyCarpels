import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, UserCheck, X } from 'lucide-react';
import { Project } from './ProjectDrawer';
import { Client } from './ClientDrawer';
import { Employee } from './EmployeeDrawer';
import { UserRole } from '../ui/Layout';
import Breadcrumbs from '../ui/Breadcrumbs';

const CURRENCIES = ['USD ($)', 'INR (₹)', 'EUR (€)', 'GBP (£)', 'SGD ($)', 'AUD ($)', 'CAD ($)', 'AED (د.إ)', 'JPY (¥)', 'CHF (Fr.)'];

interface ProjectFormViewProps {
  mode: 'add' | 'edit';
  project: Project | null;
  clients: Client[];
  employees?: Employee[];
  activeRole?: UserRole;
  onBack: () => void;
  onSaved: (msg?: string) => void;
}

export default function ProjectFormView({ mode, project, clients, employees = [], activeRole, onBack, onSaved }: ProjectFormViewProps) {
  const isSA = activeRole === 'Super Admin';
  const [projectId, setProjectId] = useState(''); const [name, setName] = useState(''); const [clientId, setClientId] = useState('');
  const [billingType, setBillingType] = useState<string>('T&M'); const [rateAmount, setRateAmount] = useState('50');
  const [currency, setCurrency] = useState('USD ($)'); const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(''); const [budgetHours, setBudgetHours] = useState('100');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [managerId, setManagerId] = useState(''); const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeBType = (bt?: string) => {
    if (!bt || bt === 'Hourly Rate (T&M)' || bt === 'T&M') return 'T&M';
    if (bt.includes('Monthly') || bt === 'Fixed RC') return 'Fixed RC';
    return bt.includes('Project') || bt === 'Fixed PC' ? 'Fixed PC' : bt;
  };

  useEffect(() => {
    setError(null);
    if (mode === 'edit' && project) {
      setProjectId(project.id); setName(project.name); setClientId(project.clientId);
      setBillingType(normalizeBType(project.billingType));
      const parsed = parseFloat(project.rate.replace(/[^0-9.]/g, ''));
      setRateAmount(isNaN(parsed) ? '50' : String(parsed));
      setCurrency(project.currency || project.clientCurrency || 'USD ($)');
      setStartDate(project.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(project.endDate || ''); setBudgetHours(String(project.budgetHours || 100));
      setStatus(project.status); setManagerId(project.managerId || '');
      setAssignedEmployees(project.assignedEmployees || []);
    } else {
      const initC = clients[0];
      setProjectId(''); setName(''); setClientId(initC?.id || '');
      setBillingType(normalizeBType(initC?.defaultBillingType));
      setRateAmount('50'); setCurrency(initC?.billingCurrency || 'USD ($)');
      setStartDate(new Date().toISOString().split('T')[0]); setEndDate(''); setBudgetHours('100'); setStatus('Active');
      const defaultPM = employees.find((e) => e.role === 'Project Manager' || e.role === 'Super Admin');
      setManagerId(defaultPM?.employeeId || ''); setAssignedEmployees([]);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [mode, project, clients, employees]);

  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    if (mode === 'add') {
      const sel = clients.find((c) => c.id === newClientId);
      if (sel?.defaultBillingType) setBillingType(normalizeBType(sel.defaultBillingType));
      if (sel?.billingCurrency) setCurrency(sel.billingCurrency);
    }
  };

  const removeEmployee = (empId: string) => setAssignedEmployees((prev) => prev.filter((id) => id !== empId));
  const addEmployee = (empId: string) => { if (empId && !assignedEmployees.includes(empId)) setAssignedEmployees((prev) => [...prev, empId]); };
  const getRateLabel = () => (billingType === 'T&M' || billingType === 'Hourly Rate (T&M)') ? 'Hourly Cost *' : (billingType === 'Fixed RC' || billingType.includes('Monthly')) ? 'Monthly Cost *' : 'Project Cost *';

  const isHourly = billingType === 'T&M' || billingType === 'Hourly Rate (T&M)';
  const pmEmployees = employees.filter((e) => e.status === 'Active' && (e.role === 'Project Manager' || e.role === 'Super Admin'));
  const staffEmployees = employees.filter((e) => e.status === 'Active' && e.role === 'Employee');
  const unassigned = staffEmployees.filter((e) => !assignedEmployees.includes(e.employeeId || String(e.id)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (!clientId) { setError('Please select a client.'); return; }
    const amount = Number(rateAmount);
    if (isNaN(amount) || amount < 0) { setError('Please enter a valid rate amount.'); return; }
    let hours = isHourly ? Number(budgetHours) : 0;
    if (isHourly && (!hours || hours <= 0)) { setError('Budget hours must be positive.'); return; }
    setSaving(true); setError(null);
    try {
      const formattedRate = `${currency.replace(/\s*\(.*\)/, '')} ${amount.toLocaleString()}${isHourly ? '/hr' : billingType.includes('Monthly') ? '/mo' : ''}`;
      const selectedPM = employees.find((e) => e.employeeId === managerId);
      const url = mode === 'edit' ? `/api/projects/${project!.id}` : '/api/projects';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(projectId.trim() && { id: projectId.trim().toUpperCase() }),
          clientId, name: name.trim(), billingType, rate: formattedRate, startDate, endDate, budgetHours: hours, status,
          managerId, managerName: selectedPM?.fullName || '', assignedEmployees
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project.');
      onSaved(mode === 'edit' ? `Project ${name} updated successfully.` : `Project ${name} created successfully.`);
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-studio-border hover:border-studio-muted/60 rounded-md text-[12.5px] text-studio-text bg-white focus:outline-none focus:border-brand-orange transition-colors";
  const labelCls = "block text-[11px] font-medium text-studio-muted mb-1";
  const sectionTitleCls = "text-[13px] font-bold text-studio-text uppercase tracking-wider pb-1.5 border-b border-studio-border/70";

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      <Breadcrumbs items={[{ label: 'Project Registry', onClick: onBack }, { label: mode === 'edit' ? `Edit Project (${project?.name || ''})` : 'New Project' }]} />
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-studio-border pb-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-1.5 rounded-lg border border-studio-border bg-white hover:bg-studio-sidebar text-studio-text transition-colors cursor-pointer" title="Back to Project Registry"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">{mode === 'edit' ? `Edit Project (${project?.name})` : 'New Project'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onBack} className="px-4 py-2 border border-studio-border rounded-md text-[12px] font-semibold text-studio-text hover:bg-studio-sidebar transition-colors cursor-pointer">Cancel</button>
          <button type="submit" form="project-full-form" disabled={saving} className="px-5 py-2 bg-brand-orange text-white rounded-md text-[12px] font-semibold hover:bg-opacity-95 shadow-sm transition-all disabled:opacity-50 cursor-pointer">{saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Project'}</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[12px] font-medium">{error}</div>}

      <form id="project-full-form" onSubmit={handleSubmit} className="bg-white border border-studio-border rounded-lg shadow-sm p-6 space-y-7">
        {/* 1. Project Information */}
        <div className="space-y-3">
          <h3 className={sectionTitleCls}>1. Project Information & Billing</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div><label className="block text-[11px] font-bold text-brand-orange mb-1">Project ID *</label><input type="text" placeholder="AODP0001" disabled={mode === 'edit'} value={projectId} onChange={(e) => setProjectId(e.target.value)} className={`${inputCls} font-mono uppercase font-semibold ${mode === 'edit' ? 'bg-studio-sidebar opacity-75' : ''}`} /></div>
            <div><label className={labelCls}>Client *</label><select value={clientId} onChange={(e) => handleClientChange(e.target.value)} className={inputCls}>{clients.map((c) => (<option key={c.id} value={c.id}>{c.displayName || c.name}</option>))}</select></div>
            <div><label className={labelCls}>Project Name *</label><input ref={inputRef} type="text" placeholder="e.g. Design System V2" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>

            {isSA ? (
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold text-studio-text mb-1"><UserCheck className="w-3.5 h-3.5 text-brand-orange" /> Assign Project Manager (PM)</label>
                <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className={inputCls}>
                  <option value="">-- Select PM --</option>
                  {pmEmployees.map((emp) => (<option key={emp.id} value={emp.employeeId || String(emp.id)}>{emp.fullName} ({emp.role === 'Super Admin' ? 'Admin' : emp.designation || 'PM'})</option>))}
                </select>
              </div>
            ) : (
              <div><label className={labelCls}>Status</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
            )}

            <div><label className={labelCls}>Billing Type</label><select value={billingType} onChange={(e) => setBillingType(e.target.value)} className={inputCls}><option value="T&M">T&M</option><option value="Fixed RC">Fixed RC</option><option value="Fixed PC">Fixed PC</option></select></div>
            <div><label className={labelCls}>{getRateLabel()}</label><input type="number" placeholder="50" value={rateAmount} onChange={(e) => setRateAmount(e.target.value)} className={inputCls} /></div>

            <div><label className={labelCls}>Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>{CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
            <div><label className={labelCls}>Start Date *</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} /></div>

            {isHourly && (<div><label className={labelCls}>Budget Hours *</label><input type="number" placeholder="100" value={budgetHours} onChange={(e) => setBudgetHours(e.target.value)} className={inputCls} /></div>)}
            {isSA && (<div><label className={labelCls}>Status</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>)}
          </div>
        </div>

        {/* 2. Assign Team Members */}
        <div className="space-y-3">
          <h3 className={sectionTitleCls}>2. Team Member Allocation ({assignedEmployees.length} assigned)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className={labelCls}>Add Employee to Project</label>
              <select value="" onChange={(e) => addEmployee(e.target.value)} className={inputCls}>
                <option value="">+ Select Employee to Assign...</option>
                {unassigned.map((emp) => (<option key={emp.id} value={emp.employeeId || String(emp.id)}>{emp.fullName} ({emp.designation})</option>))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Assigned Team Members</label>
            {assignedEmployees.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-studio-sidebar/40 border border-studio-border rounded-lg min-h-[48px]">
                {assignedEmployees.map((empCode) => {
                  const emp = staffEmployees.find((e) => (e.employeeId || String(e.id)) === empCode);
                  return (
                    <span key={empCode} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium bg-orange-50 text-brand-orange border border-brand-orange/30 shadow-2xs">
                      <span>{emp ? emp.fullName : empCode}</span>
                      <button type="button" onClick={() => removeEmployee(empCode)} className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-brand-orange/20 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}
              </div>
            ) : (<div className="text-[12px] text-studio-muted py-2.5 bg-studio-sidebar/20 border border-dashed border-studio-border rounded-lg px-3">No team members assigned yet. Use the dropdown above to allocate employees.</div>)}
          </div>
        </div>
      </form>
    </div>
  );
}

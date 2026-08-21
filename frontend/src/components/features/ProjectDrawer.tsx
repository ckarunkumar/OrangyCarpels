import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Client } from './ClientDrawer';

export interface Project {
  id: string;
  name: string;
  billingType: 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Project Cost (Fixed)';
  rate: string;
  budgetHours: number;
  loggedHours: number;
  status: 'Active' | 'Inactive';
  clientId: string;
  clientName?: string;
  clientCurrency?: string;
}

interface ProjectDrawerProps {
  open: boolean;
  mode: 'add' | 'edit';
  project: Project | null;
  clients: Client[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectDrawer({ open, mode, project, clients, onClose, onSaved }: ProjectDrawerProps) {
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [billingType, setBillingType] = useState<Project['billingType']>('Hourly Rate (T&M)');
  const [rate, setRate] = useState('₹4,000/hr');
  const [budgetHours, setBudgetHours] = useState('100');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === 'edit' && project) {
        setName(project.name);
        setClientId(project.clientId);
        setBillingType(project.billingType);
        setRate(project.rate === 'RESTRICTED' ? '' : project.rate);
        setBudgetHours(String(project.budgetHours || 100));
        setStatus(project.status);
      } else {
        const initialClient = clients[0];
        setName('');
        setClientId(initialClient?.id || '');
        setBillingType((initialClient?.defaultBillingType as any) || 'Hourly Rate (T&M)');
        setRate('₹4,000/hr');
        setBudgetHours('100');
        setStatus('Active');
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, mode, project, clients]);

  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    if (mode === 'add') {
      const selected = clients.find((c) => c.id === newClientId);
      if (selected?.defaultBillingType) {
        setBillingType(selected.defaultBillingType as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (!clientId) { setError('Please select a client.'); return; }
    const hours = Number(budgetHours);
    if (!hours || hours <= 0) { setError('Budget hours must be positive.'); return; }

    setSaving(true);
    try {
      const url = mode === 'edit' ? `/api/projects/${project!.id}` : '/api/projects';
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          name: name.trim(),
          billingType,
          rate: rate.trim() || '₹0',
          budgetHours: hours,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save project.');
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-studio-border rounded text-[13px] text-studio-text bg-white focus:outline-none focus:border-brand-blue";

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border shrink-0">
          <div>
            <h3 className="text-[15px] font-bold text-studio-text">{mode === 'edit' ? 'Edit Project' : 'Add Project'}</h3>
            <p className="text-[11px] text-studio-muted mt-0.5">{mode === 'edit' ? `Code: ${project?.id}` : 'Create a new studio project'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center text-studio-muted hover:bg-studio-bg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="project-drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-[11px]">{error}</div>}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Project Name *</label>
            <input ref={inputRef} type="text" placeholder="e.g. Mobile App Redesign" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Client *</label>
            <select value={clientId} onChange={(e) => handleClientChange(e.target.value)} className={inputCls}>
              {clients.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.id})</option>))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Billing Type</label>
            <select value={billingType} onChange={(e) => setBillingType(e.target.value as any)} className={inputCls}>
              <option value="Hourly Rate (T&M)">Hourly Rate (T&M)</option>
              <option value="Monthly Resource Cost (Fixed)">Monthly Resource Cost (Fixed)</option>
              <option value="Project Cost (Fixed)">Project Cost (Fixed)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Contract Rate</label>
              <input type="text" placeholder="₹4,000/hr" value={rate} onChange={(e) => setRate(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Budget Hours</label>
              <input type="number" placeholder="100" value={budgetHours} onChange={(e) => setBudgetHours(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={inputCls}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>

        <div className="shrink-0 px-6 py-4 border-t border-studio-border flex items-center justify-end gap-2 bg-studio-sidebar">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[12px] font-semibold text-studio-muted border border-studio-border rounded hover:bg-studio-bg transition-colors">
            Cancel
          </button>
          <button type="submit" form="project-drawer-form" disabled={saving} className="px-4 py-2 text-[12px] font-semibold text-white bg-brand-orange rounded hover:bg-opacity-90 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </>
  );
}

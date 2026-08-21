import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  billingCurrency: string;
  defaultBillingType?: 'Hourly Rate (T&M)' | 'Monthly Resource Cost (Fixed)' | 'Project Cost (Fixed)';
  status: 'Active' | 'Inactive';
  projects?: Array<{
    id: string;
    name: string;
    billingType: string;
    rate: string;
    budgetHours: number;
    loggedHours: number;
    status: 'Active' | 'Inactive';
  }>;
}

const CURRENCIES = [
  'USD ($)',
  'INR (₹)',
  'EUR (€)',
  'GBP (£)',
  'SGD ($)',
  'AUD ($)',
  'CAD ($)',
  'AED (د.إ)',
  'JPY (¥)',
  'CHF (Fr.)',
];

const BILLING_TYPES = [
  'Hourly Rate (T&M)',
  'Monthly Resource Cost (Fixed)',
  'Project Cost (Fixed)',
] as const;

interface ClientDrawerProps {
  open: boolean;
  mode: 'add' | 'edit';
  client: Client | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ClientDrawer({ open, mode, client, onClose, onSaved }: ClientDrawerProps) {
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [billingCurrency, setBillingCurrency] = useState('USD ($)');
  const [defaultBillingType, setDefaultBillingType] = useState<Client['defaultBillingType']>('Hourly Rate (T&M)');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === 'edit' && client) {
        setClientId(client.id);
        setName(client.name);
        setEmail(client.email || '');
        setPhone(client.phone || '');
        setAddress(client.address || '');
        setBillingCurrency(client.billingCurrency || 'USD ($)');
        setDefaultBillingType(client.defaultBillingType || 'Hourly Rate (T&M)');
        setStatus(client.status);
      } else {
        setClientId('');
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setBillingCurrency('USD ($)');
        setDefaultBillingType('Hourly Rate (T&M)');
        setStatus('Active');
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, mode, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client / Company name is required.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      ...(clientId.trim() && { id: clientId.trim().toUpperCase() }),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      billingCurrency,
      defaultBillingType,
      status,
    };

    try {
      const url = mode === 'edit' ? `/api/clients/${client!.id}` : '/api/clients';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save client.');
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
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-border shrink-0">
          <div>
            <h3 className="text-[15px] font-bold text-studio-text">{mode === 'edit' ? 'Edit Client' : 'Add Client'}</h3>
            <p className="text-[11px] text-studio-muted mt-0.5">
              {mode === 'edit' ? `Client Code: ${client?.id}` : 'Register a new studio client company'}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center text-studio-muted hover:bg-studio-bg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form id="client-drawer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-3.5">
          {error && <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] font-medium">{error}</div>}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Client ID</label>
              <input
                type="text"
                placeholder="CL-001"
                disabled={mode === 'edit'}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={`${inputCls} font-mono ${mode === 'edit' ? 'bg-studio-hover opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Company Name *</label>
              <input ref={inputRef} type="text" placeholder="e.g. Acme Corporation" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Contact Email</label>
              <input type="email" placeholder="billing@client.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Phone Number</label>
              <input type="tel" placeholder="+1 555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Office Address</label>
            <input type="text" placeholder="e.g. 100 Market St, San Francisco, CA" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Billing Currency</label>
            <select value={billingCurrency} onChange={(e) => setBillingCurrency(e.target.value)} className={inputCls}>
              {CURRENCIES.map((curr) => (<option key={curr} value={curr}>{curr}</option>))}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">Default Billing Type</label>
              <span className="text-[9px] text-brand-orange font-medium">Overridable per project</span>
            </div>
            <select value={defaultBillingType} onChange={(e) => setDefaultBillingType(e.target.value as any)} className={inputCls}>
              {BILLING_TYPES.map((type) => (<option key={type} value={type}>{type}</option>))}
            </select>
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
          <button type="submit" form="client-drawer-form" disabled={saving} className="px-4 py-2 text-[12px] font-semibold text-white bg-brand-orange rounded hover:bg-opacity-90 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Client'}
          </button>
        </div>
      </div>
    </>
  );
}

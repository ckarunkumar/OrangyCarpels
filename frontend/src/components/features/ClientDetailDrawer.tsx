import { X, Building2, Globe, FolderKanban, Pencil, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Client } from './ClientDrawer';

interface ClientDetailDrawerProps {
  open: boolean;
  client: Client | null;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
}

export default function ClientDetailDrawer({
  open,
  client,
  isAdmin,
  onClose,
  onEdit,
}: ClientDetailDrawerProps) {
  if (!client) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-studio-border shrink-0">
          <div>
            <h3 className="text-[14px] font-bold text-studio-text">Client Details</h3>
            <p className="text-[11px] text-studio-muted font-mono">{client.id}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(client);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-orange bg-orange-50 border border-brand-orange/30 rounded hover:bg-orange-100 transition-colors"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded flex items-center justify-center text-studio-muted hover:bg-studio-bg hover:text-studio-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-studio-border">
            <div className="w-12 h-12 rounded-lg bg-studio-sidebar flex items-center justify-center text-studio-muted border border-studio-border shrink-0">
              <Building2 className="w-6 h-6 text-studio-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-studio-text truncate">{client.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text">
                  {client.id}
                </span>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border ${
                    client.status === 'Active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-50 text-gray-500 border-gray-200'
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 text-[12px] border-b border-studio-border pb-3.5">
            <h4 className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">Contact & Address</h4>
            <div className="flex items-center gap-2 text-studio-muted">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="text-studio-text truncate">{client.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-studio-muted">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span className="text-studio-text">{client.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-studio-muted">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-studio-text">{client.address || 'No address provided'}</span>
            </div>
          </div>

          {/* Billing Preferences */}
          <div className="grid grid-cols-2 gap-3 bg-studio-sidebar border border-studio-border rounded p-3 text-[12px]">
            <div>
              <span className="text-studio-muted block text-[10px] uppercase font-bold tracking-wider">Billing Currency</span>
              <span className="font-semibold text-studio-text flex items-center gap-1 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-studio-muted" /> {client.billingCurrency}
              </span>
            </div>
            <div>
              <span className="text-studio-muted block text-[10px] uppercase font-bold tracking-wider">Default Billing Type</span>
              <span className="font-semibold text-studio-text flex items-center gap-1 mt-0.5 truncate" title={client.defaultBillingType || 'Hourly Rate (T&M)'}>
                <CreditCard className="w-3.5 h-3.5 text-studio-muted shrink-0" /> {client.defaultBillingType || 'Hourly Rate (T&M)'}
              </span>
            </div>
          </div>

          {/* Linked Projects */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] uppercase font-bold text-studio-muted tracking-wider flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5" /> Associated Projects ({client.projects?.length || 0})
              </h4>
            </div>
            {!client.projects || client.projects.length === 0 ? (
              <div className="text-[11px] text-studio-muted py-4 text-center border border-dashed border-studio-border rounded bg-studio-sidebar/50">
                No active projects linked to this client.
              </div>
            ) : (
              <div className="divide-y divide-studio-border border border-studio-border rounded bg-white overflow-hidden">
                {client.projects.map((proj) => (
                  <div key={proj.id} className="p-3 text-[12px] hover:bg-studio-bg/40 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-studio-text">{proj.name}</p>
                        <p className="text-[10px] text-studio-muted font-mono">{proj.id} • {proj.billingType}</p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-orange">
                        {proj.loggedHours} / {proj.budgetHours}h
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

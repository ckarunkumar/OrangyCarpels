import { useState, useEffect } from 'react';
import { UserRole } from '../ui/Layout';
import { Plus, Building2, Globe, Pencil, Mail, Phone } from 'lucide-react';
import { SkeletonRow } from '../ui/Skeleton';
import ClientDrawer, { Client } from './ClientDrawer';
import ClientDetailDrawer from './ClientDetailDrawer';

interface ClientsViewProps {
  activeRole: UserRole;
}

export default function ClientsView({ activeRole }: ClientsViewProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [targetClient, setTargetClient] = useState<Client | null>(null);

  const fetchClients = () => {
    setLoading(true);
    fetch('/api/clients')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('Access Denied: You do not have permission to view client registries.');
          throw new Error('Failed to fetch clients list');
        }
        return res.json();
      })
      .then((data) => {
        setClients(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setClients([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [activeRole]);

  const isAdmin = activeRole === 'Super Admin';

  const handleOpenEdit = (client: Client) => {
    setTargetClient(client);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  return (
    <>
      <ClientDrawer
        open={drawerOpen}
        mode={drawerMode}
        client={drawerMode === 'edit' ? targetClient : null}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchClients}
      />

      <ClientDetailDrawer
        open={detailOpen}
        client={selectedClient}
        isAdmin={isAdmin}
        onClose={() => setDetailOpen(false)}
        onEdit={handleOpenEdit}
      />

      <div className="w-full space-y-6">
        <div className="flex justify-between items-center border-b border-studio-border pb-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Client Registry</h2>
            <p className="text-[12px] text-studio-muted">Manage studio client accounts, contact details, billing currencies, and linked projects</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setTargetClient(null); setDrawerMode('add'); setDrawerOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Client
            </button>
          )}
        </div>

        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-[13px] font-semibold">{error}</div>
        ) : (
          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="bg-studio-sidebar border-b border-studio-border px-4 py-2 text-[10px] font-bold text-studio-muted uppercase tracking-wider grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2">Client ID</div>
              <div className="col-span-3">Company Name</div>
              <div className="col-span-3">Contact Details</div>
              <div className="col-span-2">Billing Currency</div>
              <div className="col-span-1">Projects</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-studio-border bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-[12px] text-studio-muted">No clients registered.</div>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setDetailOpen(true); }}
                    className="group px-4 py-2 grid grid-cols-12 gap-2 text-[12px] items-center hover:bg-studio-hover/50 transition-colors cursor-pointer relative"
                  >
                    {/* Client ID */}
                    <div className="col-span-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text">
                        {client.id}
                      </span>
                    </div>

                    {/* Client Name */}
                    <div className="col-span-3 min-w-0 pr-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-studio-sidebar flex items-center justify-center text-studio-muted border border-studio-border shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-studio-text truncate group-hover:text-brand-orange transition-colors">
                        {client.name}
                      </p>
                    </div>

                    {/* Contact Details */}
                    <div className="col-span-3 text-studio-muted truncate flex items-center gap-2">
                      {client.email ? (
                        <span className="flex items-center gap-1 truncate" title={client.email}>
                          <Mail className="w-3 h-3 text-studio-muted shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </span>
                      ) : client.phone ? (
                        <span className="flex items-center gap-1 truncate" title={client.phone}>
                          <Phone className="w-3 h-3 text-studio-muted shrink-0" />
                          <span className="truncate">{client.phone}</span>
                        </span>
                      ) : (
                        <span className="text-studio-muted/60 italic text-[11px]">No contact details</span>
                      )}
                    </div>

                    {/* Billing Currency */}
                    <div className="col-span-2 text-studio-muted truncate flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-studio-muted shrink-0" />
                      <span className="truncate">{client.billingCurrency}</span>
                    </div>

                    {/* Active Projects Count */}
                    <div className="col-span-1 text-studio-text font-medium truncate">
                      {client.projects?.length || 0} prj
                    </div>

                    {/* Status & Hover Edit Action */}
                    <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(client);
                          }}
                          title="Edit Client"
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-studio-border hover:border-brand-orange text-studio-text hover:text-brand-orange rounded text-[10px] font-semibold transition-all shadow-sm"
                        >
                          <Pencil className="w-2.5 h-2.5" /> Edit
                        </button>
                      )}
                      <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border shrink-0 ${
                        client.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { UserRole } from '../ui/Layout';
import { Plus, FolderKanban, Building2, Pencil } from 'lucide-react';
import { SkeletonRow } from '../ui/Skeleton';
import ProjectDrawer, { Project } from './ProjectDrawer';
import { Client } from './ClientDrawer';
import ProjectDetailDrawer from './ProjectDetailDrawer';

interface ProjectsViewProps {
  activeRole: UserRole;
}

export default function ProjectsView({ activeRole }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [targetProject, setTargetProject] = useState<Project | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
    ])
      .then(([projs, cls]) => {
        setProjects(projs || []);
        setClients(cls || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setProjects([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [activeRole]);

  const isAdmin = activeRole === 'Super Admin';

  const handleOpenEdit = (project: Project) => {
    setTargetProject(project);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  return (
    <>
      <ProjectDrawer
        open={drawerOpen}
        mode={drawerMode}
        project={drawerMode === 'edit' ? targetProject : null}
        clients={clients}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchData}
      />

      <ProjectDetailDrawer
        open={detailOpen}
        project={selectedProject}
        isAdmin={isAdmin}
        onClose={() => setDetailOpen(false)}
        onEdit={handleOpenEdit}
      />

      <div className="w-full space-y-6">
        <div className="flex justify-between items-center border-b border-studio-border pb-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Project Directory</h2>
            <p className="text-[12px] text-studio-muted">Manage studio projects, client linkings, and budget consumption metrics</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setTargetProject(null); setDrawerMode('add'); setDrawerOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          )}
        </div>

        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-[13px] font-semibold">{error}</div>
        ) : (
          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="bg-studio-sidebar border-b border-studio-border px-4 py-2 text-[10px] font-bold text-studio-muted uppercase tracking-wider grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2">Project ID</div>
              <div className="col-span-3">Project Name</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Billing Type</div>
              <div className="col-span-2">Budget Usage</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-studio-border bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-[12px] text-studio-muted">No projects registered.</div>
              ) : (
                projects.map((proj) => {
                  const consumption = Math.round((proj.loggedHours / (proj.budgetHours || 1)) * 100);
                  const isExceeded = consumption >= 70;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => { setSelectedProject(proj); setDetailOpen(true); }}
                      className="group px-4 py-2 grid grid-cols-12 gap-2 text-[12px] items-center hover:bg-studio-hover/50 transition-colors cursor-pointer relative"
                    >
                      {/* Project ID */}
                      <div className="col-span-2">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text">
                          {proj.id}
                        </span>
                      </div>

                      {/* Project Name */}
                      <div className="col-span-3 min-w-0 pr-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-studio-sidebar flex items-center justify-center text-studio-muted border border-studio-border shrink-0">
                          <FolderKanban className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-studio-text truncate group-hover:text-brand-orange transition-colors">
                          {proj.name}
                        </p>
                      </div>

                      {/* Client */}
                      <div className="col-span-2 text-studio-muted truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-studio-muted shrink-0" />
                        <span className="truncate">{proj.clientName || proj.clientId}</span>
                      </div>

                      {/* Billing Type */}
                      <div className="col-span-2 text-studio-muted truncate text-[11px]">
                        {proj.billingType}
                      </div>

                      {/* Budget Usage Progress Bar */}
                      <div className="col-span-2 pr-2">
                        <div className="flex justify-between text-[10px] font-medium text-studio-muted mb-0.5">
                          <span>{proj.loggedHours}/{proj.budgetHours}h</span>
                          <span className={isExceeded ? 'text-amber-600 font-bold' : ''}>{consumption}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-studio-sidebar rounded-full overflow-hidden border border-studio-border/50">
                          <div
                            className={`h-full ${isExceeded ? 'bg-amber-500' : 'bg-brand-blue'}`}
                            style={{ width: `${Math.min(100, consumption)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status & Hover Edit Action */}
                      <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(proj);
                            }}
                            title="Edit Project"
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-studio-border hover:border-brand-orange text-studio-text hover:text-brand-orange rounded text-[10px] font-semibold transition-all shadow-sm"
                          >
                            <Pencil className="w-2.5 h-2.5" /> Edit
                          </button>
                        )}
                        <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border shrink-0 ${
                          proj.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

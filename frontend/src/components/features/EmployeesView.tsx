import { useState, useEffect } from 'react';
import { UserRole } from '../ui/Layout';
import { Plus, Pencil, Mail, Phone } from 'lucide-react';
import { SkeletonRow } from '../ui/Skeleton';
import EmployeeDrawer, { Employee } from './EmployeeDrawer';
import EmployeeDetailDrawer from './EmployeeDetailDrawer';

interface EmployeesViewProps {
  activeRole: UserRole;
}

export default function EmployeesView({ activeRole }: EmployeesViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees')
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('Access Denied: You do not have permission to view employee registries.');
          throw new Error('Failed to fetch employee list');
        }
        return res.json();
      })
      .then((data) => {
        setEmployees(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, [activeRole]);

  const isAdmin = activeRole === 'Super Admin';

  const handleOpenEdit = (emp: Employee) => {
    setTargetEmployee(emp);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  return (
    <>
      {/* Form Drawer (Add/Edit) */}
      <EmployeeDrawer
        open={drawerOpen}
        mode={drawerMode}
        employee={drawerMode === 'edit' ? targetEmployee : null}
        onClose={() => setDrawerOpen(false)}
        onSaved={fetchEmployees}
      />

      {/* Detail Slide-In Drawer (Shows only on employee selection) */}
      <EmployeeDetailDrawer
        open={detailOpen}
        employee={selectedEmployee}
        isAdmin={isAdmin}
        onClose={() => setDetailOpen(false)}
        onEdit={handleOpenEdit}
      />

      <div className="w-full space-y-6">
        <div className="flex justify-between items-center border-b border-studio-border pb-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Employee Directory</h2>
            <p className="text-[12px] text-studio-muted">Manage studio employee records, contact details, and role assignments</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setTargetEmployee(null); setDrawerMode('add'); setDrawerOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-orange text-white rounded text-[12px] font-semibold hover:bg-opacity-90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Employee
            </button>
          )}
        </div>

        {error ? (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded text-[13px] font-semibold">{error}</div>
        ) : (
          <div className="border border-studio-border rounded-lg bg-white overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="bg-studio-sidebar border-b border-studio-border px-4 py-2 text-[10px] font-bold text-studio-muted uppercase tracking-wider grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2">Emp ID</div>
              <div className="col-span-4">Name / Role</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Phone</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-studio-border bg-white">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-[12px] text-studio-muted">No employees registered.</div>
              ) : (
                employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => { setSelectedEmployee(emp); setDetailOpen(true); }}
                    className="group px-4 py-2 grid grid-cols-12 gap-2 text-[12px] items-center hover:bg-studio-hover/50 transition-colors cursor-pointer relative"
                  >
                    {/* Emp ID */}
                    <div className="col-span-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-studio-sidebar border border-studio-border text-studio-text">
                        {emp.employeeId || `EMP-00${emp.id}`}
                      </span>
                    </div>

                    {/* Name & Role Badge */}
                    <div className="col-span-4 min-w-0 pr-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-studio-sidebar flex items-center justify-center text-[10px] font-bold text-studio-muted border border-studio-border shrink-0">
                        {emp.fullName[0]}
                      </div>
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <p className="font-semibold text-studio-text truncate group-hover:text-brand-orange transition-colors">
                          {emp.fullName}
                        </p>
                        <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                          emp.role === 'Super Admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : emp.role === 'Project Manager'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 text-studio-muted truncate flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-studio-muted shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>

                    {/* Phone */}
                    <div className="col-span-2 text-studio-muted truncate flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-studio-muted shrink-0" />
                      <span className="truncate">{emp.phone}</span>
                    </div>

                    {/* Status & Hover Edit Action */}
                    <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(emp);
                          }}
                          title="Edit Employee"
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-studio-border hover:border-brand-orange text-studio-text hover:text-brand-orange rounded text-[10px] font-semibold transition-all shadow-sm"
                        >
                          <Pencil className="w-2.5 h-2.5" /> Edit
                        </button>
                      )}
                      <span className={`text-[9px] font-semibold px-2 py-0.2 rounded-full border shrink-0 ${
                        emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {emp.status}
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

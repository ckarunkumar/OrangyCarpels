import { UserRole } from '../ui/Layout';
import { TrendingUp, DollarSign, Clock, Users, ArrowUpRight } from 'lucide-react';

interface DashboardViewProps {
  activeRole: UserRole;
}

export default function DashboardView({ activeRole }: DashboardViewProps) {
  // Mock data for display
  const metrics = {
    revenue: '₹18,45,000',
    totalHours: '1,240 hrs',
    activeProjects: '12',
    utilizationRate: '78%',
    budgetAlerts: [
      { client: 'Acme Corp', project: 'Website Redesign', budget: 100, actual: 78, status: 'Yellow' },
      { client: 'Hooli Inc', project: 'Mobile App V2', budget: 200, actual: 195, status: 'Red' },
      { client: 'Stark Ind', project: 'Brand Strategy', budget: 80, actual: 40, status: 'Green' },
    ],
  };

  const renderSuperAdminDashboard = () => (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] text-studio-muted font-medium">Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-brand-orange" />
          </div>
          <p className="text-[20px] font-bold text-studio-text">{metrics.revenue}</p>
          <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last month
          </span>
        </div>

        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] text-studio-muted font-medium">Total Hours Tracked</span>
            <Clock className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-[20px] font-bold text-studio-text">{metrics.totalHours}</p>
          <span className="text-[10px] text-studio-muted mt-1 block">85% billable hours</span>
        </div>

        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] text-studio-muted font-medium">Studio Utilization</span>
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-[20px] font-bold text-studio-text">{metrics.utilizationRate}</p>
          <span className="text-[10px] text-studio-muted mt-1 block">Target: 80% baseline</span>
        </div>

        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[12px] text-studio-muted font-medium">Active Projects</span>
            <BriefcaseIcon className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-[20px] font-bold text-studio-text">{metrics.activeProjects}</p>
          <span className="text-[10px] text-studio-muted mt-1 block">3 clients onboarding</span>
        </div>
      </div>

      {/* SVG Charts Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-5 border border-studio-border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-studio-text">Revenue Trend</h3>
              <p className="text-[10px] text-studio-muted">Time-series normalized in INR</p>
            </div>
            <select className="text-[11px] border border-studio-border rounded px-1.5 py-0.5 bg-studio-sidebar font-medium text-studio-muted">
              <option>Last 30 days</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
          {/* Simple Visual Line Chart using SVG */}
          <div className="h-44 w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path
                d="M0,35 Q15,30 30,22 T60,15 T90,5 L100,5"
                fill="none"
                stroke="#FF5C00"
                strokeWidth="2"
              />
              <path
                d="M0,35 Q15,30 30,22 T60,15 T90,5 L100,5 L100,40 L0,40 Z"
                fill="url(#gradient)"
                opacity="0.08"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF5C00" />
                  <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between text-[9px] text-studio-muted mt-2 px-1">
            <span>Aug 1</span>
            <span>Aug 10</span>
            <span>Aug 20</span>
            <span>Today</span>
          </div>
        </div>

        {/* Billable vs Non-Billable Hours Stacked Bar Chart */}
        <div className="bg-white p-5 border border-studio-border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[13px] font-bold text-studio-text">Hours Analysis</h3>
              <p className="text-[10px] text-studio-muted">Billable vs Non-Billable</p>
            </div>
          </div>
          <div className="h-44 flex flex-col justify-between py-2">
            {[
              { label: 'Week 1', billable: 75, nonBillable: 25 },
              { label: 'Week 2', billable: 80, nonBillable: 20 },
              { label: 'Week 3', billable: 88, nonBillable: 12 },
              { label: 'Week 4', billable: 82, nonBillable: 18 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[10px] text-studio-muted w-12 shrink-0">{item.label}</span>
                <div className="flex-1 h-3 flex rounded overflow-hidden bg-studio-hover">
                  <div className="bg-brand-blue" style={{ width: `${item.billable}%` }}></div>
                  <div className="bg-studio-muted/30" style={{ width: `${item.nonBillable}%` }}></div>
                </div>
                <span className="text-[10px] text-studio-text font-bold w-8 text-right">{item.billable + item.nonBillable}h</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-[9px] text-studio-muted mt-2 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-blue"></span> Billable</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-studio-muted/30"></span> Non-Billable</span>
          </div>
        </div>
      </div>

      {/* Budget Alerts Panel */}
      <div className="bg-white border border-studio-border rounded-lg p-5">
        <h3 className="text-[13px] font-bold text-studio-text mb-3">Client Budget Alert Status</h3>
        <div className="divide-y divide-studio-border">
          {metrics.budgetAlerts.map((alert) => {
            const consumptionPercent = Math.round((alert.actual / alert.budget) * 100);
            const statusColor =
              alert.status === 'Red'
                ? 'bg-brand-red text-red-700'
                : alert.status === 'Yellow'
                ? 'bg-amber-500 text-amber-800'
                : 'bg-green-500 text-green-800';

            return (
              <div key={alert.project} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <h4 className="text-[12px] font-bold text-studio-text">{alert.project}</h4>
                  <p className="text-[10px] text-studio-muted">{alert.client} — Consumption Threshold</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[12px] font-bold text-studio-text">{alert.actual}h</span>
                    <span className="text-[10px] text-studio-muted"> / {alert.budget}h budget</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor} bg-opacity-15`}>
                    {consumptionPercent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProjectManagerDashboard = () => (
    <div className="space-y-6">
      {/* PMs cannot see financial details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Total Hours Logged</span>
          <p className="text-[20px] font-bold text-studio-text">{metrics.totalHours}</p>
          <span className="text-[10px] text-studio-muted mt-1 block">For assigned team projects</span>
        </div>
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Team Utilization</span>
          <p className="text-[20px] font-bold text-studio-text">81%</p>
          <span className="text-[10px] text-green-600 font-semibold block mt-1">Above target threshold</span>
        </div>
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Assigned Projects</span>
          <p className="text-[20px] font-bold text-studio-text">5</p>
          <span className="text-[10px] text-studio-muted mt-1 block">Active under manager control</span>
        </div>
      </div>

      <div className="bg-white border border-studio-border rounded-lg p-5">
        <h3 className="text-[13px] font-bold text-studio-text mb-1">Team Hours & Log Status</h3>
        <p className="text-[11px] text-studio-muted mb-4">Pending timesheet approvals for your team</p>
        <div className="border border-studio-border rounded overflow-hidden text-[12px]">
          <div className="bg-studio-sidebar border-b border-studio-border py-2 px-3 font-semibold text-studio-muted grid grid-cols-3">
            <span>Employee</span>
            <span>Logged Hours</span>
            <span>Action Required</span>
          </div>
          <div className="divide-y divide-studio-border bg-white">
            <div className="py-2.5 px-3 grid grid-cols-3 items-center">
              <span className="font-bold">Alex Carter</span>
              <span>38.5 hrs</span>
              <span className="text-brand-orange font-medium flex items-center gap-1">
                Pending Approval <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="py-2.5 px-3 grid grid-cols-3 items-center">
              <span className="font-bold">Emma Watson</span>
              <span>40.0 hrs</span>
              <span className="text-green-600 font-medium">Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="space-y-6">
      {/* Employee Personal Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Hours Logged (This Week)</span>
          <p className="text-[20px] font-bold text-studio-text">32.5 hrs</p>
          <span className="text-[10px] text-brand-orange font-semibold block mt-1">7.5 hrs remaining</span>
        </div>
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Leave Balance</span>
          <p className="text-[20px] font-bold text-studio-text">14 days</p>
          <span className="text-[10px] text-studio-muted mt-1 block">Casual: 6 | Sick: 8</span>
        </div>
        <div className="bg-white p-4 border border-studio-border rounded-lg">
          <span className="text-[12px] text-studio-muted font-medium block mb-1">Assigned Projects</span>
          <p className="text-[20px] font-bold text-studio-text">2</p>
          <span className="text-[10px] text-studio-muted mt-1 block">Acme Website, Stark Branding</span>
        </div>
      </div>

      <div className="bg-white border border-studio-border rounded-lg p-5">
        <h3 className="text-[13px] font-bold text-studio-text mb-3">Your Upcoming Leaves</h3>
        <div className="text-[12px] text-studio-muted text-center py-6 border border-dashed border-studio-border rounded">
          No upcoming scheduled leaves. Need time off? Apply in the timesheet view.
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center border-b border-studio-border pb-3">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Studio Overview</h2>
          <p className="text-[12px] text-studio-muted">Real-time activity and utilization statistics</p>
        </div>
        <div className="text-[11px] text-studio-muted font-medium bg-white border border-studio-border rounded px-2.5 py-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
          Filters Enabled
        </div>
      </div>

      {activeRole === 'Super Admin' && renderSuperAdminDashboard()}
      {activeRole === 'Project Manager' && renderProjectManagerDashboard()}
      {activeRole === 'Employee' && renderEmployeeDashboard()}
    </div>
  );
}

// Small layout helper
function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Clock, Users, Building2, FolderKanban, Lock } from 'lucide-react';
import UserProfileDrawer from './UserProfileDrawer';

export type UserRole = 'Super Admin' | 'Project Manager' | 'Employee';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, role } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Super Admin', 'Project Manager', 'Employee'] },
    { label: 'Timesheets', path: '/timesheets', icon: Clock, roles: ['Super Admin', 'Project Manager', 'Employee'] },
    { label: 'Employees', path: '/employees', icon: Users, roles: ['Super Admin', 'Project Manager'] },
    { label: 'Clients', path: '/clients', icon: Building2, roles: ['Super Admin', 'Project Manager'] },
    { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['Super Admin', 'Project Manager'] },
  ];

  if (!user || !role) return null;

  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col font-sans">
      {/* Profile Drawer */}
      <UserProfileDrawer open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-studio-border bg-white pr-6 flex justify-between items-center h-14">
        <div className="flex items-center">
          {/* Logo container aligned with sidebar */}
          <div
            className={`flex items-center shrink-0 transition-all duration-300 ease-in-out ${
              isCollapsed ? 'w-16 justify-center' : 'w-56 px-4 gap-2.5'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="flex items-center justify-center cursor-pointer focus:outline-none p-0.5"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <img
                src="/logo.png"
                alt="Orangy Carpels Logo"
                className="w-7 h-7 object-contain transition-transform hover:scale-110"
              />
            </button>

            {!isCollapsed && (
              <div className="flex items-center overflow-hidden">
                <span className="font-semibold text-[14px] tracking-tight text-studio-text whitespace-nowrap">
                  Orangy Carpels
                </span>
              </div>
            )}
          </div>

          {isCollapsed && (
            <div className="flex items-center pl-2">
              <span className="font-semibold text-[14px] tracking-tight text-studio-text">Orangy Carpels</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar with Smooth Expand / Collapse */}
        <aside
          className={`border-r border-studio-border bg-studio-sidebar p-3 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-16 items-center' : 'w-56'
          }`}
        >
          <div className={`space-y-1 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            <nav className={`space-y-1 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              {visibleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <div key={item.label} className="relative group w-full flex justify-center">
                    <Link
                      to={item.path}
                      className={`flex items-center rounded text-[13px] font-medium transition-colors ${
                        isCollapsed ? 'w-10 h-10 justify-center' : 'w-full gap-2.5 px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-studio-hover text-brand-orange font-semibold'
                          : 'text-studio-text hover:bg-studio-hover/70'
                      }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-orange' : 'text-studio-muted'}`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>

                    {/* Tooltip in collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1e293b] text-white text-[11px] font-medium rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-[#1e293b]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User Profile Trigger at Bottom of Sidebar */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="relative group w-full flex justify-center pb-1 focus:outline-none"
              title="Open Profile"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[12px] font-bold text-studio-muted border border-studio-border overflow-hidden cursor-pointer shadow-sm hover:border-brand-orange transition-colors">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName[0]
                )}
              </div>
              {/* Tooltip for User */}
              <div className="absolute left-full ml-2.5 bottom-0 px-3 py-2 bg-[#1e293b] text-white text-[11px] rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 space-y-0.5 text-left">
                <p className="font-bold">{user.fullName}</p>
                <p className="text-[10px] text-slate-300">{role}</p>
                <p className="text-[9px] text-brand-orange pt-0.5 font-medium">Click to view profile & sign out</p>
                <div className="absolute right-full bottom-2.5 border-[4px] border-transparent border-r-[#1e293b]" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="w-full text-left border border-studio-border rounded bg-white p-2.5 space-y-2 hover:border-brand-orange/50 hover:bg-studio-hover/30 transition-all cursor-pointer focus:outline-none group"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-studio-sidebar flex items-center justify-center text-[12px] font-bold text-studio-muted border border-studio-border overflow-hidden shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName[0]
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-studio-text truncate group-hover:text-brand-orange transition-colors">
                    {user.fullName}
                  </p>
                  <p className="text-[9px] text-studio-muted truncate">{role}</p>
                </div>
              </div>
              {role !== 'Super Admin' && (
                <div className="flex items-center gap-1 text-[9px] text-red-500 font-medium bg-red-50/50 border border-red-100 p-1 rounded">
                  <Lock className="w-2.5 h-2.5 shrink-0" />
                  Financial data restricted
                </div>
              )}
            </button>
          )}
        </aside>

        {/* Content View Area */}
        <main className="flex-1 bg-studio-bg overflow-y-auto px-8 py-6 scrollbar-gutter-stable">
          {children}
        </main>
      </div>
    </div>
  );
}

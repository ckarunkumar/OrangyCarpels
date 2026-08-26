import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Clock, Users, Building2, FolderKanban, Settings, LogOut, ChevronDown, Bell } from 'lucide-react';
import UserProfileDrawer from './UserProfileDrawer';
import NotificationDrawer, { NotificationItem } from './NotificationDrawer';

export type UserRole = 'Super Admin' | 'Project Manager' | 'Employee';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleMarkAsRead = (id: number) => {
    fetch(`/api/notifications/${id}/read`, { method: 'POST' }).then(fetchNotifications);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    fetch('/api/notifications/read-all', { method: 'POST' }).then(fetchNotifications);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSelectNotification = (item: NotificationItem) => {
    if (!item.isRead) handleMarkAsRead(item.id);
    setIsNotificationOpen(false);
    if (item.projectId) {
      navigate(`/timesheets?projectId=${item.projectId}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Super Admin', 'Project Manager', 'Employee'] },
    { label: 'Timesheets', path: '/timesheets', icon: Clock, roles: ['Super Admin', 'Project Manager', 'Employee'] },
    { label: 'Team', path: '/employees', icon: Users, roles: ['Super Admin', 'Project Manager'] },
    { label: 'Clientele', path: '/clients', icon: Building2, roles: ['Super Admin', 'Project Manager'] },
    { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['Super Admin', 'Project Manager'] },
  ];

  if (!user || !role) return null;
  const visibleNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col font-sans">
      <UserProfileDrawer open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationDrawer
        open={isNotificationOpen}
        notifications={notifications}
        onClose={() => setIsNotificationOpen(false)}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* Top Header with Notification Bell & User Profile at Right */}
      <header className="sticky top-0 z-40 border-b border-studio-border bg-white pr-6 flex justify-between items-center h-14">
        <div className="flex items-center">
          <div className={`flex items-center shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16 justify-center' : 'w-56 px-4 gap-2.5'}`}>
            <button type="button" onClick={() => setIsCollapsed((prev) => !prev)} className="p-0.5 focus:outline-none" title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <img src="/logo.svg" alt="Orangyy Carpels Logo" className="w-7 h-7 object-contain hover:scale-110 transition-transform" />
            </button>
            {!isCollapsed && <span className="font-semibold text-[14px] tracking-tight text-studio-text whitespace-nowrap">Orangyy Carpels</span>}
          </div>
          {isCollapsed && <span className="font-semibold text-[14px] tracking-tight text-studio-text pl-2">Orangyy Carpels</span>}
        </div>

        {/* Right Top Header Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Icon */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            title="Notifications"
            className="relative p-2 rounded-lg border border-studio-border bg-studio-sidebar/40 hover:bg-studio-hover text-studio-muted hover:text-studio-text transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-brand-orange text-[9.5px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen((prev) => !prev)} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-studio-border bg-studio-sidebar/40 hover:bg-studio-hover/70 hover:border-brand-orange/40 transition-all focus:outline-none shadow-sm cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[12px] font-bold text-studio-muted border border-studio-border overflow-hidden shrink-0">
                {user.avatar ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" /> : user.fullName[0]}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[12px] font-bold text-studio-text leading-tight">{user.fullName}</p>
                <p className="text-[9.5px] text-studio-muted leading-tight">{user.designation || 'Team Member'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-studio-muted shrink-0" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-studio-border rounded-lg shadow-xl py-1 z-50 w-44 text-[12px] animate-in fade-in slide-in-from-top-1">
                <button type="button" onClick={() => { setMenuOpen(false); setIsProfileOpen(true); }} className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-studio-text hover:bg-studio-hover hover:text-brand-orange transition-colors cursor-pointer">
                  <Settings className="w-3.5 h-3.5 text-studio-muted" /> User Settings
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); logout(); }} className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors border-t border-studio-border/60 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5 text-red-500" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <aside className={`border-r border-studio-border bg-studio-sidebar p-3 flex flex-col justify-between shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16 items-center' : 'w-56'}`}>
          <div className={`space-y-1 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            <nav className={`space-y-1 w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
              {visibleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                return (
                  <div key={item.label} className="relative group w-full flex justify-center">
                    <Link to={item.path} className={`flex items-center rounded text-[13px] font-medium transition-colors ${isCollapsed ? 'w-10 h-10 justify-center' : 'w-full gap-2.5 px-3 py-2'} ${isActive ? 'bg-studio-hover text-brand-orange font-semibold' : 'text-studio-text hover:bg-studio-hover/70'}`}>
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-orange' : 'text-studio-muted'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                    {isCollapsed && (
                      <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#1e293b] text-white text-[11px] font-medium rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 bg-studio-bg overflow-y-auto px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

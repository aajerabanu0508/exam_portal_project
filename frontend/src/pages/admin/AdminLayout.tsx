import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon,
  Cog6ToothIcon, AcademicCapIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/admin/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
  { to: '/admin/results', icon: ClipboardDocumentListIcon, label: 'Results' },
  { to: '/admin/questions', icon: QuestionMarkCircleIcon, label: 'Questions' },
  { to: '/admin/tests', icon: Cog6ToothIcon, label: 'Test Config' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-purple
                            flex items-center justify-center shadow-glow">
              <AcademicCapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AWS Learning</p>
              <p className="text-xs text-primary-400">Trainer Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                    : 'text-gray-400 hover:bg-surface-hover hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-primary-400">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full gap-2 text-sm py-2">
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

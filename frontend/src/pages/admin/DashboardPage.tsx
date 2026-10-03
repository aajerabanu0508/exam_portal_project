import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  UsersIcon, ClipboardDocumentListIcon, TrophyIcon,
  ChartBarIcon, ExclamationCircleIcon, CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { resultService } from '../../services/examService';
import { AdminStats } from '../../types';
import { Loader } from '../../components/ui/Loader';

const statCards = (s: AdminStats) => [
  { label: 'Total Students', value: s.total_students, icon: UsersIcon, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
  { label: 'Total Attempts', value: s.total_attempts, icon: ClipboardDocumentListIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { label: 'Avg Score', value: `${s.average_score.toFixed(1)}`, icon: ChartBarIcon, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { label: 'Highest Score', value: s.highest_score, icon: TrophyIcon, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { label: 'Lowest Score', value: s.lowest_score, icon: ExclamationCircleIcon, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { label: 'Pass Rate', value: `${s.pass_percentage}%`, icon: CheckBadgeIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resultService.adminStats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of all examinations and student performance</p>
        </div>

        {loading ? <Loader /> : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards(stats).map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`stat-card border ${bg}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{label}</p>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400">No data available yet. Students need to complete exams first.</p>
          </div>
        )}

        {stats && (
          <div className="mt-8 glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Pass Rate Overview</h2>
            <div className="flex items-end gap-4">
              <div className="flex-1 bg-surface-hover rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 transition-all"
                  style={{ width: `${stats.pass_percentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-emerald-400">{stats.pass_percentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats.total_attempts} total attempts completed
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

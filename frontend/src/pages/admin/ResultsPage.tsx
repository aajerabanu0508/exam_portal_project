import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  MagnifyingGlassIcon, ArrowDownTrayIcon, EyeIcon,
  CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { resultService } from '../../services/examService';
import { ResultListItem } from '../../types';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ResultsPage() {
  const [results, setResults] = useState<ResultListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchResults = useCallback(() => {
    setLoading(true);
    resultService.list({ search: debouncedSearch || undefined })
      .then(r => setResults(r.data))
      .catch(() => toast.error('Failed to load results'))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleExport = async () => {
    try {
      const { data } = await resultService.exportCsv();
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `results_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  const sortedResults = [...results].sort((a, b) =>
    new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime()
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Student Results</h1>
            <p className="text-gray-400 text-sm mt-1">{results.length} total submissions</p>
          </div>
          <button onClick={handleExport} className="btn-secondary gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by student name, email, or test..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {loading ? <Loader /> : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Test</th>
                    <th>Score</th>
                    <th>%</th>
                    <th>Violations</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-500 py-12">
                        No results found
                      </td>
                    </tr>
                  ) : sortedResults.map((r) => (
                    <tr key={r.attempt_id}>
                      <td>
                        <div>
                          <p className="font-medium text-white">{r.student_name}</p>
                          <p className="text-xs text-gray-500">{r.student_email}</p>
                          {r.college && <p className="text-xs text-gray-600">{r.college}</p>}
                        </div>
                      </td>
                      <td className="text-gray-300 max-w-[140px] truncate">{r.test_name}</td>
                      <td className="text-white font-mono font-medium">{r.score}/{r.max_score}</td>
                      <td>
                        <span className={`font-bold ${
                          r.percentage >= 70 ? 'text-green-400' :
                          r.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td>
                        {r.total_violations > 0 ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                            {r.total_violations}
                          </span>
                        ) : (
                          <span className="text-green-400">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'submitted' ? 'badge-blue' :
                          r.status === 'auto_submitted' ? 'badge-amber' : 'badge-gray'
                        }`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs whitespace-nowrap">
                        {r.submitted_at ? format(new Date(r.submitted_at), 'dd MMM yyyy HH:mm') : '—'}
                      </td>
                      <td>
                        <span className={`badge ${r.passed ? 'badge-green' : 'badge-red'}`}>
                          {r.passed ? (
                            <><CheckCircleIcon className="w-3 h-3" /> Pass</>
                          ) : (
                            <><XCircleIcon className="w-3 h-3" /> Fail</>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

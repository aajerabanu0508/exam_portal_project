import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon, CheckCircleIcon, XCircleIcon,
  TrophyIcon, ChartBarIcon, ClockIcon, ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ExamResult, TopicScore } from '../types';
import { resultService } from '../services/examService';
import { Loader } from '../components/ui/Loader';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';

export default function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(
    (location.state as any)?.result || null
  );
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (!result && attemptId) {
      resultService.get(attemptId)
        .then(r => setResult(r.data))
        .catch(() => navigate('/'))
        .finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading || !result) return <Loader fullScreen text="Loading results..." />;

  const percentage = result.percentage;
  const passed = result.passed;

  const radialData = [{ value: percentage, fill: passed ? '#10b981' : '#ef4444' }];

  const topicChartData = result.topic_scores.map(t => ({
    topic: t.topic.length > 15 ? t.topic.slice(0, 13) + '…' : t.topic,
    fullTopic: t.topic,
    percentage: t.percentage,
    correct: t.correct,
    total: t.total,
  }));

  const getBarColor = (pct: number) =>
    pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen bg-mesh p-4 sm:p-8">
      <div className="max-w-4xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4
                          ${passed ? 'bg-green-500/20 border-2 border-green-500' : 'bg-red-500/20 border-2 border-red-500'}`}>
            {passed
              ? <TrophyIcon className="w-10 h-10 text-green-400" />
              : <XCircleIcon className="w-10 h-10 text-red-400" />
            }
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Examination Result</h1>
          <p className="text-gray-400">{result.test_name}</p>
        </div>

        {/* Student info */}
        <div className="glass-card p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Student</p>
              <p className="text-white font-medium">{result.student_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="text-white font-medium truncate">{result.student_email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Institution</p>
              <p className="text-white font-medium">{result.college || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Status</p>
              <span className={`badge ${passed ? 'badge-green' : 'badge-red'}`}>
                {passed ? '✓ PASSED' : '✗ FAILED'}
              </span>
            </div>
          </div>
        </div>

        {/* Score + Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Circular score */}
          <div className="glass-card p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-white mb-4">Overall Score</h2>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%" outerRadius="90%"
                  barSize={12}
                  data={radialData}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar dataKey="value" background={{ fill: '#1e1e3a' }} cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${passed ? 'text-green-400' : 'text-red-400'}`}>
                  {percentage}%
                </span>
                <span className="text-sm text-gray-400">{result.score}/{result.max_score}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Breakdown</h2>
            <div className="space-y-3">
              {[
                { icon: CheckCircleIcon, label: 'Correct Answers', value: result.correct_count, color: 'text-green-400' },
                { icon: XCircleIcon, label: 'Wrong Answers', value: result.wrong_count, color: 'text-red-400' },
                { icon: ClockIcon, label: 'Unanswered', value: result.unanswered_count, color: 'text-gray-400' },
                { icon: ExclamationTriangleIcon, label: 'Total Violations', value: result.total_violations, color: 'text-amber-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                  <span className={`text-lg font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Performance */}
        {topicChartData.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary-400" />
              Topic-wise Performance
            </h2>
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topicChartData} margin={{ top: 5, right: 10, left: -10, bottom: 60 }}>
                  <XAxis
                    dataKey="topic"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: '#161628', border: '1px solid #1e1e3a', borderRadius: '8px' }}
                    formatter={(val: number, _name: string, props: any) => [
                      `${val}% (${props.payload.correct}/${props.payload.total})`, 'Score'
                    ]}
                    labelFormatter={(label: string, payload: any) =>
                      payload?.[0]?.payload?.fullTopic || label
                    }
                  />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {topicChartData.map((entry, idx) => (
                      <Cell key={idx} fill={getBarColor(entry.percentage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Topic table */}
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Topic</th>
                    <th>Correct</th>
                    <th>Total</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {result.topic_scores.map((t: TopicScore) => (
                    <tr key={t.topic}>
                      <td className="text-white">{t.topic}</td>
                      <td className="text-green-400 font-medium">{t.correct}</td>
                      <td className="text-gray-400">{t.total}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-hover rounded-full h-1.5 min-w-[60px]">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${t.percentage}%`,
                                backgroundColor: getBarColor(t.percentage),
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium" style={{ color: getBarColor(t.percentage) }}>
                            {t.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Violations info */}
        {(result.tab_switches > 0 || result.fullscreen_exits > 0) && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-base font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4" /> Proctor Report
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-gray-400">Tab Switches</p>
                <p className="text-xl font-bold text-red-400">{result.tab_switches}</p>
              </div>
              <div>
                <p className="text-gray-400">Fullscreen Exits</p>
                <p className="text-xl font-bold text-red-400">{result.fullscreen_exits}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Violations</p>
                <p className="text-xl font-bold text-amber-400">{result.total_violations}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="btn-secondary"
            id="retake-btn"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

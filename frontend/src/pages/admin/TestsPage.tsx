import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { testService } from '../../services/examService';
import { Test } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', duration_minutes: 30, total_questions: 30,
  marks_per_correct: 1.0, negative_marks: 0.0, passing_percentage: 50.0,
  max_violations: 3, auto_submit_on_violation: true,
  difficulty_config: { easy: 10, medium: 15, hard: 5 },
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    testService.list().then(r => setTests(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (t: Test) => {
    setForm({
      name: t.name, description: t.description || '',
      duration_minutes: t.duration_minutes, total_questions: t.total_questions,
      marks_per_correct: t.marks_per_correct, negative_marks: t.negative_marks,
      passing_percentage: t.passing_percentage, max_violations: t.max_violations,
      auto_submit_on_violation: t.auto_submit_on_violation,
      difficulty_config: (t.difficulty_config as any) || { easy: 10, medium: 15, hard: 5 },
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await testService.update(editingId, form as any);
        toast.success('Test updated');
      } else {
        await testService.create(form as any);
        toast.success('Test created');
      }
      setShowForm(false);
      load();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await testService.delete(deleteId);
      toast.success('Test deleted');
      setDeleteId(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Test Configuration</h1>
            <p className="text-gray-400 text-sm mt-1">Create and manage examination settings</p>
          </div>
          <button onClick={openAdd} className="btn-primary gap-2">
            <PlusIcon className="w-4 h-4" />
            New Test
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="grid gap-4">
            {tests.map(test => (
              <div key={test.id} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                    {test.description && <p className="text-gray-400 text-sm mt-1">{test.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-4">
                      {[
                        { label: 'Duration', value: `${test.duration_minutes} min` },
                        { label: 'Questions', value: test.total_questions },
                        { label: 'Pass Threshold', value: `${test.passing_percentage}%` },
                        { label: 'Max Violations', value: test.max_violations },
                        { label: 'Marking', value: `+${test.marks_per_correct} / ${test.negative_marks}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="px-3 py-1.5 bg-surface-hover rounded-lg border border-surface-border">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-sm font-medium text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => openEdit(test)} className="btn-secondary p-2.5">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(test.id)} className="btn-secondary p-2.5 text-red-400 hover:border-red-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tests.length === 0 && (
              <div className="glass-card p-12 text-center text-gray-500">
                No tests configured. Create your first test.
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          title={editingId ? 'Edit Test' : 'Create New Test'}
          onClose={() => setShowForm(false)}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Test Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="form-input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} className="form-input resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Duration (minutes)', key: 'duration_minutes', type: 'number' },
                { label: 'Total Questions', key: 'total_questions', type: 'number' },
                { label: 'Marks per Correct', key: 'marks_per_correct', type: 'number' },
                { label: 'Negative Marks', key: 'negative_marks', type: 'number' },
                { label: 'Passing %', key: 'passing_percentage', type: 'number' },
                { label: 'Max Violations', key: 'max_violations', type: 'number' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                    className="form-input"
                    min={0}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Distribution</label>
              <div className="grid grid-cols-3 gap-3">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <div key={d}>
                    <label className="block text-xs text-gray-400 mb-1 capitalize">{d}</label>
                    <input
                      type="number"
                      value={form.difficulty_config[d]}
                      onChange={e => setForm(f => ({
                        ...f,
                        difficulty_config: { ...f.difficulty_config, [d]: Number(e.target.value) }
                      }))}
                      className="form-input"
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="auto-submit"
                type="checkbox"
                checked={form.auto_submit_on_violation}
                onChange={e => setForm(f => ({ ...f, auto_submit_on_violation: e.target.checked }))}
                className="w-4 h-4 accent-primary-500"
              />
              <label htmlFor="auto-submit" className="text-sm text-gray-300">
                Auto-submit on max violations
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update Test' : 'Create Test'}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Test"
          message="Are you sure? This will deactivate the test."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}

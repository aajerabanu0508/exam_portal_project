import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from './AdminLayout';
import {
  PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { questionService } from '../../services/examService';
import { Question } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const TOPICS = [
  'Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks',
  'DBMS', 'Computer Organization', 'Digital Logic', 'Theory of Computation',
  'Compiler Design', 'Discrete Mathematics', 'Programming', 'AWS Cloud',
];

const EMPTY_FORM = {
  question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
  correct_answer: 0, explanation: '', topic: 'Data Structures', difficulty: 'medium' as const,
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    questionService.list({
      topic: topicFilter || undefined,
      difficulty: diffFilter || undefined,
    })
      .then(r => setQuestions(r.data))
      .finally(() => setLoading(false));
  }, [topicFilter, diffFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = questions.filter(q =>
    !search || q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (q: Question) => {
    setForm({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer,
      explanation: q.explanation || '', topic: q.topic, difficulty: q.difficulty,
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await questionService.update(editingId, form);
        toast.success('Question updated');
      } else {
        await questionService.create(form);
        toast.success('Question added');
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
      await questionService.delete(deleteId);
      toast.success('Question deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const diffBadge = (d: string) =>
    d === 'easy' ? 'badge-green' : d === 'medium' ? 'badge-amber' : 'badge-red';

  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionKeys = ['option_a', 'option_b', 'option_c', 'option_d'] as const;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Question Bank</h1>
            <p className="text-gray-400 text-sm mt-1">{questions.length} questions</p>
          </div>
          <button onClick={openAdd} className="btn-primary gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Topics</option>
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {loading ? <Loader /> : (
          <div className="glass-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-8">#</th>
                  <th>Question</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Correct</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-12">No questions found</td>
                  </tr>
                ) : filtered.map((q, i) => (
                  <tr key={q.id}>
                    <td className="text-gray-500 text-xs">{i + 1}</td>
                    <td>
                      <p className="text-white text-sm line-clamp-2 max-w-sm">{q.question_text}</p>
                    </td>
                    <td><span className="badge badge-blue">{q.topic}</span></td>
                    <td><span className={`badge ${diffBadge(q.difficulty)}`}>{q.difficulty}</span></td>
                    <td>
                      <span className="text-green-400 font-mono font-bold text-sm">
                        {optionLabels[q.correct_answer]}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(q)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(q.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showForm}
          title={editingId ? 'Edit Question' : 'Add Question'}
          onClose={() => setShowForm(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Question Text</label>
              <textarea
                value={form.question_text}
                onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))}
                rows={3}
                className="form-input resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {optionKeys.map((key, idx) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Option {optionLabels[idx]}
                    {form.correct_answer === idx && (
                      <span className="ml-2 text-green-400 text-xs">✓ Correct</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Correct Answer</label>
                <select
                  value={form.correct_answer}
                  onChange={e => setForm(f => ({ ...f, correct_answer: Number(e.target.value) }))}
                  className="form-input"
                >
                  {optionLabels.map((l, i) => <option key={i} value={i}>Option {l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Topic</label>
                <select
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  className="form-input"
                >
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Difficulty</label>
                <select
                  value={form.difficulty}
                  onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))}
                  className="form-input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Explanation <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                rows={2}
                className="form-input resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : editingId ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteId}
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          variant="danger"
        />
      </div>
    </AdminLayout>
  );
}

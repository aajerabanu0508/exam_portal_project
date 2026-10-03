import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { authService } from '../../services/examService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form.email, form.password);
      const userObj = {
        id: data.user_id,
        name: data.name,
        email: form.email,
        role: data.role as 'trainer',
      };
      setAuth(userObj, data.access_token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary-600 to-accent-purple shadow-glow mb-4">
            <LockClosedIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Trainer Login</h1>
          <p className="text-gray-400 text-sm mt-1">AWS Learning Assessment Dashboard</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="trainer@awslearning.com"
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">
            Default: admin@awslearning.com / Admin@123
          </p>
          <p className="text-center text-xs text-gray-600 mt-2">
            <a href="/" className="text-primary-400 hover:text-primary-300">← Student Exam Portal</a>
          </p>
        </div>
      </div>
    </div>
  );
}

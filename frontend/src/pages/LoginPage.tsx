import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    student_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.student_id.trim()) errs.student_id = 'Student ID is required';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await authService.register(form);
      const userObj = {
        id: data.user_id,
        name: data.name,
        email: form.email,
        phone: form.phone,
        college: form.college,
        student_id: form.student_id,
        role: data.role as 'student',
      };
      setAuth(userObj, data.access_token);
      navigate('/rules');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
                          bg-gradient-to-br from-primary-600 to-accent-purple shadow-glow mb-4">
            <AcademicCapIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">AWS Learning Assessment</h1>
          <p className="text-gray-400 text-sm">Online Technical Examination Platform</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-aws-orange/20 text-amber-400 border border-amber-500/30">
              AWS Certified
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
              CS Assessment
            </span>
          </div>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Student Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="name">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="phone">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="student_id">
                  Student ID <span className="text-red-400">*</span>
                </label>
                <input
                  id="student_id"
                  name="student_id"
                  type="text"
                  placeholder="STU-001"
                  value={form.student_id}
                  onChange={handleChange}
                  className={`form-input ${errors.student_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.student_id && <p className="text-xs text-red-400 mt-1">{errors.student_id}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="college">
                College / Institution
              </label>
              <input
                id="college"
                name="college"
                type="text"
                placeholder="Your college or institution"
                value={form.college}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              id="start-test-btn"
              disabled={loading}
              className="btn-primary w-full mt-2 text-base py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Test
                  <ArrowRightIcon className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            Are you a trainer?{' '}
            <a href="/admin/login" className="text-primary-400 hover:text-primary-300 transition-colors">
              Trainer Login →
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Secure Browser-Based Examination Platform · Powered by FastAPI + React
        </p>
      </div>
    </div>
  );
}

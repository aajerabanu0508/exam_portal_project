import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon, QuestionMarkCircleIcon, CameraIcon,
  MicrophoneIcon, ComputerDesktopIcon, ExclamationTriangleIcon,
  CheckCircleIcon, ArrowRightIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const rules = [
  { icon: QuestionMarkCircleIcon, label: 'Total Questions', value: '30 MCQs', color: 'text-primary-400' },
  { icon: ClockIcon, label: 'Duration', value: '30 Minutes', color: 'text-cyan-400' },
  { icon: ComputerDesktopIcon, label: 'Mode', value: 'Fullscreen Required', color: 'text-amber-400' },
  { icon: CameraIcon, label: 'Camera', value: 'Required & Active', color: 'text-green-400' },
  { icon: MicrophoneIcon, label: 'Microphone', value: 'Required & Active', color: 'text-green-400' },
];

const doList = [
  'Read each question carefully before selecting an answer',
  'You can navigate between questions using the navigation panel',
  'Mark questions for review and revisit before submitting',
  'Submit before the timer expires',
  'Stay in fullscreen mode throughout the examination',
];

const dontList = [
  'Do NOT switch browser tabs or minimize the window',
  'Do NOT use right-click or keyboard shortcuts (Ctrl+C, Ctrl+V, etc.)',
  'Do NOT copy or paste text during the examination',
  'Do NOT close or refresh the browser during the exam',
  'Repeated violations will result in auto-submission',
];

export default function RulesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mesh p-4 sm:p-8">
      <div className="max-w-3xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-primary-500/20 border border-primary-500/30 text-primary-400
                          text-sm font-medium mb-4">
            <DocumentTextIcon className="w-4 h-4" />
            Examination Guidelines
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Examination Rules & Instructions</h1>
          <p className="text-gray-400">
            Welcome, <span className="text-white font-medium">{user?.name}</span>.
            Please read all instructions carefully before proceeding.
          </p>
        </div>

        {/* Exam info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {rules.map((rule) => (
            <div key={rule.label} className="glass-card p-4 text-center">
              <rule.icon className={`w-6 h-6 mx-auto mb-2 ${rule.color}`} />
              <p className="text-xs text-gray-500 mb-1">{rule.label}</p>
              <p className={`text-sm font-semibold ${rule.color}`}>{rule.value}</p>
            </div>
          ))}
        </div>

        {/* Scoring info */}
        <div className="glass-card p-5 mb-6">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" /> Scoring System
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-green-400">+1</p>
              <p className="text-xs text-gray-400 mt-1">Correct Answer</p>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-400">0</p>
              <p className="text-xs text-gray-400 mt-1">Unanswered</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-2xl font-bold text-red-400">0</p>
              <p className="text-xs text-gray-400 mt-1">Wrong Answer</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            No negative marking. Maximum score: 30 points. Passing threshold: 50%
          </p>
        </div>

        {/* Do / Don't */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-green-400 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" /> DO
            </h2>
            <ul className="space-y-2.5">
              {doList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30
                                   flex items-center justify-center flex-shrink-0 text-green-400 text-xs font-bold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-red-400 mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" /> DO NOT
            </h2>
            <ul className="space-y-2.5">
              {dontList.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30
                                   flex items-center justify-center flex-shrink-0 text-red-400 text-xs font-bold">
                    ✗
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-8">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            <strong>Important:</strong> This examination uses browser-level proctoring controls.
            After <strong>3 violations</strong> (tab switches or fullscreen exits),
            your test will be automatically submitted.
          </p>
        </div>

        {/* Agree button */}
        <div className="text-center">
          <button
            id="agree-start-btn"
            onClick={() => navigate('/permissions')}
            className="btn-primary px-12 py-4 text-base"
          >
            I Agree & Proceed to Camera Setup
            <ArrowRightIcon className="w-5 h-5" />
          </button>
          <p className="text-xs text-gray-600 mt-3">
            By clicking above, you agree to follow all examination rules.
          </p>
        </div>
      </div>
    </div>
  );
}

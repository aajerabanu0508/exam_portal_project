import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon, CameraIcon, MicrophoneIcon,
  ExclamationTriangleIcon, ChevronLeftIcon, ChevronRightIcon,
  FlagIcon, TrashIcon, ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../hooks/useTimer';
import { useProctor } from '../hooks/useProctor';
import { useMedia } from '../hooks/useMedia';
import { attemptService } from '../services/examService';
import { AttemptResponse, AnswerState, QuestionStatus, ViolationState } from '../types';
import { ConfirmDialog } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import toast from 'react-hot-toast';

type NavStatus = 'not-visited' | 'answered' | 'marked' | 'answered-marked';

export default function ExamPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Load attempt from localStorage ──────────────────────────────────────
  const [attempt, setAttempt] = useState<AttemptResponse | null>(() => {
    try {
      const data = localStorage.getItem('attemptData');
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  });
  const attemptId = localStorage.getItem('attemptId') || '';

  // ── State ────────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    if (!attempt) return {};
    return Object.fromEntries(
      attempt.questions.map(q => [q.id, { selected_option: null, is_marked_for_review: false }])
    );
  });
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violations, setViolations] = useState<ViolationState>({ tabSwitches: 0, fullscreenExits: 0, total: 0 });
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_VIOLATIONS = 3;

  // ── Media ─────────────────────────────────────────────────────────────────
  const { cameraReady, micReady, stream, requestPermissions, stopStream } = useMedia();

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const doSubmit = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data: result } = await attemptService.submit(attemptId);
      stopStream();
      localStorage.removeItem('attemptData');
      localStorage.removeItem('attemptId');
      localStorage.removeItem('testId');
      navigate(`/result/${result.attempt_id}`, { state: { result } });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Submission failed');
      setSubmitting(false);
    }
  }, [attemptId, navigate, stopStream, submitting]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const { formatted, timerClass, isWarning, isDanger, stop: stopTimer } = useTimer({
    durationSeconds: attempt?.time_limit_seconds || 1800,
    onExpire: () => {
      toast('⏱ Time is up! Submitting automatically.', { icon: '⚠️' });
      doSubmit(true);
    },
  });

  // ── Show warning banner ───────────────────────────────────────────────────
  const showWarning = useCallback((msg: string) => {
    setWarningMessage(msg);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setWarningMessage(null), 5000);
  }, []);

  // ── Violation handlers ────────────────────────────────────────────────────
  const handleTabSwitch = useCallback(async () => {
    const newViolations = { ...violations };
    newViolations.tabSwitches += 1;
    newViolations.total += 1;
    setViolations(newViolations);

    showWarning(`⚠️ Warning: Tab switching detected. Violation ${newViolations.total}/${MAX_VIOLATIONS}`);

    try {
      const { data } = await attemptService.reportViolation(attemptId, {
        violation_type: 'tab_switch',
        details: `Tab switch #${newViolations.tabSwitches}`,
      });
      if (data.auto_submit) {
        toast.error('Maximum violations reached. Submitting test automatically.');
        doSubmit(true);
      }
    } catch {}
  }, [violations, attemptId, showWarning, doSubmit]);

  const handleFullscreenExit = useCallback(async () => {
    setShowFullscreenPrompt(true);
    const newViolations = { ...violations };
    newViolations.fullscreenExits += 1;
    newViolations.total += 1;
    setViolations(newViolations);

    try {
      const { data } = await attemptService.reportViolation(attemptId, {
        violation_type: 'fullscreen_exit',
        details: `Fullscreen exit #${newViolations.fullscreenExits}`,
      });
      if (data.auto_submit) {
        toast.error('Maximum violations reached. Submitting test automatically.');
        doSubmit(true);
      }
    } catch {}
  }, [violations, attemptId, doSubmit]);

  // ── Proctor ───────────────────────────────────────────────────────────────
  const { requestFullscreen, exitFullscreen } = useProctor({
    onTabSwitch: handleTabSwitch,
    onFullscreenExit: handleFullscreenExit,
    enabled: true,
  });

  // Enter fullscreen on mount
  useEffect(() => {
    requestFullscreen();
    return () => { stopStream(); };
  }, []);

  // ── Redirect if no attempt ────────────────────────────────────────────────
  useEffect(() => {
    if (!attempt || !attemptId) {
      navigate('/');
    }
  }, [attempt, attemptId]);

  if (!attempt) return <Loader fullScreen text="Loading examination..." />;

  const questions = attempt.questions;
  const currentQ = questions[currentIndex];

  // ── Answer helpers ────────────────────────────────────────────────────────
  const markVisited = useCallback((qId: string) => {
    setVisited(v => new Set([...v, qId]));
  }, []);

  const selectOption = useCallback(async (optionIndex: number) => {
    const qId = currentQ.id;
    const newAnswer = { selected_option: optionIndex, is_marked_for_review: answers[qId]?.is_marked_for_review || false };
    setAnswers(a => ({ ...a, [qId]: newAnswer }));
    markVisited(qId);

    try {
      await attemptService.saveAnswer(attemptId, {
        question_id: qId,
        selected_option: optionIndex,
        is_marked_for_review: newAnswer.is_marked_for_review,
      });
    } catch {}
  }, [currentQ, answers, attemptId, markVisited]);

  const clearAnswer = useCallback(async () => {
    const qId = currentQ.id;
    setAnswers(a => ({ ...a, [qId]: { ...a[qId], selected_option: null } }));
    try {
      await attemptService.saveAnswer(attemptId, {
        question_id: qId,
        selected_option: null,
        is_marked_for_review: answers[qId]?.is_marked_for_review || false,
      });
    } catch {}
  }, [currentQ, answers, attemptId]);

  const toggleMark = useCallback(async () => {
    const qId = currentQ.id;
    const newMark = !answers[qId]?.is_marked_for_review;
    setAnswers(a => ({ ...a, [qId]: { ...a[qId], is_marked_for_review: newMark } }));
    markVisited(qId);
    try {
      await attemptService.saveAnswer(attemptId, {
        question_id: qId,
        selected_option: answers[qId]?.selected_option ?? null,
        is_marked_for_review: newMark,
      });
    } catch {}
  }, [currentQ, answers, attemptId, markVisited]);

  const goTo = (index: number) => {
    markVisited(questions[currentIndex].id);
    setCurrentIndex(index);
  };

  // ── Nav status helper ─────────────────────────────────────────────────────
  const getStatus = (qId: string): NavStatus => {
    const ans = answers[qId];
    const isVisited = visited.has(qId);
    if (ans?.selected_option !== null && ans?.selected_option !== undefined) {
      return ans.is_marked_for_review ? 'answered-marked' : 'answered';
    }
    if (ans?.is_marked_for_review) return 'marked';
    if (isVisited) return 'not-visited';
    return 'not-visited';
  };

  const navClass = (qId: string, idx: number): string => {
    const status = getStatus(qId);
    const isCurrent = idx === currentIndex;
    const classMap: Record<NavStatus, string> = {
      'not-visited': 'q-nav-btn not-visited',
      'answered': 'q-nav-btn answered',
      'marked': 'q-nav-btn marked',
      'answered-marked': 'q-nav-btn answered-marked',
    };
    return `${classMap[status]}${isCurrent ? ' current' : ''}`;
  };

  const answeredCount = Object.values(answers).filter(a => a.selected_option !== null).length;
  const markedCount = Object.values(answers).filter(a => a.is_marked_for_review).length;
  const unansweredCount = questions.length - answeredCount;
  const currentAnswer = answers[currentQ?.id];

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="exam-mode min-h-screen bg-surface flex flex-col select-none">

      {/* ── Warning Banner ── */}
      {warningMessage && (
        <div className="warning-banner">{warningMessage}</div>
      )}

      {/* ── Fullscreen Prompt ── */}
      {showFullscreenPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-md text-center animate-bounce-in">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fullscreen Exited</h3>
            <p className="text-gray-300 mb-2">
              Warning: You have exited fullscreen mode.
              Please return to fullscreen to continue the examination.
            </p>
            <p className="text-sm text-red-400 mb-6">
              Violation {violations.total}/{MAX_VIOLATIONS}
            </p>
            <button
              onClick={() => { requestFullscreen(); setShowFullscreenPrompt(false); }}
              className="btn-primary w-full"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-surface-card/90 backdrop-blur-sm border-b border-surface-border px-6 py-3">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-primary-400" />
              <span className="font-bold text-white text-sm hidden sm:block">AWS Learning Assessment</span>
            </div>
            <div className="hidden md:block h-5 w-px bg-surface-border" />
            <div className="hidden md:block">
              <p className="text-xs text-gray-400">Student</p>
              <p className="text-sm font-medium text-white">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Camera indicator */}
            <div className="flex items-center gap-1.5">
              <CameraIcon className={`w-4 h-4 ${cameraReady ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs hidden sm:block ${cameraReady ? 'text-green-400' : 'text-red-400'}`}>
                {cameraReady ? 'Camera 🟢' : 'Camera 🔴'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MicrophoneIcon className={`w-4 h-4 ${micReady ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs hidden sm:block ${micReady ? 'text-green-400' : 'text-red-400'}`}>
                {micReady ? 'Mic 🟢' : 'Mic 🔴'}
              </span>
            </div>

            {/* Violations */}
            {violations.total > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">{violations.total}/{MAX_VIOLATIONS}</span>
              </div>
            )}

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl
                             bg-surface-hover border border-surface-border font-mono font-bold text-lg ${timerClass}`}>
              ⏱ {formatted}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── Question Panel ── */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
          <div className="animate-fade-in">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-400">Question</p>
                <p className="text-2xl font-bold text-white">
                  {currentIndex + 1}
                  <span className="text-gray-500 text-lg font-normal"> / {questions.length}</span>
                </p>
              </div>
              <div className="text-right">
                <span className={`badge ${
                  currentQ.difficulty === 'easy' ? 'badge-green' :
                  currentQ.difficulty === 'medium' ? 'badge-amber' : 'badge-red'
                }`}>
                  {currentQ.difficulty.charAt(0).toUpperCase() + currentQ.difficulty.slice(1)}
                </span>
                <p className="text-xs text-gray-500 mt-1">{currentQ.topic}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-hover rounded-full h-1.5 mb-8">
              <div
                className="bg-gradient-to-r from-primary-600 to-accent-cyan h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="glass-card p-6 mb-6">
              <p className="text-lg font-medium text-white leading-relaxed">
                {currentQ.question_text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentAnswer?.selected_option === idx;
                return (
                  <div
                    key={idx}
                    id={`option-${idx}`}
                    onClick={() => selectOption(idx)}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                                     text-sm font-bold border transition-all ${
                      isSelected
                        ? 'bg-primary-600 border-primary-500 text-white'
                        : 'bg-surface-hover border-surface-border text-gray-400'
                    }`}>
                      {optionLabels[idx]}
                    </div>
                    <span className={`text-sm leading-relaxed ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => goTo(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary gap-1"
                id="prev-btn"
              >
                <ChevronLeftIcon className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => goTo(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="btn-secondary gap-1"
                id="next-btn"
              >
                Next <ChevronRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMark}
                className={`btn-secondary gap-1 ml-auto ${
                  currentAnswer?.is_marked_for_review ? 'border-amber-500 text-amber-400' : ''
                }`}
                id="mark-review-btn"
              >
                <FlagIcon className="w-4 h-4" />
                {currentAnswer?.is_marked_for_review ? 'Unmark' : 'Mark for Review'}
              </button>

              <button
                onClick={clearAnswer}
                className="btn-secondary gap-1"
                id="clear-answer-btn"
                disabled={currentAnswer?.selected_option === null || currentAnswer?.selected_option === undefined}
              >
                <TrashIcon className="w-4 h-4" /> Clear
              </button>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="btn-success gap-1"
                id="submit-test-btn"
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                Submit Test
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-72 bg-surface-card border-l border-surface-border p-4 overflow-y-auto">
          {/* Mini camera */}
          <div className="mb-4">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {cameraReady && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1
                                bg-black/60 px-1.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-white">LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Question nav */}
          <div className="glass-card p-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Questions</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => goTo(idx)}
                  className={navClass(q.id, idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card p-3 mb-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Legend</p>
            {[
              { cls: 'q-nav-btn not-visited w-6 h-6', label: 'Not Visited' },
              { cls: 'q-nav-btn answered w-6 h-6', label: 'Answered' },
              { cls: 'q-nav-btn marked w-6 h-6', label: 'Marked for Review' },
              { cls: 'q-nav-btn answered-marked w-6 h-6', label: 'Answered + Marked' },
            ].map(({ cls, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cls} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass-card p-3 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Answered</span>
              <span className="text-primary-400 font-medium">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Unanswered</span>
              <span className="text-amber-400 font-medium">{unansweredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Marked</span>
              <span className="text-yellow-400 font-medium">{markedCount}</span>
            </div>
          </div>

          {/* Violations */}
          {violations.total > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Violations</p>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Tab Switches</span>
                  <span className="text-red-400">{violations.tabSwitches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fullscreen Exits</span>
                  <span className="text-red-400">{violations.fullscreenExits}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-red-500/20 pt-1 mt-1">
                  <span>Total</span>
                  <span className="text-red-400">{violations.total}/{MAX_VIOLATIONS}</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* ── Submit Confirm ── */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        title="Submit Test?"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to submit your test? This action cannot be undone.</p>
            <div className="bg-surface-hover rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Answered</span>
                <span className="text-green-400 font-medium">{answeredCount} / {questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Unanswered</span>
                <span className="text-amber-400 font-medium">{unansweredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Marked for Review</span>
                <span className="text-yellow-400 font-medium">{markedCount}</span>
              </div>
            </div>
          </div>
        }
        confirmLabel={submitting ? 'Submitting...' : 'Submit Test'}
        cancelLabel="Continue Exam"
        onConfirm={() => { setShowSubmitConfirm(false); doSubmit(); }}
        onCancel={() => setShowSubmitConfirm(false)}
        variant="primary"
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CameraIcon, MicrophoneIcon, CheckCircleIcon,
  ExclamationTriangleIcon, ArrowPathIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useMedia } from '../hooks/useMedia';
import { testService, attemptService } from '../services/examService';
import { Test } from '../types';
import toast from 'react-hot-toast';

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { cameraReady, micReady, error, stream, requestPermissions, stopStream } = useMedia();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [starting, setStarting] = useState(false);

  // Fetch available tests
  useEffect(() => {
    testService.list().then(r => {
      setTests(r.data);
      if (r.data.length > 0) setSelectedTest(r.data[0]);
    }).catch(() => toast.error('Could not load tests'));
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-request on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const handleStartExam = async () => {
    if (!selectedTest) { toast.error('No test available'); return; }
    if (!cameraReady || !micReady) { toast.error('Camera and microphone required'); return; }

    setStarting(true);
    try {
      const { data: attempt } = await attemptService.start(selectedTest.id);
      localStorage.setItem('attemptId', attempt.id);
      localStorage.setItem('testId', selectedTest.id);
      localStorage.setItem('attemptData', JSON.stringify(attempt));
      // Don't stop stream — keep it alive through to exam page
      navigate('/exam');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not start exam');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Camera & Microphone Setup</h1>
          <p className="text-gray-400">Verify your camera and microphone before starting the examination</p>
        </div>

        <div className="glass-card p-6 mb-4">
          {/* Video preview */}
          <div className="relative bg-black rounded-xl overflow-hidden mb-6 aspect-video flex items-center justify-center">
            {cameraReady ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <CameraIcon className="w-16 h-16" />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            )}
            {cameraReady && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5
                              bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-white font-medium">LIVE</span>
              </div>
            )}
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              cameraReady
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {cameraReady
                ? <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                : <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
              }
              <div>
                <p className="text-sm font-medium text-white">Camera</p>
                <p className={`text-xs ${cameraReady ? 'text-green-400' : 'text-red-400'}`}>
                  {cameraReady ? '🟢 Connected' : '🔴 Not connected'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              micReady
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              {micReady
                ? <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                : <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0" />
              }
              <div>
                <p className="text-sm font-medium text-white">Microphone</p>
                <p className={`text-xs ${micReady ? 'text-green-400' : 'text-red-400'}`}>
                  {micReady ? '🟢 Connected' : '🔴 Not connected'}
                </p>
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30
                            rounded-xl mb-4 animate-fade-in">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300">{error}</p>
                <p className="text-xs text-red-400/70 mt-1">
                  Please allow camera and microphone access in your browser settings and retry.
                </p>
              </div>
            </div>
          )}

          {/* Test selector */}
          {tests.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Select Examination
              </label>
              <select
                value={selectedTest?.id || ''}
                onChange={e => setSelectedTest(tests.find(t => t.id === e.target.value) || null)}
                className="form-input"
              >
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!cameraReady && (
              <button
                id="retry-permissions-btn"
                onClick={requestPermissions}
                className="btn-secondary flex-1"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Retry Permission
              </button>
            )}

            {cameraReady && micReady && (
              <button
                id="enter-fullscreen-start-btn"
                onClick={handleStartExam}
                disabled={starting || !selectedTest}
                className="btn-primary flex-1 py-4 text-base"
              >
                {starting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Exam...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Fullscreen & Start Exam
                    <ArrowRightIcon className="w-5 h-5" />
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600">
          Camera footage is displayed as a live preview only and is not recorded or stored.
        </p>
      </div>
    </div>
  );
}

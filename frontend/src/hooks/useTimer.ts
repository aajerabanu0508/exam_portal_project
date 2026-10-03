import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerOptions {
  durationSeconds: number;
  onExpire: () => void;
  autoStart?: boolean;
}

export function useTimer({ durationSeconds, onExpire, autoStart = true }: UseTimerOptions) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpireRef = useRef(onExpire);
  const startTimeRef = useRef<number>(Date.now());
  const initialDurationRef = useRef(durationSeconds);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const left = Math.max(0, initialDurationRef.current - elapsed);
      setRemaining(left);

      if (left === 0) {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
        onExpireRef.current();
      }
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - (initialDurationRef.current - remaining) * 1000;
    setIsRunning(true);
  }, [remaining]);

  const format = useCallback((secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const timerClass =
    remaining <= 60 ? 'timer-danger' :
    remaining <= 300 ? 'timer-warn' : 'timer-normal';

  return {
    remaining,
    formatted: format(remaining),
    isRunning,
    timerClass,
    stop,
    start,
    isWarning: remaining <= 300 && remaining > 60,
    isDanger: remaining <= 60,
  };
}

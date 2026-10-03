import { useEffect, useCallback, useRef } from 'react';

interface UseProctorOptions {
  onTabSwitch: () => void;
  onFullscreenExit: () => void;
  enabled: boolean;
}

export function useProctor({ onTabSwitch, onFullscreenExit, enabled }: UseProctorOptions) {
  const tabSwitchRef = useRef(onTabSwitch);
  const fullscreenRef = useRef(onFullscreenExit);

  useEffect(() => { tabSwitchRef.current = onTabSwitch; }, [onTabSwitch]);
  useEffect(() => { fullscreenRef.current = onFullscreenExit; }, [onFullscreenExit]);

  // ── Anti-copy controls ──
  useEffect(() => {
    if (!enabled) return;

    const prevent = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked = [
        (e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'u', 's', 'p'].includes(e.key.toLowerCase()),
        e.key === 'F12',
        (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I',
      ];
      if (blocked.some(Boolean)) e.preventDefault();
    };

    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('paste', prevent);
    document.addEventListener('selectstart', prevent);
    document.addEventListener('dragstart', prevent);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('paste', prevent);
      document.removeEventListener('selectstart', prevent);
      document.removeEventListener('dragstart', prevent);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);

  // ── Tab-switch detection ──
  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      if (document.hidden) {
        tabSwitchRef.current();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled]);

  // ── Fullscreen change detection ──
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        fullscreenRef.current();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, [enabled]);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
  }, []);

  return { requestFullscreen, exitFullscreen };
}

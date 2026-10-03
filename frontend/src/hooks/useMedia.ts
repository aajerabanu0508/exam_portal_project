import { useState, useRef, useCallback } from 'react';

interface MediaState {
  cameraReady: boolean;
  micReady: boolean;
  error: string | null;
  stream: MediaStream | null;
}

export function useMedia() {
  const [state, setState] = useState<MediaState>({
    cameraReady: false,
    micReady: false,
    error: null,
    stream: null,
  });
  const streamRef = useRef<MediaStream | null>(null);

  const requestPermissions = useCallback(async () => {
    setState(s => ({ ...s, error: null }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setState({
        cameraReady: true,
        micReady: true,
        error: null,
        stream,
      });
      return stream;
    } catch (err: any) {
      setState({
        cameraReady: false,
        micReady: false,
        error: 'Camera and microphone access are required to start this examination.',
        stream: null,
      });
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setState(s => ({ ...s, cameraReady: false, micReady: false, stream: null }));
    }
  }, []);

  return { ...state, requestPermissions, stopStream };
}

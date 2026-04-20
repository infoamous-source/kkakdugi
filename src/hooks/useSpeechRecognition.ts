/**
 * useSpeechRecognition
 *
 * Web Speech API를 감싸는 React 훅.
 * 브라우저가 SpeechRecognition을 지원하지 않으면 isSupported=false로
 * 조용히 폴백하고, 모든 함수는 no-op이 된다.
 *
 * 설정: 한국어(ko-KR), interimResults=true, continuous=true
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionState {
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
      : null;

  const isSupported = SpeechRecognitionAPI !== null;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // 인스턴스를 한 번만 생성
  useEffect(() => {
    if (!isSupported || !SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
    // SpeechRecognitionAPI ref는 마운트 시 한 번만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // 이미 실행 중인 경우 등 무시
    }
  }, [isSupported, isListening]);

  const stop = useCallback(() => {
    if (!isSupported || !recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isSupported, isListening]);

  const reset = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    recognitionRef.current.abort();
    setIsListening(false);
    setTranscript('');
  }, [isSupported]);

  // no-op 폴백
  const noop = useCallback(() => {}, []);

  if (!isSupported) {
    return {
      isSupported: false,
      isListening: false,
      transcript: '',
      start: noop,
      stop: noop,
      reset: noop,
    };
  }

  return { isSupported, isListening, transcript, start, stop, reset };
}

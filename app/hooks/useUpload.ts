'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { PipelineStep, QuranVerse, ProgressInfo, SpeakerSegment } from '../types/session';
import { startSession, startProcessing, stopProcessing, fetchSession } from '../services/api';
import { getSocket, joinSession, leaveSession, onProgress, disconnectSocket } from '../services/socket';

interface UseProcessorReturn {
  step: PipelineStep;
  sessionId: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
  quranVerses: QuranVerse[];
  words: { word: string; start: number; end: number; speaker: string }[];
  speakerSegments: SpeakerSegment[];
  errorMessage: string;
  failedStep: string;
  progress: ProgressInfo | null;
  startProcessing: (file: File) => Promise<void>;
  /** Reconnect to an in-progress session (e.g. after page reload) */
  reconnectSession: (id: string) => Promise<void>;
  /** Resume a failed/stopped session from where it left off */
  resumeSession: (id: string) => Promise<void>;
  /** Stop/cancel active processing */
  stopCurrentProcessing: () => Promise<void>;
  /** Check sessionStorage for an active session and reconnect if found (for page reload) */
  checkAndReconnect: () => Promise<void>;
  reset: () => void;
}

/**
 * Fire-and-forget processing architecture:
 * - Frontend uploads file, gets sessionId, calls /process once
 * - Backend runs the full pipeline autonomously
 * - Frontend only listens to Socket.IO events for progress display
 * - Page reload/navigate does NOT affect backend processing
 * - On reload, frontend can reconnect to an active session via reconnectSession()
 */
export function useProcessor(): UseProcessorReturn {
  const [step, setStep] = useState<PipelineStep>('idle');
  const [sessionId, setSessionId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [quranVerses, setQuranVerses] = useState<QuranVerse[]>([]);
  const [words, setWords] = useState<{ word: string; start: number; end: number; speaker: string }[]>([]);
  const [speakerSegments, setSpeakerSegments] = useState<SpeakerSegment[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedStep, setFailedStep] = useState('');
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  const cleanupRef = useRef<Array<() => void>>([]);
  const currentSessionRef = useRef<string>('');

  const STORAGE_KEY = 'jawhar_active_session';

  const saveActiveSession = (id: string) => {
    try { sessionStorage.setItem(STORAGE_KEY, id); } catch {}
  };
  const clearActiveSession = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };
  const getActiveSession = (): string | null => {
    try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
  };

  // Set up Socket.IO listeners for a session
  const setupSocketListeners = useCallback((id: string) => {
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];

    currentSessionRef.current = id;
    joinSession(id);

    const events: Array<[string, (data: any) => void]> = [
      ['uploaded', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('uploading');
      }],
      ['extracting', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('extracting');
      }],
      ['extracted', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('extracting');
      }],
      ['transcribing', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('transcribing');
      }],
      ['transcribing_chunk', (d) => {
        setProgress({
          progress: d.progress,
          status: 'transcribing',
          chunk: d.chunk,
          total: d.total,
          message: d.total > 1 ? `تفريغ الجزء ${d.chunk} من ${d.total}` : undefined,
        });
        setStep('transcribing');
      }],
      ['fixing', (d) => {
        setProgress({ progress: d.progress, status: 'fixing', message: 'تصحيح وتنسيق النص' });
        setStep('transcribing');
      }],
      ['transcribed', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('enriching');
      }],
      ['enriching', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('enriching');
      }],
      ['enriched', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        if (d.quranVerses) setQuranVerses(d.quranVerses);
        setStep('summarizing');
      }],
      ['summarizing', (d) => {
        setProgress({ progress: d.progress, status: d.status });
        setStep('summarizing');
      }],
      ['summarized', (d) => {
        clearActiveSession();
        setProgress({ progress: 100, status: 'done' });
        if (d.title) setTitle(d.title);
        if (d.summary) setSummary(d.summary);
        if (d.keyPoints) setKeyPoints(d.keyPoints);
        setStep('done');
        // Fetch full session data (words, transcript, etc.)
        fetchSession(id).then((session) => {
          setWords(session.words || []);
          setTranscript(session.transcript || '');
          setQuranVerses(session.quranVerses || []);
          setSpeakerSegments(session.speakerSegments || []);
        }).catch(() => {});
      }],
      ['cancelled', (d) => {
        clearActiveSession();
        setProgress({ progress: 0, status: 'cancelled', message: 'تم إلغاء المعالجة' });
        setStep('idle');
      }],
      ['error', (d) => {
        clearActiveSession();
        setProgress({ progress: 0, status: 'error', message: d.message, step: d.step });
        setErrorMessage(d.message || 'حدث خطأ');
        setFailedStep(d.step || '');
        setStep('error');
      }],
    ];

    for (const [event, handler] of events) {
      cleanupRef.current.push(onProgress(event, handler));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
      if (currentSessionRef.current) {
        leaveSession(currentSessionRef.current);
      }
      disconnectSocket();
    };
  }, []);

  /**
   * Upload file and start autonomous processing.
   * After upload, fires /process and returns immediately.
   * All progress comes via Socket.IO.
   */
  const startProcessingFn = useCallback(async (file: File) => {
    setErrorMessage('');
    setFailedStep('');
    setTranscript('');
    setTitle('');
    setSummary('');
    setKeyPoints([]);
    setQuranVerses([]);
    setWords([]);
    setProgress(null);

    try {
      setStep('uploading');
      setProgress({ progress: 0, status: 'uploading', message: 'جارٍ رفع الملف' });

      // Step 1: Upload file
      const { sessionId: id } = await startSession(file);
      setSessionId(id);

      // Connect Socket.IO and join session room
      getSocket();
      setupSocketListeners(id);

      // Step 2: Start autonomous processing (fire-and-forget)
      await startProcessing(id);
      saveActiveSession(id);
      // Backend is now running the pipeline. We just listen.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setStep('error');
    }
  }, [setupSocketListeners]);

  /**
   * Reconnect to an in-progress session (e.g. after page reload).
   * Joins the socket room and fetches current session state.
   * If the session is still processing, socket events will update the UI.
   * If it's already done, shows the final result.
   * If it failed, shows the error.
   */
  const reconnectSession = useCallback(async (id: string) => {
    setSessionId(id);
    setErrorMessage('');
    setFailedStep('');
    setProgress(null);

    // Connect Socket.IO and join session room
    getSocket();
    setupSocketListeners(id);

    try {
      const session = await fetchSession(id);

      // Preload any existing data
      if (session.transcript) setTranscript(session.transcript);
      if (session.title) setTitle(session.title);
      if (session.summary) setSummary(session.summary);
      if (session.keyPoints) setKeyPoints(session.keyPoints);
      if (session.quranVerses) setQuranVerses(session.quranVerses);
      if (session.words) setWords(session.words);
      if (session.speakerSegments) setSpeakerSegments(session.speakerSegments);

      // Set UI state based on session status
      if (session.status === 'summarized') {
        setProgress({ progress: 100, status: 'done' });
        setStep('done');
      } else if (session.status === 'failed') {
        setErrorMessage('توقفت المعالجة — اضغط متابعة لإكمالها');
        setFailedStep(session.failedAt || '');
        setStep('error');
      } else {
        // Session is in an intermediate state — might still be processing
        // or might have been interrupted. Set step based on status.
        const stepMap: Record<string, PipelineStep> = {
          uploaded: 'extracting',
          extracted: 'transcribing',
          transcribed: 'enriching',
          enriched: 'summarizing',
        };
        setStep(stepMap[session.status] || 'extracting');
        setProgress({ progress: 0, status: session.status, message: 'جارٍ متابعة المعالجة...' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل تحميل الجلسة';
      setErrorMessage(message);
      setStep('error');
    }
  }, [setupSocketListeners]);

  /**
   * Resume a failed/stopped session from where it left off.
   * Calls /process again — backend will detect the current status and resume.
   */
  const resumeSession = useCallback(async (id: string) => {
    setErrorMessage('');
    setFailedStep('');
    setProgress(null);

    // Ensure socket listeners are set up
    getSocket();
    setupSocketListeners(id);

    try {
      await startProcessing(id);
      // Backend resumes from where it left off. Socket events drive UI.
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل استئناف المعالجة';
      setErrorMessage(message);
      setStep('error');
    }
  }, [setupSocketListeners]);

  /**
   * Stop/cancel active processing.
   */
  const stopCurrentProcessing = useCallback(async () => {
    if (!currentSessionRef.current) return;
    try {
      await stopProcessing(currentSessionRef.current);
    } catch (error) {
      console.error('Failed to stop processing:', error);
    }
  }, []);

  /**
   * On page load, check if there's an active session in sessionStorage.
   * If found, reconnect to it — shows live progress if still processing,
   * or the final result if it completed while the page was away.
   */
  const checkAndReconnect = useCallback(async () => {
    const activeId = getActiveSession();
    if (!activeId) return;
    await reconnectSession(activeId);
  }, [reconnectSession]);

  const reset = useCallback(() => {
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];
    if (currentSessionRef.current) {
      leaveSession(currentSessionRef.current);
      currentSessionRef.current = '';
    }
    clearActiveSession();

    setStep('idle');
    setSessionId('');
    setTranscript('');
    setTitle('');
    setSummary('');
    setKeyPoints([]);
    setQuranVerses([]);
    setWords([]);
    setSpeakerSegments([]);
    setErrorMessage('');
    setFailedStep('');
    setProgress(null);
  }, []);

  return {
    step, sessionId, transcript, title, summary, keyPoints, quranVerses, words,
    speakerSegments,
    errorMessage, failedStep, progress,
    startProcessing: startProcessingFn,
    reconnectSession, resumeSession, stopCurrentProcessing, checkAndReconnect, reset,
  };
}

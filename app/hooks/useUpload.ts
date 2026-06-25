'use client';

import { useState, useCallback } from 'react';
import { PipelineStep, StepResult, QuranVerse } from '../types/session';
import { startSession, extractAudio, transcribeAudio, enrichVerses, summarizeText, fetchSession } from '../services/api';

interface UseProcessorReturn {
  step: PipelineStep;
  sessionId: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
  quranVerses: QuranVerse[];
  words: { word: string; start: number; end: number }[];
  errorMessage: string;
  failedStep: string;
  startProcessing: (file: File) => Promise<void>;
  /** Resume from a specific step — takes sessionId directly to avoid stale closures */
  resumeSession: (id: string, fromStep: string, existingData?: Partial<StepResult>) => Promise<void>;
  reset: () => void;
}

/**
 * Manages the real step-by-step pipeline.
 * Each step is a separate API call. On failure, saves checkpoint.
 * Supports resume from any failed step via resumeSession().
 */
export function useProcessor(): UseProcessorReturn {
  const [step, setStep] = useState<PipelineStep>('idle');
  const [sessionId, setSessionId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [quranVerses, setQuranVerses] = useState<QuranVerse[]>([]);
  const [words, setWords] = useState<{ word: string; start: number; end: number }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedStep, setFailedStep] = useState('');

  const runExtract = useCallback(async (id: string) => {
    setStep('extracting');
    await extractAudio(id);
  }, []);

  const runTranscribe = useCallback(async (id: string) => {
    setStep('transcribing');
    const result = await transcribeAudio(id);
    setTranscript(result.transcript);
  }, []);

  const runEnrich = useCallback(async (id: string) => {
    setStep('enriching');
    const result = await enrichVerses(id);
    setQuranVerses(result.quranVerses);
    if (result.transcript) setTranscript(result.transcript);
  }, []);

  const runSummarize = useCallback(async (id: string) => {
    setStep('summarizing');
    const result = await summarizeText(id);
    setTitle(result.title);
    setSummary(result.summary);
    setKeyPoints(result.keyPoints);
  }, []);

  const startProcessing = useCallback(async (file: File) => {
    setErrorMessage('');
    setFailedStep('');
    setTranscript('');
    setTitle('');
    setSummary('');
    setKeyPoints([]);
    setQuranVerses([]);
    setWords([]);

    try {
      setStep('uploading');
      const { sessionId: id } = await startSession(file);
      setSessionId(id);

      await runExtract(id);
      await runTranscribe(id);
      await runEnrich(id);
      await runSummarize(id);

      // Fetch full session to get word-level timestamps for audio player
      const session = await fetchSession(id);
      setWords(session.words || []);

      setStep('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setStep('error');
    }
  }, [runExtract, runTranscribe, runEnrich, runSummarize]);

  /**
   * Resume processing from a specific step.
   * Takes sessionId directly — avoids stale closure issues.
   * Optionally preloads existing data (transcript etc.) from the session.
   */
  const resumeSession = useCallback(async (
    id: string,
    fromStep: string,
    existingData?: Partial<StepResult>
  ) => {
    // Set state immediately with the session data
    setSessionId(id);
    setErrorMessage('');
    setFailedStep('');

    if (existingData) {
      if (existingData.transcript) setTranscript(existingData.transcript);
      if (existingData.title) setTitle(existingData.title);
      if (existingData.summary) setSummary(existingData.summary);
      if (existingData.keyPoints) setKeyPoints(existingData.keyPoints);
      if (existingData.quranVerses) setQuranVerses(existingData.quranVerses);
      if (existingData.words) setWords(existingData.words);
    }

    try {
      if (fromStep === 'extracting') {
        await runExtract(id);
        await runTranscribe(id);
        await runEnrich(id);
        await runSummarize(id);
      } else if (fromStep === 'transcribing') {
        await runTranscribe(id);
        await runEnrich(id);
        await runSummarize(id);
      } else if (fromStep === 'enriching') {
        await runEnrich(id);
        await runSummarize(id);
      } else if (fromStep === 'summarizing') {
        await runSummarize(id);
      }
      // Fetch full session to get word-level timestamps for audio player
      const session = await fetchSession(id);
      setWords(session.words || []);
      setStep('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setStep('error');
    }
  }, [runExtract, runTranscribe, runEnrich, runSummarize]);

  const reset = useCallback(() => {
    setStep('idle');
    setSessionId('');
    setTranscript('');
    setTitle('');
    setSummary('');
    setKeyPoints([]);
    setQuranVerses([]);
    setWords([]);
    setErrorMessage('');
    setFailedStep('');
  }, []);

  return {
    step, sessionId, transcript, title, summary, keyPoints, quranVerses, words,
    errorMessage, failedStep,
    startProcessing, resumeSession, reset,
  };
}

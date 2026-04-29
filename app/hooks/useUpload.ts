'use client';

import { useState, useCallback } from 'react';
import { PipelineStep, StepResult } from '../types/session';
import { startSession, extractAudio, transcribeAudio, summarizeText } from '../services/api';

interface UseProcessorReturn {
  step: PipelineStep;
  sessionId: string;
  transcript: string;
  title: string;
  summary: string;
  keyPoints: string[];
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

    try {
      setStep('uploading');
      const { sessionId: id } = await startSession(file);
      setSessionId(id);

      await runExtract(id);
      await runTranscribe(id);
      await runSummarize(id);

      setStep('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setStep('error');
    }
  }, [runExtract, runTranscribe, runSummarize]);

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
    }

    try {
      if (fromStep === 'extracting') {
        await runExtract(id);
        await runTranscribe(id);
        await runSummarize(id);
      } else if (fromStep === 'transcribing') {
        await runTranscribe(id);
        await runSummarize(id);
      } else if (fromStep === 'summarizing') {
        await runSummarize(id);
      }
      setStep('done');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      setErrorMessage(message);
      setStep('error');
    }
  }, [runExtract, runTranscribe, runSummarize]);

  const reset = useCallback(() => {
    setStep('idle');
    setSessionId('');
    setTranscript('');
    setTitle('');
    setSummary('');
    setKeyPoints([]);
    setErrorMessage('');
    setFailedStep('');
  }, []);

  return {
    step, sessionId, transcript, title, summary, keyPoints,
    errorMessage, failedStep,
    startProcessing, resumeSession, reset,
  };
}

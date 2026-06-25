'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UploadZone from './components/UploadZone';
import ProcessingView from './components/ProgressOverlay';
import StudySheet from './components/StudySheet';
import SessionHistory from './components/SessionHistory';
import { IconMenu } from './components/Icons';
import { useProcessor } from './hooks/useUpload';
import { fetchSession, getAudioUrl } from './services/api';
import { SessionData } from './types/session';

/**
 * Maps a session DB status/failedAt to the exact pipeline step key
 * that needs to run next. Used to highlight completed steps and
 * pass the resume target to resumeSession().
 */
function getNextStep(session: SessionData): string {
  if (session.failedAt) {
    const map: Record<string, string> = {
      extract:    'extracting',
      transcribe: 'transcribing',
      enrich:     'enriching',
      summarize:  'summarizing',
    };
    return map[session.failedAt] ?? session.failedAt;
  }
  const statusMap: Record<string, string> = {
    uploaded:   'extracting',
    extracted:  'transcribing',
    transcribed:'enriching',
    enriched:   'summarizing',
  };
  return statusMap[session.status] ?? 'extracting';
}

export default function Home() {
  const processor = useProcessor();
  const [viewingSession, setViewingSession] = useState<SessionData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const resumeAttempted = useRef(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isSidebarOpen]);

  /* ── resume from query params (coming from history page) ── */
  useEffect(() => {
    if (resumeAttempted.current) return;
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get('resume');
    const resumeStep = params.get('step');
    if (!resumeId || !resumeStep) return;

    resumeAttempted.current = true;
    router.replace('/');

    fetchSession(resumeId).then((session) => {
      processor.resumeSession(resumeId, resumeStep, {
        transcript: session.transcript,
        title:      session.title,
        summary:    session.summary,
        keyPoints:  session.keyPoints,
        quranVerses: session.quranVerses,
        words:      session.words,
      }).then(() => {
        setRefreshTrigger(p => p + 1);
      });
    }).catch(() => {
      console.error('Failed to resume session');
    });
  }, [router, processor]);

  const isProcessing =
    processor.step !== 'idle' &&
    processor.step !== 'done' &&
    processor.step !== 'error';

  const showUpload    = processor.step === 'idle' && !viewingSession;
  const showSheet     = viewingSession?.status === 'summarized';
  const showIncomplete = viewingSession && viewingSession.status !== 'summarized';
  const showProcessing = !viewingSession && processor.step !== 'idle';
  const showDone       = !viewingSession && processor.step === 'done';

  /* ── file upload flow ──────────────────────────────── */
  const handleFileSelected = useCallback((file: File) => {
    setViewingSession(null);
    processor.startProcessing(file).then(() => {
      setRefreshTrigger(p => p + 1);
    });
  }, [processor]);

  /* ── select session from history ──────────────────── */

  /* ── back / reset ──────────────────────────────────── */
  const handleBack = useCallback(() => {
    setViewingSession(null);
    processor.reset();
    setRefreshTrigger(p => p + 1);
  }, [processor]);

  /* ── view full sheet after processing finishes ─────── */
  const handleViewSheet = useCallback(async () => {
    if (!processor.sessionId) return;
    const session = await fetchSession(processor.sessionId);
    setViewingSession(session);
    processor.reset();
  }, [processor]);

  /* ── auto-transition to StudySheet when steps finish ── */
  const doneHandled = useRef(false);
  useEffect(() => {
    if (processor.step === 'done' && processor.sessionId && !doneHandled.current) {
      doneHandled.current = true;
      handleViewSheet();
    }
    if (processor.step !== 'done') {
      doneHandled.current = false;
    }
  }, [processor.step, processor.sessionId, handleViewSheet]);

  /**
   * Resume an incomplete session directly from the session object.
   * Passes the session ID immediately to avoid stale-closure issues.
   */
  const handleResume = useCallback((fromStep: string) => {
    if (!viewingSession) return;
    const session = viewingSession;
    setViewingSession(null); // hide incomplete view, show live processing
    processor.resumeSession(session._id, fromStep, {
      transcript: session.transcript,
      title:      session.title,
      summary:    session.summary,
      keyPoints:  session.keyPoints,
      quranVerses: session.quranVerses,
      words:      session.words,
    }).then(() => {
      setRefreshTrigger(p => p + 1);
    });
  }, [viewingSession, processor]);

  return (
    <div className="flex flex-col sm:flex-row h-screen rtl overflow-hidden bg-[#101010]">
      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#161616] shrink-0 safe-top">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[#B0B0B0] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all cursor-pointer"
          aria-label="فتح القائمة"
        >
          <IconMenu size={20} />
        </button>
        <span
          className="text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #FFB74D, #FF9800, #E65100)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >جَوْهَر</span>
        <div className="w-9" />
      </div>

      <SessionHistory
        refreshTrigger={refreshTrigger}
        onAddNew={handleBack}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {/* 1. Completed session — full-height study sheet (no header, no padding) */}
      {showSheet && viewingSession ? (
        <main className="flex-1 min-w-0 overflow-hidden" id="main-content">
          <StudySheet data={viewingSession} onBack={handleBack} />
        </main>
      ) : (
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-10 py-6 sm:py-10 pb-16 relative" id="main-content">
          <header className="text-center mb-12 relative animate-fade-in-down no-print">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[240px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(255,152,0,0.1) 0%, transparent 70%)' }}
            />
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FFB74D, #FF9800, #E65100)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >جَوْهَر</h1>
            <p className="text-sm sm:text-base text-[#B0B0B0] font-light max-w-[480px] mx-auto leading-relaxed">
              ارفع ملف صوتي أو مرئي وسنحوّله لملخص منظم بالذكاء الاصطناعي
            </p>
          </header>

          {/* 2. Incomplete session from history — show checkpoint + resume */}
          {showIncomplete && viewingSession ? (
            <div className="w-full max-w-[720px] mx-auto">
              <ProcessingView
                step="idle"
                failedAtStep={getNextStep(viewingSession)}
                transcript={viewingSession.transcript}
                title={viewingSession.title}
                summary={viewingSession.summary}
                keyPoints={viewingSession.keyPoints}
                quranVerses={viewingSession.quranVerses}
                audioUrl={getAudioUrl(viewingSession._id)}
                words={viewingSession.words}
                errorMessage="توقفت المعالجة — اضغط متابعة لإكمالها"
                onRetry={handleResume}
                onReset={handleBack}
              />
            </div>

          /* 3. Active processing — live step view */
          ) : showProcessing ? (
            <ProcessingView
              step={processor.step}
              transcript={processor.transcript}
              title={processor.title}
              summary={processor.summary}
              keyPoints={processor.keyPoints}
              quranVerses={processor.quranVerses}
              audioUrl={processor.sessionId ? getAudioUrl(processor.sessionId) : undefined}
              words={processor.words}
              errorMessage={processor.errorMessage}
              onRetry={(fromStep) =>
                processor.resumeSession(processor.sessionId, fromStep, {
                  transcript: processor.transcript,
                  title:      processor.title,
                  summary:    processor.summary,
                  keyPoints:  processor.keyPoints,
                  quranVerses: processor.quranVerses,
                  words:      processor.words,
                })
              }
              onReset={handleBack}
            />

          /* 4. Processing finished — brief loading before StudySheet */
          ) : showDone ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast mb-4" />
              <span className="text-[#808080] text-sm">جارٍ تحضير الملخص...</span>
            </div>

          /* 5. Default — upload zone */
          ) : showUpload ? (
            <div className="w-full max-w-[600px] mx-auto">
              <UploadZone onFileSelected={handleFileSelected} disabled={isProcessing} />
            </div>
          ) : null}
        </main>
      )}
    </div>
  );
}

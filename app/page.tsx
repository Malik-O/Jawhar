'use client';

import { useState, useCallback } from 'react';
import UploadZone from './components/UploadZone';
import ProcessingView from './components/ProgressOverlay';
import StudySheet from './components/StudySheet';
import SessionHistory from './components/SessionHistory';
import { useProcessor } from './hooks/useUpload';
import { fetchSession } from './services/api';
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
      summarize:  'summarizing',
    };
    return map[session.failedAt] ?? session.failedAt;
  }
  const statusMap: Record<string, string> = {
    uploaded:   'extracting',
    extracted:  'transcribing',
    transcribed:'summarizing',
  };
  return statusMap[session.status] ?? 'extracting';
}

export default function Home() {
  const processor = useProcessor();
  const [viewingSession, setViewingSession] = useState<SessionData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  const handleSessionSelect = useCallback(async (id: string) => {
    try {
      processor.reset();
      const session = await fetchSession(id);
      setViewingSession(session);
    } catch {
      console.error('Failed to load session');
    }
  }, [processor]);

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
    }).then(() => {
      setRefreshTrigger(p => p + 1);
    });
  }, [viewingSession, processor]);

  return (
    <div className="app-layout">
      <SessionHistory onSelect={handleSessionSelect} refreshTrigger={refreshTrigger} />

      <main className="main-content" id="main-content">
        <header className="app-header no-print">
          <div className="header-glow" />
          <h1 className="app-title">ملخّص المحاضرات</h1>
          <p className="app-subtitle">ارفع ملف صوتي أو مرئي وسنحوّله لملخص منظم بالذكاء الاصطناعي</p>
        </header>

        {/* 1. Completed session — full study sheet */}
        {showSheet && viewingSession ? (
          <StudySheet data={viewingSession} onBack={handleBack} />

        /* 2. Incomplete session from history — show checkpoint + resume */
        ) : showIncomplete && viewingSession ? (
          <div className="incomplete-session">
            <ProcessingView
              step="idle"
              failedAtStep={getNextStep(viewingSession)}
              transcript={viewingSession.transcript}
              title={viewingSession.title}
              summary={viewingSession.summary}
              keyPoints={viewingSession.keyPoints}
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
            errorMessage={processor.errorMessage}
            onRetry={(fromStep) =>
              processor.resumeSession(processor.sessionId, fromStep, {
                transcript: processor.transcript,
                title:      processor.title,
                summary:    processor.summary,
                keyPoints:  processor.keyPoints,
              })
            }
            onReset={handleBack}
          />

        /* 4. Processing finished — show results + action buttons */
        ) : showDone ? (
          <div className="done-container">
            <ProcessingView
              step={processor.step}
              transcript={processor.transcript}
              title={processor.title}
              summary={processor.summary}
              keyPoints={processor.keyPoints}
              errorMessage=""
              onRetry={() => {}}
              onReset={handleBack}
            />
            <div className="done-actions">
              <button className="action-btn print-btn" onClick={handleViewSheet}>
                عرض الملخص الكامل
              </button>
              <button className="action-btn back-btn" onClick={handleBack}>
                رفع ملف جديد
              </button>
            </div>
          </div>

        /* 5. Default — upload zone */
        ) : showUpload ? (
          <div className="upload-container">
            <UploadZone onFileSelected={handleFileSelected} disabled={isProcessing} />
          </div>
        ) : null}
      </main>
    </div>
  );
}

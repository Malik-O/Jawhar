'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchSession, getAudioUrl } from '../../services/api';
import { SessionData } from '../../types/session';
import StudySheet from '../../components/StudySheet';
import ProcessingView from '../../components/ProgressOverlay';
import SessionHistory from '../../components/SessionHistory';
import { IconMenu } from '../../components/Icons';

/**
 * Maps a session DB status/failedAt to the exact pipeline step key
 * that needs to run next.
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

export default function HistoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [titleUpdate, setTitleUpdate] = useState<{ id: string; title: string; nonce: number }>({ id: '', title: '', nonce: 0 });

  useEffect(() => {
    if (!id) return;
    fetchSession(id)
      .then(setSession)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => document.body.classList.remove('drawer-open');
  }, [isSidebarOpen]);

  const handleBack = () => router.push('/');

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
        onAddNew={handleBack}
        refreshTrigger={refreshTrigger}
        titleUpdate={titleUpdate}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />

      {session?.status === 'summarized' && !loading && !error ? (
        <main className="flex-1 min-w-0 overflow-hidden" id="main-content">
          <StudySheet
            data={session}
            onBack={handleBack}
            onTitleChange={(newTitle) => {
              setSession(prev => prev ? { ...prev, title: newTitle } : prev);
              setTitleUpdate({ id: session._id, title: newTitle, nonce: Date.now() });
            }}
          />
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
            >تفاصيل المحاضرة</h1>
          </header>

          {loading ? (
            <div className="text-center text-[#808080] mt-20 animate-pulse">جارٍ التحميل...</div>
          ) : error ? (
            <div className="text-center text-red-400 mt-20">{error}</div>
          ) : session ? (
            <div className="w-full max-w-[720px] mx-auto">
              <ProcessingView
                step="idle"
                failedAtStep={getNextStep(session)}
                transcript={session.transcript}
                title={session.title}
                summary={session.summary}
                keyPoints={session.keyPoints}
                quranVerses={session.quranVerses || []}
                audioUrl={getAudioUrl(session._id)}
                words={session.words}
                errorMessage="هذه المحاضرة لم تكتمل بعد"
                onRetry={() => {
                  router.push(`/?resume=${session._id}&step=resume`);
                }}
                onReset={handleBack}
              />
            </div>
          ) : (
            <div className="text-center text-[#808080] mt-20">لم يتم العثور على المحاضرة</div>
          )}
        </main>
      )}
    </div>
  );
}

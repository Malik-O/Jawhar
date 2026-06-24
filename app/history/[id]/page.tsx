'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchSession } from '../../services/api';
import { SessionData } from '../../types/session';
import StudySheet from '../../components/StudySheet';
import ProcessingView from '../../components/ProgressOverlay';
import SessionHistory from '../../components/SessionHistory';

export default function HistoryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchSession(id)
      .then(setSession)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => router.push('/');

  return (
    <div className="app-layout">
      <SessionHistory />

      <main className="main-content" id="main-content">
        <header className="app-header no-print">
          <div className="header-glow" />
          <h1 className="app-title">تفاصيل المحاضرة</h1>
        </header>

        {loading ? (
          <div className="text-center text-slate-400 mt-20">جارٍ التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-400 mt-20">{error}</div>
        ) : session?.status === 'summarized' ? (
          <StudySheet data={session} onBack={handleBack} />
        ) : session ? (
          <div className="incomplete-session">
             <ProcessingView
              step="idle"
              failedAtStep={session.failedAt || 'extracting'}
              transcript={session.transcript}
              title={session.title}
              summary={session.summary}
              keyPoints={session.keyPoints}
              errorMessage="هذه المحاضرة لم تكتمل بعد"
              onRetry={() => router.push('/')}
              onReset={handleBack}
            />
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">لم يتم العثور على المحاضرة</div>
        )}
      </main>
    </div>
  );
}

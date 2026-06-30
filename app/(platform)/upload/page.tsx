'use client';

import { useState, useCallback, useEffect } from 'react';
import SheikhOnly from '@/app/components/SheikhOnly';
import UploadZone from '@/app/components/UploadZone';
import ProcessingView from '@/app/components/ProgressOverlay';
import { useProcessor } from '@/app/hooks/useUpload';
import PublishLectureForm from './components/PublishLectureForm';
import { getAudioUrl } from '@/app/services/api';

export default function UploadLecturePage() {
  const processor = useProcessor();
  const [published, setPublished] = useState(false);

  const isProcessing =
    processor.step !== 'idle' &&
    processor.step !== 'done' &&
    processor.step !== 'error';

  const showUpload = processor.step === 'idle';
  const showProcessing = processor.step !== 'idle' && processor.step !== 'done';
  const showDone = processor.step === 'done' && !published;

  const handleFileSelected = useCallback((file: File) => {
    processor.startProcessing(file);
    setPublished(false);
  }, [processor]);

  const handleBack = useCallback(() => {
    processor.reset();
    setPublished(false);
  }, [processor]);

  return (
    <SheikhOnly>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-[#E0E0E0]">رفع محاضرة جديدة</h1>
          <p className="text-[#808080] text-sm mt-1">ارفع الملف الصوتي أو المرئي وسنقوم بتحويله لمحاضرة منظمة باستخدام الذكاء الاصطناعي</p>
        </header>

        {showUpload && (
          <div className="max-w-[600px] mx-auto mt-12">
            <UploadZone onFileSelected={handleFileSelected} disabled={isProcessing} />
          </div>
        )}

        {showProcessing && (
          <div className="mt-8 bg-[#161616] rounded-2xl overflow-hidden border border-white/10 p-6 min-h-[400px]">
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
              progress={processor.progress}
              onRetry={() => processor.resumeSession(processor.sessionId)}
              onReset={handleBack}
            />
          </div>
        )}

        {showDone && processor.sessionId && (
          <PublishLectureForm 
            sessionId={processor.sessionId} 
            defaultTitle={processor.title} 
            onPublished={() => setPublished(true)} 
          />
        )}

        {published && (
          <div className="text-center py-20 bg-[#161616] border border-white/10 rounded-2xl">
            <div className="w-16 h-16 bg-[#00C8C8]/10 text-[#00C8C8] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00C8C8]/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 className="text-2xl font-bold text-[#E0E0E0] mb-2">تم نشر المحاضرة بنجاح</h2>
            <p className="text-[#808080] mb-8">يمكن للطلاب الآن رؤية المحاضرة والاستفادة منها.</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-white/5 border border-white/10 text-[#E0E0E0] hover:bg-white/10 rounded-lg transition-colors font-semibold"
            >
              رفع محاضرة أخرى
            </button>
          </div>
        )}
      </div>
    </SheikhOnly>
  );
}

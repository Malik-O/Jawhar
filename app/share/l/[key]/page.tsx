'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLectureByPublicKey } from '../../../services/platformApi';
import { LectureWithSession } from '../../../types/platform';
import StudySheet from '../../../components/StudySheet';


export default function PublicLecturePage() {
  const params = useParams();
  const key = params?.key as string;
  const [lecture, setLecture] = useState<LectureWithSession | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) return;
    getLectureByPublicKey(key)
      .then(data => {
        setLecture(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'المحاضرة غير موجودة');
        setLoading(false);
      });
  }, [key]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#101010] text-[#FF9800]">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-current border-t-transparent" />
      </div>
    );
  }

  if (error || !lecture) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#101010] text-[#E0E0E0]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">عذراً</h2>
          <p className="text-[#808080]">{error || 'المحاضرة غير موجودة'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#101010] text-[#E0E0E0] overflow-hidden flex flex-col rtl">
      <StudySheet
        data={{
          _id: lecture.sessionId,
          title: lecture.title,
          originalFileName: lecture.session?.title || 'محاضرة',
          status: 'summarized',
          fileType: 'audio', // default
          createdAt: lecture.createdAt || new Date().toISOString(),
          duration: lecture.session?.duration || 0,
          summary: lecture.session?.summary || '',
          transcript: lecture.session?.transcript || '',
          keyPoints: lecture.session?.keyPoints || [],
          quranVerses: lecture.session?.quranVerses || [],
          words: lecture.session?.words || [],
          rawTranscript: lecture.session?.rawTranscript || '',
          speakerSegments: lecture.session?.speakerSegments || [],
          failedAt: '',
          publicKey: lecture.session?.publicKey,
        }}
        isPublic={true}
      />
    </div>
  );
}

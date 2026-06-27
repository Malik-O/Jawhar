'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCourseByPublicKey } from '../../../services/platformApi';
import { Course } from '../../../types/platform';
import { IconFolder, IconNote, IconClock, IconArrowRight } from '../../../components/Icons';

export default function PublicCoursePage() {
  const params = useParams();
  const key = params?.key as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) return;
    getCourseByPublicKey(key)
      .then(data => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'الدورة غير موجودة');
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

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#101010] text-[#E0E0E0]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">عذراً</h2>
          <p className="text-[#808080]">{error || 'الدورة غير موجودة'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101010] text-[#E0E0E0] p-6 sm:p-10 rtl">
      <div className="max-w-[800px] mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/[0.08] pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[14px] bg-[#FF9800]/10 text-[#FF9800] flex items-center justify-center border border-[#FF9800]/25 shrink-0">
              <IconFolder size={32} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0]">{course.title}</h1>
              {course.category && (
                <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-[6px] bg-white/[0.05] border border-white/10 text-[#B0B0B0]">
                  {course.category}
                </span>
              )}
            </div>
          </div>
        </header>

        {course.description && (
          <div className="mb-8 p-5 bg-[#1a1a1a] rounded-[16px] border border-white/[0.08]">
            <p className="text-[0.95rem] text-[#B0B0B0] leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-[#E0E0E0] flex items-center gap-2">
            <IconNote size={20} className="text-[#FF9800]" />
            محاضرات الدورة ({course.lectures.length})
          </h2>
          
          <div className="flex flex-col gap-3">
            {course.lectures.length === 0 ? (
              <div className="text-center py-10 bg-[#1a1a1a] rounded-[16px] border border-white/[0.08] text-[#808080]">
                لا توجد محاضرات مضافة لهذه الدورة بعد.
              </div>
            ) : (
              course.lectures.map((lecture, index) => (
                <Link
                  key={lecture._id}
                  href={`/share/l/${lecture.publicKey}`}
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#1a1a1a] rounded-[16px] border border-white/[0.08] hover:border-[#FF9800]/30 hover:bg-[#FF9800]/[0.02] transition-all gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.05] text-[#808080] group-hover:bg-[#FF9800]/10 group-hover:text-[#FF9800] transition-colors shrink-0 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[1.05rem] font-semibold text-[#E0E0E0] group-hover:text-[#FF9800] transition-colors truncate">
                        {lecture.title}
                      </h3>
                      {lecture.description && (
                        <p className="text-[0.85rem] text-[#808080] truncate mt-0.5">
                          {lecture.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#808080] group-hover:text-[#FF9800] transition-colors shrink-0">
                    <span className="text-sm">عرض المحاضرة</span>
                    <IconArrowRight size={16} className="rotate-180" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

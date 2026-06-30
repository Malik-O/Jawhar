'use client';

import Link from 'next/link';
import { LectureWithSession } from '@/app/types/platform';

interface LectureNavigationProps {
  lecture: LectureWithSession;
  courseLectures: any[];
}

export default function LectureNavigation({ lecture, courseLectures }: LectureNavigationProps) {
  if (!courseLectures || courseLectures.length === 0) return null;

  const sortedLectures = [...courseLectures].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIndex = sortedLectures.findIndex(l => l._id === lecture._id);
  
  const prevLecture = currentIndex > 0 ? sortedLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < sortedLectures.length - 1 ? sortedLectures[currentIndex + 1] : null;

  if (!prevLecture && !nextLecture) return null;

  return (
    <div className="flex items-center justify-between mt-8 p-4 bg-[#161616] border border-white/10 rounded-xl max-w-5xl mx-auto mb-8">
      {prevLecture ? (
        <Link 
          href={`/lecture/${prevLecture._id}`}
          className="flex items-center gap-2 text-[#E0E0E0] hover:text-[#FF9800] transition-colors text-sm font-medium"
        >
          <span>&rarr;</span>
          <span>المحاضرة السابقة</span>
        </Link>
      ) : <div />}
      
      {nextLecture ? (
        <Link 
          href={`/lecture/${nextLecture._id}`}
          className="flex items-center gap-2 text-[#E0E0E0] hover:text-[#FF9800] transition-colors text-sm font-medium"
        >
          <span>المحاضرة التالية</span>
          <span>&larr;</span>
        </Link>
      ) : <div />}
    </div>
  );
}

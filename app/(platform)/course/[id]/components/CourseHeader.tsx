'use client';

import Link from 'next/link';
import CopyLinkButton from '@/app/components/CopyLinkButton';
import { Course, PlatformUser } from '@/app/types/platform';

interface CourseHeaderProps {
  course: Course;
  sheikh: PlatformUser | null;
  enrolled: boolean;
  enrollLoading: boolean;
  handleEnroll: () => void;
}

export default function CourseHeader({ course, sheikh, enrolled, enrollLoading, handleEnroll }: CourseHeaderProps) {
  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden mb-8 relative">
      <div className="h-48 sm:h-64 bg-[#1a1a1a] w-full relative">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-[#222]" />
        )}
      </div>
      
      <div className="px-6 sm:px-8 pb-8 pt-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-wider text-[#FF9800] bg-[#FF9800]/10 px-2 py-1 rounded">
                {course.category || 'عام'}
              </span>
              <CopyLinkButton size="md" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0] mb-2">{course.title}</h1>
            
            {sheikh && (
              <div className="flex items-center gap-3 mb-4">
                <Link href={`/sheikh/${sheikh.clerkId}`} className="flex items-center gap-2 group">
                  {sheikh.profileImage ? (
                    <img src={sheikh.profileImage} alt={sheikh.name} className="w-8 h-8 rounded-full border border-white/10" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-xs text-[#808080]">
                      {sheikh.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-[#B0B0B0] group-hover:text-[#FF9800] transition-colors">{sheikh.name}</span>
                </Link>
              </div>
            )}
            
            {course.description && (
              <p className="text-[#B0B0B0] leading-relaxed max-w-3xl mt-4">{course.description}</p>
            )}
          </div>
          
          <div className="mt-4 sm:mt-0 min-w-[200px]">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 text-center">
              <p className="text-sm text-[#808080] mb-2">عدد المحاضرات</p>
              <p className="text-2xl font-bold text-[#E0E0E0] mb-4">{course.lectures?.length || 0}</p>
              
              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="w-full px-6 py-2 bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {enrollLoading ? 'جاري التسجيل...' : 'التسجيل في الدورة'}
                </button>
              ) : (
                <div className="px-6 py-2 bg-[#00C8C8]/10 text-[#00C8C8] border border-[#00C8C8]/30 font-bold rounded-lg">
                  أنت مسجل في الدورة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { Course } from '@/app/types/platform';

interface CourseListProps {
  courses: Course[];
}

export default function CourseList({ courses }: CourseListProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#E0E0E0] mb-6 border-b border-white/10 pb-4">
        الدورات
      </h2>
      
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id as string}
              href={`/course/${course._id}`}
              className="group bg-[#161616] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF9800]/30 transition-all"
            >
              <div className="h-40 bg-[#1a1a1a] relative">
                {course.coverImage ? (
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#404040]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-[10px] uppercase tracking-wider text-[#FF9800] bg-[#FF9800]/10 px-2 py-1 rounded mb-2 inline-block">
                  {course.category || 'عام'}
                </span>
                <h3 className="text-[#E0E0E0] font-semibold mb-2 group-hover:text-[#FF9800] transition-colors">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-[#808080] line-clamp-2">{course.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#161616] border border-white/10 rounded-2xl">
          <p className="text-[#808080]">لا يوجد دورات حالياً</p>
        </div>
      )}
    </div>
  );
}

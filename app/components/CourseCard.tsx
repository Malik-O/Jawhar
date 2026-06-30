import Link from 'next/link';
import { Course, CourseProgress } from '../types/platform';
import { IconCheck } from './Icons';

interface CourseCardProps {
  course: Course;
  sheikhName?: string;
  progress?: CourseProgress;
  href: string;
}

export default function CourseCard({ course, sheikhName, progress, href }: CourseCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-[#161616] border border-white/[0.08] rounded-[16px] overflow-hidden hover:border-[#FF9800]/25 transition-all"
    >
      {/* Cover Image */}
      <div className="relative aspect-video bg-[#1a1a1a]">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19V5C4 3.89543 4.89543 3 6 3H19.4C19.8319 3 20.134 3.42258 19.986 3.8291L18.5 7.91455C18.3377 8.36093 18.3377 8.85223 18.5 9.29861L19.986 13.384C20.134 13.7906 19.8319 14.2132 19.4 14.2132H6C4.89543 14.2132 4 15.1086 4 16.2132V19ZM4 19C4 20.1046 4.89543 21 6 21H20" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        
        {/* Category Badge */}
        {course.category && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-[6px] text-xs text-[#E0E0E0] border border-white/10">
            {course.category}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-[#E0E0E0] group-hover:text-[#FF9800] transition-colors line-clamp-1 mb-1">
          {course.title}
        </h3>
        
        {sheikhName && (
          <p className="text-xs text-[#808080] mb-3">الشيخ {sheikhName}</p>
        )}
        
        <div className="flex items-center justify-between mt-4 text-xs text-[#B0B0B0]">
          <span>{course.lectures?.length || 0} محاضرة</span>
          {course.enrolledStudents && course.enrolledStudents.length > 0 && (
            <span>{course.enrolledStudents.length} طالب</span>
          )}
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={progress.percent === 100 ? 'text-[#4CAF50]' : 'text-[#808080]'}>
                {progress.percent === 100 ? 'مكتملة' : `${Math.round(progress.percent)}% مكتمل`}
              </span>
              <span className="text-[#808080]">{progress.completed} / {progress.total}</span>
            </div>
            <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progress.percent === 100 ? 'bg-[#4CAF50]' : 'bg-[#FF9800]'}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

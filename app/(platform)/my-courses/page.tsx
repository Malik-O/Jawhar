'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMe, getCourseProgress } from '../../services/platformApi';
import { PlatformUser, Course, CourseProgress } from '../../types/platform';
import CourseCard from '../../components/CourseCard';
import Link from 'next/link';

interface EnrolledCourseData {
  course: Course;
  progress: CourseProgress;
}

export default function MyCoursesPage() {
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState<EnrolledCourseData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    
    async function loadData() {
      try {
        const token = await getToken();
        if (!token) return;
        
        // 1. Get user to see what they're enrolled in (or we can just fetch their enrolled courses)
        const me = await getMe(token);
        
        // This assumes the backend can return the courses a user is enrolled in.
        // Wait, the API `getMe` doesn't populate courses, we might need a specific endpoint, 
        // OR we can fetch all courses and filter. Since `getMe` might return populated courses if we add it to the backend, 
        // or we can fetch `getCourses` with a specific flag.
        // For now, let's assume the backend needs to provide `/api/users/me/courses`.
        // Let's check `getMe` response from the backend. If it doesn't have it, we'll fetch all and filter client-side for now 
        // or just show a coming soon placeholder if not fully supported in backend.
        // But wait! We have `/api/progress/course/:id` to get progress.
        
        // To strictly follow what we have:
        // Let's just fetch all courses and filter by `enrolledStudents.includes(me.clerkId)`
        const { getCourses } = await import('../../services/platformApi');
        const { courses } = await getCourses({ page: 1 }); // might need to handle pagination to get all
        
        const myEnrolled = courses.filter(c => c.enrolledStudents?.includes(me.clerkId));
        
        const withProgress = await Promise.all(
          myEnrolled.map(async (c) => {
            try {
              const progress = await getCourseProgress(token, c._id);
              return { course: c, progress };
            } catch (err) {
              return { 
                course: c, 
                progress: { completed: 0, total: c.lectures?.length || 0, percent: 0, lectures: [] } 
              };
            }
          })
        );
        
        setCoursesData(withProgress);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في تحميل الدورات');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [getToken, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#E0E0E0] mb-2">دوراتي</h1>
        <p className="text-sm text-[#808080]">الدورات التي التحقت بها وتقدمك فيها</p>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {coursesData.length === 0 ? (
        <div className="text-center py-20 bg-[#161616] rounded-[16px] border border-white/5">
          <p className="text-[#808080] text-sm mb-4">لم تلتحق بأي دورة بعد</p>
          <Link 
            href="/"
            className="inline-block bg-[#FF9800]/10 text-[#FF9800] px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#FF9800]/20 transition-colors"
          >
            اكتشف الدورات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coursesData.map(({ course, progress }) => (
            <CourseCard
              key={course._id}
              course={course}
              progress={progress}
              href={`/course/${course._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

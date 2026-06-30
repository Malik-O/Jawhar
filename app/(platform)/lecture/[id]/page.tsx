'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getLecturePublic, getCoursePublic, markLectureComplete } from '@/app/services/platformApi';
import { LectureWithSession, Course } from '@/app/types/platform';
import StudySheet from '@/app/components/StudySheet';
import LectureNavigation from './components/LectureNavigation';

export default function LectureViewPage() {
  const { id } = useParams() as { id: string };
  const { getToken, isLoaded, userId } = useAuth();
  
  const [lecture, setLecture] = useState<LectureWithSession | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!isLoaded) return;
      try {
        const lectureData = await getLecturePublic(id);
        setLecture(lectureData);
        
        if (lectureData.courseId) {
          const courseData = await getCoursePublic(lectureData.courseId).catch(() => null);
          if (courseData) setCourse(courseData);
        }
        
        if (userId) {
          const token = await getToken();
          if (token) {
            markLectureComplete(token, id).catch(() => {});
          }
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في تحميل المحاضرة');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isLoaded, userId, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (error || !lecture || !lecture.session) {
    return (
      <div className="text-center py-20">
        <p className="text-[#ff3333] mb-4">{error || 'المحاضرة غير موجودة'}</p>
        <Link href="/" className="text-[#FF9800] hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col bg-[#101010]">
      <div className="h-[80vh] min-h-[600px] border-b border-white/10">
        <StudySheet 
          data={lecture.session as any} 
          isPublic={true}
        />
      </div>
      
      {course && course.lectures && (
        <div className="flex-1 bg-[#101010]">
          <LectureNavigation 
            lecture={lecture} 
            courseLectures={course.lectures} 
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getCoursePublic, getPublicUser, enrollCourse, getMe } from '@/app/services/platformApi';
import { Course, PlatformUser } from '@/app/types/platform';
import CourseHeader from './components/CourseHeader';
import LectureList from './components/LectureList';

export default function CourseDetailPage() {
  const { id } = useParams() as { id: string };
  const { getToken, isLoaded, userId } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [sheikh, setSheikh] = useState<PlatformUser | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!isLoaded) return;
      try {
        const courseData = await getCoursePublic(id);
        setCourse(courseData);
        
        if (courseData.sheikhId) {
          const sheikhData = await getPublicUser(courseData.sheikhId).catch(() => null);
          setSheikh(sheikhData);
        }
        
        if (userId) {
          const token = await getToken();
          if (token) {
            const me = await getMe(token);
            setEnrolled(courseData.enrolledStudents?.includes(userId) || false);
          }
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في تحميل الدورة');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isLoaded, userId, getToken]);

  const handleEnroll = async () => {
    if (!userId) {
      alert('يرجى تسجيل الدخول للتسجيل في الدورة');
      return;
    }
    
    setEnrollLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token');
      await enrollCourse(token, id);
      setEnrolled(true);
      
      setCourse(prev => prev ? { 
        ...prev, 
        enrolledStudents: [...(prev.enrolledStudents || []), userId] 
      } : null);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في التسجيل');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-20">
        <p className="text-[#ff3333] mb-4">{error || 'الدورة غير موجودة'}</p>
        <Link href="/" className="text-[#FF9800] hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <CourseHeader 
        course={course} 
        sheikh={sheikh} 
        enrolled={enrolled} 
        enrollLoading={enrollLoading} 
        handleEnroll={handleEnroll} 
      />
      <LectureList lectures={course.lectures || []} enrolled={enrolled} />
    </div>
  );
}

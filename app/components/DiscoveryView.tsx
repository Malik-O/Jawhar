'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getSheikhs, getMe, getCourseProgress, getCourses } from '../services/platformApi';
import { SheikhListItem, Course, CourseProgress } from '../types/platform';
import CourseCard from './CourseCard';
import Navbar from './Navbar';

interface EnrolledCourseData {
  course: Course;
  progress: CourseProgress;
}

/** Search input for the discovery section */
function SearchInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="max-w-md mx-auto mb-8">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ابحث عن شيخ بالاسم..."
        className="w-full bg-[#161616] border border-white/10 rounded-[12px] px-4 py-3 text-sm text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
      />
    </div>
  );
}

/** Grid of sheikh cards */
function SheikhGrid({ sheikhs }: { sheikhs: SheikhListItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sheikhs.map((sheikh) => (
        <Link
          key={sheikh.clerkId}
          href={`/sheikh/${sheikh.clerkId}`}
          className="group bg-[#161616] border border-white/[0.08] rounded-[16px] p-5 hover:border-[#FF9800]/25 transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            {sheikh.profileImage ? (
              <img src={sheikh.profileImage} alt={sheikh.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[#808080] text-lg font-bold">
                {sheikh.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#E0E0E0] group-hover:text-[#FF9800] transition-colors truncate">
                {sheikh.name}
              </h3>
              <p className="text-xs text-[#808080]">{sheikh.followers.length} متابع</p>
            </div>
          </div>
          {sheikh.bio && (
            <p className="text-xs text-[#B0B0B0] line-clamp-2 leading-relaxed">{sheikh.bio}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

/** Pagination controls */
function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (p: number) => void }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-sm text-[#B0B0B0] border border-white/10 rounded-[8px] disabled:opacity-40 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all"
      >
        السابق
      </button>
      <span className="text-sm text-[#808080]">{page} / {pages}</span>
      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-3 py-1.5 text-sm text-[#B0B0B0] border border-white/10 rounded-[8px] disabled:opacity-40 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all"
      >
        التالي
      </button>
    </div>
  );
}

/** Enrolled courses section for logged-in students */
function EnrolledCoursesSection({ coursesData }: { coursesData: EnrolledCourseData[] }) {
  if (coursesData.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#E0E0E0]">أكمل تعلمك</h2>
        <Link href="/my-courses" className="text-xs text-[#FF9800] hover:underline">
          عرض الكل
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {coursesData.slice(0, 4).map(({ course, progress }) => (
          <CourseCard
            key={course._id}
            course={course}
            progress={progress}
            href={`/course/${course._id}`}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Student/guest discovery view — the home screen for non-sheikh users.
 * Shows: enrolled courses (if signed in) + browse sheikhs.
 */
export default function DiscoveryView() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [sheikhs, setSheikhs] = useState<SheikhListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  const fetchSheikhs = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const data = await getSheikhs(p, s);
      setSheikhs(data.sheikhs);
      setPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch sheikhs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSheikhs(page, search), 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchSheikhs]);

  /** Load enrolled courses for signed-in students */
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function loadEnrolled() {
      setEnrolledLoading(true);
      try {
        const token = await getToken();
        if (!token) return;

        const me = await getMe(token);
        const { courses } = await getCourses({ page: 1 });
        const myEnrolled = courses.filter(c => c.enrolledStudents?.includes(me.clerkId));

        const withProgress = await Promise.all(
          myEnrolled.map(async (c) => {
            try {
              const progress = await getCourseProgress(token, c._id);
              return { course: c, progress };
            } catch {
              return {
                course: c,
                progress: { completed: 0, total: c.lectures?.length || 0, percent: 0, lectures: [] },
              };
            }
          })
        );
        setEnrolledCourses(withProgress);
      } catch (err) {
        console.error('Failed to load enrolled courses:', err);
      } finally {
        setEnrolledLoading(false);
      }
    }

    loadEnrolled();
  }, [isLoaded, isSignedIn, getToken]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-[#101010]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{
            background: 'linear-gradient(135deg, #FFB74D, #FF9800, #E65100)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            اكتشف الشيوخ والدورات
          </h1>
          <p className="text-sm text-[#B0B0B0]">تابع شيوخك المفضلين وتعلم من محاضراتهم</p>
        </header>

        {/* Enrolled courses for signed-in students */}
        {isSignedIn && !enrolledLoading && (
          <EnrolledCoursesSection coursesData={enrolledCourses} />
        )}

        <SearchInput value={search} onChange={handleSearchChange} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
          </div>
        ) : sheikhs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#808080] text-sm">لا يوجد شيوخ حالياً</p>
          </div>
        ) : (
          <SheikhGrid sheikhs={sheikhs} />
        )}

        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>
    </div>
  );
}

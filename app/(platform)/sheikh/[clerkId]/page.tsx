'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getSheikhPublic, followSheikh, unfollowSheikh, getMe } from '@/app/services/platformApi';
import { PlatformUser, Course } from '@/app/types/platform';
import CopyLinkButton from '@/app/components/CopyLinkButton';

interface SheikhPublicProfile extends PlatformUser {
  courses: Course[];
}

export default function SheikhProfilePage() {
  const { clerkId } = useParams() as { clerkId: string };
  const { getToken, isLoaded, userId } = useAuth();
  
  const [sheikh, setSheikh] = useState<SheikhPublicProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!isLoaded) return;
      try {
        const data = await getSheikhPublic(clerkId);
        setSheikh(data);
        
        // Check if current user is following
        if (userId) {
          const token = await getToken();
          if (token) {
            const me = await getMe(token);
            setIsFollowing(me.following?.includes(clerkId) || false);
          }
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في تحميل بيانات الشيخ');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clerkId, isLoaded, userId, getToken]);

  const handleFollowToggle = async () => {
    if (!userId) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    setFollowLoading(true);
    try {
      const token = await getToken();
      if (isFollowing) {
        await unfollowSheikh(token, clerkId);
        setIsFollowing(false);
        setSheikh(prev => prev ? { ...prev, followers: prev.followers.filter(id => id !== userId) } : null);
      } else {
        await followSheikh(token, clerkId);
        setIsFollowing(true);
        setSheikh(prev => prev ? { ...prev, followers: [...prev.followers, userId] } : null);
      }
    } catch (err) {
      console.error('Follow toggle failed', err);
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (error || !sheikh) {
    return (
      <div className="text-center py-20">
        <p className="text-[#ff3333] mb-4">{error || 'الشيخ غير موجود'}</p>
        <Link href="/" className="text-[#FF9800] hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const isOwnProfile = userId === clerkId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden mb-8 relative">
        {/* Cover Image */}
        <div className="h-48 sm:h-64 bg-[#1a1a1a] w-full relative">
          {sheikh.coverImage ? (
            <img src={sheikh.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-[#222]" />
          )}
        </div>
        
        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20 relative z-10 mb-6">
            <div className="flex items-end gap-4">
              {sheikh.profileImage ? (
                <img src={sheikh.profileImage} alt={sheikh.name} className="w-32 h-32 rounded-full border-4 border-[#161616] object-cover bg-[#1a1a1a]" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-[#161616] bg-[#1a1a1a] flex items-center justify-center text-[#808080] text-4xl font-bold">
                  {sheikh.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-4 sm:mt-0">
              <CopyLinkButton size="md" />
              
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                    isFollowing 
                      ? 'bg-transparent border border-white/20 text-[#E0E0E0] hover:bg-white/5' 
                      : 'bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] border-none hover:opacity-90'
                  }`}
                >
                  {followLoading ? 'جاري...' : isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                </button>
              )}
              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="px-6 py-2 bg-transparent border border-white/20 text-[#E0E0E0] hover:bg-white/5 rounded-lg font-semibold transition-all"
                >
                  تعديل الملف الشخصي
                </Link>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E0E0E0] mb-1">{sheikh.name}</h1>
            <p className="text-[#808080] text-sm mb-4">{sheikh.followers?.length || 0} متابع</p>
            {sheikh.bio && (
              <p className="text-[#B0B0B0] leading-relaxed max-w-3xl">{sheikh.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-[#E0E0E0] mb-6 border-b border-white/10 pb-4">
          الدورات
        </h2>
        
        {sheikh.courses && sheikh.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheikh.courses.map((course) => (
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
    </div>
  );
}

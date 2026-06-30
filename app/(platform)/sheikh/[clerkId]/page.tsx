'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { getSheikhPublic, followSheikh, unfollowSheikh, getMe } from '@/app/services/platformApi';
import { PlatformUser, Course } from '@/app/types/platform';
import SheikhHeader from './components/SheikhHeader';
import CourseList from './components/CourseList';

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
      if (!token) throw new Error('No token');
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SheikhHeader 
        sheikh={sheikh} 
        isFollowing={isFollowing} 
        followLoading={followLoading} 
        handleFollowToggle={handleFollowToggle} 
        clerkId={clerkId} 
      />
      <CourseList courses={sheikh.courses} />
    </div>
  );
}

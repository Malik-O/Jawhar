'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import CopyLinkButton from '@/app/components/CopyLinkButton';

interface SheikhHeaderProps {
  sheikh: any;
  isFollowing: boolean;
  followLoading: boolean;
  handleFollowToggle: () => void;
  clerkId: string;
}

export default function SheikhHeader({ sheikh, isFollowing, followLoading, handleFollowToggle, clerkId }: SheikhHeaderProps) {
  const { userId } = useAuth();
  const isOwnProfile = userId === clerkId;

  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl overflow-hidden mb-8 relative">
      <div className="h-48 sm:h-64 bg-[#1a1a1a] w-full relative">
        {sheikh.coverImage ? (
          <img src={sheikh.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-[#222]" />
        )}
      </div>
      
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
  );
}

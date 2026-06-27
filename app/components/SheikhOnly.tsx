'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../hooks/useUserRole';

export default function SheikhOnly({ children }: { children: React.ReactNode }) {
  const { isSheikh, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSheikh) {
      router.push('/');
    }
  }, [loading, isSheikh, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (!isSheikh) return null;

  return <>{children}</>;
}

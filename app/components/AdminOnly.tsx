'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '../hooks/useUserRole';

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
}

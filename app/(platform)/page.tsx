'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Platform route group index — redirects to root page
 * which handles role-based rendering (discovery vs workspace).
 */
export default function PlatformIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
    </div>
  );
}

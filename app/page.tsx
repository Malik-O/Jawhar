'use client';

import { useUserRole } from './hooks/useUserRole';
import SheikhWorkspace from './components/SheikhWorkspace';
import DiscoveryView from './components/DiscoveryView';

/**
 * Root page — role-based router.
 * - Sheikh users see their workspace (upload, process, study sheets).
 * - Students/guests see the discovery page (browse sheikhs + enrolled courses).
 */
export default function Home() {
  const { isSheikh, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101010]">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (isSheikh) {
    return <SheikhWorkspace />;
  }

  return <DiscoveryView />;
}

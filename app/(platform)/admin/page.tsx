'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getAdminStats, getPendingSheikhs, approveSheikh, rejectSheikh, getAdminUsers } from '@/app/services/platformApi';
import { AdminStats, PlatformUser } from '@/app/types/platform';
import AdminOnly from '@/app/components/AdminOnly';
import StatsCards from './components/StatsCards';
import PendingSheikhs from './components/PendingSheikhs';
import UsersTable from './components/UsersTable';

export default function AdminDashboardPage() {
  const { getToken, isLoaded } = useAuth();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingSheikhs, setPendingSheikhs] = useState<PlatformUser[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!isLoaded) return;
    try {
      const token = await getToken();
      if (!token) return;
      
      const [statsData, pendingData, usersData] = await Promise.all([
        getAdminStats(token),
        getPendingSheikhs(token),
        getAdminUsers(token, 1)
      ]);
      
      setStats(statsData);
      setPendingSheikhs(pendingData);
      setUsers(usersData.users);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تحميل بيانات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isLoaded, getToken]);

  const handleApprove = async (clerkId: string) => {
    if (!confirm('تأكيد قبول طلب الاعتماد؟')) return;
    setActionLoading(`approve-${clerkId}`);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token');
      await approveSheikh(token, clerkId);
      await loadData(); // Reload all data to update stats and lists
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في قبول الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (clerkId: string) => {
    if (!confirm('تأكيد رفض طلب الاعتماد؟')) return;
    setActionLoading(`reject-${clerkId}`);
    try {
      const token = await getToken();
      if (!token) throw new Error('No token');
      await rejectSheikh(token, clerkId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في رفض الطلب');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminOnly>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-bold text-[#E0E0E0]">لوحة تحكم الإدارة</h1>
          <p className="text-[#808080] text-sm mt-1">إدارة المستخدمين والطلبات والنظام</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
          </div>
        ) : error ? (
          <div className="p-4 bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff3333] rounded-lg">
            {error}
          </div>
        ) : (
          <>
            {stats && <StatsCards stats={stats} />}
            <PendingSheikhs 
              pendingSheikhs={pendingSheikhs} 
              handleApprove={handleApprove} 
              handleReject={handleReject} 
              actionLoading={actionLoading} 
            />
            <UsersTable users={users} />
          </>
        )}
      </div>
    </AdminOnly>
  );
}

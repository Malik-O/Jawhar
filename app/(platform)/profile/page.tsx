'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMe } from '@/app/services/platformApi';
import { PlatformUser } from '@/app/types/platform';
import ProfileForm from './components/ProfileForm';
import SidebarInfo from './components/SidebarInfo';

export default function ProfilePage() {
  const { getToken, isLoaded } = useAuth();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadUser() {
      if (!isLoaded) return;
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getMe(token);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[#808080]">حدث خطأ في تحميل الملف الشخصي.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#E0E0E0]">الملف الشخصي</h1>
        <p className="text-[#808080] text-sm mt-1">إدارة معلوماتك الشخصية وحالة حسابك</p>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success' ? 'bg-[#00C8C8]/10 border-[#00C8C8]/30 text-[#00C8C8]' : 'bg-[#ff3333]/10 border-[#ff3333]/30 text-[#ff3333]'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ProfileForm user={user} onUserUpdate={setUser} setMessage={setMessage} />
        </div>
        <SidebarInfo user={user} onUserUpdate={setUser} setMessage={setMessage} />
      </div>
    </div>
  );
}

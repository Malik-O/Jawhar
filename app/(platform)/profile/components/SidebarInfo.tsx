'use client';

import { useAuth } from '@clerk/nextjs';
import { PlatformUser } from '@/app/types/platform';
import { requestSheikh, getMe } from '@/app/services/platformApi';
import Link from 'next/link';

interface SidebarInfoProps {
  user: PlatformUser;
  onUserUpdate: (updatedUser: PlatformUser) => void;
  setMessage: (msg: { text: string; type: string }) => void;
}

export default function SidebarInfo({ user, onUserUpdate, setMessage }: SidebarInfoProps) {
  const { getToken } = useAuth();

  const handleRequestSheikh = async () => {
    if (!confirm('هل أنت متأكد من تقديم طلب الاعتماد كشيخ؟')) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('No token');
      await requestSheikh(token);
      setMessage({ text: 'تم ترقية الحساب إلى شيخ بنجاح', type: 'success' });
      // Refresh user to get updated status
      const data = await getMe(token);
      onUserUpdate(data);
    } catch (err: any) {
      setMessage({ text: err.message || 'حدث خطأ في تقديم الطلب', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/10 object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-white/10 flex items-center justify-center text-[#808080] text-3xl font-bold mx-auto mb-4">
            {user.name.charAt(0)}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-[#E0E0E0]">{user.name}</h3>
        
        <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs border border-white/10 bg-[#1a1a1a]">
          {user.role === 'super_admin' && <span className="text-[#ff3333]">مدير نظام</span>}
          {user.role === 'sheikh' && <span className="text-[#FF9800]">شيخ معتمد</span>}
          {user.role === 'student' && <span className="text-[#00C8C8]">طالب</span>}
        </div>
      </div>

      {user.role === 'student' && (
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-[#E0E0E0] mb-2">ترقية الحساب</h3>
          <p className="text-sm text-[#808080] mb-4">ترقية الحساب إلى شيخ تتيح لك إنشاء دورات ونشر محاضرات.</p>
          <button
            onClick={handleRequestSheikh}
            className="w-full px-4 py-2 border border-[#FF9800]/50 text-[#FF9800] hover:bg-[#FF9800]/10 rounded-lg transition-colors text-sm font-semibold"
          >
            ترقية إلى شيخ
          </button>
        </div>
      )}

      {user.role === 'sheikh' && (
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
          <h3 className="font-semibold text-[#E0E0E0] mb-2">لوحة التحكم</h3>
          <p className="text-sm text-[#808080] mb-4">إدارة دوراتك ومحاضراتك التي تنشرها للطلاب.</p>
          <div className="space-y-2">
            <Link href="/courses/new" className="block w-full text-center px-4 py-2 border border-white/10 text-[#E0E0E0] hover:border-white/20 hover:bg-white/5 rounded-lg transition-colors text-sm">
              إنشاء دورة جديدة
            </Link>
            <Link href="/upload" className="block w-full text-center px-4 py-2 bg-white/5 border border-white/10 text-[#FF9800] hover:bg-white/10 rounded-lg transition-colors text-sm">
              رفع محاضرة جديدة
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

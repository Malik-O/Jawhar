'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMe, updateMe, requestSheikh } from '@/app/services/platformApi';
import { PlatformUser } from '@/app/types/platform';
import Link from 'next/link';

export default function ProfilePage() {
  const { getToken, isLoaded } = useAuth();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadUser() {
      if (!isLoaded) return;
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getMe(token);
        setUser(data);
        setBio(data.bio || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [isLoaded, getToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = await getToken();
      const updated = await updateMe(token, { bio });
      setUser(updated);
      setMessage({ text: 'تم تحديث الملف الشخصي بنجاح', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'حدث خطأ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestSheikh = async () => {
    if (!confirm('هل أنت متأكد من تقديم طلب الاعتماد كشيخ؟')) return;
    try {
      const token = await getToken();
      await requestSheikh(token);
      setMessage({ text: 'تم تقديم الطلب بنجاح، بانتظار المراجعة', type: 'success' });
      // Refresh user to get updated status
      const data = await getMe(token);
      setUser(data);
    } catch (err: any) {
      setMessage({ text: err.message || 'حدث خطأ في تقديم الطلب', type: 'error' });
    }
  };

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
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#E0E0E0] mb-4">المعلومات الأساسية</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-[#B0B0B0] mb-1">الاسم</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-[#E0E0E0] opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-[#808080] mt-1">يتم تحديث الاسم من إعدادات الحساب الرئيسية (Clerk)</p>
              </div>

              <div>
                <label className="block text-sm text-[#B0B0B0] mb-1">النبذة التعريفية</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
                  placeholder="اكتب نبذة مختصرة عنك..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
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
              {user.sheikhStatus === 'pending' ? (
                <div className="p-3 bg-[#FF9800]/10 border border-[#FF9800]/20 rounded-lg text-sm text-[#FF9800]">
                  طلب اعتمادك كشيخ قيد المراجعة حالياً.
                </div>
              ) : user.sheikhStatus === 'rejected' ? (
                <div className="p-3 bg-[#ff3333]/10 border border-[#ff3333]/20 rounded-lg text-sm text-[#ff3333]">
                  نأسف، تم رفض طلبك. يمكنك التواصل مع الإدارة.
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#808080] mb-4">هل أنت شيخ أو محاضر؟ قدم طلبك الآن لتتمكن من إنشاء دورات ونشر محاضراتك.</p>
                  <button
                    onClick={handleRequestSheikh}
                    className="w-full px-4 py-2 border border-[#FF9800]/50 text-[#FF9800] hover:bg-[#FF9800]/10 rounded-lg transition-colors text-sm font-semibold"
                  >
                    طلب اعتماد كشيخ
                  </button>
                </>
              )}
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
      </div>
    </div>
  );
}

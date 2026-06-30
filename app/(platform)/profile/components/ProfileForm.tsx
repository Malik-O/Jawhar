'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { updateMe } from '@/app/services/platformApi';
import { PlatformUser } from '@/app/types/platform';

interface ProfileFormProps {
  user: PlatformUser;
  onUserUpdate: (updatedUser: PlatformUser) => void;
  setMessage: (msg: { text: string; type: string }) => void;
}

export default function ProfileForm({ user, onUserUpdate, setMessage }: ProfileFormProps) {
  const { getToken } = useAuth();
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = await getToken();
      if (!token) throw new Error('No token');
      const updated = await updateMe(token, { bio });
      onUserUpdate(updated);
      setMessage({ text: 'تم تحديث الملف الشخصي بنجاح', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'حدث خطأ', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
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
  );
}

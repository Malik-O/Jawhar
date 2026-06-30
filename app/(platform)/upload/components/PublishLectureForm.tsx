'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createLecture, getCourses } from '@/app/services/platformApi';
import { Course } from '@/app/types/platform';
import Link from 'next/link';

interface PublishLectureFormProps {
  sessionId: string;
  defaultTitle?: string;
  onPublished: () => void;
}

export default function PublishLectureForm({ sessionId, defaultTitle, onPublished }: PublishLectureFormProps) {
  const { getToken, userId } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState(defaultTitle || '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى إدخال عنوان المحاضرة');
      return;
    }

    setPublishing(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No token');

      const data: any = { sessionId, title, description };

      await createLecture(token, data);
      onPublished();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في نشر المحاضرة');
      setPublishing(false);
    }
  };

  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 md:p-8 mt-8">
      <h2 className="text-xl font-bold text-[#FF9800] mb-6">اكتملت المعالجة! نشر المحاضرة</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff3333] rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">عنوان المحاضرة *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
            placeholder="مثال: الدرس الأول - مقدمة"
            required
          />
        </div>



        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">وصف المحاضرة (اختياري)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
            placeholder="نبذة مختصرة عن محتوى المحاضرة..."
          />
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <Link href={`/history/${sessionId}`} className="text-[#808080] hover:text-[#E0E0E0] text-sm transition-colors">
            معاينة الملخص قبل النشر
          </Link>
          <button
            type="submit"
            disabled={publishing}
            className="px-8 py-3 bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {publishing ? 'جاري النشر...' : 'نشر المحاضرة'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/app/services/platformApi';

export default function CourseForm() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الدورة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No token');

      const course = await createCourse(token, {
        title,
        description,
        category,
        coverImage,
      });

      router.push(`/course/${course._id}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إنشاء الدورة');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 md:p-8">
      {error && (
        <div className="mb-6 p-4 bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff3333] rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">عنوان الدورة *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
            placeholder="مثال: شرح كتاب التوحيد"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">التصنيف</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
            placeholder="مثال: عقيدة، فقه، سيرة..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">وصف الدورة</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
            placeholder="وصف مختصر لمحتوى الدورة وأهدافها..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#E0E0E0] mb-2">رابط صورة الغلاف (اختياري)</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-[#E0E0E0] focus:border-[#FF9800]/50 focus:outline-none transition-colors text-left dir-ltr"
            placeholder="https://example.com/image.jpg"
          />
          {coverImage && (
            <div className="mt-4">
              <p className="text-sm text-[#808080] mb-2">معاينة الصورة:</p>
              <img src={coverImage} alt="Cover preview" className="w-full max-w-sm h-48 object-cover rounded-lg border border-white/10" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getSheikhs } from '../services/platformApi';
import { SheikhListItem } from '../types/platform';

export default function DiscoveryPage() {
  const [sheikhs, setSheikhs] = useState<SheikhListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchSheikhs = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const data = await getSheikhs(p, s);
      setSheikhs(data.sheikhs);
      setPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch sheikhs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchSheikhs(page, search), 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchSheikhs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #FFB74D, #FF9800, #E65100)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          اكتشف الشيوخ والدورات
        </h1>
        <p className="text-sm text-[#B0B0B0]">تابع شيوخك المفضلين وتعلم من محاضراتهم</p>
      </header>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث عن شيخ بالاسم..."
          className="w-full bg-[#161616] border border-white/10 rounded-[12px] px-4 py-3 text-sm text-[#E0E0E0] placeholder:text-[#808080] focus:border-[#FF9800]/50 focus:outline-none transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/[0.08] border-t-[#FF9800] rounded-full animate-spin-fast" />
        </div>
      ) : sheikhs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#808080] text-sm">لا يوجد شيوخ حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheikhs.map((sheikh) => (
            <Link
              key={sheikh.clerkId}
              href={`/sheikh/${sheikh.clerkId}`}
              className="group bg-[#161616] border border-white/[0.08] rounded-[16px] p-5 hover:border-[#FF9800]/25 transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                {sheikh.profileImage ? (
                  <img src={sheikh.profileImage} alt={sheikh.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[#808080] text-lg font-bold">
                    {sheikh.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#E0E0E0] group-hover:text-[#FF9800] transition-colors truncate">
                    {sheikh.name}
                  </h3>
                  <p className="text-xs text-[#808080]">{sheikh.followers.length} متابع</p>
                </div>
              </div>
              {sheikh.bio && (
                <p className="text-xs text-[#B0B0B0] line-clamp-2 leading-relaxed">{sheikh.bio}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm text-[#B0B0B0] border border-white/10 rounded-[8px] disabled:opacity-40 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all"
          >
            السابق
          </button>
          <span className="text-sm text-[#808080]">{page} / {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 text-sm text-[#B0B0B0] border border-white/10 rounded-[8px] disabled:opacity-40 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}

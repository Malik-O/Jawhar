'use client';

import { AdminStats } from '@/app/types/platform';

interface StatsCardsProps {
  stats: AdminStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-[#808080] text-sm mb-2">إجمالي المستخدمين</h3>
        <p className="text-3xl font-bold text-[#E0E0E0]">{stats.totalUsers}</p>
      </div>
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-[#808080] text-sm mb-2">الشيوخ المعتمدين</h3>
        <p className="text-3xl font-bold text-[#FF9800]">{stats.totalSheikhs}</p>
      </div>
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-[#808080] text-sm mb-2">إجمالي الدورات</h3>
        <p className="text-3xl font-bold text-[#00C8C8]">{stats.totalCourses}</p>
      </div>
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 text-center">
        <h3 className="text-[#808080] text-sm mb-2">إجمالي المحاضرات</h3>
        <p className="text-3xl font-bold text-[#b366ff]">{stats.totalLectures}</p>
      </div>
    </div>
  );
}

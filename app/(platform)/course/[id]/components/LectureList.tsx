'use client';

import Link from 'next/link';

interface LectureListProps {
  lectures: any[];
  enrolled: boolean;
}

export default function LectureList({ lectures, enrolled }: LectureListProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#E0E0E0] mb-6 border-b border-white/10 pb-4">
        محتوى الدورة
      </h2>
      
      {lectures && lectures.length > 0 ? (
        <div className="space-y-3">
          {lectures.sort((a, b) => (a.order || 0) - (b.order || 0)).map((lecture, index) => (
            <div key={lecture._id} className="bg-[#161616] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-sm text-[#808080]">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-[#E0E0E0] font-medium">{lecture.title}</h3>
                  {lecture.description && (
                    <p className="text-sm text-[#808080] line-clamp-1 mt-1">{lecture.description}</p>
                  )}
                </div>
              </div>
              
              <Link
                href={`/lecture/${lecture._id}`}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#E0E0E0] rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                عرض المحاضرة
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#161616] border border-white/10 rounded-2xl">
          <p className="text-[#808080]">لا توجد محاضرات في هذه الدورة بعد</p>
        </div>
      )}
    </div>
  );
}

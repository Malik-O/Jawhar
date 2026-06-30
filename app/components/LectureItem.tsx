import Link from 'next/link';
import { Lecture, LectureWithSession } from '../types/platform';
import { IconCheck } from './Icons';

interface LectureItemProps {
  lecture: Lecture | LectureWithSession;
  completed?: boolean;
  href: string;
  order?: number;
}

export default function LectureItem({ lecture, completed, href, order }: LectureItemProps) {
  const session = (lecture as LectureWithSession).session;
  
  // Format duration if available
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-4 rounded-[12px] border transition-all ${
        completed 
          ? 'bg-[#161616]/50 border-white/[0.04] hover:bg-[#161616]' 
          : 'bg-[#161616] border-white/[0.08] hover:border-[#FF9800]/30 hover:shadow-[0_0_15px_rgba(255,152,0,0.05)]'
      }`}
    >
      {/* Status/Order indicator */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        completed 
          ? 'bg-[#4CAF50]/10 border-[#4CAF50]/30 text-[#4CAF50]' 
          : 'bg-[#1a1a1a] border-white/10 text-[#808080] group-hover:text-[#FF9800] group-hover:border-[#FF9800]/30'
      } transition-colors`}>
        {completed ? (
          <IconCheck size={16} />
        ) : (
          <span className="text-sm font-medium">{order !== undefined ? order : '▶'}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate mb-1 transition-colors ${
          completed ? 'text-[#B0B0B0]' : 'text-[#E0E0E0] group-hover:text-[#FF9800]'
        }`}>
          {lecture.title}
        </h4>
        {lecture.description && (
          <p className="text-xs text-[#808080] line-clamp-1">{lecture.description}</p>
        )}
      </div>

      {/* Duration */}
      {session && session.duration > 0 && (
        <div className="shrink-0 text-xs text-[#808080] font-mono bg-[#101010] px-2 py-1 rounded-[6px] border border-white/5">
          {formatTime(session.duration)}
        </div>
      )}
    </Link>
  );
}

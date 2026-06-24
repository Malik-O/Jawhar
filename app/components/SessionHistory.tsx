'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SessionListItem } from '../types/session';
import { fetchSessions } from '../services/api';
import { IconFile, IconMic, IconVideo, IconX, IconClock } from './Icons';
import { formatDuration } from '../utils/formatDuration';

interface SessionHistoryProps {
  onSelect?: (id: string) => void;
  refreshTrigger?: number;
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    uploaded: 'تم الرفع',
    extracted: 'تم الاستخراج',
    transcribed: 'تم التفريغ',
    summarized: 'مكتمل',
    failed: 'فشل',
  };
  const isOk = status === 'summarized';
  const isFail = status === 'failed';
  
  return (
    <span className={`text-[0.68rem] px-2 py-0.5 rounded-full border ${isOk ? 'text-emerald-400 border-emerald-400/25 bg-emerald-400/10' : isFail ? 'text-red-400 border-red-400/25 bg-red-400/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function SessionHistory({ onSelect, refreshTrigger = 0 }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const currentId = params?.id as string;

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch {
      console.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, refreshTrigger]);

  return (
    <aside className="w-[280px] min-w-[280px] bg-[#0d1529] border-l border-white/10 p-6 flex flex-col h-screen sticky top-0 overflow-y-auto no-print">
      <h2 className="flex items-center gap-2 text-[1.05rem] font-semibold text-[#d4a843] mb-5 pb-3 border-b border-white/10">
        <IconFile size={18} />
        المحاضرات السابقة
      </h2>

      {isLoading && <div className="text-center text-slate-500 text-sm py-8">جارٍ التحميل...</div>}
      {!isLoading && sessions.length === 0 && <div className="text-center text-slate-500 text-sm py-8">لا توجد محاضرات بعد</div>}

      {!isLoading && sessions.length > 0 && (
        <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
          {sessions.map((s) => {
            const dateStr = new Date(s.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            const isActive = currentId === s._id;
            
            const content = (
              <>
                <span className={`flex transition-colors ${isActive ? 'text-[#d4a843]' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {s.fileType === 'video' ? <IconVideo size={18} /> : <IconMic size={18} />}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[0.82rem] font-medium text-slate-200 whitespace-nowrap overflow-hidden text-ellipsis">
                    {s.title || s.originalFileName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[0.72rem] text-slate-500">
                      <IconClock size={12} /> {dateStr}
                    </span>
                    {s.duration > 0 && (
                      <span className="text-[0.68rem] text-slate-500">
                        {formatDuration(s.duration)}
                      </span>
                    )}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              </>
            );

            const className = `flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all text-right group ${isActive ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'}`;

            return (
              <li key={s._id}>
                {onSelect ? (
                   <button onClick={() => onSelect(s._id)} className={className}>
                     {content}
                  </button>
                ) : (
                  <Link href={`/history/${s._id}`} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

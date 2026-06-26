'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Tooltip } from 'react-tooltip';
import { SessionListItem } from '../types/session';
import { fetchSessions, archiveSession } from '../services/api';
import { IconFile, IconMic, IconVideo, IconX, IconClock, IconArchive, IconPlus } from './Icons';
import { IconMenu } from './Icons';
import { formatDuration } from '../utils/formatDuration';

const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' });

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  let duration = (date.getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), 'year');
}

interface SessionHistoryProps {
  onSelect?: (id: string) => void;
  onAddNew?: () => void;
  refreshTrigger?: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  titleUpdate?: { id: string; title: string; nonce: number };
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
  
  if (isOk) return null;

  return (
    <span className={`text-[0.68rem] px-2 py-0.5 rounded-[16px] border ${isFail ? 'text-red-400 border-red-400/25 bg-red-400/10' : 'text-[#808080] border-white/10 bg-white/5'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function SessionHistory({ onSelect, onAddNew, refreshTrigger = 0, isMobileOpen = false, onMobileClose, titleUpdate }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const params = useParams();
  const currentId = params?.id as string;

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSessions(showArchived);
      setSessions(data);
    } catch {
      console.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, refreshTrigger]);

  useEffect(() => {
    if (!titleUpdate || titleUpdate.nonce === 0) return;
    setSessions(prev => prev.map(s => s._id === titleUpdate.id ? { ...s, title: titleUpdate.title } : s));
  }, [titleUpdate]);

  const handleArchive = useCallback(async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await archiveSession(id, !showArchived);
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch {
      console.error('Failed to archive session');
    }
  }, [showArchived]);

  const handleSelectAndClose = useCallback((id: string) => {
    onSelect?.(id);
    onMobileClose?.();
  }, [onSelect, onMobileClose]);

  const handleAddNewAndClose = useCallback(() => {
    onAddNew?.();
    onMobileClose?.();
  }, [onAddNew, onMobileClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/60 z-40 animate-backdrop-in"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          w-full sm:w-[300px] sm:min-w-[300px] h-full bg-[#161616] border-l border-white/[0.08] flex flex-col overflow-hidden no-print shrink-0
          fixed sm:static inset-y-0 right-0 z-50 transition-transform duration-300 sm:transition-none
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
        `}
      >
      <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-[#FF9800]/15 gap-2 shrink-0">
        <h2 className="flex items-center gap-2 text-[1.05rem] font-semibold text-[#FF9800] whitespace-nowrap shrink-0">
          {/* <IconFile size={18} /> */}
          {showArchived ? 'المؤرشفة' : 'المحاضرات السابقة'}
        </h2>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-[8px] text-[#808080] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 hover:bg-[#FF9800]/10 transition-all cursor-pointer"
            title="إغلاق"
          >
            <IconX size={16} />
          </button>
          {!showArchived && (
            <button
              onClick={handleAddNewAndClose}
              data-tooltip-id="session-action-tooltip"
              data-tooltip-content="إضافة محاضرة جديدة"
              className="flex items-center justify-center w-8 h-8 rounded-[8px] text-[#808080] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 hover:bg-[#FF9800]/10 transition-all cursor-pointer"
            >
              <IconPlus size={16} />
            </button>
          )}
          <button
            onClick={() => setShowArchived(v => !v)}
            data-tooltip-id="session-action-tooltip"
            data-tooltip-content={showArchived ? 'العودة' : 'المؤرشف'}
            className={`flex items-center justify-center w-8 h-8 rounded-[8px] border transition-all cursor-pointer ${showArchived ? 'text-[#FF9800] border-[#FF9800]/25 bg-[#FF9800]/10' : 'text-[#808080] border-white/10 hover:text-[#B0B0B0] hover:border-white/20'}`}
          >
            <IconArchive size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 pt-3">
      {isLoading && <div className="text-center text-[#808080] text-sm py-8 animate-pulse">جارٍ التحميل...</div>}
      {!isLoading && sessions.length === 0 && <div className="text-center text-[#808080] text-sm py-8">لا توجد محاضرات بعد</div>}

      {!isLoading && sessions.length > 0 && (
        <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
          {sessions.map((s) => {
            const dateStr = formatRelativeTime(s.createdAt);
            const isActive = currentId === s._id;
            
            const content = (
              <>
                <span className={`flex transition-colors ${isActive ? 'text-[#FF9800]' : 'text-[#808080] group-hover:text-[#B0B0B0]'}`}>
                  {s.fileType === 'video' ? <IconVideo size={18} /> : <IconMic size={18} />}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    data-tooltip-id="session-item-tooltip"
                    data-tooltip-content={s.title || s.originalFileName}
                    className="text-[0.82rem] font-medium text-[#E0E0E0] whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {s.title || s.originalFileName}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-[0.72rem] text-[#808080]">
                      <IconClock size={12} /> {dateStr}
                    </span>
                    {s.duration > 0 && (
                      <span className="text-[0.68rem] text-[#808080]">
                        {formatDuration(s.duration)}
                      </span>
                    )}
                    <StatusBadge status={s.status} />
                  </div>
                </div>
                <button
                  onClick={(e) => handleArchive(e, s._id)}
                  data-tooltip-id="session-item-action-tooltip"
                  data-tooltip-content={showArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                  className="flex items-center justify-center w-7 h-7 min-w-7 rounded-[8px] text-[#808080] hover:text-[#FF9800] hover:bg-[#FF9800]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <IconArchive size={15} />
                </button>
              </>
            );

            const className = `flex items-center gap-3 w-full p-2.5 rounded-[10px] border transition-all text-right group ${isActive ? 'bg-[#FF9800]/[0.08] border-[#FF9800]/20' : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'}`;

            return (
              <li key={s._id}>
                {onSelect ? (
                   <button onClick={() => handleSelectAndClose(s._id)} className={className}>
                     {content}
                  </button>
                ) : (
                  <Link href={`/history/${s._id}`} className={className} onClick={onMobileClose}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
      </div>

      <Tooltip
        id="session-item-tooltip"
        place="top"
        variant="dark"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,152,0,0.25)',
          borderRadius: '10px',
          fontSize: '0.78rem',
          padding: '6px 12px',
          color: '#E0E0E0',
          maxWidth: '300px',
          zIndex: 9999,
        }}
      />
      <Tooltip
        id="session-action-tooltip"
        place="bottom"
        variant="dark"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,152,0,0.25)',
          borderRadius: '10px',
          fontSize: '0.72rem',
          padding: '4px 10px',
          color: '#E0E0E0',
          zIndex: 9999,
        }}
      />
      <Tooltip
        id="session-item-action-tooltip"
        place="top"
        variant="dark"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,152,0,0.25)',
          borderRadius: '10px',
          fontSize: '0.72rem',
          padding: '4px 10px',
          color: '#E0E0E0',
          zIndex: 9999,
        }}
      />
      </aside>
    </>
  );
}

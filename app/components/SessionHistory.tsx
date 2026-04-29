'use client';

import { useEffect, useState, useCallback } from 'react';
import { SessionListItem } from '../types/session';
import { fetchSessions } from '../services/api';
import { IconFile, IconMic, IconVideo, IconX, IconClock } from './Icons';

interface SessionHistoryProps {
  onSelect: (id: string) => void;
  refreshTrigger: number;
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
    <span className={`history-status ${isOk ? 'ok' : ''} ${isFail ? 'fail' : ''}`}>
      {labels[status] || status}
    </span>
  );
}

export default function SessionHistory({ onSelect, refreshTrigger }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <aside className="history-panel no-print" id="history-panel">
      <h2 className="history-title">
        <IconFile size={18} />
        المحاضرات السابقة
      </h2>

      {isLoading && <div className="history-empty">جارٍ التحميل...</div>}
      {!isLoading && sessions.length === 0 && <div className="history-empty">لا توجد محاضرات بعد</div>}

      {!isLoading && sessions.length > 0 && (
        <ul className="history-list">
          {sessions.map((s) => {
            const dateStr = new Date(s.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            return (
              <li key={s._id}>
                <button className="history-item" onClick={() => onSelect(s._id)}>
                  <span className="history-icon">
                    {s.fileType === 'video' ? <IconVideo size={18} /> : <IconMic size={18} />}
                  </span>
                  <div className="history-info">
                    <span className="history-name">{s.title || s.originalFileName}</span>
                    <div className="history-meta">
                      <span className="history-date">
                        <IconClock size={12} /> {dateStr}
                      </span>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

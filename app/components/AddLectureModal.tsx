'use client';

import { useState, useEffect } from 'react';
import { fetchSessions } from '../services/api';
import { createLecture } from '../services/platformApi';
import { SessionListItem } from '../types/session';
import { useAuthToken } from '../hooks/useUserRole';
import { IconX, IconNote } from './Icons';

interface AddLectureModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLectureModal({ onClose, onSuccess }: AddLectureModalProps) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const getToken = useAuthToken();

  useEffect(() => {
    fetchSessions(false).then((data) => {
      // Only show summarized sessions that are not already a lecture
      const available = data.filter(s => s.status === 'summarized' && !s.lectureId);
      setSessions(available);
      setLoading(false);
    }).catch(() => {
      setError('فشل جلب الجلسات');
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !title.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = await getToken();
      await createLecture(token, {
        sessionId: selectedSessionId,
        title: title.trim(),
        description: description.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'فشل إضافة المحاضرة');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-[500px] flex flex-col max-h-[90vh] animate-slide-up">
        
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-[#E0E0E0] flex items-center gap-2">
            <IconNote size={20} className="text-[#FF9800]" />
            إضافة محاضرة
          </h2>
          <button
            onClick={onClose}
            className="text-[#808080] hover:text-[#FF9800] hover:bg-[#FF9800]/10 p-1.5 rounded-lg transition-all"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 text-red-400 text-[0.85rem] rounded-[10px]">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] text-[#B0B0B0] font-medium">اختر الجلسة</label>
            {loading ? (
              <div className="h-[42px] bg-[#161616] border border-white/10 rounded-[10px] animate-pulse" />
            ) : sessions.length === 0 ? (
              <div className="text-[0.85rem] text-[#808080] p-2 bg-[#161616] rounded-[10px] border border-white/10">
                لا توجد جلسات مكتملة متاحة. قم برفع ومعالجة ملف أولاً.
              </div>
            ) : (
              <select
                value={selectedSessionId}
                onChange={(e) => {
                  setSelectedSessionId(e.target.value);
                  const s = sessions.find(x => x._id === e.target.value);
                  if (s && !title) setTitle(s.title || s.originalFileName);
                }}
                className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-3 py-2.5 text-[0.9rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all"
                required
              >
                <option value="">-- اختر جلسة --</option>
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.title || s.originalFileName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] text-[#B0B0B0] font-medium">عنوان المحاضرة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-3 py-2.5 text-[0.9rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all"
              placeholder="مثال: شرح كتاب التوحيد - الدرس الأول"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] text-[#B0B0B0] font-medium">وصف المحاضرة (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-3 py-2.5 text-[0.9rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all min-h-[100px] resize-none"
              placeholder="وصف مختصر لمحتوى المحاضرة..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[0.9rem] text-[#B0B0B0] hover:text-[#E0E0E0] transition-colors"
              disabled={submitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSessionId || !title.trim()}
              className="ss-accent-btn px-6 py-2 rounded-[10px] text-[0.9rem] font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'جاري الإضافة...' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSessions } from '../../services/api';
import { createCourse, createLecture } from '../../services/platformApi';
import { SessionListItem } from '../../types/session';
import { useAuthToken } from '../../hooks/useUserRole';
import SheikhOnly from '../../components/SheikhOnly';
import { IconFolder, IconX, IconCheck, IconMenu } from '../../components/Icons';
import SessionHistory from '../../components/SessionHistory';

export default function NewCoursePage() {
  const router = useRouter();
  const getToken = useAuthToken();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSessions(false).then((data) => {
      // Only show summarized sessions that are not already in a lecture
      const available = data.filter(s => s.status === 'summarized' && !s.lectureId);
      setSessions(available);
      setLoadingSessions(false);
    }).catch(() => {
      setLoadingSessions(false);
    });
  }, []);

  const toggleSession = (id: string) => {
    setSelectedSessions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = await getToken();
      // 1. Create the course
      const course = await createCourse(token, {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
      });
      
      // 2. Create lectures for selected sessions
      if (selectedSessions.length > 0) {
        for (const sessionId of selectedSessions) {
          const sessionData = sessions.find(s => s._id === sessionId);
          await createLecture(token, {
            sessionId,
            courseId: course._id,
            title: sessionData?.title || sessionData?.originalFileName || 'محاضرة بدون عنوان',
          });
        }
      }
      
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الدورة');
      setSubmitting(false);
    }
  };

  return (
    <SheikhOnly>
      <div className="flex flex-col sm:flex-row h-screen rtl overflow-hidden bg-[#101010]">
        {/* Mobile top bar */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#161616] shrink-0 safe-top">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-[8px] text-[#B0B0B0] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all cursor-pointer"
            aria-label="فتح القائمة"
          >
            <IconMenu size={20} />
          </button>
          <span className="text-lg font-bold text-[#E0E0E0]">إضافة دورة جديدة</span>
          <div className="w-9" />
        </div>

        <SessionHistory
          onAddNew={() => router.push('/')}
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-10 py-6 sm:py-10 pb-16 relative">
          <div className="w-full max-w-[800px] mx-auto">
            <header className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[12px] bg-[#FF9800]/10 text-[#FF9800] flex items-center justify-center border border-[#FF9800]/25">
                  <IconFolder size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#E0E0E0]">إضافة دورة جديدة</h1>
                  <p className="text-[0.9rem] text-[#808080] mt-1">قم بإنشاء دورة لجمع عدة محاضرات معاً</p>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10 rounded-[10px] text-[#808080] border border-white/10 hover:text-[#E0E0E0] hover:border-white/20 transition-all cursor-pointer"
              >
                <IconX size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in-down">
              {error && (
                <div className="p-4 bg-red-400/10 border border-red-400/20 text-red-400 text-[0.9rem] rounded-[12px]">
                  {error}
                </div>
              )}

              <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-[16px] p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] text-[#B0B0B0] font-medium">اسم الدورة</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-4 py-3 text-[0.95rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all"
                    placeholder="مثال: شرح صحيح البخاري"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] text-[#B0B0B0] font-medium">الوصف (اختياري)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-4 py-3 text-[0.95rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all min-h-[120px] resize-none"
                    placeholder="وصف مختصر لمحتوى الدورة وأهدافها..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.9rem] text-[#B0B0B0] font-medium">التصنيف (اختياري)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-[10px] px-4 py-3 text-[0.95rem] text-[#E0E0E0] outline-none focus:border-[#FF9800]/50 focus:ring-1 focus:ring-[#FF9800]/50 transition-all"
                    placeholder="مثال: عقيدة، فقه، حديث..."
                  />
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-[16px] p-6 flex flex-col gap-4">
                <h3 className="text-[1.05rem] font-bold text-[#E0E0E0]">محاضرات الدورة</h3>
                <p className="text-[0.85rem] text-[#808080]">اختر الجلسات المكتملة التي تريد ضمها لهذه الدورة كمحاضرات</p>
                
                <div className="mt-2 max-h-[300px] overflow-y-auto pr-2 flex flex-col gap-2">
                  {loadingSessions ? (
                    <div className="text-center py-6 text-[#808080] text-sm animate-pulse">جارٍ تحميل الجلسات...</div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-[#808080] text-sm bg-[#161616] rounded-[12px] border border-white/5">
                      لا توجد جلسات متاحة لإضافتها.
                    </div>
                  ) : (
                    sessions.map(s => {
                      const isSelected = selectedSessions.includes(s._id);
                      return (
                        <div
                          key={s._id}
                          onClick={() => toggleSession(s._id)}
                          className={`flex items-center gap-3 p-3 rounded-[10px] border transition-all cursor-pointer ${
                            isSelected ? 'bg-[#FF9800]/[0.08] border-[#FF9800]/30' : 'bg-[#161616] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded-[6px] border ${
                            isSelected ? 'bg-[#FF9800] border-[#FF9800] text-[#101010]' : 'border-white/20 text-transparent'
                          }`}>
                            <IconCheck size={12} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[0.9rem] font-medium text-[#E0E0E0] truncate">
                              {s.title || s.originalFileName}
                            </span>
                            <span className="text-[0.75rem] text-[#808080] truncate">
                              {s.originalFileName}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-[12px] text-[0.95rem] text-[#E0E0E0] border border-white/10 hover:bg-white/5 transition-all"
                  disabled={submitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="ss-accent-btn px-8 py-3 rounded-[12px] text-[0.95rem] font-bold shadow-lg disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SheikhOnly>
  );
}

'use client';

import { useState } from 'react';
import { SessionData } from '../types/session';
import { updateSessionVisibility } from '../services/api';
import { IconX } from './Icons';

interface SessionSettingsModalProps {
  session: SessionData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (visibility: 'public' | 'private' | 'unlisted') => void;
}

export default function SessionSettingsModal({ session, isOpen, onClose, onUpdate }: SessionSettingsModalProps) {
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(session.visibility || 'private');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateSessionVisibility(session._id, visibility);
      onUpdate(visibility);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in" dir="rtl">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-[#E0E0E0]">إعدادات المحاضرة</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-[#E0E0E0] transition-colors cursor-pointer">
            <IconX size={24} />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[#ff3333]/10 border border-[#ff3333]/30 text-[#ff3333] rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-3">حالة الظهور (الرؤية)</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="public" 
                  checked={visibility === 'public'} 
                  onChange={() => setVisibility('public')}
                  className="w-4 h-4 text-[#FF9800] focus:ring-[#FF9800]"
                />
                <div>
                  <div className="text-sm font-medium text-[#E0E0E0]">عام (Public)</div>
                  <div className="text-xs text-[#808080]">يمكن لأي شخص رؤية هذه المحاضرة والوصول إليها.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="private" 
                  checked={visibility === 'private'} 
                  onChange={() => setVisibility('private')}
                  className="w-4 h-4 text-[#FF9800] focus:ring-[#FF9800]"
                />
                <div>
                  <div className="text-sm font-medium text-[#E0E0E0]">خاص (Private)</div>
                  <div className="text-xs text-[#808080]">لا يمكن لأحد رؤية المحاضرة سواك.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                <input 
                  type="radio" 
                  name="visibility" 
                  value="unlisted" 
                  checked={visibility === 'unlisted'} 
                  onChange={() => setVisibility('unlisted')}
                  className="w-4 h-4 text-[#FF9800] focus:ring-[#FF9800]"
                />
                <div>
                  <div className="text-sm font-medium text-[#E0E0E0]">غير مدرج (Unlisted)</div>
                  <div className="text-xs text-[#808080]">فقط من لديه الرابط يمكنه رؤية المحاضرة.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-white/10 flex justify-end gap-3 bg-[#101010]">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-white/10 rounded-lg text-[#E0E0E0] hover:bg-white/5 transition-colors text-sm font-medium cursor-pointer"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-l from-[#FFB74D] to-[#FF9800] text-[#101010] rounded-lg hover:opacity-90 transition-opacity font-bold text-sm disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  );
}

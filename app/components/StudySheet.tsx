'use client';

import { useState, useCallback } from 'react';
import { SessionData } from '../types/session';
import {
  IconPrinter, IconArrowRight, IconFile, IconClock,
  IconText, IconList, IconHeadphones, IconUser,
  IconNote, IconBookmark, IconUsers, IconDownload, IconX,
} from './Icons';
import ParsedTranscript from './ParsedTranscript';
import AudioSyncPlayer from './AudioSyncPlayer';
import { getAudioUrl, updateTranscript } from '../services/api';
import { formatDuration } from '../utils/formatDuration';

interface StudySheetProps {
  data: SessionData;
  onBack: () => void;
}

const SPEAKER_2_PLACEHOLDER = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`;

export default function StudySheet({ data, onBack }: StudySheetProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'audio'>('transcript');
  const [transcript, setTranscript] = useState(data.transcript);
  const [isSaving, setIsSaving] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'audio' | 'notes'>('audio');
  const [notes, setNotes] = useState('');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const formattedDate = new Date(data.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fixesCount = transcript ? (transcript.match(/<fix\b/gi) || []).length : 0;
  const hasAudio = data.words?.length > 0;

  const handleTranscriptSave = useCallback(async (newText: string) => {
    setTranscript(newText);
    setIsSaving(true);
    try {
      await updateTranscript(data._id, newText);
    } catch (err) {
      console.error('Failed to save transcript:', err);
    } finally {
      setIsSaving(false);
    }
  }, [data._id]);

  return (
    <div className="w-full h-full flex flex-col animate-slide-up">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.08] no-print shrink-0" id="study-header">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-[10px] bg-transparent text-[#B0B0B0] border border-white/[0.08] hover:bg-white/[0.06] hover:text-[#E0E0E0] transition-all cursor-pointer text-sm"
            onClick={onBack}
            id="back-button"
          >
            <IconArrowRight size={16} />
            <span className="hidden sm:inline">رجوع</span>
          </button>
          <button
            className="ss-accent-btn flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-[10px] font-semibold border-none cursor-pointer text-sm"
            onClick={() => window.print()}
            id="print-button"
          >
            <IconPrinter size={16} />
            <span className="hidden sm:inline">طباعة PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[16px] bg-[#FF9800]/[0.12] border border-[#FF9800]/25 text-[#FF9800] text-xs font-medium">
            <IconFile size={14} />
            محاضرة
          </div>
          <div className="hidden md:flex items-center gap-2 text-[#808080] text-xs">
            <span className="flex items-center gap-1"><IconClock size={13} /> {formattedDate}</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1 truncate max-w-[150px]"><IconFile size={13} /> {data.originalFileName}</span>
          </div>
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] items-center justify-center text-[#808080] hover:text-[#FF9800] hover:border-[#FF9800]/30 transition-all cursor-pointer">
            <IconUser size={16} />
          </div>
        </div>
      </div>

      {/* ── Title row ── */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-white/[0.08] no-print shrink-0">
        <h1 className="text-lg sm:text-2xl font-bold leading-relaxed text-right" dir="rtl">
          {data.title || data.originalFileName}
        </h1>
        {data.summary && (
          <p className="text-xs sm:text-sm text-[#808080] mt-1.5 text-right leading-relaxed line-clamp-2" dir="rtl">
            {data.summary.slice(0, 120)}...
          </p>
        )}
      </div>

      {/* ── Main content: center + right panel ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Center — speaker diarization */}
        <div className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-5 py-4 sm:py-5 pb-20 lg:pb-5" dir="rtl" id="diarization-content">
          <div className="flex items-center gap-2 mb-4">
            <IconUsers size={18} className="text-[#FF9800]" />
            <h2 className="text-sm font-semibold text-[#FF9800]">تفريغ النص مع تمييز المتحدثين</h2>
          </div>

          {/* Speaker 1 — الشيخ / المحاضر */}
          <SpeakerBlock
            speakerLabel="الشيخ / المحاضر"
            timestamp="12:00 / 2:45"
            speakerColor="#FF9800"
            speakerInitial="ش"
          >
            <div className="leading-[2.2] text-[1.02rem] text-[#E0E0E0] text-right" dir="rtl">
              {transcript ? (
                <ParsedTranscript
                  text={transcript}
                  editable
                  onTextChange={handleTranscriptSave}
                  quranVerses={data.quranVerses}
                />
              ) : (
                <span className="text-[#808080] text-sm">لا يوجد نص متاح</span>
              )}
            </div>
          </SpeakerBlock>

          {/* Speaker 2 — الطلاب */}
          <SpeakerBlock
            speakerLabel="الطلاب"
            timestamp="12:00 / 2:45"
            speakerColor="#5b8def"
            speakerInitial="ط"
          >
            <div className="leading-[1.9] text-sm text-[#808080] text-left" dir="ltr">
              {SPEAKER_2_PLACEHOLDER}
            </div>
          </SpeakerBlock>

          {/* Summary section (collapsible) */}
          {data.summary && (
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <IconText size={16} className="text-[#FF9800]" />
                <h3 className="text-sm font-semibold text-[#FF9800]">الملخص</h3>
              </div>
              <div className="text-[#B0B0B0] text-sm leading-[2.1] whitespace-pre-wrap text-right" dir="rtl">
                {data.summary}
              </div>
            </div>
          )}

          {data.keyPoints.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <IconList size={16} className="text-[#FF9800]" />
                <h3 className="text-sm font-semibold text-[#FF9800]">أهم النقاط والفوائد</h3>
              </div>
              <ul className="list-none flex flex-col gap-2">
                {data.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 px-4 py-3 bg-[#FF9800]/[0.04] rounded-[10px] border-r-[3px] border-[#FF9800] hover:bg-[#FF9800]/[0.08] transition-all">
                    <span className="flex items-center justify-center w-6 h-6 min-w-6 rounded-full bg-[#FF9800] text-[#101010] font-bold text-[11px]">{index + 1}</span>
                    <span className="text-[0.82rem] leading-relaxed text-right" dir="rtl">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right detail panel */}
        {/* Mobile backdrop */}
        {isMobilePanelOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-backdrop-in"
            onClick={() => setIsMobilePanelOpen(false)}
          />
        )}

        {/* Floating button to open panel on mobile */}
        <button
          onClick={() => setIsMobilePanelOpen(true)}
          className="lg:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full ss-accent-btn flex items-center justify-center shadow-lg cursor-pointer"
          aria-label="فتح لوحة الاستماع"
        >
          <IconHeadphones size={24} />
        </button>

        <aside className={`
          w-full lg:w-[380px] lg:min-w-[380px] border-t lg:border-t-0 lg:border-l border-white/[0.08] flex flex-col overflow-hidden no-print shrink-0
          fixed lg:static inset-x-0 bottom-0 z-50 lg:z-auto max-h-[75vh] lg:max-h-none
          bg-[#161616] rounded-t-[20px] lg:rounded-none
          transition-transform duration-300 lg:transition-none
          ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
          {/* Panel tabs */}
          <div className="flex border-b border-white/[0.08] shrink-0 relative">
            {/* Mobile drag handle */}
            <div className="lg:hidden absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
            <RightPanelTab
              active={rightPanelTab === 'audio'}
              onClick={() => setRightPanelTab('audio')}
              label="الاستماع"
              icon={<IconHeadphones size={15} />}
            />
            <RightPanelTab
              active={rightPanelTab === 'notes'}
              onClick={() => setRightPanelTab('notes')}
              label="الملاحظات"
              icon={<IconNote size={15} />}
            />
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobilePanelOpen(false)}
              className="lg:hidden flex items-center justify-center w-8 h-8 mr-2 my-auto rounded-[8px] text-[#808080] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all cursor-pointer shrink-0"
              aria-label="إغلاق"
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelTab === 'audio' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#FF9800] font-medium tracking-wide">ملف الاستماع والمراجعة</span>
                  {data.duration > 0 && (
                    <span className="text-[0.65rem] text-[#808080] font-mono">{formatDuration(data.duration)}</span>
                  )}
                </div>
                <AudioSyncPlayer
                  audioUrl={getAudioUrl(data._id)}
                  words={data.words}
                  duration={data.duration}
                />
                {isSaving && (
                  <span className="text-xs text-yellow-400 text-center">جارٍ الحفظ...</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#FF9800] font-medium tracking-wide">الملاحظات والمراجعة</span>
                  <IconBookmark size={15} className="text-[#808080]" />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب ملاحظاتك هنا..."
                  className="w-full min-h-[200px] bg-[#161616] border border-white/[0.08] rounded-[20px] p-4 text-[#E0E0E0] text-sm leading-relaxed resize-y focus:outline-none focus:border-[#FF9800]/40 transition-colors"
                  dir="rtl"
                />
                <div className="flex gap-2 justify-end">
                  <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-[10px] border border-white/[0.08] text-[#808080] hover:bg-white/[0.05] transition-colors cursor-pointer">
                    <IconDownload size={14} />
                    تصدير
                  </button>
                  <button className="ss-accent-btn flex items-center gap-1.5 text-xs px-3 py-2 rounded-[10px] font-semibold border-none cursor-pointer">
                    حفظ
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Print-only versions */}
      <div className="print-only hidden">
        {data.summary && (
          <section className="mb-10 last:mb-0">
            <h2 className="text-lg font-semibold text-[#FF9800] mb-5 pb-2.5 border-b border-white/[0.08]">الملخص</h2>
            <div className="text-[#E0E0E0] text-base leading-[2.1] whitespace-pre-wrap">{data.summary}</div>
          </section>
        )}
        {data.keyPoints.length > 0 && (
          <section className="mb-10 last:mb-0">
            <h2 className="text-lg font-semibold text-[#FF9800] mb-5 pb-2.5 border-b border-white/[0.08]">أهم النقاط والفوائد</h2>
            <ul className="list-none flex flex-col gap-3">
              {data.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-4 px-5 py-3.5 bg-[#FF9800]/[0.04] rounded-[10px] border-r-[3px] border-[#FF9800]">
                  <span className="flex items-center justify-center w-7 h-7 min-w-7 rounded-full bg-[#FF9800] text-[#101010] font-bold text-xs">{index + 1}</span>
                  <span className="text-sm leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {transcript && (
          <section className="mb-10 last:mb-0">
            <h2 className="text-lg font-semibold text-[#FF9800] mb-5 pb-2.5 border-b border-white/[0.08]">النص الكامل</h2>
            <div className="text-[#B0B0B0] text-sm leading-[2.1] whitespace-pre-wrap">
              <ParsedTranscript text={transcript} quranVerses={data.quranVerses} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/** Speaker block with timestamp and label */
function SpeakerBlock({
  speakerLabel,
  timestamp,
  speakerColor,
  speakerInitial,
  children,
}: {
  speakerLabel: string;
  timestamp: string;
  speakerColor: string;
  speakerInitial: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-[20px] border border-white/[0.08] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
            style={{
              background: `${speakerColor}20`,
              color: speakerColor,
              border: `1px solid ${speakerColor}40`,
            }}
          >
            {speakerInitial}
          </span>
          <span className="text-sm font-medium" style={{ color: speakerColor }}>
            {speakerLabel}
          </span>
        </div>
        <span className="text-[0.7rem] text-[#808080] font-mono">{timestamp}</span>
      </div>
      <div className="px-4 py-4 bg-[#161616]/50">
        {children}
      </div>
    </div>
  );
}

/** Right panel tab button */
function RightPanelTab({ active, onClick, label, icon }: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap cursor-pointer border-b-2 transition-all flex-1 justify-center ${
        active
          ? 'text-[#FF9800] border-b-[#FF9800] bg-[#FF9800]/[0.04]'
          : 'text-[#808080] border-b-transparent hover:text-[#B0B0B0] hover:bg-white/[0.02]'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

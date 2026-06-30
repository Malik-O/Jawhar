'use client';

import { useState, useCallback } from 'react';
import { SessionData } from '../types/session';
import {
  IconPrinter, IconArrowRight, IconFile, IconClock,
  IconText, IconList, IconHeadphones, IconUser,
  IconNote, IconBookmark, IconUsers, IconDownload, IconX,
  IconSettings,
} from './Icons';
import ParsedTranscript from './ParsedTranscript';
import SessionSettingsModal from './SessionSettingsModal';
import AudioSyncPlayer from './AudioSyncPlayer';
import { getAudioUrl, getPublicAudioUrl, updateTranscript, updateSessionMetadata } from '../services/api';
import { formatDuration } from '../utils/formatDuration';
import { filterArabicOnly } from '../utils/arabicFilter';

// ── Speaker color palette ──
const SPEAKER_COLORS = [
  '#FF9800', // orange (primary speaker)
  '#00C8C8', // teal
  '#7C4DFF', // purple
  '#4CAF50', // green
  '#E91E63', // pink
  '#2196F3', // blue
  '#FF5722', // deep orange
  '#FFC107', // amber
];

const SPEAKER_INITIALS = ['ش', 'ض', 'ث', 'ر', 'خ', 'س', 'د', 'ج'];

const SPEAKER_LABELS_AR: Record<string, string> = {
  'SPEAKER_00': 'المتحدث الأول',
  'SPEAKER_01': 'المتحدث الثاني',
  'SPEAKER_02': 'المتحدث الثالث',
  'SPEAKER_03': 'المتحدث الرابع',
  'SPEAKER_04': 'المتحدث الخامس',
  'SPEAKER_05': 'المتحدث السادس',
  'SPEAKER_06': 'المتحدث السابع',
  'SPEAKER_07': 'المتحدث الثامن',
};

function getSpeakerColor(speaker: string): string {
  const idx = parseInt(speaker.replace('SPEAKER_', '')) || 0;
  return SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
}

function getSpeakerInitial(speaker: string): string {
  const idx = parseInt(speaker.replace('SPEAKER_', '')) || 0;
  return SPEAKER_INITIALS[idx % SPEAKER_INITIALS.length];
}

function getSpeakerLabel(speaker: string): string {
  return SPEAKER_LABELS_AR[speaker] || `المتحدث ${speaker}`;
}

function formatTimeRange(start: number, end: number): string {
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };
  return `${fmt(start)} / ${fmt(end)}`;
}

interface ParsedSpeakerSection {
  speaker: string;
  text: string;
}

/** Parse [SPEAKER_XX] markers from transcript into sections */
function parseSpeakerSections(transcript: string): ParsedSpeakerSection[] {
  if (!transcript) return [];

  const hasMarkers = /\[SPEAKER_\d+\]/.test(transcript);
  if (!hasMarkers) {
    return [{ speaker: 'SPEAKER_00', text: transcript }];
  }

  const parts = transcript.split(/(\[SPEAKER_\d+\])/gi);
  const sections: ParsedSpeakerSection[] = [];
  let currentSpeaker = 'SPEAKER_00';
  let currentText = '';

  for (const part of parts) {
    const markerMatch = part.match(/\[SPEAKER_(\d+)\]/i);
    if (markerMatch) {
      if (currentText.trim()) {
        sections.push({ speaker: currentSpeaker, text: currentText.trim() });
      }
      currentSpeaker = `SPEAKER_${markerMatch[1]}`;
      currentText = '';
    } else {
      currentText += part;
    }
  }

  if (currentText.trim()) {
    sections.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return sections;
}

interface StudySheetProps {
  data: SessionData;
  onBack?: () => void;
  onTitleChange?: (title: string) => void;
  isPublic?: boolean;
}

export default function StudySheet({ data: initialData, onBack, onTitleChange, isPublic = false }: StudySheetProps) {
  const [data, setData] = useState<SessionData>(initialData);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'audio'>('transcript');
  const [transcript, setTranscript] = useState(data.transcript);
  const [isSaving, setIsSaving] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'audio' | 'notes'>('audio');
  const [notes, setNotes] = useState('');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [title, setTitle] = useState(data.title || data.originalFileName);
  const [summary, setSummary] = useState(data.summary || '');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const originalTitle = data.title || data.originalFileName;

  const handleTitleSave = useCallback(async () => {
    setEditingTitle(false);
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(originalTitle);
      return;
    }
    if (trimmed === originalTitle) return;
    try {
      await updateSessionMetadata(data._id, { title: trimmed });
      onTitleChange?.(trimmed);
    } catch (err) {
      console.error('Failed to save title:', err);
      setTitle(originalTitle);
    }
  }, [data._id, originalTitle, title, onTitleChange]);

  const handleTitleCancel = useCallback(() => {
    setEditingTitle(false);
    setTitle(originalTitle);
  }, [originalTitle]);

  const handleSummarySave = useCallback(async () => {
    setEditingSummary(false);
    const trimmed = summary.trim();
    if (trimmed === (data.summary || '')) return;
    try {
      await updateSessionMetadata(data._id, { summary: trimmed });
    } catch (err) {
      console.error('Failed to save summary:', err);
    }
  }, [data._id, data.summary, summary]);

  return (
    <div className="w-full h-full flex flex-col animate-slide-up">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.08] no-print shrink-0" id="study-header">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-[10px] bg-transparent text-[#B0B0B0] border border-white/[0.08] hover:bg-white/[0.06] hover:text-[#E0E0E0] transition-all cursor-pointer text-sm"
              onClick={onBack}
              id="back-button"
            >
              <IconArrowRight size={16} />
              <span className="hidden sm:inline">رجوع</span>
            </button>
          )}
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
          <div className="hidden md:flex items-center gap-2 text-[#808080] text-xs">
            <span className="flex items-center gap-1"><IconClock size={13} /> {formattedDate}</span>
            <span className="text-white/10">|</span>
            <span className="flex items-center gap-1 truncate max-w-[150px]"><IconFile size={13} /> {data.originalFileName}</span>
          </div>
          {!isPublic && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex w-8 h-8 rounded-[10px] bg-white/[0.06] border border-white/[0.1] items-center justify-center text-[#808080] hover:text-[#FF9800] hover:border-[#FF9800]/30 transition-all cursor-pointer"
              title="الإعدادات"
            >
              <IconSettings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Title row ── */}
      <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-white/[0.08] no-print shrink-0">
        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') handleTitleCancel();
            }}
            autoFocus
            dir="rtl"
            placeholder={originalTitle}
            className="w-full text-lg sm:text-2xl font-bold leading-relaxed text-right bg-[#1a1a1a] border border-[#FF9800]/40 rounded-[8px] px-3 py-1.5 text-[#E0E0E0] focus:outline-none focus:border-[#FF9800] focus:ring-1 focus:ring-[#FF9800]/20 transition-all"
          />
        ) : (
          <h1
            className={`text-lg sm:text-2xl font-bold leading-relaxed text-right ${!isPublic ? 'cursor-text hover:text-[#FFB74D]' : ''} transition-colors`}
            dir="rtl"
            onClick={() => !isPublic && setEditingTitle(true)}
            title={!isPublic ? "اضغط للتعديل" : ""}
          >
            {title}
          </h1>
        )}
        {summary && (
          editingSummary && !isPublic ? (
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={handleSummarySave}
              autoFocus
              dir="rtl"
              className="w-full text-xs sm:text-sm text-[#B0B0B0] mt-1.5 text-right leading-relaxed bg-transparent border border-[#FF9800]/30 rounded-[8px] p-2 focus:outline-none focus:border-[#FF9800] resize-y"
            />
          ) : (
            <p
              className={`text-xs sm:text-sm text-[#808080] mt-1.5 text-right leading-relaxed ${!isPublic ? 'cursor-text hover:text-[#B0B0B0]' : ''} transition-colors`}
              dir="rtl"
              onClick={() => !isPublic && setEditingSummary(true)}
              title={!isPublic ? "اضغط للتعديل" : ""}
            >
              {filterArabicOnly(summary)}
            </p>
          )
        )}
      </div>

      {/* ── Main content: center + right panel ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden no-print">
        {/* Center — speaker diarization */}
        <div className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-5 py-4 sm:py-5 pb-20 lg:pb-5" dir="rtl" id="diarization-content">
          <div className="flex items-center gap-2 mb-4">
            <IconUsers size={18} className="text-[#FF9800]" />
            <h2 className="text-sm font-semibold text-[#FF9800]">تفريغ النص</h2>
          </div>

          {/* Speaker-segmented transcript */}
          {transcript ? (
            (() => {
              const sections = parseSpeakerSections(transcript);
              const uniqueSpeakers = new Set(sections.map(s => s.speaker)).size;
              const isSingleSpeaker = uniqueSpeakers === 1;
              return sections.map((section, idx) => {
                const segData = data.speakerSegments?.find(s => s.speaker === section.speaker);
                const color = getSpeakerColor(section.speaker);
                const label = getSpeakerLabel(section.speaker);
                const initial = getSpeakerInitial(section.speaker);
                const timestamp = segData
                  ? formatTimeRange(segData.start, segData.end)
                  : '';
                const isLast = idx === sections.length - 1;

                if (isSingleSpeaker) {
                  return (
                    <div key={idx} className="mb-4 text-right" dir="rtl">
                      <div className="leading-[2.2] text-[1.02rem] text-[#E0E0E0]">
                        <ParsedTranscript
                          text={section.text}
                          editable={!isPublic && isLast}
                          onTextChange={handleTranscriptSave}
                          quranVerses={data.quranVerses}
                          hideCorrections={isPublic}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <SpeakerBlock
                    key={idx}
                    speakerLabel={label}
                    timestamp={timestamp}
                    speakerColor={color}
                    speakerInitial={initial}
                  >
                    <div className="leading-[2.2] text-[1.02rem] text-[#E0E0E0] text-right" dir="rtl">
                      <ParsedTranscript
                        text={section.text}
                        editable={!isPublic && isLast}
                        onTextChange={handleTranscriptSave}
                        quranVerses={data.quranVerses}
                        hideCorrections={isPublic}
                      />
                    </div>
                  </SpeakerBlock>
                );
              });
            })()
          ) : (
            <span className="text-[#808080] text-sm">لا يوجد نص متاح</span>
          )}

          {/* Summary section (collapsible) */}
          {summary && (
            <div className="mt-6 pt-5 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 mb-3">
                <IconText size={16} className="text-[#FF9800]" />
                <h3 className="text-sm font-semibold text-[#FF9800]">الملخص</h3>
              </div>
              <div className="text-[#B0B0B0] text-sm leading-[2.1] whitespace-pre-wrap text-right" dir="rtl">
                {filterArabicOnly(summary)}
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
                    <span className="text-[0.82rem] leading-relaxed text-right" dir="rtl">{filterArabicOnly(point)}</span>
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
            {!isPublic && (
              <RightPanelTab
                active={rightPanelTab === 'notes'}
                onClick={() => setRightPanelTab('notes')}
                label="الملاحظات"
                icon={<IconNote size={15} />}
              />
            )}
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
                  audioUrl={isPublic && data.publicKey ? getPublicAudioUrl(data.publicKey) : getAudioUrl(data._id)}
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

      {/* Print-only A4 document */}
      <div className="print-only hidden">
        <div className="print-document" dir="rtl">
          {/* Header */}
          <div className="print-header">
            <h1>{title}</h1>
            <div className="print-meta">
              <span>{formattedDate}</span>
              {data.duration > 0 && <span>{formatDuration(data.duration)}</span>}
              <span>{data.fileType === 'video' ? 'فيديو' : 'صوت'}</span>
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <section className="print-section">
              <h2>الملخص</h2>
              <div className="print-summary-body">{summary}</div>
            </section>
          )}

          {/* Key Points */}
          {data.keyPoints.length > 0 && (
            <section className="print-section">
              <h2>أهم النقاط والفوائد</h2>
              <ul className="print-keypoints-list">
                {data.keyPoints.map((point, index) => (
                  <li key={index} className="print-avoid-break">
                    <span className="kp-number">{index + 1}</span>
                    <span className="kp-text">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Full Transcript */}
          {transcript && (
            <section className="print-section print-transcript">
              <h2>النص الكامل</h2>
              <div className="print-transcript-body">
                <PrintTranscript text={transcript} quranVerses={data.quranVerses} />
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="print-footer">
            تم إنشاء هذا المستند بواسطة أداة التفريغ الصوتي — {formattedDate}
          </div>
        </div>
      </div>
      
      {!isPublic && (
        <SessionSettingsModal 
          session={data}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdate={(visibility) => {
            setData(prev => ({ ...prev, visibility }));
          }}
        />
      )}
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
    <div
      className="mb-4 rounded-[20px] border border-white/[0.08] overflow-hidden"
      style={{ borderRightColor: `${speakerColor}40`, borderRightWidth: '3px' }}
    >
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
        {timestamp && <span className="text-[0.7rem] text-[#808080] font-mono">{timestamp}</span>}
      </div>
      <div className="px-4 py-4 bg-[#161616]/50">
        {children}
      </div>
    </div>
  );
}

/** Print-friendly transcript renderer (no interactive elements) */
function PrintTranscript({ text, quranVerses }: { text: string; quranVerses?: import('../types/session').QuranVerse[] }) {
  if (!text) return null;

  const parts = text.split(/(<fix\b[^>]*>[\s\S]*?<\/fix>|<quran\b[^>]*>[\s\S]*?<\/quran>|<hadith\b[^>]*>[\s\S]*?<\/hadith>|\n)/gi);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part === '\n') return <br key={i} />;

        const fixMatch = part.match(/<fix\b[^>]*original=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/fix>/i);
        if (fixMatch) {
          return <span key={i}>{fixMatch[2]}</span>;
        }

        const quranMatch = part.match(/<quran\b([^>]*)>([\s\S]*?)<\/quran>/i);
        if (quranMatch) {
          const attrs = quranMatch[1] || '';
          const refMatch = attrs.match(/ref\s*=\s*["']?([^"'\s>]+)["']?/i);
          const verse = refMatch && quranVerses
            ? quranVerses.find(v => v.ref === refMatch[1])
            : undefined;
          return (
            <span key={i} className="quran-verse-print">
              ﴿ {verse ? verse.uthmani : quranMatch[2]} ﴾
              {verse && (
                <span className="verse-ref">{verse.surahName} {verse.surah}:{verse.ayah}</span>
              )}
            </span>
          );
        }

        const hadithMatch = part.match(/<hadith\b[^>]*>([\s\S]*?)<\/hadith>/i);
        if (hadithMatch) {
          return <span key={i} className="hadith-print">»{hadithMatch[1]}«</span>;
        }

        if (part.trim().startsWith('- ')) {
          return <span key={i} className="block mr-4 my-1">• {part.replace(/^\s*-\s/, '')}</span>;
        }

        return <span key={i}>{part}</span>;
      })}
    </>
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

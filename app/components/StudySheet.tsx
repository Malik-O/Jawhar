'use client';

import { useState, useCallback } from 'react';
import { SessionData } from '../types/session';
import { IconPrinter, IconArrowRight, IconFile, IconClock, IconText, IconList } from './Icons';
import ParsedTranscript from './ParsedTranscript';
import AudioSyncPlayer from './AudioSyncPlayer';
import { getAudioUrl, updateTranscript } from '../services/api';
import { formatDuration } from '../utils/formatDuration';

interface StudySheetProps {
  data: SessionData;
  onBack: () => void;
}

export default function StudySheet({ data, onBack }: StudySheetProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'audio'>('summary');
  const [transcript, setTranscript] = useState(data.transcript);
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="sheet-wrapper">
      <div className="sheet-actions no-print">
        <button className="action-btn back-btn" onClick={onBack} id="back-button">
          <IconArrowRight size={18} />
          رجوع
        </button>
        <button className="action-btn print-btn" onClick={() => window.print()} id="print-button">
          <IconPrinter size={18} />
          طباعة / حفظ PDF
        </button>
      </div>

      <article className="study-sheet" id="study-sheet">
        <header className="sheet-header">
          <div className="sheet-badge">
            <IconFile size={16} />
            محاضرة
          </div>
          <h1 className="sheet-title">{data.title || data.originalFileName}</h1>
          <div className="sheet-meta">
            <span><IconFile size={14} /> {data.originalFileName}</span>
            <span><IconClock size={14} /> {formattedDate}</span>
            {data.duration > 0 && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDuration(data.duration)}
              </span>
            )}
            {isSaving && <span className="text-xs text-yellow-400">جارٍ الحفظ...</span>}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-6 no-print overflow-x-auto">
          <TabButton
            active={activeTab === 'summary'}
            onClick={() => setActiveTab('summary')}
            label="الملخص والفوائد"
          />
          <TabButton
            active={activeTab === 'transcript'}
            onClick={() => setActiveTab('transcript')}
            label="النص الكامل"
            badge={fixesCount > 0 ? fixesCount : undefined}
          />
          {hasAudio && (
            <TabButton
              active={activeTab === 'audio'}
              onClick={() => setActiveTab('audio')}
              label="الاستماع والمتابعة"
              icon="🎧"
            />
          )}
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div>
            {data.summary && (
              <section className="sheet-section">
                <h2 className="section-title">
                  <IconText size={18} />
                  الملخص
                </h2>
                <div className="summary-text">{data.summary}</div>
              </section>
            )}

            {data.keyPoints.length > 0 && (
              <section className="sheet-section mt-8">
                <h2 className="section-title">
                  <IconList size={18} />
                  أهم النقاط والفوائد
                </h2>
                <ul className="key-points-list">
                  {data.keyPoints.map((point, index) => (
                    <li key={index} className="key-point-item">
                      <span className="point-number">{index + 1}</span>
                      <span className="point-text">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === 'transcript' && transcript && (
          <div>
            <section className="sheet-section">
              <h2 className="section-title no-print">
                <IconText size={18} />
                النص الكامل
                <span className="text-sm font-normal text-slate-400 mr-4">
                  (الكلمات المظللة تم تصحيحها تلقائياً، مرر مؤشر الفأرة لرؤية الأصل)
                </span>
              </h2>
              <div className="transcript-text expanded bg-[#0f172a] p-6 rounded-xl border border-white/5 shadow-inner">
                <ParsedTranscript
                  text={transcript}
                  editable
                  onTextChange={handleTranscriptSave}
                />
              </div>
            </section>
          </div>
        )}

        {/* Audio Sync Tab */}
        {activeTab === 'audio' && hasAudio && (
          <div>
            <section className="sheet-section">
              <h2 className="section-title no-print">
                <span>🎧</span>
                الاستماع والمتابعة
                <span className="text-sm font-normal text-slate-400 mr-4">
                  (اضغط على أي كلمة للانتقال إليها في التسجيل)
                </span>
              </h2>
              <AudioSyncPlayer
                audioUrl={getAudioUrl(data._id)}
                words={data.words}
                duration={data.duration}
              />
            </section>
          </div>
        )}

        {/* Print-only versions */}
        <div className="print-only">
          {data.summary && (
            <section className="sheet-section">
              <h2 className="section-title">الملخص</h2>
              <div className="summary-text">{data.summary}</div>
            </section>
          )}
          {data.keyPoints.length > 0 && (
            <section className="sheet-section mt-8">
              <h2 className="section-title">أهم النقاط والفوائد</h2>
              <ul className="key-points-list">
                {data.keyPoints.map((point, index) => (
                  <li key={index} className="key-point-item">
                    <span className="point-number">{index + 1}</span>
                    <span className="point-text">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {transcript && (
            <section className="sheet-section mt-8">
              <h2 className="section-title">النص الكامل</h2>
              <div className="transcript-text expanded">
                <ParsedTranscript text={transcript} />
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}

/** Reusable tab button */
function TabButton({ active, onClick, label, badge, icon }: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  icon?: string;
}) {
  return (
    <button
      className={`pb-2 px-3 border-b-2 transition-colors font-semibold text-base flex items-center gap-2 whitespace-nowrap ${
        active
          ? 'border-[#d4a843] text-[#d4a843]'
          : 'border-transparent text-slate-400 hover:text-slate-300'
      }`}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded-full border border-yellow-500/20">
          {badge}
        </span>
      )}
    </button>
  );
}

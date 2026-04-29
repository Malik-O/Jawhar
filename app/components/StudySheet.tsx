'use client';

import { useState } from 'react';
import { SessionData } from '../types/session';
import { IconPrinter, IconArrowRight, IconChevron, IconFile, IconClock, IconText, IconList } from './Icons';

interface StudySheetProps {
  data: SessionData;
  onBack: () => void;
}

export default function StudySheet({ data, onBack }: StudySheetProps) {
  const [showTranscript, setShowTranscript] = useState(false);

  const formattedDate = new Date(data.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
          </div>
        </header>

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
          <section className="sheet-section">
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

        {data.transcript && (
          <section className="sheet-section">
            <h2
              className="section-title clickable no-print"
              onClick={() => setShowTranscript(!showTranscript)}
              role="button"
              tabIndex={0}
            >
              <IconText size={18} />
              النص الكامل
              <span className={`toggle-icon ${showTranscript ? 'rotated' : ''}`}>
                <IconChevron size={16} />
              </span>
            </h2>
            <h2 className="section-title print-only">
              <IconText size={18} />
              النص الكامل
            </h2>
            <div className={`transcript-text ${showTranscript ? 'expanded' : 'collapsed'}`}>
              {data.transcript}
            </div>
            <div className="transcript-text print-only">{data.transcript}</div>
          </section>
        )}
      </article>
    </div>
  );
}

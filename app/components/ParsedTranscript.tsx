'use client';

import { useState } from 'react';
import { QuranVerse } from '../types/session';
import { IconEdit, IconUndo } from './Icons';

function FixTag({ original, fixed }: { original: string; fixed: string }) {
  const [isReverted, setIsReverted] = useState(false);

  if (isReverted) {
    return (
      <span className="inline-flex items-center gap-1 mx-0.5">
        <span className="text-[#B0B0B0] bg-white/[0.06] px-1.5 py-0.5 rounded text-sm line-through">{original}</span>
        <button
          onClick={() => setIsReverted(false)}
          className="text-[10px] text-[#00C8C8] hover:text-[#00C8C8]/80 border border-[#00C8C8]/30 bg-[#00C8C8]/10 rounded px-1.5 py-0.5 transition-colors flex items-center gap-1"
          title="إعادة التصحيح"
        >
          <IconUndo size={10} />
        </button>
      </span>
    );
  }

  return (
    <span className="relative group inline-flex items-center mx-0.5">
      <span className="bg-yellow-500/15 text-yellow-200 px-1.5 py-0.5 rounded border-b-2 border-yellow-500/40 cursor-help transition-colors hover:bg-yellow-500/25">
        {fixed}
      </span>
      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center gap-2 bg-[#1a1a1a] text-white text-xs py-1.5 px-3 rounded-[10px] shadow-2xl border border-white/10 w-max z-50 whitespace-nowrap">
        <span className="text-[#808080]">الأصل:</span>
        <span className="text-white font-medium">{original}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setIsReverted(true); }}
          className="text-red-400 hover:text-red-300 border border-red-500/30 bg-red-500/10 rounded px-2 py-0.5 transition-colors mr-1 flex items-center gap-1"
        >
          <IconUndo size={10} />
          تراجع
        </button>
        <div className="absolute top-full right-4 border-4 border-transparent border-t-[#1a1a1a]" />
      </span>
    </span>
  );
}

function QuranTag({ text, verse }: { text: string; verse?: QuranVerse }) {
  if (verse) {
    return (
      <span className="block my-3 py-4 px-5 bg-[#FF9800]/10 border-r-4 border-[#FF9800] rounded-[10px] text-[#FF9800] leading-loose" dir="rtl">
        <span className="font-quran text-xl leading-loose" style={{ fontFamily: `var(--font-quran), "Amiri", serif` }}>
          ﴾ {verse.uthmani} ﴿
        </span>
        <span className="block mt-2 text-xs text-[#FF9800]/70 font-sans">
          {verse.surahName} {verse.surah}:{verse.ayah}
        </span>
      </span>
    );
  }
  return (
    <span className="block my-3 py-3 px-5 bg-[#FF9800]/10 border-r-4 border-[#FF9800] rounded-[10px] text-[#FF9800] text-lg leading-loose" dir="rtl">
      ﴾ {text} ﴿
    </span>
  );
}

function HadithTag({ text }: { text: string }) {
  return (
    <span className="block my-3 py-3 px-5 bg-[#00C8C8]/10 border-r-4 border-[#00C8C8] rounded-[10px] text-[#00C8C8] text-base leading-loose" dir="rtl">
      «{text}»
    </span>
  );
}

interface ParsedTranscriptProps {
  text: string;
  editable?: boolean;
  onTextChange?: (newText: string) => void;
  quranVerses?: QuranVerse[];
}

export default function ParsedTranscript({ text, editable, onTextChange, quranVerses }: ParsedTranscriptProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  if (!text) return null;

  if (isEditing && editable) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#808080]">وضع التحرير — يمكنك إضافة الوسوم يدوياً</span>
          <div className="flex gap-1.5 mr-auto">
            <TagButton label="آية" tag="quran" onInsert={(tag) => {
              setEditText(prev => prev + ` <${tag}>نص الآية</${tag}> `);
            }} />
            <TagButton label="حديث" tag="hadith" onInsert={(tag) => {
              setEditText(prev => prev + ` <${tag}>نص الحديث</${tag}> `);
            }} />
            <TagButton label="تصحيح" tag="fix" onInsert={() => {
              setEditText(prev => prev + ` <fix original="الكلمة الخاطئة">الكلمة الصحيحة</fix> `);
            }} />
          </div>
        </div>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full min-h-[300px] bg-[#161616] border border-white/10 rounded-[20px] p-4 text-[#E0E0E0] text-sm leading-loose resize-y focus:outline-none focus:border-[#FF9800]/50 transition-colors"
          dir="rtl"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { setIsEditing(false); setEditText(text); }}
            className="text-sm px-4 py-2 rounded-[10px] border border-white/10 text-[#808080] hover:bg-white/5 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onTextChange?.(editText);
              setIsEditing(false);
            }}
            className="ss-accent-btn text-sm px-4 py-2 rounded-[10px] font-semibold border-none cursor-pointer"
          >
            حفظ
          </button>
        </div>
      </div>
    );
  }

  const parts = text.split(/(<fix\b[^>]*>[\s\S]*?<\/fix>|<quran\b[^>]*>[\s\S]*?<\/quran>|<hadith\b[^>]*>[\s\S]*?<\/hadith>|\n)/gi);

  return (
    <div className="relative">
      {editable && (
        <button
          onClick={() => { setEditText(text); setIsEditing(true); }}
          className="absolute -top-1 left-0 text-xs text-[#808080] border border-white/10 rounded-[10px] px-3 py-1.5 hover:bg-white/5 hover:text-[#B0B0B0] transition-all z-10 flex items-center gap-1.5"
        >
          <IconEdit size={12} />
          تحرير
        </button>
      )}
      <div className="leading-[2.2] text-[1.02rem] text-[#E0E0E0] pt-2">
        {parts.map((part, i) => {
          if (!part) return null;
          if (part === '\n') return <br key={i} />;

          const fixMatch = part.match(/<fix\b[^>]*original=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/fix>/i);
          if (fixMatch) {
            return <FixTag key={i} original={fixMatch[1]} fixed={fixMatch[2]} />;
          }

          const quranMatch = part.match(/<quran\b([^>]*)>([\s\S]*?)<\/quran>/i);
          if (quranMatch) {
            const attrs = quranMatch[1] || '';
            const refMatch = attrs.match(/ref\s*=\s*["']?([^"'\s>]+)["']?/i);
            const verse = refMatch && quranVerses
              ? quranVerses.find(v => v.ref === refMatch[1])
              : undefined;
            return <QuranTag key={i} text={quranMatch[2]} verse={verse} />;
          }

          const hadithMatch = part.match(/<hadith\b[^>]*>([\s\S]*?)<\/hadith>/i);
          if (hadithMatch) {
            return <HadithTag key={i} text={hadithMatch[1]} />;
          }

          if (part.trim().startsWith('- ')) {
            return <span key={i} className="block mr-4 my-1">• {part.replace(/^\s*-\s/, '')}</span>;
          }

          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}

function TagButton({ label, tag, onInsert }: { label: string; tag: string; onInsert: (tag: string) => void }) {
  const colors: Record<string, string> = {
    quran: 'text-[#FF9800] border-[#FF9800]/30 bg-[#FF9800]/10',
    hadith: 'text-[#00C8C8] border-[#00C8C8]/30 bg-[#00C8C8]/10',
    fix: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  };
  return (
    <button
      onClick={() => onInsert(tag)}
      className={`text-[11px] px-2.5 py-1 rounded-[10px] border transition-all hover:opacity-80 hover:scale-105 ${colors[tag] || ''}`}
    >
      + {label}
    </button>
  );
}

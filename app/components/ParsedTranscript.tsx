'use client';

import { useState } from 'react';

function FixTag({ original, fixed }: { original: string; fixed: string }) {
  const [isReverted, setIsReverted] = useState(false);

  if (isReverted) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-slate-300 bg-slate-800/50 px-1.5 py-0.5 rounded text-sm line-through">{original}</span>
        <button
          onClick={() => setIsReverted(false)}
          className="text-[10px] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded px-1.5 py-0.5 transition-colors"
          title="إعادة التصحيح"
        >
          ↩
        </button>
      </span>
    );
  }

  return (
    <span className="relative group inline-flex items-center">
      <span className="bg-yellow-500/15 text-yellow-200 px-1.5 py-0.5 rounded border-b-2 border-yellow-500/40 cursor-help">
        {fixed}
      </span>
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center gap-2 bg-[#1e293b] text-white text-xs py-1.5 px-3 rounded-lg shadow-2xl border border-white/10 w-max z-50 whitespace-nowrap">
        <span className="text-slate-400">الأصل:</span>
        <span className="text-white font-medium">{original}</span>
        <button
          onClick={(e) => { e.stopPropagation(); setIsReverted(true); }}
          className="text-red-400 hover:text-red-300 border border-red-500/30 bg-red-500/10 rounded px-2 py-0.5 transition-colors mr-1"
        >
          ↩ تراجع
        </button>
        <div className="absolute top-full right-4 border-4 border-transparent border-t-[#1e293b]" />
      </span>
    </span>
  );
}

function QuranTag({ text }: { text: string }) {
  return (
    <span className="block my-2 py-2 px-4 bg-[#d4a843]/10 border-r-4 border-[#d4a843] rounded-sm text-[#d4a843] text-lg leading-relaxed" dir="rtl">
      ﴿ {text} ﴾
    </span>
  );
}

function HadithTag({ text }: { text: string }) {
  return (
    <span className="block my-2 py-2 px-4 bg-emerald-500/10 border-r-4 border-emerald-500 rounded-sm text-emerald-300 text-base leading-relaxed" dir="rtl">
      «{text}»
    </span>
  );
}

interface ParsedTranscriptProps {
  text: string;
  editable?: boolean;
  onTextChange?: (newText: string) => void;
}

export default function ParsedTranscript({ text, editable, onTextChange }: ParsedTranscriptProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  if (!text) return null;

  if (isEditing && editable) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400">وضع التحرير — يمكنك إضافة الوسوم يدوياً</span>
          <div className="flex gap-1 mr-auto">
            <TagButton label="آية" tag="quran" onInsert={(tag) => {
              setEditText(prev => prev + `<${tag}>نص الآية</${tag}>`);
            }} />
            <TagButton label="حديث" tag="hadith" onInsert={(tag) => {
              setEditText(prev => prev + `<${tag}>نص الحديث</${tag}>`);
            }} />
            <TagButton label="تصحيح" tag="fix" onInsert={() => {
              setEditText(prev => prev + `<fix original="الكلمة الخاطئة">الكلمة الصحيحة</fix>`);
            }} />
          </div>
        </div>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full min-h-[300px] bg-[#0d1529] border border-white/10 rounded-lg p-4 text-slate-200 text-sm leading-loose resize-y focus:outline-none focus:border-[#d4a843]/50"
          dir="rtl"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { setIsEditing(false); setEditText(text); }}
            className="text-sm px-4 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onTextChange?.(editText);
              setIsEditing(false);
            }}
            className="text-sm px-4 py-1.5 rounded-lg bg-[#d4a843] text-[#0f172a] font-semibold hover:bg-[#e0b94e] transition-colors"
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
          className="absolute top-2 left-2 text-xs text-slate-400 border border-white/10 rounded-md px-3 py-1 hover:bg-white/5 hover:text-slate-200 transition-colors z-10"
        >
          ✏️ تحرير
        </button>
      )}
      <div className="leading-loose text-[1.05rem] text-slate-200">
        {parts.map((part, i) => {
          if (!part) return null;
          if (part === '\n') return <br key={i} />;

          const fixMatch = part.match(/<fix\b[^>]*original=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/fix>/i);
          if (fixMatch) {
            return <FixTag key={i} original={fixMatch[1]} fixed={fixMatch[2]} />;
          }

          const quranMatch = part.match(/<quran\b[^>]*>([\s\S]*?)<\/quran>/i);
          if (quranMatch) {
            return <QuranTag key={i} text={quranMatch[1]} />;
          }

          const hadithMatch = part.match(/<hadith\b[^>]*>([\s\S]*?)<\/hadith>/i);
          if (hadithMatch) {
            return <HadithTag key={i} text={hadithMatch[1]} />;
          }

          if (part.trim().startsWith('- ')) {
            return <span key={i} className="block mr-4">• {part.replace(/^-\s/, '')}</span>;
          }

          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
}

/** Small tag insertion button for the editor toolbar */
function TagButton({ label, tag, onInsert }: { label: string; tag: string; onInsert: (tag: string) => void }) {
  const colors: Record<string, string> = {
    quran: 'text-[#d4a843] border-[#d4a843]/30 bg-[#d4a843]/10',
    hadith: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    fix: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  };
  return (
    <button
      onClick={() => onInsert(tag)}
      className={`text-[10px] px-2 py-1 rounded border transition-colors hover:opacity-80 ${colors[tag] || ''}`}
    >
      + {label}
    </button>
  );
}

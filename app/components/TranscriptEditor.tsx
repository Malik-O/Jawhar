'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { QuranVerse } from '../types/session';
import { IconPlus, IconX, IconEdit, IconGrip } from './Icons';

// ─── Types ───
type BlockType = 'text' | 'quran' | 'hadith' | 'fix';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  original?: string;
  ref?: string;
}

// ─── Helpers ───
let _id = 0;
const genId = () => `b${++_id}`;

function parseTranscript(text: string): Block[] {
  const blocks: Block[] = [];
  const regex = /<fix\b[^>]*original=["']?([^"'>]*)["']?[^>]*>([\s\S]*?)<\/fix>|<quran\b([^>]*)>([\s\S]*?)<\/quran>|<hadith\b[^>]*>([\s\S]*?)<\/hadith>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      const t = text.slice(last, m.index).trim();
      if (t) blocks.push({ id: genId(), type: 'text', content: t });
    }
    if (m[1] !== undefined) {
      blocks.push({ id: genId(), type: 'fix', original: m[1], content: m[2] });
    } else if (m[3] !== undefined) {
      const refM = m[3].match(/ref\s*=\s*["']?([^"'\s>]+)["']?/i);
      blocks.push({ id: genId(), type: 'quran', content: m[4], ref: refM?.[1] });
    } else if (m[5] !== undefined) {
      blocks.push({ id: genId(), type: 'hadith', content: m[5] });
    }
    last = regex.lastIndex;
  }
  if (last < text.length) {
    const t = text.slice(last).trim();
    if (t) blocks.push({ id: genId(), type: 'text', content: t });
  }
  return blocks.length ? blocks : [{ id: genId(), type: 'text', content: text }];
}

function serializeBlocks(blocks: Block[]): string {
  return blocks
    .filter(b => b.content.trim() || (b.original || '').trim())
    .map(b => {
      switch (b.type) {
        case 'text': return b.content;
        case 'quran': return b.ref ? `<quran ref="${b.ref}">${b.content}</quran>` : `<quran>${b.content}</quran>`;
        case 'hadith': return `<hadith>${b.content}</hadith>`;
        case 'fix': return `<fix original="${b.original || ''}">${b.content}</fix>`;
      }
    })
    .join('\n');
}

// ─── Auto-growing textarea ───
function AutoTextarea({ value, onChange, placeholder, className, dir = 'rtl', autoFocus }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const adjust = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, []);
  useEffect(() => { adjust(); }, [value, adjust]);
  useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      dir={dir}
      rows={1}
      onInput={adjust}
    />
  );
}

// ─── Block editors ───
function TextBlockEdit({ block, onChange, autoFocus }: {
  block: Block; onChange: (u: Partial<Block>) => void; autoFocus?: boolean;
}) {
  return (
    <AutoTextarea
      value={block.content}
      onChange={(v) => onChange({ content: v })}
      placeholder="اكتب النص هنا..."
      autoFocus={autoFocus}
      className="w-full bg-transparent border border-transparent rounded-[10px] p-2 text-[#E0E0E0] text-[1.02rem] leading-[2.2] resize-none focus:outline-none focus:bg-white/[0.03] focus:border-white/[0.08] transition-all"
    />
  );
}

function QuranBlockEdit({ block, onChange, autoFocus, quranVerses }: {
  block: Block; onChange: (u: Partial<Block>) => void; autoFocus?: boolean; quranVerses?: QuranVerse[];
}) {
  const verse = block.ref && quranVerses ? quranVerses.find(v => v.ref === block.ref) : undefined;
  return (
    <div className="bg-[#FF9800]/10 border-r-4 border-[#FF9800] rounded-[10px] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF9800] shrink-0" />
        <span className="text-xs text-[#FF9800] font-medium">آية قرآنية</span>
      </div>
      <AutoTextarea
        value={block.content}
        onChange={(v) => onChange({ content: v })}
        placeholder="اكتب نص الآية..."
        autoFocus={autoFocus}
        className="w-full bg-transparent border-none p-1 text-[#FF9800] text-lg leading-loose resize-none focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <input
          value={block.ref || ''}
          onChange={(e) => onChange({ ref: e.target.value })}
          placeholder="المرجع (مثال: 2:255)"
          className="bg-[#FF9800]/5 border border-[#FF9800]/20 rounded-[8px] px-3 py-1.5 text-xs text-[#FF9800] placeholder-[#FF9800]/40 focus:outline-none focus:border-[#FF9800]/40 w-40"
          dir="ltr"
        />
        {verse && (
          <span className="text-xs text-[#FF9800]/60">{verse.surahName} {verse.surah}:{verse.ayah}</span>
        )}
      </div>
    </div>
  );
}

function HadithBlockEdit({ block, onChange, autoFocus }: {
  block: Block; onChange: (u: Partial<Block>) => void; autoFocus?: boolean;
}) {
  return (
    <div className="bg-[#00C8C8]/10 border-r-4 border-[#00C8C8] rounded-[10px] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00C8C8] shrink-0" />
        <span className="text-xs text-[#00C8C8] font-medium">حديث شريف</span>
      </div>
      <AutoTextarea
        value={block.content}
        onChange={(v) => onChange({ content: v })}
        placeholder="اكتب نص الحديث..."
        autoFocus={autoFocus}
        className="w-full bg-transparent border-none p-1 text-[#00C8C8] text-base leading-loose resize-none focus:outline-none"
      />
    </div>
  );
}

function FixBlockReadOnly({ block }: { block: Block }) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[10px] px-3 py-2.5 flex items-center gap-2 flex-wrap">
      <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
      <span className="text-xs text-yellow-400 font-medium shrink-0">تصحيح</span>
      <span className="text-sm text-[#B0B0B0] line-through">{block.original}</span>
      <span className="text-[#808080] text-xs">←</span>
      <span className="text-sm text-yellow-200 font-medium">{block.content}</span>
    </div>
  );
}

// ─── Add block menu ───
function AddBlockMenu({ onAdd, onClose }: {
  onAdd: (type: BlockType) => void; onClose: () => void;
}) {
  const items: { type: BlockType; label: string; color: string }[] = [
    { type: 'text', label: 'نص عادي', color: '#B0B0B0' },
    { type: 'quran', label: 'آية قرآنية', color: '#FF9800' },
    { type: 'hadith', label: 'حديث شريف', color: '#00C8C8' },
  ];
  return (
    <div className="flex items-center gap-2 py-2 px-1 flex-wrap animate-slide-up">
      <span className="text-xs text-[#808080] ml-1">إضافة:</span>
      {items.map(item => (
        <button
          key={item.type}
          onClick={() => onAdd(item.type)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all text-xs text-[#B0B0B0] hover:text-white"
        >
          <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
          {item.label}
        </button>
      ))}
      <button onClick={onClose} className="text-[#808080] hover:text-[#B0B0B0] p-1">
        <IconX size={14} />
      </button>
    </div>
  );
}

// ─── Main editor ───
export default function TranscriptEditor({ initialText, onSave, onCancel, quranVerses }: {
  initialText: string;
  onSave: (text: string) => void;
  onCancel: () => void;
  quranVerses?: QuranVerse[];
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseTranscript(initialText));
  const [showMenuAt, setShowMenuAt] = useState<number | null>(null);
  const [newBlockIds, setNewBlockIds] = useState<Set<string>>(new Set());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const addBlock = (type: BlockType, index: number) => {
    const newBlock: Block = {
      id: genId(),
      type,
      content: '',
      ...(type === 'fix' ? { original: '' } : {}),
    };
    setBlocks(prev => [...prev.slice(0, index), newBlock, ...prev.slice(index)]);
    setNewBlockIds(prev => new Set(prev).add(newBlock.id));
    setShowMenuAt(null);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    onSave(serializeBlocks(blocks));
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Edit mode indicator */}
      <div className="flex items-center gap-2 mb-2 text-xs text-[#808080]">
        <IconEdit size={12} />
        <span>وضع التحرير — اضغط على أي فقرة لتعديلها</span>
      </div>

      {/* Blocks */}
      {blocks.map((block, index) => (
        <div key={block.id}>
          {showMenuAt === index && (
            <AddBlockMenu
              onAdd={(type) => addBlock(type, index)}
              onClose={() => setShowMenuAt(null)}
            />
          )}
          {/* Drop indicator above */}
          {dragOverIndex === index && dragIndex !== null && dragIndex !== index && (
            <div className="h-0.5 bg-[#FF9800] rounded-full mb-1 opacity-80" />
          )}
          <div
            className={`group relative flex items-start gap-1 rounded-[10px] transition-all ${
              dragIndex === index ? 'opacity-40' : ''
            } ${dragOverIndex === index && dragIndex !== null && dragIndex !== index ? 'bg-[#FF9800]/[0.04]' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(index)}
          >
            {/* Hover controls */}
            <div className="flex flex-col gap-0.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-7">
              <button
                onClick={() => setShowMenuAt(index)}
                className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[#808080] hover:text-[#FF9800] hover:bg-white/5 cursor-pointer"
                title="إضافة فوق"
              >
                <IconPlus size={13} />
              </button>
              <button
                onClick={() => deleteBlock(block.id)}
                className="w-5 h-5 rounded-[6px] flex items-center justify-center text-[#808080] hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                title="حذف"
              >
                <IconX size={13} />
              </button>
            </div>
            {/* Drag handle */}
            <div className="pt-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab active:cursor-grabbing text-[#606060] hover:text-[#FF9800]">
              <IconGrip size={14} />
            </div>
            {/* Block content */}
            <div className="flex-1 min-w-0">
              {block.type === 'text' && (
                <TextBlockEdit block={block} onChange={(u) => updateBlock(block.id, u)} autoFocus={newBlockIds.has(block.id)} />
              )}
              {block.type === 'quran' && (
                <QuranBlockEdit block={block} onChange={(u) => updateBlock(block.id, u)} autoFocus={newBlockIds.has(block.id)} quranVerses={quranVerses} />
              )}
              {block.type === 'hadith' && (
                <HadithBlockEdit block={block} onChange={(u) => updateBlock(block.id, u)} autoFocus={newBlockIds.has(block.id)} />
              )}
              {block.type === 'fix' && (
                <FixBlockReadOnly block={block} />
              )}
            </div>
          </div>
        </div>
      ))}
      {/* Drop indicator at end */}
      {dragOverIndex === blocks.length && dragIndex !== null && (
        <div className="h-0.5 bg-[#FF9800] rounded-full mb-1 opacity-80" />
      )}

      {/* Add menu at end */}
      {showMenuAt === blocks.length && (
        <AddBlockMenu
          onAdd={(type) => addBlock(type, blocks.length)}
          onClose={() => setShowMenuAt(null)}
        />
      )}

      {/* Bottom add button */}
      <button
        onClick={() => setShowMenuAt(blocks.length)}
        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(blocks.length); }}
        onDrop={() => handleDrop(blocks.length)}
        className="flex items-center gap-2 mt-2 px-3 py-2 rounded-[10px] border border-dashed border-white/[0.1] text-[#808080] hover:text-[#FF9800] hover:border-[#FF9800]/30 transition-all text-sm self-start"
      >
        <IconPlus size={16} />
        إضافة فقرة جديدة
      </button>

      {/* Save / Cancel */}
      <div className="flex gap-2 justify-end mt-3 pt-3 border-t border-white/[0.06]">
        <button
          onClick={onCancel}
          className="text-sm px-4 py-2 rounded-[10px] border border-white/10 text-[#808080] hover:bg-white/5 transition-colors cursor-pointer"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          className="ss-accent-btn text-sm px-4 py-2 rounded-[10px] font-semibold border-none cursor-pointer"
        >
          حفظ
        </button>
      </div>
    </div>
  );
}

'use client';

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { IconUpload } from './Icons';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled: boolean;
}

const ACCEPTED = '.mp3,.wav,.ogg,.m4a,.aac,.flac,.mp4,.mkv,.webm,.avi,.mov';

export default function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) onFileSelected(f);
  }, [disabled, onFileSelected]);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelected(f);
  }, [onFileSelected]);

  return (
    <div
      id="upload-zone"
      className={`
        relative overflow-hidden flex flex-col items-center justify-center gap-5
        px-6 py-12 sm:px-10 sm:py-16 text-center cursor-pointer rounded-[20px] sm:rounded-[30px]
        backdrop-blur-md transition-all duration-300
        border-2 border-dashed
        ${isDragging || !disabled
          ? 'border-white/[0.08] bg-white/[0.035] hover:border-[#FF9800] hover:bg-[#FF9800]/[0.12] hover:shadow-[0_0_80px_rgba(255,152,0,0.08)] hover:-translate-y-1'
          : ''
        }
        ${isDragging ? 'border-[#FF9800] bg-[#FF9800]/[0.12] shadow-[0_0_80px_rgba(255,152,0,0.08)]' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="منطقة رفع الملفات"
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleInput} className="hidden" />
      <div className="text-[#FF9800] animate-float relative z-10">
        <IconUpload size={48} className="sm:hidden" />
        <IconUpload size={56} className="hidden sm:block" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold relative z-10 text-[#E0E0E0]">اسحب الملف هنا أو اضغط للاختيار</h2>
      <p className="text-xs sm:text-sm text-[#B0B0B0] relative z-10">يدعم: MP3, WAV, MP4, MKV, WebM, AVI وغيرها</p>
    </div>
  );
}

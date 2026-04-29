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
      className={`upload-zone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="منطقة رفع الملفات"
    >
      <input ref={inputRef} type="file" accept={ACCEPTED} onChange={handleInput} className="hidden-input" />
      <div className="upload-icon">
        <IconUpload size={56} />
      </div>
      <h2 className="upload-title">اسحب الملف هنا أو اضغط للاختيار</h2>
      <p className="upload-subtitle">يدعم: MP3, WAV, MP4, MKV, WebM, AVI وغيرها</p>
    </div>
  );
}

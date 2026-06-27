'use client';

import { useState, useCallback } from 'react';

interface CopyLinkButtonProps {
  url?: string;
  size?: 'sm' | 'md';
}

export default function CopyLinkButton({ url, size = 'md' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const iconSize = size === 'sm' ? 16 : 20;
  const btnClass = size === 'sm'
    ? 'w-7 h-7 rounded-[6px]'
    : 'w-9 h-9 rounded-[8px]';

  const handleCopy = useCallback(async () => {
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy URL');
    }
  }, [url]);

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center ${btnClass} text-[#B0B0B0] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 transition-all cursor-pointer relative group`}
      aria-label="نسخ الرابط"
    >
      {copied ? (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="#FF9800" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-[#FF9800] whitespace-nowrap bg-[#161616] px-2 py-1 rounded border border-white/10">
          تم النسخ
        </span>
      )}
    </button>
  );
}

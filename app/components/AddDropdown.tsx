'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IconPlus, IconNote, IconFolder } from './Icons';

interface AddDropdownProps {
  onAddLecture: () => void;
}

export default function AddDropdown({ onAddLecture }: AddDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-tooltip-id="session-action-tooltip"
        data-tooltip-content="إضافة جديد"
        className="flex items-center justify-center w-8 h-8 rounded-[8px] text-[#808080] border border-white/10 hover:text-[#FF9800] hover:border-[#FF9800]/25 hover:bg-[#FF9800]/10 transition-all cursor-pointer"
      >
        <IconPlus size={16} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-10 w-48 bg-[#1a1a1a] border border-white/[0.08] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-1 z-[100] animate-slide-up origin-top-left">
          <button
            onClick={() => {
              setIsOpen(false);
              onAddLecture();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[0.85rem] text-[#E0E0E0] hover:bg-[#FF9800]/[0.08] hover:text-[#FF9800] transition-colors text-right"
          >
            <IconNote size={16} />
            إضافة محاضرة
          </button>
          
          <Link
            href="/course/new"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[0.85rem] text-[#E0E0E0] hover:bg-[#FF9800]/[0.08] hover:text-[#FF9800] transition-colors text-right"
          >
            <IconFolder size={16} />
            إضافة دورة
          </Link>
        </div>
      )}
    </div>
  );
}
